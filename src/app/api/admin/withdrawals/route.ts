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
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { customId: true, fullName: true, email: true } },
    },
  });

  const withdrawals = rawWithdrawals.map((w) => ({
    id: w.id,
    userId: w.userId,
    user: {
      name: w.user?.fullName || "Member",
      fullName: w.user?.fullName || "Member",
      customId: w.user?.customId || "N/A",
      email: w.user?.email || "N/A",
    },
    amountUsdt: Number(w.amountInUsdt),
    amountInUsdt: Number(w.amountInUsdt),
    amountInr: Number(w.amountInInr),
    payoutAddress: w.toAddress || "",
    toAddress: w.toAddress || "",
    txHash: w.txHash || "",
    adminNote: w.adminNote,
    status: w.status,
    createdAt: w.createdAt,
  }));

  return NextResponse.json({ withdrawals });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { withdrawalId, action, txHash, adminNote } = await req.json();

  const withdrawal = await db.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: { user: true },
  });

  if (!withdrawal || withdrawal.status !== "PENDING") {
    return NextResponse.json({ error: "Invalid withdrawal or already processed." }, { status: 400 });
  }

  if (action === "APPROVE") {
    if (!txHash) {
      return NextResponse.json({ error: "Transaction hash is required." }, { status: 400 });
    }

    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: "PROCESSED", txHash, adminNote, processedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Withdrawal marked as processed." });
  } else if (action === "REJECT") {
    // Refund Income Balance
    const amountUsdtDec = new Decimal(withdrawal.amountInUsdt.toString());

    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: "REJECTED", adminNote, processedAt: new Date() },
    });

    await executeLedgerTransaction({
      userId: withdrawal.userId,
      type: "WITHDRAWAL",
      wallet: "INCOME",
      amount: amountUsdtDec,
      referenceKey: `WITHDRAWAL_REFUND_${withdrawal.id}`,
      description: `Refund for rejected withdrawal: ${adminNote || "Admin rejection"}`,
    });

    return NextResponse.json({ success: true, message: "Withdrawal rejected and funds refunded to Income Wallet." });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}