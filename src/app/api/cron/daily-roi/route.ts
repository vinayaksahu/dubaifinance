import { NextRequest, NextResponse } from "next/server";
import { executeDailyRoiDistribution } from "@/lib/services/roiService";
import { getSession, timingSafeEqualString } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("key");
    const cronSecret = process.env.CRON_SECRET;

    const session = await getSession();
    const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
    const isSuperRoot = session?.role === "SUPER_ROOT_ADMIN";

    let isSecretMatch = false;
    if (cronSecret && cronSecret.length >= 16) {
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        isSecretMatch = timingSafeEqualString(token, cronSecret);
      }
      if (!isSecretMatch && secretParam) {
        isSecretMatch = timingSafeEqualString(secretParam.trim(), cronSecret);
      }
    }

    const isAuthorized =
      isAdmin ||
      isSuperRoot ||
      isSecretMatch ||
      (process.env.NODE_ENV !== "production" && (authHeader === "Bearer dev-cron-secret" || secretParam === "dev-cron-secret"));

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    // If an isolated sub-admin triggers this, ONLY process their own branch!
    // If super root or external automated cron secret runs, process platform-wide.
    const adminId = (isSuperRoot || isSecretMatch)
      ? undefined
      : (isAdmin ? session?.userId : undefined);

    const result = await executeDailyRoiDistribution(adminId);

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