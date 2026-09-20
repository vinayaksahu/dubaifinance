import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/mail";
import { recordActivity } from "@/lib/auditLogger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const adminUser = await db.user.findUnique({
      where: { id: session.userId },
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
        usdtAddress: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: adminUser });
  } catch (error: any) {
    console.error("[Admin Profile GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, phone, otp } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }

    if (!otp || typeof otp !== "string" || !otp.trim()) {
      return NextResponse.json(
        { error: "Security OTP is required to update admin profile. Click 'Send OTP' to receive verification code." },
        { status: 400 }
      );
    }

    const currentAdmin = await db.user.findUnique({
      where: { id: session.userId },
      select: { email: true, customId: true },
    });

    if (!currentAdmin || !currentAdmin.email) {
      return NextResponse.json({ error: "Admin account email not found." }, { status: 404 });
    }

    const currentRegisteredEmail = currentAdmin.email.toLowerCase().trim();

    // Security Verification: Check OTP sent to the account's existing registered email
    const isOtpValid = await verifyOtp(currentRegisteredEmail, otp.trim(), "ADMIN_PROFILE_UPDATE");
    if (!isOtpValid) {
      return NextResponse.json(
        { error: `Invalid or expired OTP code. Please enter the 6-digit code sent to ${currentRegisteredEmail}.` },
        { status: 400 }
      );
    }

    const updateData: any = {
      fullName: fullName.trim(),
      phone: phone ? String(phone).trim() : null,
    };

    // If changing email address, check that the new email format is valid and not already taken
    if (email && typeof email === "string" && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== currentRegisteredEmail) {
        const existing = await db.user.findFirst({
          where: {
            email: cleanEmail,
            NOT: { id: session.userId },
          },
        });
        if (existing) {
          return NextResponse.json({ error: `Email "${cleanEmail}" is already taken by another user (${existing.customId}).` }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
    }

    const updatedAdmin = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        teamPrefix: true,
      },
    });

    await recordActivity({
      userId: session.userId,
      action: "ADMIN_PROFILE_UPDATE",
      category: "PROFILE",
      description: `Admin ${updatedAdmin.customId} updated profile details (name: ${updatedAdmin.fullName}${updateData.email ? `, email changed to: ${updatedAdmin.email}` : ""})`,
      req,
      metadata: { fullName: updatedAdmin.fullName, email: updatedAdmin.email, phone: updatedAdmin.phone },
    });

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully with verified authorization!",
      user: updatedAdmin,
    });
  } catch (error: any) {
    console.error("[Admin Profile POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
