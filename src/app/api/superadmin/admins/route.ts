import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";

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
          db.depositRequest.count({
            where: {
              OR: [
                { user: { adminId: adm.id } },
                { userId: adm.id },
              ],
              status: "PENDING",
            },
          }),
          db.withdrawalRequest.count({
            where: {
              OR: [
                { user: { adminId: adm.id } },
                { userId: adm.id },
              ],
              status: "PENDING",
            },
          }),
          db.depositRequest.aggregate({
            where: {
              OR: [
                { user: { adminId: adm.id } },
                { userId: adm.id },
              ],
              status: "APPROVED",
            },
            _sum: { amountInUsdt: true },
          }),
          db.withdrawalRequest.aggregate({
            where: {
              OR: [
                { user: { adminId: adm.id } },
                { userId: adm.id },
              ],
              status: "PROCESSED",
            },
            _sum: { amountInUsdt: true, feeAmount: true },
          }),
          db.investmentContract.count({
            where: {
              OR: [
                { user: { adminId: adm.id } },
                { userId: adm.id },
              ],
              status: "ACTIVE",
            },
          }),
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

    const { fullName, customId, teamPrefix, email, phone, password, role } = await req.json();

    if (!fullName || !customId || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const cleanCustomId = customId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPrefix = teamPrefix ? teamPrefix.trim() : null;

    // Check duplicate Custom ID
    const existing = await db.user.findUnique({
      where: { customId: cleanCustomId },
    });
    if (existing) {
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
        role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
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

    await recordActivity({
      userId: session.userId,
      action: "ADMIN_CREATED",
      category: "ADMIN",
      description: `Super Root Admin created new Admin ${newAdmin.customId} (${newAdmin.fullName})`,
      req,
      metadata: { adminId: newAdmin.id, customId: newAdmin.customId },
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

    const body = await req.json();
    const { adminId, action, newPassword, status, teamPrefix, fullName, email, phone, password } = body;
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
      await recordActivity({
        userId: session.userId,
        action: "ADMIN_STATUS_CHANGED",
        category: "ADMIN",
        description: `Super Root Admin changed status of Admin ${targetAdmin.customId} to ${updatedStatus}`,
        req,
        metadata: { adminId, newStatus: updatedStatus },
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
      await recordActivity({
        userId: session.userId,
        action: "ADMIN_PASSWORD_RESET",
        category: "SECURITY",
        description: `Super Root Admin reset password for Admin ${targetAdmin.customId}`,
        req,
        metadata: { adminId },
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
      await recordActivity({
        userId: session.userId,
        action: "ADMIN_PREFIX_UPDATED",
        category: "ADMIN",
        description: `Super Root Admin set team prefix "${cleanPrefix}" for Admin ${targetAdmin.customId}`,
        req,
        metadata: { adminId, teamPrefix: cleanPrefix },
      });
      return NextResponse.json({ success: true, message: `Team prefix updated to "${cleanPrefix}".` });
    }

    if (action === "UPDATE_DETAILS" || action === "UPDATE_PROFILE") {
      const updateData: any = {};

      // 1. Update Full Name
      if (fullName !== undefined) {
        if (!fullName || !fullName.trim()) {
          return NextResponse.json({ error: "Full Name cannot be empty." }, { status: 400 });
        }
        updateData.fullName = fullName.trim();
      }

      // 2. Update Email
      if (email !== undefined) {
        if (!email || !email.trim()) {
          return NextResponse.json({ error: "Email cannot be empty." }, { status: 400 });
        }
        const cleanEmail = email.trim().toLowerCase();
        const existingEmail = await db.user.findFirst({
          where: {
            email: cleanEmail,
            NOT: { id: adminId },
          },
        });
        if (existingEmail) {
          return NextResponse.json(
            { error: `Email "${cleanEmail}" is already used by another account (${existingEmail.customId}).` },
            { status: 400 }
          );
        }
        updateData.email = cleanEmail;
      }

      // 3. Update Contact Phone
      if (phone !== undefined) {
        updateData.phone = phone ? phone.trim() : null;
      }

      // 4. Update Team Prefix (if provided)
      if (teamPrefix !== undefined) {
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
        updateData.teamPrefix = cleanPrefix;
      }

      // 5. Update Password (optional)
      const passCandidate = password || newPassword;
      if (passCandidate && passCandidate.trim()) {
        if (passCandidate.trim().length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }
        updateData.passwordHash = await hashPassword(passCandidate.trim());
      }

      // 6. Update Role (optional, e.g. SUPER_ADMIN or ADMIN)
      if (body.role && (body.role === "SUPER_ADMIN" || body.role === "ADMIN")) {
        updateData.role = body.role;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
      }

      const updated = await db.user.update({
        where: { id: adminId },
        data: updateData,
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          phone: true,
          teamPrefix: true,
          status: true,
          role: true,
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "ADMIN_DETAILS_UPDATED",
        category: "ADMIN",
        description: `Super Root Admin modified profile/credentials of Admin ${targetAdmin.customId}`,
        req,
        metadata: { adminId, updatedFields: Object.keys(updateData) },
      });

      return NextResponse.json({
        success: true,
        message: `Admin ${targetAdmin.customId} profile & credentials updated successfully.`,
        admin: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[SuperAdmin Admins PATCH Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin" }, { status: 500 });
  }
}
