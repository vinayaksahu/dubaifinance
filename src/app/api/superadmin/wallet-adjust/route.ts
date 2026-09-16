import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const { userId, action, wallet, amount, note } = await req.json();

    if (!userId || !action || !wallet || !amount) {
      return NextResponse.json({ error: "userId, action, wallet, and amount are required." }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    const amountDec = new Decimal(numAmount.toString());
    const targetWallet = wallet === "FUND" ? "FUND" : "INCOME";

    if (action === "CREDIT") {
      await executeLedgerTransaction({
        userId: targetUser.id,
        type: "DEPOSIT",
        wallet: targetWallet as any,
        amount: amountDec,
        referenceKey: `MASTER_CREDIT_${Date.now()}_${targetUser.id.slice(-6)}`,
        description: `Master Super Root Credit: ${note || "Manual balance credit"}`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully credited $${numAmount.toFixed(2)} USDT to ${targetUser.fullName} (${targetUser.customId}) ${targetWallet} Wallet.`,
      });
    } else if (action === "DEBIT") {
      const currentBal = targetWallet === "FUND" 
        ? new Decimal(targetUser.fundBalance.toString())
        : new Decimal(targetUser.incomeBalance.toString());

      if (currentBal.lessThan(amountDec)) {
        return NextResponse.json({ 
          error: `Insufficient balance to debit. Current ${targetWallet} balance is $${currentBal.toFixed(2)} USDT.` 
        }, { status: 400 });
      }

      await executeLedgerTransaction({
        userId: targetUser.id,
        type: "WITHDRAWAL",
        wallet: targetWallet as any,
        amount: amountDec,
        referenceKey: `MASTER_DEBIT_${Date.now()}_${targetUser.id.slice(-6)}`,
        description: `Master Super Root Debit: ${note || "Manual balance adjustment"}`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully debited $${numAmount.toFixed(2)} USDT from ${targetUser.fullName} (${targetUser.customId}) ${targetWallet} Wallet.`,
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be CREDIT or DEBIT." }, { status: 400 });
  } catch (error: any) {
    console.error("[SuperAdmin Wallet Adjust Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to adjust wallet" }, { status: 500 });
  }
}
