import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { recordActivity } from "@/lib/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin privileges required." }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    // Lookup target user
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        role: true,
        adminId: true,
        status: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    // Role boundary checks: Only SUPER_ROOT_ADMIN can impersonate admins or other branches
    if (session.role !== "SUPER_ROOT_ADMIN") {
      // Normal admin can only impersonate members in their own branch
      if (targetUser.role !== "USER" || targetUser.adminId !== session.userId) {
        return NextResponse.json({ error: "Forbidden: You can only inspect members in your own branch." }, { status: 403 });
      }
    }

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get("df_session")?.value;

    // Check if backup super root token already exists
    const existingBackup = cookieStore.get("df_superroot_backup")?.value;
    const backupToken = existingBackup || currentSessionToken;

    // Create target session token
    const targetToken = await createSessionToken({
      userId: targetUser.id,
      customId: targetUser.customId,
      role: targetUser.role,
      email: targetUser.email,
      adminId: targetUser.adminId,
    });

    // Log the impersonation action into audit logs
    await recordActivity({
      userId: session.userId,
      action: "IMPERSONATE_PORTAL_ENTER",
      category: "SECURITY",
      description: `Super Root Admin (${session.customId}) entered portal of ${targetUser.role} ${targetUser.customId} (${targetUser.fullName})`,
      req,
      metadata: {
        impersonatorId: session.userId,
        impersonatorCustomId: session.customId,
        targetUserId: targetUser.id,
        targetCustomId: targetUser.customId,
        targetRole: targetUser.role,
      },
    });

    // Destination portal
    const redirectUrl = targetUser.role === "USER" ? "/member" : "/admin";

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      targetUser: {
        id: targetUser.id,
        customId: targetUser.customId,
        fullName: targetUser.fullName,
        role: targetUser.role,
      },
    });

    // Set cookies:
    // 1. Preserve the original Super Root Admin token in backup cookie
    if (backupToken) {
      response.cookies.set("df_superroot_backup", backupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    // 2. Set impersonator label cookie
    response.cookies.set("df_impersonator", `${session.customId}|${session.role}`, {
      httpOnly: false, // Accessible by client UI for banner
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // 3. Switch main session to the target user
    response.cookies.set("df_session", targetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Impersonate Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to switch portal." }, { status: 500 });
  }
}
