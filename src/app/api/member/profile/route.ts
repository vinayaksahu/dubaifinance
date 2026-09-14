import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        fullName: fullName.trim(),
        phone: phone ? String(phone).trim() : null,
      },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: updated,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
