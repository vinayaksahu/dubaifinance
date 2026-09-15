import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose = "REGISTRATION" } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

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
