import { NextRequest, NextResponse } from "next/server";
import { executeDailyRoiDistribution } from "@/lib/services/roiService";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("key");
    const validSecret = process.env.CRON_SECRET || "DF-cr0n-s3cr3t-2026-dubaifinance-key-k9p2";

    const session = await getSession();
    const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";

    const isAuthorized =
      isAdmin ||
      authHeader === `Bearer ${validSecret}` ||
      secretParam === validSecret ||
      process.env.NODE_ENV !== "production";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const result = await executeDailyRoiDistribution();

    const recentLedgers = await db.ledgerEntry.findMany({
      where: { type: { in: ["BASIC_ROI", "BASIC_LEVEL_INCOME", "FD_ROI", "FD_LEVEL_INCOME"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, userId: true, type: true, amount: true, referenceKey: true, description: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      summary: result,
      recentLedgers,
    });
  } catch (error: any) {
    console.error("Daily ROI Cron failed:", error);
    return NextResponse.json({ error: error.message || "Failed to run daily ROI" }, { status: 500 });
  }
}

export const POST = GET;