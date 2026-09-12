import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const [totalUsers, activeUsers, pendingDeposits, pendingWithdrawals, activeContracts] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.depositRequest.count({ where: { status: "PENDING" } }),
    db.withdrawalRequest.count({ where: { status: "PENDING" } }),
    db.investmentContract.count({ where: { status: "ACTIVE" } }),
  ]);

  const depositsAgg = await db.depositRequest.aggregate({
    where: { status: "APPROVED" },
    _sum: { amountInUsdt: true },
  });

  const withdrawalsAgg = await db.withdrawalRequest.aggregate({
    where: { status: "PROCESSED" },
    _sum: { amountInUsdt: true },
  });

  return NextResponse.json({
    stats: {
      totalUsers,
      activeUsers,
      pendingDeposits,
      pendingWithdrawals,
      activeContracts,
      totalApprovedDepositsUsdt: depositsAgg._sum.amountInUsdt || 0,
      totalProcessedWithdrawalsUsdt: withdrawalsAgg._sum.amountInUsdt || 0,
    },
  });
}