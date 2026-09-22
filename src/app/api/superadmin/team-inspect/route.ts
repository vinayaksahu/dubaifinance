import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({ error: "adminId query parameter is required." }, { status: 400 });
    }

    const targetAdmin = await db.user.findFirst({
      where: {
        OR: [
          { id: adminId },
          { customId: adminId.trim() },
          { customId: adminId.trim().toUpperCase() },
        ],
      },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        teamPrefix: true,
        usdtAddress: true,
        createdAt: true,
      },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    const resolvedAdminId = targetAdmin.id;

    // Fetch all members belonging to this admin
    const members = await db.user.findMany({
      where: { adminId: resolvedAdminId, role: "USER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        fundBalance: true,
        incomeBalance: true,
        fdLockedBalance: true,
        totalWithdrawn: true,
        usdtAddress: true,
        createdAt: true,
        sponsor: { select: { customId: true, fullName: true } },
        _count: { select: { contracts: true, deposits: true, withdrawals: true } },
      },
    });

    // Fetch all deposits under this admin (including admin's own deposits)
    const deposits = await db.depositRequest.findMany({
      where: {
        OR: [
          { user: { adminId: resolvedAdminId } },
          { userId: resolvedAdminId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { customId: true, fullName: true } },
      },
    });

    // Fetch all withdrawals under this admin (including admin's own withdrawals)
    const withdrawals = await db.withdrawalRequest.findMany({
      where: {
        OR: [
          { user: { adminId: resolvedAdminId } },
          { userId: resolvedAdminId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { customId: true, fullName: true } },
      },
    });

    // Fetch active investment contracts under this admin (including admin's own contracts)
    const activeContracts = await db.investmentContract.findMany({
      where: {
        OR: [
          { user: { adminId: resolvedAdminId } },
          { userId: resolvedAdminId },
        ],
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { customId: true, fullName: true } },
      },
    });

    // Fetch recent login sessions for this admin AND their members
    const loginSessions = await db.loginSession.findMany({
      where: {
        user: {
          OR: [{ id: resolvedAdminId }, { adminId: resolvedAdminId }],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: {
          select: {
            id: true,
            customId: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
    });

    // Fetch recent activity / function logs for this admin AND their members
    const activityLogs = await db.activityLog.findMany({
      where: {
        user: {
          OR: [{ id: resolvedAdminId }, { adminId: resolvedAdminId }],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: {
          select: {
            id: true,
            customId: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
    });

    // Safe formatting to convert Decimals to numbers and BigInts to strings
    const formattedMembers = members.map((m) => ({
      ...m,
      fundBalance: Number(m.fundBalance),
      incomeBalance: Number(m.incomeBalance),
      fdLockedBalance: m.fdLockedBalance != null ? Number(m.fdLockedBalance) : 0,
      totalWithdrawn: m.totalWithdrawn != null ? Number(m.totalWithdrawn) : 0,
    }));

    const formattedDeposits = deposits.map((d) => ({
      ...d,
      amountInUsdt: Number(d.amountInUsdt),
      amountInInr: Number(d.amountInInr),
      blockNumber: d.blockNumber != null ? d.blockNumber.toString() : null,
    }));

    const formattedWithdrawals = withdrawals.map((w) => ({
      ...w,
      amountInUsdt: Number(w.amountInUsdt),
      amountInInr: Number(w.amountInInr),
      feeAmount: w.feeAmount != null ? Number(w.feeAmount) : 0,
      netAmount: w.netAmount != null ? Number(w.netAmount) : 0,
    }));

    const formattedContracts = activeContracts.map((c) => ({
      ...c,
      amountInUsdt: Number(c.amountInUsdt),
      amountInInr: Number(c.amountInInr),
      dailyRoiRate: Number(c.dailyRoiRate),
      totalEarned: c.totalEarned != null ? Number(c.totalEarned) : 0,
    }));

    // Universal BigInt-safe serialization guarantee
    const payload = {
      admin: targetAdmin,
      members: formattedMembers,
      deposits: formattedDeposits,
      withdrawals: formattedWithdrawals,
      activeContracts: formattedContracts,
      loginSessions,
      activityLogs,
    };

    const safePayload = JSON.parse(
      JSON.stringify(payload, (_key, val) => (typeof val === "bigint" ? val.toString() : val))
    );

    return NextResponse.json(safePayload);
  } catch (error: any) {
    console.error("[SuperAdmin Team Inspect Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to inspect admin team" }, { status: 500 });
  }
}
