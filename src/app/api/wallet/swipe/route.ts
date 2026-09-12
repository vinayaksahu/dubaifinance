import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { inrToUsdt } from "@/lib/constants";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountInInr, transactionPin } = await req.json();

    if (!amountInInr || !transactionPin) {
      return NextResponse.json({ error: "Amount and 6-digit PIN are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, transactionPin: true, incomeBalance: true },
    });

    if (!user || !user.transactionPin) {
      return NextResponse.json({ error: "PIN not set." }, { status: 400 });
    }

    const isPinValid = await comparePin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ error: "Invalid 6-digit Transaction PIN." }, { status: 401 });
    }

    const amountInrDec = new Decimal(amountInInr.toString());
    const amountUsdt = inrToUsdt(amountInrDec.toNumber());
    const amountUsdtDec = new Decimal(amountUsdt.toString());

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