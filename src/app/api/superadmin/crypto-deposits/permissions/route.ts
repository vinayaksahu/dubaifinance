import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";
import { ALL_DEPOSIT_PERMISSIONS, setAdminDepositPermissions } from "@/lib/blockchain/rbac";

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
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        teamPrefix: true,
        depositMode: true,
        adminDepositPermissions: {
          select: { permission: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedAdmins = admins.map((a) => ({
      id: a.id,
      customId: a.customId,
      fullName: a.fullName,
      email: a.email,
      role: a.role,
      status: a.status,
      teamPrefix: a.teamPrefix,
      depositMode: a.depositMode || "GLOBAL",
      permissions: a.adminDepositPermissions.map((p) => p.permission),
    }));

    return NextResponse.json({
      admins: formattedAdmins,
      availablePermissions: ALL_DEPOSIT_PERMISSIONS,
    });
  } catch (error: any) {
    console.error("[Deposit Permissions GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admin permissions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const { adminId, permissions, depositMode } = await req.json();

    if (!adminId) {
      return NextResponse.json({ error: "adminId is required." }, { status: 400 });
    }

    const targetAdmin = await db.user.findUnique({
      where: { id: adminId },
      select: { customId: true, fullName: true, role: true, depositMode: true },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Target admin not found." }, { status: 404 });
    }

    // Update branch deposit mode if provided
    let cleanMode: string = targetAdmin.depositMode || "GLOBAL";
    if (depositMode) {
      const upper = depositMode.toUpperCase();
      cleanMode = upper === "AUTOMATIC" ? "AUTOMATIC" : upper === "MANUAL" ? "MANUAL" : "GLOBAL";
      await db.user.update({
        where: { id: adminId },
        data: { depositMode: cleanMode },
      });
    }

    // Update granular permissions if provided
    let updatedPermissions: any[] = [];
    if (Array.isArray(permissions)) {
      updatedPermissions = await setAdminDepositPermissions(adminId, permissions, session.userId);
    }

    await recordActivity({
      userId: session.userId,
      action: "ADMIN_BRANCH_DEPOSIT_CONFIG_UPDATE",
      category: "ADMIN",
      description: `Super Root Admin updated Admin ${targetAdmin.customId} (${targetAdmin.fullName}) deposit mode to "${cleanMode}" with ${updatedPermissions.length} permissions assigned`,
      req,
      metadata: { adminId, customId: targetAdmin.customId, depositMode: cleanMode, permissions: updatedPermissions },
    });

    return NextResponse.json({
      success: true,
      message: `Deposit settings for Admin ${targetAdmin.customId} updated successfully (Mode: ${cleanMode}).`,
      depositMode: cleanMode,
      permissions: updatedPermissions,
    });
  } catch (error: any) {
    console.error("[Deposit Permissions POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update permissions." }, { status: 500 });
  }
}
