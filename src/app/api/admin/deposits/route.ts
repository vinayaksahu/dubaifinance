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

  const rawDeposits = await db.depositRequest.findMany({
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

  const deposits = rawDeposits.map((d) => ({
    id: d.id,
    userId: d.userId,
    user: {
      name: d.user?.fullName || "Member",
      fullName: d.user?.fullName || "Member",
      customId: d.user?.customId || "N/A",
      email: d.user?.email || "N/A",
    },
    amountUsdt: Number(d.amountInUsdt),
    amountInUsdt: Number(d.amountInUsdt),
    amountInr: Number(d.amountInInr),
    txHash: d.txHash || "",
    status: d.status,
    adminNote: d.adminNote,
    createdAt: d.createdAt,
  }));

  return NextResponse.json({ deposits });
}

import { sanitizeText } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { depositId, action, adminNote } = await req.json();
  const cleanedAdminNote = adminNote ? sanitizeText(adminNote, 250) : null;

  const deposit = await db.depositRequest.findFirst({
    where: { 
      id: depositId,
      OR: [
        { user: { adminId: session.userId } },
        { userId: session.userId },
      ],
    },
    include: { user: true },
  });

  if (!deposit || deposit.status !== "PENDING") {
    return NextResponse.json({ error: "Invalid deposit or already resolved." }, { status: 400 });
  }

  if (action === "APPROVE") {
    const amountUsdtDec = new Decimal(deposit.amountInUsdt.toString());

    await db.depositRequest.update({
      where: { id: depositId },
      data: { status: "APPROVED", adminNote: cleanedAdminNote, reviewedAt: new Date() },
    });

    // Credit user's Fund Wallet
    await executeLedgerTransaction({
      userId: deposit.userId,
      type: "DEPOSIT",
      wallet: "FUND",
      amount: amountUsdtDec,
      referenceKey: `DEPOSIT_APPROVED_${deposit.id}`,
      description: `Approved USDT BEP-20 Deposit (Tx: ${deposit.txHash})`,
    });

    return NextResponse.json({ success: true, message: "Deposit approved and Fund Wallet credited." });
  } else if (action === "REJECT") {
    await db.depositRequest.update({
      where: { id: depositId },
      data: { status: "REJECTED", adminNote: cleanedAdminNote, reviewedAt: new Date() },
    });
    return NextResponse.json({ success: true, message: "Deposit rejected." });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}