import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/mail";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // IP-level rate limit for password reset attempts
    const ipLimit = await checkRateLimit({
      key: `reset_pwd_ip:${ip}`,
      limit: 10,
      windowSeconds: 900,
    });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts from this IP. Please wait 15 minutes." },
        { status: 429 }
      );
    }

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

    // Account-level rate limit for brute-forcing OTPs
    const emailLimit = await checkRateLimit({
      key: `reset_pwd_email:${normalizedEmail}`,
      limit: 5,
      windowSeconds: 900,
    });
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: "Too many failed attempts for this account. Please wait 15 minutes or request a new code." },
        { status: 429 }
      );
    }

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

    // Invalidate all past OTPs for this user to prevent replay
    await (db as any).otpVerification.deleteMany({
      where: {
        email: normalizedEmail,
        purpose: "FORGOT_PASSWORD",
      },
    }).catch(() => {});

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
