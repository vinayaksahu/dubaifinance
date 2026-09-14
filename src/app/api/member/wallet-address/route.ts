import { NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { usdtAddress, transactionPin } = body;

    if (!usdtAddress || typeof usdtAddress !== "string" || !usdtAddress.trim()) {
      return NextResponse.json(
        { error: "Valid USDT BEP-20 address is required" },
        { status: 400 }
      );
    }

    const trimmedAddress = usdtAddress.trim();

    // Basic BEP-20 / EVM address validation: starts with 0x and 42 chars
    if (!trimmedAddress.startsWith("0x") || trimmedAddress.length !== 42) {
      return NextResponse.json(
        { error: "Invalid address format. Must be a valid BEP-20 (0x...) address." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, transactionPin: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.transactionPin) {
      if (!transactionPin) {
        return NextResponse.json(
          { error: "Transaction PIN is required to update wallet address" },
          { status: 400 }
        );
      }
      const isPinValid = await comparePin(transactionPin, user.transactionPin);
      if (!isPinValid) {
        return NextResponse.json(
          { error: "Invalid Transaction PIN" },
          { status: 400 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: { usdtAddress: trimmedAddress },
      select: {
        id: true,
        customId: true,
        usdtAddress: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "USDT BEP-20 wallet address updated successfully!",
      user: updated,
    });
  } catch (error: any) {
    console.error("Update wallet address error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
