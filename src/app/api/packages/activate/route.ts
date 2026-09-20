import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { processDirectReferralReward } from "@/lib/services/referralService";
import { getNumericConfig } from "@/lib/configService";
import { APP_CONFIG } from "@/lib/constants";
import { verifyOtp } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordActivity } from "@/lib/auditLogger";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 package activations per 5 minutes per user
    const rateLimitRes = await checkRateLimit({
      key: `activate_usr:${session.userId}`,
      limit: 10,
      windowSeconds: 300,
    });
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: "Too many activation requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const { packageType, amountInInr, amountInUsdt, amount, targetCustomId, transactionPin, otp, fdTenureDays } = await req.json();

    const rawAmount = amountInUsdt ?? amount ?? amountInInr;
    const verificationCode = (otp || transactionPin || "").trim();

    if (!packageType || !rawAmount || !verificationCode) {
      return NextResponse.json({ error: "Package type, amount and Security OTP / PIN are required." }, { status: 400 });
    }

    let parsedUsdt = Number(rawAmount);
    if (!amountInUsdt && !amount && Number(amountInInr) > 5000) {
      parsedUsdt = Number(amountInInr) / 110;
    }

    // Strict boundary & NaN validation against financial tampering
    if (!Number.isFinite(parsedUsdt) || isNaN(parsedUsdt) || parsedUsdt <= 0) {
      return NextResponse.json({ error: "Please enter a valid positive package investment amount." }, { status: 400 });
    }

    // Verify user PIN or OTP
    const caller = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, customId: true, email: true, transactionPin: true, fundBalance: true, status: true, adminId: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    let isAuthorized = false;
    if (verificationCode) {
      isAuthorized = await verifyOtp(caller.email, verificationCode, "TRANSACTION");
      if (!isAuthorized && caller.transactionPin) {
        isAuthorized = await comparePin(verificationCode, caller.transactionPin);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Invalid or expired Security OTP code." }, { status: 401 });
    }

    // Target beneficiary
    let beneficiary = caller;
    if (targetCustomId && targetCustomId.trim() !== caller.customId) {
      const found = await db.user.findUnique({ 
        where: { customId: targetCustomId.trim() },
        select: { id: true, customId: true, email: true, status: true, adminId: true },
      });
      if (!found) {
        return NextResponse.json({ error: `Beneficiary ID ${targetCustomId} not found.` }, { status: 404 });
      }
      if (caller.role !== "SUPER_ROOT_ADMIN" && caller.adminId && found.adminId && found.adminId !== caller.adminId) {
        return NextResponse.json({ error: `Beneficiary ID ${targetCustomId} not found.` }, { status: 404 });
      }
      beneficiary = found as any;
    }

    const amountUsdtDec = new Decimal(parsedUsdt.toString());
    const amountInrDec = amountUsdtDec; // 1:1 Pure USDT throughout

    // Validate Package Limits
    let dailyRoiRate: Decimal;
    let tenureDays: number;

    if (packageType === "BASIC_SAVING") {
      const minUsdt = await getNumericConfig("BASIC_PLAN_MIN_USDT", APP_CONFIG.basicPlan.minUsdt);
      const maxUsdt = await getNumericConfig("BASIC_PLAN_MAX_USDT", APP_CONFIG.basicPlan.maxUsdt);
      const dailyRoi = await getNumericConfig("BASIC_PLAN_DAILY_ROI", APP_CONFIG.basicPlan.dailyRoiRate);
      const tenure = await getNumericConfig("BASIC_PLAN_TENURE_DAYS", APP_CONFIG.basicPlan.tenureDays);

      if (amountUsdtDec.lessThan(minUsdt) || amountUsdtDec.greaterThan(maxUsdt)) {
        return NextResponse.json({
          error: `Basic Saving Package must be between $${minUsdt} and $${maxUsdt} USDT.`,
        }, { status: 400 });
      }
      dailyRoiRate = new Decimal(dailyRoi);
      tenureDays = tenure;
    } else if (packageType === "FIX_DEPOSIT") {
      const minFd = await getNumericConfig("FD_MIN_USDT", 10);
      const maxFd = await getNumericConfig("FD_MAX_USDT", 5000);
      const fd180Roi = await getNumericConfig("FD_PLAN_180_DAILY_ROI", 10.0);
      const fd180Days = await getNumericConfig("FD_PLAN_180_DAYS", 180);
      const fd210Roi = await getNumericConfig("FD_PLAN_210_DAILY_ROI", 15.0);
      const fd210Days = await getNumericConfig("FD_PLAN_210_DAYS", 210);

      const tenure = Number(fdTenureDays) || fd180Days;
      if (tenure !== fd180Days && tenure !== fd210Days) {
        return NextResponse.json({ error: `FD Tenure must be either ${fd180Days} Days (${fd180Roi}%) or ${fd210Days} Days (${fd210Roi}%).` }, { status: 400 });
      }

      if (amountUsdtDec.lessThan(minFd) || amountUsdtDec.greaterThan(maxFd)) {
        return NextResponse.json({
          error: `Fix Deposit amount must be between $${minFd} and $${maxFd} USDT.`,
        }, { status: 400 });
      }

      tenureDays = tenure;
      dailyRoiRate = tenure === fd180Days ? new Decimal(fd180Roi) : new Decimal(fd210Roi);
    } else {
      return NextResponse.json({ error: "Invalid package type." }, { status: 400 });
    }

    // Check caller fund balance
    const callerFundDec = new Decimal(caller.fundBalance.toString());
    if (callerFundDec.lessThan(amountUsdtDec)) {
      return NextResponse.json({
        error: `Insufficient Fund Balance. You have $${callerFundDec.toFixed(2)} USDT, but $${amountUsdtDec.toFixed(2)} USDT is required.`,
      }, { status: 400 });
    }

    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + tenureDays);

    // Create contract
    const contract = await db.investmentContract.create({
      data: {
        userId: beneficiary.id,
        packageType,
        amountInInr: amountInrDec.toFixed(2),
        amountInUsdt: amountUsdtDec.toFixed(8),
        dailyRoiRate: dailyRoiRate.toFixed(2),
        tenureDays,
        daysPaid: 0,
        status: "ACTIVE",
        maturityDate,
      },
    });

    // Deduct Fund Wallet of caller
    await executeLedgerTransaction({
      userId: caller.id,
      type: "PACKAGE_PURCHASE",
      wallet: "FUND",
      amount: amountUsdtDec.negated(),
      referenceKey: `PKG_PURCHASE_${contract.id}_${caller.id}`,
      description: `Activated ${packageType === "BASIC_SAVING" ? "Basic Saving" : "Fix Deposit"} Package ($${amountUsdtDec.toFixed(2)} USDT) for ${beneficiary.customId}`,
      sourceUserId: beneficiary.id,
    });

    // Ensure beneficiary status is ACTIVE
    if (beneficiary.status === "INACTIVE") {
      await db.user.update({
        where: { id: beneficiary.id },
        data: { status: "ACTIVE" },
      });
    }

    // Process instant direct referral commission for beneficiary sponsor (Dark PDF 10%)
    await processDirectReferralReward(beneficiary.id, contract.id, amountUsdtDec.toNumber());

    await recordActivity({
      userId: caller.id,
      action: "PACKAGE_ACTIVATION",
      category: "FINANCIAL",
      description: `Activated ${packageType === "BASIC_SAVING" ? "Basic Saving" : "Fix Deposit"} Package of $${amountUsdtDec.toFixed(2)} USDT for ${beneficiary.customId}`,
      req,
      metadata: {
        contractId: contract.id,
        packageType,
        amountInUsdt: amountUsdtDec.toNumber(),
        beneficiaryCustomId: beneficiary.customId,
        tenureDays,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Package of $${amountUsdtDec.toFixed(2)} USDT activated successfully!`,
      contractId: contract.id,
    });
  } catch (error: any) {
    console.error("Activation error:", error);
    return NextResponse.json({ error: error.message || "Failed to activate package." }, { status: 500 });
  }
}