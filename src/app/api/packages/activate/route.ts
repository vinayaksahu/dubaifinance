import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { processDirectReferralReward } from "@/lib/services/referralService";
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

    const amountInrDec = new Decimal(amountInInr.toString());
    const amountUsdt = inrToUsdt(amountInrDec.toNumber());
    const amountUsdtDec = new Decimal(amountUsdt.toString());

    // Validate Package Limits
    let dailyRoiRate: Decimal;
    let tenureDays: number;

    if (packageType === "BASIC_SAVING") {
      if (amountUsdtDec.lessThan(APP_CONFIG.basicPlan.minUsdt) || amountUsdtDec.greaterThan(APP_CONFIG.basicPlan.maxUsdt)) {
        return NextResponse.json({
          error: `Basic Saving Package must be between $${APP_CONFIG.basicPlan.minUsdt} and $${APP_CONFIG.basicPlan.maxUsdt} USDT.`,
        }, { status: 400 });
      }
      dailyRoiRate = new Decimal(APP_CONFIG.basicPlan.dailyRoiRate);
      tenureDays = APP_CONFIG.basicPlan.tenureDays; // 30 Days
    } else if (packageType === "FIX_DEPOSIT") {
      const tenure = Number(fdTenureDays) || 180;
      if (tenure !== 180 && tenure !== 210) {
        return NextResponse.json({ error: "FD Tenure must be either 180 Days (10%) or 210 Days (15%)." }, { status: 400 });
      }
      tenureDays = tenure;
      dailyRoiRate = tenure === 180 ? new Decimal(10.0) : new Decimal(15.0);
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