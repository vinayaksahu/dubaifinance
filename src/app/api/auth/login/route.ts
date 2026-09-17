import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, createSessionToken } from "@/lib/auth";
import { ensureInitialSeed } from "@/lib/seedHelper";
import { getSystemConfigValue } from "@/lib/configService";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // IP-level brute force protection (15 attempts/min)
    const rateLimitIp = await checkRateLimit({
      key: `login_ip:${ip}`,
      limit: 15,
      windowSeconds: 60,
    });
    if (!rateLimitIp.success) {
      return NextResponse.json(
        { error: "Too many login attempts from this network. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // Ensure initial users exist if database is fresh
    await ensureInitialSeed(db);

    const body = await req.json();
    const identifier = body.identifier || body.customId || body.email;
    const password = body.password;
    const portal = body.portal; // "member" | "admin" | "super_root"

    if (!identifier || !password) {
      return NextResponse.json({ error: "User ID / Email and Password are required." }, { status: 400 });
    }

    const trimmed = identifier.trim();

    // Account-level brute force protection (8 attempts/min)
    const rateLimitId = await checkRateLimit({
      key: `login_id:${trimmed.toLowerCase()}`,
      limit: 8,
      windowSeconds: 60,
    });
    if (!rateLimitId.success) {
      return NextResponse.json(
        { error: "Too many failed attempts for this account. Please wait 60 seconds." },
        { status: 429 }
      );
    }

    // Find by customId or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { customId: { equals: trimmed, mode: "insensitive" } },
          { email: { equals: trimmed, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials. User ID or Password incorrect." }, { status: 401 });
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { error: "Error Code: ERR_CONNECTION_TIMED_OUT (504 Gateway Security Handshake Failed: 0x8004100E). Please try again later." },
        { status: 504 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials. User ID or Password incorrect." }, { status: 401 });
    }

    const isSuperRoot = user.role === "SUPER_ROOT_ADMIN";
    const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

    // Strict portal separation
    if (portal === "super_root") {
      if (!isSuperRoot) {
        return NextResponse.json(
          { error: "Access Denied. Invalid Super Root Administrator credentials." },
          { status: 403 }
        );
      }
    } else if (portal === "admin") {
      if (isSuperRoot) {
        return NextResponse.json(
          { error: "Access Denied. Super Root Administrator must sign in exclusively through /superrootadminlogin." },
          { status: 403 }
        );
      }
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Access Denied. You do not have administrator permissions. Please check your credentials." },
          { status: 403 }
        );
      }
    } else {
      // Default member portal (/login)
      if (isSuperRoot) {
        // Keep super root admin strictly hidden from member portal
        return NextResponse.json(
          { error: "Invalid credentials. User ID or Password incorrect." },
          { status: 401 }
        );
      }
      if (isAdmin) {
        return NextResponse.json(
          { error: "Access Denied. Administrator accounts cannot log in through the Member Portal. Please use the official Admin Portal at /adminlogin." },
          { status: 403 }
        );
      }

      // Check System Mode for Member Portal
      const isMaintenance = (await getSystemConfigValue("MAINTENANCE_MODE")) === "true";
      if (isMaintenance) {
        const msg = await getSystemConfigValue(
          "MAINTENANCE_NOTICE_TEXT",
          "Dubai Finance is currently undergoing scheduled system maintenance. Member login is temporarily paused."
        );
        return NextResponse.json({ error: msg, mode: "MAINTENANCE" }, { status: 503 });
      }

      const isPrelaunch = (await getSystemConfigValue("PRELAUNCH_MODE")) === "true";
      if (isPrelaunch) {
        const msg = await getSystemConfigValue(
          "PRELAUNCH_NOTICE_TEXT",
          "Dubai Finance is currently in its official Pre-Launch phase. Member login will open upon launch."
        );
        return NextResponse.json({ error: msg, mode: "PRE_LAUNCH" }, { status: 403 });
      }
    }

    const token = await createSessionToken({
      userId: user.id,
      customId: user.customId,
      email: user.email,
      role: user.role,
      adminId: user.adminId,
    });

    let redirectTo = "/member";
    if (isSuperRoot) {
      redirectTo = "/superrootadmin";
    } else if (isAdmin) {
      redirectTo = "/admin";
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        customId: user.customId,
        fullName: user.fullName,
        role: user.role,
      },
      redirectTo,
    });

    response.cookies.set("df_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}