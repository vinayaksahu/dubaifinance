import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/mail";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, 6-digit OTP, and new password are required." },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit OTP." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP for FORGOT_PASSWORD
    const isValid = await verifyOtp(normalizedEmail, otp, "FORGOT_PASSWORD");
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new security code." },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("[Reset Password Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
