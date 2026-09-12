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
      return NextResponse.json({ error: "Your account is suspended. Please contact support." }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials. User ID or Password incorrect." }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      customId: user.customId,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        customId: user.customId,
        fullName: user.fullName,
        role: user.role,
      },
      redirectTo: user.role === "USER" ? "/member" : "/admin",
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