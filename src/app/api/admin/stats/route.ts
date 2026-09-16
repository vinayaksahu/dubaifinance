import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUpcomingCycleForecast } from "@/lib/services/roiService";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const adminId = session.userId;
  const userFilter = { adminId, role: "USER" as const };
  const userRelationFilter = { user: { adminId } };

  const [totalUsers, activeUsers, pendingDeposits, pendingWithdrawals, activeContracts] = await Promise.all([
    db.user.count({ where: userFilter }),
    db.user.count({ where: { ...userFilter, status: "ACTIVE" } }),
    db.depositRequest.count({ where: { status: "PENDING", ...userRelationFilter } }),
    db.withdrawalRequest.count({ where: { status: "PENDING", ...userRelationFilter } }),
    db.investmentContract.count({ where: { status: "ACTIVE", ...userRelationFilter } }),
  ]);

  const depositsAgg = await db.depositRequest.aggregate({
    where: { status: "APPROVED", ...userRelationFilter },
    _sum: { amountInUsdt: true },
  });

  // Calculate detailed withdrawal stats including 10% admin fee income
  const allWithdrawals = await db.withdrawalRequest.findMany({
    where: { status: { in: ["PROCESSED", "PENDING"] }, ...userRelationFilter },
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

  // Fetch upcoming cycle forecast for next 12:01 AM Dubai cycle scoped to this admin's team
  let upcomingCycle = null;
  try {
    upcomingCycle = await getUpcomingCycleForecast(adminId);
  } catch (err) {
    console.error("Failed to compute upcoming cycle forecast:", err);
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
      // Next upcoming Dubai 12:01 AM cycle forecast
      upcomingCycle,
    },
  });
}