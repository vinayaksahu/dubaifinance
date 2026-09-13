import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_CONFIG, usdtToInr } from "@/lib/constants";
import { getNumericConfig } from "@/lib/configService";
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

    const cleanHash = txHash.trim();

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
        screenshotUrl: screenshotUrl || null,
        network: APP_CONFIG.depositNetwork,
        status: "PENDING",
      },
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