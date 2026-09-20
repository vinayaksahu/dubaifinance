import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const admin = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, fullName: true, customId: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const rawTarget = body.email || admin.email;
    if (!rawTarget || typeof rawTarget !== "string") {
      return NextResponse.json({ error: "A valid email address is required to receive OTP." }, { status: 400 });
    }

    const targetEmail = rawTarget.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address format." }, { status: 400 });
    }

    // If changing to a new email, ensure it's not registered to someone else
    if (targetEmail !== admin.email?.toLowerCase().trim()) {
      const duplicate = await db.user.findFirst({
        where: {
          email: targetEmail,
          NOT: { id: session.userId },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Email "${targetEmail}" is already registered to another account (${duplicate.customId}).` },
          { status: 400 }
        );
      }
    }

    // Check cooldown: don't allow spamming within 60 seconds
    const existingOtp = await (db as any).otpVerification.findFirst({
      where: {
        email: targetEmail,
        purpose: "ADMIN_PROFILE_UPDATE",
      },
      orderBy: { createdAt: "desc" },
    });

    const cooldownMs = 60 * 1000;
    if (existingOtp) {
      const timeSinceLastOtp = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (timeSinceLastOtp < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds}s before requesting a new verification code.` },
          { status: 429 }
        );
      }
    }

    // Send OTP via SMTP
    await sendOtpEmail(targetEmail, "ADMIN_PROFILE_UPDATE");

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${targetEmail}. Please check your inbox or spam.`,
      targetEmail,
    });
  } catch (error: any) {
    console.error("[Admin Profile Send-OTP Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send verification code. Please check SMTP configuration." },
      { status: 500 }
    );
  }
}
