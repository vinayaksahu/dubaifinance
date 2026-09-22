import { NextRequest, NextResponse } from "next/server";
import { runBlockchainScan } from "@/lib/blockchain/monitor";
import { timingSafeEqualString } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return handleMonitor(req);
}

export async function POST(req: NextRequest) {
  return handleMonitor(req);
}

async function handleMonitor(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verify authentication if CRON_SECRET is configured in production
    if (cronSecret && cronSecret.trim().length > 0) {
      const token = authHeader?.replace(/^Bearer\s+/i, "") || "";
      if (!timingSafeEqualString(token, cronSecret)) {
        return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
      }
    }

    const scanResult = await runBlockchainScan();

    return NextResponse.json({
      success: scanResult.success,
      timestamp: new Date().toISOString(),
      scan: scanResult,
    });
  } catch (error: any) {
    console.error("[Cron Blockchain Monitor Error]:", error);
    return NextResponse.json({ error: error.message || "Monitor cycle failed." }, { status: 500 });
  }
}
