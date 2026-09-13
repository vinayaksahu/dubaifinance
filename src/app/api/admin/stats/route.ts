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

  // Calculate detailed withdrawal stats including 10% admin fee income
  const allWithdrawals = await db.withdrawalRequest.findMany({
    where: { status: { in: ["PROCESSED", "PENDING"] } },
    select: {
      status: true,
      amountInUsdt: true,
      feePercent: true,
      feeAmount: true,
      netAmount: true,
    },
  });

  let totalGrossWithdrawalsUsdt = 0;
  let adminFeeIncomeUsdt = 0; // Processed 10% fee income
  let totalNetDispatchedUsdt = 0; // Processed net payouts ($450 base)
  let pendingGrossWithdrawalsUsdt = 0;
  let pendingAdminFeeUsdt = 0;
  let pendingNetPayoutsUsdt = 0;

  for (const w of allWithdrawals) {
    const gross = Number(w.amountInUsdt);
    const feeP = w.feePercent != null ? Number(w.feePercent) : 10;
    const feeA = w.feeAmount != null && Number(w.feeAmount) > 0 ? Number(w.feeAmount) : (gross * (feeP / 100));
    const netA = w.netAmount != null && Number(w.netAmount) > 0 ? Number(w.netAmount) : (gross - feeA);

    if (w.status === "PROCESSED") {
      totalGrossWithdrawalsUsdt += gross;
      adminFeeIncomeUsdt += feeA;
      totalNetDispatchedUsdt += netA;
    } else if (w.status === "PENDING") {
      pendingGrossWithdrawalsUsdt += gross;
      pendingAdminFeeUsdt += feeA;
      pendingNetPayoutsUsdt += netA;
    }
  }

  return NextResponse.json({
    stats: {
      totalUsers,
      activeUsers,
      pendingDeposits,
      pendingWithdrawals,
      activeContracts,
      totalApprovedDepositsUsdt: Number(depositsAgg._sum.amountInUsdt || 0),
      totalProcessedWithdrawalsUsdt: totalGrossWithdrawalsUsdt,
      // Admin Income / Revenue from 10% deduction
      adminFeeIncomeUsdt,
      pendingAdminFeeUsdt,
      // Net dispatched to users ($450 base)
      totalNetDispatchedUsdt,
      pendingNetPayoutsUsdt,
      pendingGrossWithdrawalsUsdt,
    },
  });
}