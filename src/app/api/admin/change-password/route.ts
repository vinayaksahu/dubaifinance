import { NextResponse } from "next/server";
import { getSession, comparePassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    const admin = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true, customId: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword.trim());

    await db.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash },
    });

    await recordActivity({
      userId: session.userId,
      action: "ADMIN_PASSWORD_CHANGE",
      category: "SECURITY",
      description: `Admin ${admin.customId} changed their account password`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Password for Admin ${admin.customId} changed successfully!`,
    });
  } catch (error: any) {
    console.error("[Admin Change Password Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
