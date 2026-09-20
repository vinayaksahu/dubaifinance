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

    if (!admin || !admin.email) {
      return NextResponse.json({ error: "Admin email not found." }, { status: 404 });
    }

    const normalizedEmail = admin.email.toLowerCase().trim();

    // Check cooldown: don't allow resending within 60 seconds
    const existingOtp = await (db as any).otpVerification.findFirst({
      where: {
        email: normalizedEmail,
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
    await sendOtpEmail(normalizedEmail, "ADMIN_PROFILE_UPDATE");

    // Mask email for display (e.g. v***u@gmail.com)
    const [name, domain] = normalizedEmail.split("@");
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}*`;
    const maskedEmail = `${maskedName}@${domain}`;

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${maskedEmail}. Please check your inbox or spam.`,
      maskedEmail,
    });
  } catch (error: any) {
    console.error("[Admin Profile Send-OTP Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send verification code." },
      { status: 500 }
    );
  }
}
