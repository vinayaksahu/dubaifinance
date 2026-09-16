import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    // Fetch all sub-admins
    const admins = await db.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        NOT: { role: "SUPER_ROOT_ADMIN" },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        teamPrefix: true,
        createdAt: true,
      },
    });

    // Gather branch stats for each admin
    const enrichedAdmins = await Promise.all(
      admins.map(async (adm) => {
        const [
          totalMembers,
          activeMembers,
          pendingDeposits,
          pendingWithdrawals,
          approvedDepositsAgg,
          processedWithdrawalsAgg,
          activeContractsCount,
        ] = await Promise.all([
          db.user.count({ where: { adminId: adm.id, role: "USER" } }),
          db.user.count({ where: { adminId: adm.id, role: "USER", status: "ACTIVE" } }),
          db.depositRequest.count({ where: { user: { adminId: adm.id }, status: "PENDING" } }),
          db.withdrawalRequest.count({ where: { user: { adminId: adm.id }, status: "PENDING" } }),
          db.depositRequest.aggregate({
            where: { user: { adminId: adm.id }, status: "APPROVED" },
            _sum: { amountInUsdt: true },
          }),
          db.withdrawalRequest.aggregate({
            where: { user: { adminId: adm.id }, status: "PROCESSED" },
            _sum: { amountInUsdt: true, feeAmount: true },
          }),
          db.investmentContract.count({ where: { user: { adminId: adm.id }, status: "ACTIVE" } }),
        ]);

        return {
          ...adm,
          totalMembers,
          activeMembers,
          pendingDeposits,
          pendingWithdrawals,
          activeContractsCount,
          totalDepositsUsdt: Number(approvedDepositsAgg._sum.amountInUsdt || 0),
          totalWithdrawalsUsdt: Number(processedWithdrawalsAgg._sum.amountInUsdt || 0),
          totalAdminFeeUsdt: Number(processedWithdrawalsAgg._sum.feeAmount || 0),
        };
      })
    );

    return NextResponse.json({ admins: enrichedAdmins });
  } catch (error: any) {
    console.error("[SuperAdmin Admins GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const { fullName, customId, email, phone, password, teamPrefix } = await req.json();

    if (!fullName || !customId || !email || !password) {
      return NextResponse.json({ error: "Full Name, Admin ID, Email, and Password are required." }, { status: 400 });
    }

    const cleanCustomId = customId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPrefix = (teamPrefix || "").toString().trim() || null;

    // Check duplicate ID
    const existingId = await db.user.findFirst({
      where: { customId: cleanCustomId },
    });
    if (existingId) {
      return NextResponse.json({ error: `Admin ID "${cleanCustomId}" is already taken.` }, { status: 400 });
    }

    // Check duplicate Email
    const existingEmail = await db.user.findFirst({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json({ error: `Email "${cleanEmail}" is already registered.` }, { status: 400 });
    }

    // Check if teamPrefix is already used by another admin
    if (cleanPrefix) {
      const existingPrefix = await db.user.findFirst({
        where: {
          teamPrefix: cleanPrefix,
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
        },
      });
      if (existingPrefix) {
        return NextResponse.json(
          { error: `Team digit prefix "${cleanPrefix}" is already assigned to Admin ${existingPrefix.customId} (${existingPrefix.fullName}). Please choose another digit.` },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(password.trim());

    const newAdmin = await db.user.create({
      data: {
        customId: cleanCustomId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        teamPrefix: cleanPrefix,
        fundBalance: 0,
        incomeBalance: 0,
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
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${newAdmin.customId} created successfully.`,
      admin: newAdmin,
    });
  } catch (error: any) {
    console.error("[SuperAdmin Admins POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create admin" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const { adminId, action, newPassword, status, teamPrefix } = await req.json();
    if (!adminId) {
      return NextResponse.json({ error: "adminId is required." }, { status: 400 });
    }

    const targetAdmin = await db.user.findUnique({
      where: { id: adminId },
    });
    if (!targetAdmin || targetAdmin.role === "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Target admin not found or invalid operation." }, { status: 404 });
    }

    if (action === "TOGGLE_STATUS") {
      const updatedStatus = targetAdmin.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      await db.user.update({
        where: { id: adminId },
        data: { status: updatedStatus },
      });
      return NextResponse.json({ success: true, message: `Admin ${targetAdmin.customId} status updated to ${updatedStatus}.` });
    }

    if (action === "RESET_PASSWORD") {
      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }
      const passwordHash = await hashPassword(newPassword.trim());
      await db.user.update({
        where: { id: adminId },
        data: { passwordHash },
      });
      return NextResponse.json({ success: true, message: `Password for Admin ${targetAdmin.customId} updated successfully.` });
    }

    if (action === "UPDATE_PREFIX") {
      const cleanPrefix = (teamPrefix || "").toString().trim() || null;
      if (cleanPrefix) {
        const existingPrefix = await db.user.findFirst({
          where: {
            teamPrefix: cleanPrefix,
            NOT: { id: adminId },
            role: { in: ["ADMIN", "SUPER_ADMIN"] },
          },
        });
        if (existingPrefix) {
          return NextResponse.json(
            { error: `Team digit prefix "${cleanPrefix}" is already assigned to Admin ${existingPrefix.customId}.` },
            { status: 400 }
          );
        }
      }

      await db.user.update({
        where: { id: adminId },
        data: { teamPrefix: cleanPrefix },
      });
      return NextResponse.json({ success: true, message: `Team prefix updated to "${cleanPrefix}".` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[SuperAdmin Admins PATCH Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin" }, { status: 500 });
  }
}
