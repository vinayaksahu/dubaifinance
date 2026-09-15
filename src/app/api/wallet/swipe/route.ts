import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { inrToUsdt } from "@/lib/constants";
import { verifyOtp } from "@/lib/mail";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountInInr, amountInUsdt, amount, transactionPin, otp } = await req.json();
    const rawAmount = amountInUsdt ?? amount ?? amountInInr;
    const verificationCode = (otp || transactionPin || "").trim();

    if (!rawAmount || !verificationCode) {
      return NextResponse.json({ error: "Amount and Security OTP / PIN are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, transactionPin: true, incomeBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

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

    let parsedUsdt = Number(rawAmount);
    if (!amountInUsdt && !amount && Number(amountInInr) > 5000) {
      parsedUsdt = Number(amountInInr) / 110;
    }
    const amountUsdtDec = new Decimal(parsedUsdt.toString());

    const incomeBal = new Decimal(user.incomeBalance.toString());
    if (incomeBal.lessThan(amountUsdtDec)) {
      return NextResponse.json({ error: "Insufficient Available Income balance." }, { status: 400 });
    }

    const refBase = `SWIPE_${user.id}_${Date.now()}`;

    // Debit Income Wallet
    await executeLedgerTransaction({
      userId: user.id,
      type: "SWIPE_INCOME_TO_FUND",
      wallet: "INCOME",
      amount: amountUsdtDec.negated(),
      referenceKey: `${refBase}_DEBIT`,
      description: `Swipe $${amountUsdtDec.toFixed(2)} USDT from Income to Fund Wallet`,
    });

    // Credit Fund Wallet (0% fee)
    await executeLedgerTransaction({
      userId: user.id,
      type: "SWIPE_INCOME_TO_FUND",
      wallet: "FUND",
      amount: amountUsdtDec,
      referenceKey: `${refBase}_CREDIT`,
      description: `Fund Wallet Credited via Income Swipe ($${amountUsdtDec.toFixed(2)} USDT)`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${amountUsdtDec.toFixed(2)} USDT to Fund Wallet.`,
    });
  } catch (error: any) {
    console.error("Swipe error:", error);
    return NextResponse.json({ error: error.message || "Failed to convert funds." }, { status: 500 });
  }
}