import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, hashPin, createSessionToken } from "@/lib/auth";
import { executeLedgerTransaction } from "@/lib/ledger";
import { APP_CONFIG } from "@/lib/constants";
import { verifyOtp } from "@/lib/mail";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password, transactionPin, sponsorCode, otp } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: "Valid 6-digit Email Verification Code (OTP) is required." },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOtp = await verifyOtp(email, otp, "REGISTRATION");
    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Check existing email
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    // Resolve sponsor
    let sponsor = null;
    if (sponsorCode) {
      sponsor = await db.user.findUnique({ where: { customId: sponsorCode } });
    }
    if (!sponsor) {
      // Default to root admin
      sponsor = await db.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    }

    // Generate unique customId like DF836419
    let customId = "";
    let isUnique = false;
    while (!isUnique) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      customId = `DF${rand}`;
      const found = await db.user.findUnique({ where: { customId } });
      if (!found) isUnique = true;
    }

    const passwordHash = await hashPassword(password);
    const pinHash = await hashPin(transactionPin || "123456");

    const newUser = await db.user.create({
      data: {
        customId,
        fullName,
        email,
        phone: phone || null,
        passwordHash,
        transactionPin: pinHash,
        sponsorId: sponsor?.id || null,
        status: "INACTIVE",
        role: "USER",
      },
    });

    // Credit Signup Welcome Bonus directly in USDT ($0.50 USDT per Dark PDF Slide 21)
    const bonusUsdt = new Decimal(APP_CONFIG.signupBonusUsdt);
    await executeLedgerTransaction({
      userId: newUser.id,
      type: "SIGNUP_BONUS",
      wallet: "INCOME",
      amount: bonusUsdt,
      referenceKey: `SIGNUP_BONUS_${newUser.id}`,
      description: `Welcome Bonus $${bonusUsdt.toFixed(2)} USDT`,
    });

    // Create session token
    const token = await createSessionToken({
      userId: newUser.id,
      customId: newUser.customId,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        customId: newUser.customId,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });

    response.cookies.set("df_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}