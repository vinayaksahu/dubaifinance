import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";

import { sanitizeText } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone } = body;

    const cleanedFullName = sanitizeText(fullName, 80);
    const cleanedPhone = phone ? sanitizeText(phone, 25) : null;

    if (!cleanedFullName) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        fullName: cleanedFullName,
        phone: cleanedPhone,
      },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    await recordActivity({
      userId: session.userId,
      action: "MEMBER_PROFILE_UPDATE",
      category: "PROFILE",
      description: `Member ${updated.customId} updated profile details (name: ${updated.fullName})`,
      req,
      metadata: { fullName: updated.fullName, phone: updated.phone },
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
