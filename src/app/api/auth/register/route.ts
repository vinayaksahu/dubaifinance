import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, hashPin, createSessionToken } from "@/lib/auth";
import { executeLedgerTransaction } from "@/lib/ledger";
import { APP_CONFIG } from "@/lib/constants";
import { sendWelcomeCredentialsEmail } from "@/lib/mail";
import { getSystemConfigValue } from "@/lib/configService";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // IP-level rate limit for registration (10 registrations/hour)
    const ipLimit = await checkRateLimit({
      key: `reg_ip:${ip}`,
      limit: 10,
      windowSeconds: 3600,
    });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many registrations from this IP address. Please try again later." },
        { status: 429 }
      );
    }

    // Check System Mode
    const isMaintenance = (await getSystemConfigValue("MAINTENANCE_MODE")) === "true";
    if (isMaintenance) {
      const msg = await getSystemConfigValue(
        "MAINTENANCE_NOTICE_TEXT",
        "Registration is temporarily paused for scheduled maintenance."
      );
      return NextResponse.json({ error: msg, mode: "MAINTENANCE" }, { status: 503 });
    }

    const isPrelaunch = (await getSystemConfigValue("PRELAUNCH_MODE")) === "true";
    if (isPrelaunch) {
      const msg = await getSystemConfigValue(
        "PRELAUNCH_NOTICE_TEXT",
        "Dubai Finance is currently in Pre-Launching phase. Public registration will open shortly."
      );
      return NextResponse.json({ error: msg, mode: "PRE_LAUNCH" }, { status: 403 });
    }

    const { fullName, email, phone, password, transactionPin, sponsorCode } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    if (!transactionPin || typeof transactionPin !== "string" || transactionPin.trim().length !== 6 || !/^\d{6}$/.test(transactionPin.trim())) {
      return NextResponse.json(
        { error: "A valid 6-digit numeric Transaction PIN is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingEmail = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    // Resolve sponsor and assigned branch admin
    let sponsor = null;
    let assignedAdminId: string | null = null;

    if (sponsorCode) {
      sponsor = await db.user.findFirst({
        where: {
          OR: [
            { customId: { equals: sponsorCode.trim(), mode: "insensitive" } },
            { id: sponsorCode.trim() },
          ],
        },
      });
    }

    if (!sponsor) {
      // Default to first active branch admin
      sponsor = await db.user.findFirst({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
          status: "ACTIVE",
        },
      });
    }

    if (sponsor) {
      if (sponsor.role === "ADMIN" || sponsor.role === "SUPER_ADMIN") {
        assignedAdminId = sponsor.id;
      } else {
        assignedAdminId = sponsor.adminId || null;
      }
    }

    // Final fallback if needed
    if (!assignedAdminId) {
      const fallbackAdmin = await db.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      });
      assignedAdminId = fallbackAdmin?.id || null;
    }

    // Resolve teamPrefix from assigned branch admin (e.g. "1" for DF1xxxxx, "2" for DF2xxxxx, "3" for DF3xxxxx)
    let teamPrefix = "1";
    if (assignedAdminId) {
      const adminRecord = await db.user.findUnique({
        where: { id: assignedAdminId },
        select: { teamPrefix: true },
      });
      if (adminRecord?.teamPrefix) {
        teamPrefix = adminRecord.teamPrefix.trim();
      }
    }

    // Generate unique customId like DF123456, DF223456, DF323456
    let customId = "";
    let isUnique = false;
    while (!isUnique) {
      const rand5 = Math.floor(10000 + Math.random() * 90000); // 5 random digits
      customId = `DF${teamPrefix}${rand5}`;
      const found = await db.user.findUnique({ where: { customId } });
      if (!found) isUnique = true;
    }

    const cleanPin = transactionPin.trim();
    const passwordHash = await hashPassword(password);
    const pinHash = await hashPin(cleanPin);

    const newUser = await db.user.create({
      data: {
        customId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        transactionPin: pinHash,
        sponsorId: sponsor?.id || null,
        adminId: assignedAdminId,
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

    // Determine live application domain from request headers
    const originHeader = req.headers.get("origin") || req.headers.get("referer");
    let detectedAppUrl: string | undefined = undefined;
    if (originHeader) {
      try {
        const parsed = new URL(originHeader);
        detectedAppUrl = parsed.origin;
      } catch {}
    }

    // Send Welcome Email with User ID and PIN to user's Gmail in background
    sendWelcomeCredentialsEmail({
      email: newUser.email,
      fullName: newUser.fullName,
      customId: newUser.customId,
      transactionPin: cleanPin,
      appUrl: detectedAppUrl,
    }).catch((err) => console.error("[Welcome Email Failed]:", err));

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
      credentials: {
        customId: newUser.customId,
        transactionPin: cleanPin,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });

    response.cookies.set("df_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}