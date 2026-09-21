import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_CONFIG, usdtToInr } from "@/lib/constants";
import { getNumericConfig } from "@/lib/configService";
import { recordActivity } from "@/lib/auditLogger";
import { sanitizeIdentifier, sanitizeText } from "@/lib/sanitize";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountInUsdt, txHash, screenshotUrl } = await req.json();

    if (!amountInUsdt || !txHash) {
      return NextResponse.json({ error: "Amount and Blockchain TxHash are required." }, { status: 400 });
    }

    const cleanHash = sanitizeIdentifier(txHash, "x");
    const cleanScreenshot = screenshotUrl ? sanitizeText(screenshotUrl, 500) : null;

    if (!cleanHash || cleanHash.length < 10) {
      return NextResponse.json({ error: "Valid blockchain transaction hash is required." }, { status: 400 });
    }

    // Check duplicate txHash
    const existing = await db.depositRequest.findUnique({
      where: { txHash: cleanHash },
    });
    if (existing) {
      return NextResponse.json({ error: "This transaction hash has already been submitted." }, { status: 400 });
    }

    const amountUsdtDec = new Decimal(amountInUsdt.toString());

    const deposit = await db.depositRequest.create({
      data: {
        userId: session.userId,
        amountInUsdt: amountUsdtDec.toFixed(8),
        amountInInr: amountUsdtDec.toFixed(2),
        txHash: cleanHash,
        screenshotUrl: cleanScreenshot,
        network: APP_CONFIG.depositNetwork,
        status: "PENDING",
      },
    });

    await recordActivity({
      userId: session.userId,
      action: "DEPOSIT_SUBMITTED",
      category: "FINANCIAL",
      description: `Submitted deposit proof for $${amountUsdtDec.toFixed(2)} USDT (TxHash: ${cleanHash.slice(0, 12)}...)`,
      req,
      metadata: { depositId: deposit.id, amountInUsdt: amountUsdtDec.toNumber(), txHash: cleanHash },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit submitted! Funds will be credited to your Fund Wallet upon admin blockchain verification.",
      depositId: deposit.id,
    });
  } catch (error: any) {
    console.error("Deposit error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit deposit." }, { status: 500 });
  }
}