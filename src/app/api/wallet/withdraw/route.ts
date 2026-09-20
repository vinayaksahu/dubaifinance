import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { getNumericConfig, getAllSystemConfigs } from "@/lib/configService";
import { APP_CONFIG, getWithdrawalWindowStatus } from "@/lib/constants";
import { verifyOtp } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateBonusUsageEligibility } from "@/lib/services/bonusService";
import { recordActivity } from "@/lib/auditLogger";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    // Rate limit: 5 withdrawal attempts per 5 minutes per user/IP
    const rateLimitRes = await checkRateLimit({
      key: `withdraw_usr:${session.userId}`,
      limit: 5,
      windowSeconds: 300,
    });
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: "Too many withdrawal requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // Dynamic withdrawal window check using complete system configs
    const configs = await getAllSystemConfigs();
    const windowStatus = getWithdrawalWindowStatus(configs);

    if (!windowStatus.isOpen) {
      return NextResponse.json({
        error: `Withdrawal window is closed. Withdrawals are accepted daily during ${windowStatus.gstLabel} (Dubai Time) / ${windowStatus.istLabel} (India Time). (Current Dubai Time: ${windowStatus.currentGstTime} GST)`,
      }, { status: 403 });
    }

    const minUsdt = await getNumericConfig("MIN_WITHDRAWAL_USDT", APP_CONFIG.minWithdrawalUsdt);
    const maxUsdt = await getNumericConfig("MAX_WITHDRAWAL_USDT", APP_CONFIG.maxWithdrawalUsdt);

    const { amountInUsdt, amount, amountInInr, toAddress, transactionPin, otp } = await req.json();
    const rawAmount = amountInUsdt ?? amount ?? amountInInr;
    const verificationCode = (otp || transactionPin || "").trim();

    if (!rawAmount || !verificationCode) {
      return NextResponse.json({ error: "Amount and Security OTP / PIN are required." }, { status: 400 });
    }

    let parsedUsdt = Number(rawAmount);
    if (!amountInUsdt && !amount && Number(amountInInr) > 5000) {
      parsedUsdt = Number(amountInInr) / 110;
    }

    // Strict boundary & NaN validation against financial tampering
    if (!Number.isFinite(parsedUsdt) || isNaN(parsedUsdt) || parsedUsdt <= 0) {
      return NextResponse.json({ error: "Please enter a valid positive withdrawal amount." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        customId: true,
        email: true,
        transactionPin: true,
        incomeBalance: true,
        usdtAddress: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify via OTP first, or fallback to saved PIN
    let isAuthorized = false;
    if (verificationCode) {
      isAuthorized = await verifyOtp(user.email, verificationCode, "TRANSACTION");
      if (!isAuthorized && user.transactionPin) {
        isAuthorized = await comparePin(verificationCode, user.transactionPin);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Invalid or expired Security OTP code." }, { status: 401 });
    }

    const payoutAddress = (toAddress || user.usdtAddress || "").trim();
    if (!payoutAddress || payoutAddress.length < 10 || payoutAddress.length > 128) {
      return NextResponse.json({ error: "Please bind a valid USDT BEP-20 payout address." }, { status: 400 });
    }

    const amountUsdtDec = new Decimal(parsedUsdt.toString());

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
        error: `Insufficient Available Income balance. You have $${incomeBal.toFixed(2)} USDT, required: $${amountUsdtDec.toFixed(2)} USDT.`,
      }, { status: 400 });
    }

    // Validate $20+ Active ID condition for redeeming bonus funds
    const bonusCheck = await validateBonusUsageEligibility(user.id, amountUsdtDec);
    if (!bonusCheck.allowed) {
      return NextResponse.json({
        error: bonusCheck.error || "Bonus funds are usable only on active IDs with $20+ active package.",
      }, { status: 400 });
    }

    const feePercent = await getNumericConfig("WITHDRAWAL_FEE_PERCENT", APP_CONFIG.withdrawalAdminFeePercent);
    const feeRateDec = new Decimal(feePercent).dividedBy(100);
    const feeAmountDec = amountUsdtDec.times(feeRateDec);
    const netAmountDec = amountUsdtDec.minus(feeAmountDec);

    // Deduct Gross Income Balance via Ledger
    await executeLedgerTransaction({
      userId: user.id,
      type: "WITHDRAWAL",
      wallet: "INCOME",
      amount: amountUsdtDec.negated(),
      referenceKey: `WITHDRAWAL_REQ_${Date.now()}_${user.id}`,
      description: `Requested Payout $${amountUsdtDec.toFixed(2)} USDT (Net: $${netAmountDec.toFixed(2)}, Admin Fee ${feePercent}%: $${feeAmountDec.toFixed(2)}) to ${payoutAddress.slice(0, 8)}...`,
    });

    // Create WithdrawalRequest in DB with fee breakdown
    const request = await db.withdrawalRequest.create({
      data: {
        userId: user.id,
        amountInInr: amountUsdtDec.toFixed(2),
        amountInUsdt: amountUsdtDec.toFixed(8),
        feePercent: new Decimal(feePercent),
        feeAmount: feeAmountDec.toFixed(8),
        netAmount: netAmountDec.toFixed(8),
        toAddress: payoutAddress,
        network: "USDT_BEP20",
        status: "PENDING",
      },
    });

    await recordActivity({
      userId: user.id,
      action: "WITHDRAWAL_REQUEST",
      category: "FINANCIAL",
      description: `Requested payout of $${amountUsdtDec.toFixed(2)} USDT (Net: $${netAmountDec.toFixed(2)}) to ${payoutAddress.slice(0, 10)}...`,
      req,
      metadata: {
        withdrawalId: request.id,
        grossAmount: amountUsdtDec.toNumber(),
        netAmount: netAmountDec.toNumber(),
        feeAmount: feeAmountDec.toNumber(),
        payoutAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for $${amountUsdtDec.toFixed(2)} USDT (Net Payout: $${netAmountDec.toFixed(2)} USDT) submitted successfully!`,
      withdrawalId: request.id,
      grossAmount: amountUsdtDec.toNumber(),
      feePercent: Number(feePercent),
      feeAmount: feeAmountDec.toNumber(),
      netPayout: netAmountDec.toNumber(),
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: error.message || "Withdrawal failed." }, { status: 500 });
  }
}