import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { getNumericConfig } from "@/lib/configService";
import { APP_CONFIG } from "@/lib/constants";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamic withdrawal window check
    const startHour = await getNumericConfig("WITHDRAWAL_START_HOUR", APP_CONFIG.withdrawalWindow.startHour);
    const endHour = await getNumericConfig("WITHDRAWAL_END_HOUR", APP_CONFIG.withdrawalWindow.endHour);
    const minUsdt = await getNumericConfig("MIN_WITHDRAWAL_USDT", APP_CONFIG.minWithdrawalUsdt);
    const maxUsdt = await getNumericConfig("MAX_WITHDRAWAL_USDT", APP_CONFIG.maxWithdrawalUsdt);
    const usdtRate = await getNumericConfig("USDT_TO_INR_RATE", APP_CONFIG.usdtToInrRate);

    // Current IST Time calculation
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    let istHours = (utcHours + 5) % 24;
    let istMinutes = utcMinutes + 30;
    if (istMinutes >= 60) {
      istHours = (istHours + 1) % 24;
    }
    const isWindowOpen = istHours >= startHour && istHours < endHour;

    if (!isWindowOpen) {
      return NextResponse.json({
        error: `Withdrawal window is closed. Withdrawals are processed daily between ${startHour}:00 and ${endHour}:00 IST.`,
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
    const amountUsdt = Number((amountInrDec.toNumber() / usdtRate).toFixed(4));
    const amountUsdtDec = new Decimal(amountUsdt.toString());

    // Validate dynamic limits
    if (amountUsdtDec.lessThan(minUsdt)) {
      return NextResponse.json({
        error: `Minimum withdrawal is $${minUsdt} USDT.`,
      }, { status: 400 });
    }
    if (amountUsdtDec.greaterThan(maxUsdt)) {
      return NextResponse.json({
        error: `Maximum withdrawal is $${maxUsdt} USDT.`,
      }, { status: 400 });
    }

    const incomeBal = new Decimal(user.incomeBalance.toString());
    if (incomeBal.lessThan(amountUsdtDec)) {
      return NextResponse.json({
        error: `Insufficient Available Income balance. You have $${incomeBal.toFixed(4)} USDT, required: $${amountUsdtDec.toFixed(4)} USDT.`,
      }, { status: 400 });
    }

    // Deduct Income Balance via Ledger
    await executeLedgerTransaction({
      userId: user.id,
      type: "WITHDRAWAL",
      wallet: "INCOME",
      amount: amountUsdtDec.negated(),
      referenceKey: `WITHDRAWAL_REQ_${Date.now()}_${user.id}`,
      description: `Requested USDT Payout of $${amountUsdtDec.toFixed(2)} USDT to ${payoutAddress.slice(0, 8)}...`,
    });

    // Create WithdrawalRequest in DB
    const request = await db.withdrawalRequest.create({
      data: {
        userId: user.id,
        amountInInr: amountInrDec.toFixed(2),
        amountInUsdt: amountUsdtDec.toFixed(8),
        toAddress: payoutAddress,
        network: "USDT_BEP20",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully! Admin will dispatch payout shortly.",
      withdrawalId: request.id,
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: error.message || "Withdrawal failed." }, { status: 500 });
  }
}