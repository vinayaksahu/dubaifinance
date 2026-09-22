import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateUserDepositAddress } from "@/lib/blockchain/addressService";
import {
  getDepositProcessingModeForUser,
  getRequiredConfirmations,
  getUsdtContractAddress,
} from "@/lib/blockchain/config";
import { verifyOnChainTransaction, creditUserFundWalletAtomic } from "@/lib/blockchain/depositProcessor";
import { sanitizeIdentifier } from "@/lib/sanitize";
import { recordActivity } from "@/lib/auditLogger";
import { getSystemConfigValue } from "@/lib/configService";
import { APP_CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [userAddress, mode, requiredConfirmations, usdtContract, companyAddress, companyQr] = await Promise.all([
      getOrCreateUserDepositAddress(session.userId),
      getDepositProcessingModeForUser(session.userId),
      getRequiredConfirmations(),
      getUsdtContractAddress(),
      getSystemConfigValue("COMPANY_USDT_ADDRESS", APP_CONFIG.depositAddress),
      getSystemConfigValue("COMPANY_USDT_QR", ""),
    ]);

    const activeAddress = (mode === "MANUAL" && companyAddress) ? companyAddress : userAddress.address;
    const qrUrl = (mode === "MANUAL" && companyQr)
      ? companyQr
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${activeAddress}`;

    // Fetch user's recent deposits
    const deposits = await db.depositRequest.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        amountInUsdt: true,
        amountInInr: true,
        txHash: true,
        fromAddress: true,
        toAddress: true,
        network: true,
        blockNumber: true,
        confirmations: true,
        processingMode: true,
        status: true,
        adminNote: true,
        detectedAt: true,
        confirmedAt: true,
        creditedAt: true,
        createdAt: true,
      },
    });

    const formattedDeposits = deposits.map((d) => ({
      ...d,
      amountInUsdt: Number(d.amountInUsdt),
      amountInInr: Number(d.amountInInr),
      blockNumber: d.blockNumber ? d.blockNumber.toString() : null,
    }));

    return NextResponse.json({
      address: activeAddress,
      asset: "USDT",
      network: "BEP20 (BNB Smart Chain)",
      tokenContract: usdtContract,
      qrUrl,
      mode,
      requiredConfirmations,
      deposits: formattedDeposits,
    });
  } catch (error: any) {
    console.error("[Member Crypto Deposit GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to load deposit details." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { txHash } = await req.json();
    if (!txHash) {
      return NextResponse.json({ error: "Transaction hash is required." }, { status: 400 });
    }

    const cleanHash = sanitizeIdentifier(txHash, "x");
    if (!cleanHash || cleanHash.length < 10) {
      return NextResponse.json({ error: "Invalid transaction hash." }, { status: 400 });
    }

    // 1. Get user's assigned deposit address & system configured company address
    const [userAddress, mode, companyAddress] = await Promise.all([
      getOrCreateUserDepositAddress(session.userId),
      getDepositProcessingModeForUser(session.userId),
      getSystemConfigValue("COMPANY_USDT_ADDRESS", APP_CONFIG.depositAddress),
    ]);

    const targetAddress = (mode === "MANUAL" && companyAddress) ? companyAddress : userAddress.address;

    // 2. Check if txHash already exists in database
    const existing = await db.depositRequest.findUnique({
      where: { txHash: cleanHash },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: `This transaction hash has already been submitted (Status: ${existing.status}).`,
          status: existing.status,
        },
        { status: 400 }
      );
    }

    // 3. Independent on-chain blockchain verification
    let verification = await verifyOnChainTransaction(cleanHash, targetAddress);
    if (!verification.verified && mode === "MANUAL" && userAddress?.address) {
      // Fallback: check if the user sent to their personal address instead
      const fallbackVerification = await verifyOnChainTransaction(cleanHash, userAddress.address);
      if (fallbackVerification.verified) {
        verification = fallbackVerification;
      }
    }

    if (!verification.verified || !verification.amountInUsdt) {
      return NextResponse.json(
        {
          error: verification.error || "Failed to verify transaction on BNB Smart Chain.",
        },
        { status: 400 }
      );
    }

    const requiredConfirmations = await getRequiredConfirmations();
    const isConfirmed = (verification.confirmations || 0) >= requiredConfirmations;

    // 4. Create deposit record with verified on-chain data
    const deposit = await db.depositRequest.create({
      data: {
        userId: session.userId,
        depositAddressId: userAddress.id,
        amountInUsdt: verification.amountInUsdt.toFixed(8),
        amountInInr: verification.amountInUsdt.toFixed(2),
        txHash: cleanHash,
        verifiedTxHash: cleanHash,
        network: "USDT_BEP20",
        tokenContract: verification.tokenContract,
        fromAddress: verification.fromAddress,
        toAddress: verification.toAddress || targetAddress,
        blockNumber: verification.blockNumber,
        logIndex: verification.logIndex,
        confirmations: verification.confirmations || 0,
        processingMode: mode,
        status: isConfirmed
          ? (mode === "AUTOMATIC" ? "CONFIRMED" : "PENDING_REVIEW")
          : "CONFIRMING",
        detectedAt: new Date(),
        confirmedAt: isConfirmed ? new Date() : null,
      },
    });

    // 5. In AUTOMATIC mode and already confirmed, credit immediately
    if (mode === "AUTOMATIC" && isConfirmed) {
      await creditUserFundWalletAtomic({ depositId: deposit.id });
    }

    await recordActivity({
      userId: session.userId,
      action: "MANUAL_TX_SUBMITTED",
      category: "FINANCIAL",
      description: `User submitted on-chain verified deposit for $${verification.amountInUsdt.toFixed(2)} USDT (Tx: ${cleanHash.slice(0, 10)}...)`,
      req,
      metadata: { depositId: deposit.id, amountInUsdt: verification.amountInUsdt.toNumber(), txHash: cleanHash },
    });

    return NextResponse.json({
      success: true,
      message: mode === "AUTOMATIC" && isConfirmed
        ? `Deposit verified and $${verification.amountInUsdt.toFixed(2)} USDT credited to your Fund Wallet!`
        : `Deposit of $${verification.amountInUsdt.toFixed(2)} USDT verified on BSC! Awaiting administrator review.`,
      depositId: deposit.id,
      amountInUsdt: verification.amountInUsdt.toNumber(),
      status: deposit.status,
    });
  } catch (error: any) {
    console.error("[Member Crypto Deposit POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to submit transaction." }, { status: 500 });
  }
}
