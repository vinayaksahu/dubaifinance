import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { processDirectReferralReward } from "@/lib/services/referralService";
import { getNumericConfig } from "@/lib/configService";
import { APP_CONFIG, inrToUsdt } from "@/lib/constants";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { packageType, amountInInr, targetCustomId, transactionPin, fdTenureDays } = await req.json();

    if (!packageType || !amountInInr || !transactionPin) {
      return NextResponse.json({ error: "Package type, amount and 6-digit PIN are required." }, { status: 400 });
    }

    // Verify user PIN
    const caller = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, customId: true, transactionPin: true, fundBalance: true, status: true },
    });

    if (!caller || !caller.transactionPin) {
      return NextResponse.json({ error: "Please set your 6-digit Transaction PIN in Security settings first." }, { status: 400 });
    }

    const isPinValid = await comparePin(transactionPin, caller.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ error: "Invalid 6-digit Transaction PIN." }, { status: 401 });
    }

    // Target beneficiary
    let beneficiary = caller;
    if (targetCustomId && targetCustomId.trim() !== caller.customId) {
      const found = await db.user.findUnique({ where: { customId: targetCustomId.trim() } });
      if (!found) {
        return NextResponse.json({ error: `Beneficiary ID ${targetCustomId} not found.` }, { status: 404 });
      }
      beneficiary = found;
    }

    const rate = await getNumericConfig("USDT_TO_INR_RATE", APP_CONFIG.usdtToInrRate);
    const amountInrDec = new Decimal(amountInInr.toString());
    const amountUsdt = Number((amountInrDec.toNumber() / rate).toFixed(4));
    const amountUsdtDec = new Decimal(amountUsdt.toString());

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
        error: `Insufficient Fund Balance. You have $${callerFundDec.toFixed(4)} USDT, but $${amountUsdtDec.toFixed(4)} USDT is required.`,
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

    // Process instant 15% direct referral commission for beneficiary sponsor
    await processDirectReferralReward(beneficiary.id, contract.id, amountInrDec.toNumber());

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