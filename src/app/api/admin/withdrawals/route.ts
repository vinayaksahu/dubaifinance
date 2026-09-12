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

  const withdrawals = await db.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { customId: true, fullName: true, email: true } },
    },
  });

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
    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: "PROCESSED",
        txHash: txHash || "MANUAL_DISPATCH",
        adminNote,
        processedAt: new Date(),
      },
    });

    // Update totalWithdrawn on User
    const currentWithdrawn = new Decimal(withdrawal.user.totalWithdrawn.toString());
    const amountUsdtDec = new Decimal(withdrawal.amountInUsdt.toString());
    await db.user.update({
      where: { id: withdrawal.userId },
      data: {
        totalWithdrawn: currentWithdrawn.plus(amountUsdtDec).toFixed(8),
      },
    });

    return NextResponse.json({ success: true, message: "Withdrawal marked as processed." });
  } else if (action === "REJECT") {
    const amountUsdtDec = new Decimal(withdrawal.amountInUsdt.toString());

    await db.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        adminNote,
        processedAt: new Date(),
      },
    });

    // Refund back to user's Income Wallet
    await executeLedgerTransaction({
      userId: withdrawal.userId,
      type: "WITHDRAWAL_REFUND",
      wallet: "INCOME",
      amount: amountUsdtDec,
      referenceKey: `REFUND_WITHDRAWAL_${withdrawal.id}`,
      description: `Refund of Rejected Withdrawal #${withdrawal.id}: ${adminNote || "Rejected by administrator"}`,
    });

    return NextResponse.json({ success: true, message: "Withdrawal rejected and funds refunded to user." });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}