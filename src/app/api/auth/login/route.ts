import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, createSessionToken } from "@/lib/auth";
import { ensureInitialSeed } from "@/lib/seedHelper";

export async function POST(req: NextRequest) {
  try {
    // Ensure initial users exist if database is fresh
    await ensureInitialSeed(db);

    const body = await req.json();
    const identifier = body.identifier || body.customId || body.email;
    const password = body.password;
    const portal = body.portal; // "member" | "admin"

    if (!identifier || !password) {
      return NextResponse.json({ error: "User ID / Email and Password are required." }, { status: 400 });
    }

    const trimmed = identifier.trim();

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
    const isUser = user.role === "USER";

    // Strict portal separation
    if (portal === "super_root") {
      if (!isSuperRoot) {
        return NextResponse.json(
          { error: "Access Denied. Invalid Super Root Administrator credentials." },
          { status: 403 }
        );
      }
    } else if (portal === "admin") {
      if (isSuperRoot || !isAdmin) {
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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}