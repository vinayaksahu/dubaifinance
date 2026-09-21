import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import Decimal from "decimal.js";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rawWithdrawals = await db.withdrawalRequest.findMany({
    where: {
      OR: [
        { user: { adminId: session.userId } },
        { userId: session.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { customId: true, fullName: true, email: true } },
    },
  });

  let totalProcessedGross = 0;
  let totalProcessedFee = 0;
  let totalProcessedNet = 0;
  let pendingGross = 0;
  let pendingFee = 0;
  let pendingNet = 0;

  const withdrawals = rawWithdrawals.map((w) => {
    const gross = Number(w.amountInUsdt);
    const feePercent = w.feePercent != null ? Number(w.feePercent) : 10;
    const feeAmount = w.feeAmount != null && Number(w.feeAmount) > 0 
      ? Number(w.feeAmount) 
      : (gross * (feePercent / 100));
    const netAmount = w.netAmount != null && Number(w.netAmount) > 0 
      ? Number(w.netAmount) 
      : (gross - feeAmount);

    if (w.status === "PROCESSED") {
      totalProcessedGross += gross;
      totalProcessedFee += feeAmount;
      totalProcessedNet += netAmount;
    } else if (w.status === "PENDING") {
      pendingGross += gross;
      pendingFee += feeAmount;
      pendingNet += netAmount;
    }

    return {
      id: w.id,
      userId: w.userId,
      user: {
        name: w.user?.fullName || "Member",
        fullName: w.user?.fullName || "Member",
        customId: w.user?.customId || "N/A",
        email: w.user?.email || "N/A",
      },
      // Net payout amount that admin must dispatch (e.g. $450)
      amountUsdt: netAmount,
      netPayout: netAmount,
      netAmount: netAmount,
      // Gross requested amount (e.g. $500)
      grossAmount: gross,
      amountGross: gross,
      amountInUsdt: gross,
      // Admin fee retained (e.g. $50)
      feePercent: feePercent,
      feeAmount: feeAmount,
      amountInr: Number(w.amountInInr),
      payoutAddress: w.toAddress || "",
      toAddress: w.toAddress || "",
      txHash: w.txHash || "",
      adminNote: w.adminNote,
      status: w.status,
      createdAt: w.createdAt,
    };
  });

  return NextResponse.json({ 
    withdrawals,
    summary: {
      totalProcessedGross,
      totalProcessedFee, // Admin Income from 10% fee
      totalProcessedNet, // Dispatched to users
      pendingGross,
      pendingFee,
      pendingNet,
    }
  });
}

import { sanitizeText, sanitizeIdentifier } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { withdrawalId, action, txHash, adminNote } = await req.json();
  const cleanedAdminNote = adminNote ? sanitizeText(adminNote, 250) : null;
  const cleanedTxHash = txHash ? sanitizeIdentifier(txHash, "x") : "";

  const withdrawal = await db.withdrawalRequest.findFirst({
    where: { 
      id: withdrawalId,
      OR: [
        { user: { adminId: session.userId } },
        { userId: session.userId },
      ],
    },
    include: { user: true },
  });

  if (!withdrawal || withdrawal.status !== "PENDING") {
    return NextResponse.json({ error: "Invalid withdrawal or already processed." }, { status: 400 });
  }

  if (action === "APPROVE") {
    if (!cleanedTxHash) {
      return NextResponse.json({ error: "Transaction hash is required." }, { status: 400 });
    }

    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: "PROCESSED", txHash: cleanedTxHash, adminNote: cleanedAdminNote, processedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Withdrawal marked as processed." });
  } else if (action === "REJECT") {
    // Refund Income Balance
    const amountUsdtDec = new Decimal(withdrawal.amountInUsdt.toString());

    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: "REJECTED", adminNote: cleanedAdminNote, processedAt: new Date() },
    });

    await executeLedgerTransaction({
      userId: withdrawal.userId,
      type: "WITHDRAWAL",
      wallet: "INCOME",
      amount: amountUsdtDec,
      referenceKey: `WITHDRAWAL_REFUND_${withdrawal.id}`,
      description: `Refund for rejected withdrawal: ${cleanedAdminNote || "Admin rejection"}`,
    });

    return NextResponse.json({ success: true, message: "Withdrawal rejected and funds refunded to Income Wallet." });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}