import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { APP_CONFIG, isWithdrawalWindowOpen, inrToUsdt } from "@/lib/constants";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Withdrawal Window (10 AM to 02 PM IST)
    if (!isWithdrawalWindowOpen()) {
      return NextResponse.json({
        error: "Withdrawal window is closed. Withdrawals are strictly processed daily between 10:00 AM and 02:00 PM (IST).",
      }, { status: 403 });
    }

    const { amountInInr, toAddress, transactionPin } = await req.json();

    if (!amountInInr || !transactionPin) {
      return NextResponse.json({ error: "Amount and 6-digit PIN are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        customId: true,
        transactionPin: true,
        incomeBalance: true,
        usdtAddress: true,
      },
    });

    if (!user || !user.transactionPin) {
      return NextResponse.json({ error: "Please set your 6-digit Transaction PIN first." }, { status: 400 });
    }

    const isPinValid = await comparePin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ error: "Invalid 6-digit Transaction PIN." }, { status: 401 });
    }

    const payoutAddress = toAddress || user.usdtAddress;
    if (!payoutAddress) {
      return NextResponse.json({ error: "Please bind a valid USDT BEP-20 payout address." }, { status: 400 });
    }

    const amountInrDec = new Decimal(amountInInr.toString());

    const amountUsdt = inrToUsdt(amountInrDec.toNumber());
    const amountUsdtDec = new Decimal(amountUsdt.toString());

    // Validate limits
    if (amountUsdtDec.lessThan(APP_CONFIG.minWithdrawalUsdt)) {
      return NextResponse.json({
        error: `Minimum withdrawal is $${APP_CONFIG.minWithdrawalUsdt} USDT.`,
      }, { status: 400 });
    }
    if (amountUsdtDec.greaterThan(APP_CONFIG.maxWithdrawalUsdt)) {
      return NextResponse.json({
        error: `Maximum withdrawal is $${APP_CONFIG.maxWithdrawalUsdt} USDT.`,
      }, { status: 400 });
    }

    const incomeBal = new Decimal(user.incomeBalance.toString());
    if (incomeBal.lessThan(amountUsdtDec)) {
      return NextResponse.json({
        error: `Insufficient Available Income balance. You have $${incomeBal.toFixed(4)} USDT, required: $${amountUsdtDec.toFixed(4)} USDT.`,
      }, { status: 400 });
    }

    const withdrawal = await db.withdrawalRequest.create({
      data: {
        userId: user.id,
        amountInInr: amountInrDec.toFixed(2),
        amountInUsdt: amountUsdtDec.toFixed(8),
        toAddress: payoutAddress,
        status: "PENDING",
      },
    });

    // Debit user income balance immediately (Zero deduction, 100% payout)
    await executeLedgerTransaction({
      userId: user.id,
      type: "WITHDRAWAL",
      wallet: "INCOME",
      amount: amountUsdtDec.negated(),
      referenceKey: `WITHDRAWAL_${withdrawal.id}`,
      description: `Withdrawal request of $${amountUsdtDec.toFixed(2)} USDT to ${payoutAddress}`,
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal of $${amountUsdtDec.toFixed(2)} USDT placed successfully! Zero admin deduction.`,
      withdrawalId: withdrawal.id,
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: error.message || "Failed to process withdrawal." }, { status: 500 });
  }
}