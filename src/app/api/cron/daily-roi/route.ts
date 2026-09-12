import { NextRequest, NextResponse } from "next/server";
import { executeDailyRoiDistribution } from "@/lib/services/roiService";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("key");
    const validSecret = process.env.CRON_SECRET || "DF-cr0n-s3cr3t-2026-dubaifinance-key-k9p2";

    const isAuthorized =
      authHeader === `Bearer ${validSecret}` ||
      secretParam === validSecret ||
      process.env.NODE_ENV !== "production";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const result = await executeDailyRoiDistribution();

    return NextResponse.json({
      success: true,
      summary: result,
    });
  } catch (error: any) {
    console.error("Daily ROI Cron failed:", error);
    return NextResponse.json({ error: error.message || "Failed to run daily ROI" }, { status: 500 });
  }
}

export const POST = GET;