import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { getSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // IP-level rate limit for OTP sending (6 requests per 10 minutes)
    const ipLimit = await checkRateLimit({
      key: `otp_req_ip:${ip}`,
      limit: 6,
      windowSeconds: 600,
    });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many verification code requests from your IP. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { purpose = "REGISTRATION" } = body;
    let rawEmail = body.email;

    // If email is not passed but purpose is TRANSACTION, try to get from session
    if (!rawEmail && purpose === "TRANSACTION") {
      const session = await getSession();
      if (session?.userId) {
        const user = await db.user.findUnique({
          where: { id: session.userId },
          select: { email: true },
        });
        if (user) rawEmail = user.email;
      }
    }

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email format." },
        { status: 400 }
      );
    }

    // Email-level rate limit (3 OTP requests per 10 minutes)
    const emailLimit = await checkRateLimit({
      key: `otp_req_email:${normalizedEmail}`,
      limit: 3,
      windowSeconds: 600,
    });
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: "Too many verification attempts for this email address. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // Check if email already registered for REGISTRATION purpose
    if (purpose === "REGISTRATION") {
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "This email is already registered. Please login." },
          { status: 400 }
        );
      }
    }

    // Check if user exists for FORGOT_PASSWORD purpose with uniform response to prevent user enumeration
    if (purpose === "FORGOT_PASSWORD") {
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!existingUser) {
        // Uniform message prevents account enumeration
        return NextResponse.json({
          success: true,
          message: `If an active account exists with that email address, a verification code has been sent. Please check your inbox and spam folder.`,
        });
      }
    }

    // Rate-limiting check: Don't allow resending within 60 seconds
    const existingOtp = await (db as any).otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingOtp) {
      const timeSinceLastOtp = Date.now() - new Date(existingOtp.createdAt).getTime();
      const cooldownMs = 60 * 1000; // 60 seconds
      if (timeSinceLastOtp < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds}s before requesting a new OTP.` },
          { status: 429 }
        );
      }
    }

    // Resolve Gmail / SMTP credentials safely
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Email notification service is temporarily unavailable." },
          { status: 500 }
        );
      }
    }

    // Send the OTP via mailer
    await sendOtpEmail(normalizedEmail, purpose);

    return NextResponse.json({
      success: true,
      message: `Verification code sent successfully to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error("[Send OTP Error]:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to send verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}
