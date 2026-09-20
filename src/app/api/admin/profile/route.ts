import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/mail";

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
        { error: "Security OTP is required to update admin profile." },
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

    // Verify OTP sent to current admin's email
    const isOtpValid = await verifyOtp(currentAdmin.email, otp.trim(), "ADMIN_PROFILE_UPDATE");
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code. Please request a new verification code." },
        { status: 400 }
      );
    }

    const updateData: any = {
      fullName: fullName.trim(),
      phone: phone ? String(phone).trim() : null,
    };

    // If email is provided and different, check uniqueness
    if (email && typeof email === "string" && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
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

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully with OTP verification!",
      user: updatedAdmin,
    });
  } catch (error: any) {
    console.error("[Admin Profile POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
