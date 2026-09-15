import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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

    // Check if user exists for FORGOT_PASSWORD purpose
    if (purpose === "FORGOT_PASSWORD") {
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!existingUser) {
        return NextResponse.json(
          { error: "No Dubai Finance account found with this email address." },
          { status: 404 }
        );
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

    // Resolve Gmail credentials with default fallback
    const gmailUser = process.env.GMAIL_USER || "dubaifinance.support@gmail.com";
    const gmailPass = process.env.GMAIL_APP_PASSWORD || "afod ydtb adop milg";

    if (!gmailUser || !gmailPass) {
      return NextResponse.json(
        {
          error: "Gmail SMTP is not configured.",
        },
        { status: 500 }
      );
    }

    // Send the OTP via Gmail
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
