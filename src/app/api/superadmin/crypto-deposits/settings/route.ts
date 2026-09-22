import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";
import { invalidateConfigCache } from "@/lib/configService";
import { defaultBlockchainProvider } from "@/lib/blockchain/provider";
import {
  getDepositProcessingMode,
  isAutomaticCreditingEnabled,
  isBlockchainMonitorEnabled,
  getUsdtContractAddress,
  getRequiredConfirmations,
} from "@/lib/blockchain/config";
import { hasDepositPermission } from "@/lib/blockchain/rbac";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const canView = await hasDepositPermission(session, "deposit.settings.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden. deposit.settings.view permission required." }, { status: 403 });
    }

    const [mode, autoCredit, monitorEnabled, usdtContract, requiredConfirmations, health, checkpoint] =
      await Promise.all([
        getDepositProcessingMode(),
        isAutomaticCreditingEnabled(),
        isBlockchainMonitorEnabled(),
        getUsdtContractAddress(),
        getRequiredConfirmations(),
        defaultBlockchainProvider.checkHealth(),
        db.blockchainCheckpoint.findUnique({ where: { id: "bsc_usdt_mainnet" } }),
      ]);

    const latestBlock = health.currentBlock.toString();
    const lastProcessed = checkpoint?.lastProcessedBlock ? checkpoint.lastProcessedBlock.toString() : "0";
    const lag = health.currentBlock > (checkpoint?.lastProcessedBlock || BigInt(0))
      ? Number(health.currentBlock - (checkpoint?.lastProcessedBlock || BigInt(0)))
      : 0;

    // Aggregated stats
    const [pendingCount, confirmingCount, pendingReviewCount, manualReviewCount, creditedCount] = await Promise.all([
      db.depositRequest.count({ where: { status: "PENDING" } }),
      db.depositRequest.count({ where: { status: "CONFIRMING" } }),
      db.depositRequest.count({ where: { status: "PENDING_REVIEW" } }),
      db.depositRequest.count({ where: { status: "MANUAL_REVIEW" } }),
      db.depositRequest.count({ where: { status: "CREDITED" } }),
    ]);

    return NextResponse.json({
      settings: {
        depositProcessingMode: mode,
        automaticCreditEnabled: autoCredit,
        depositMonitorEnabled: monitorEnabled,
        usdtContract,
        requiredConfirmations,
      },
      health: {
        connected: health.connected,
        currentRpc: health.rpcUrl,
        latestBlock,
        lastProcessedBlock: lastProcessed,
        blockLag: lag,
        status: checkpoint?.status || (health.connected ? "IDLE" : "DISCONNECTED"),
        lastSuccessfulScan: checkpoint?.lastSuccessfulScan,
        lastError: checkpoint?.lastError,
      },
      stats: {
        pendingCount,
        confirmingCount,
        pendingReviewCount,
        manualReviewCount,
        creditedCount,
      },
    });
  } catch (error: any) {
    console.error("[Crypto Settings GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      depositProcessingMode,
      automaticCreditEnabled,
      depositMonitorEnabled,
      requiredConfirmations,
      usdtContract,
      bscRpcUrl,
    } = body;

    const updates: { key: string; value: string; desc: string }[] = [];

    if (depositProcessingMode) {
      const mode = depositProcessingMode.toUpperCase() === "MANUAL" ? "MANUAL" : "AUTOMATIC";
      updates.push({
        key: "DEPOSIT_PROCESSING_MODE",
        value: mode,
        desc: "Global USDT BEP-20 deposit processing mode (AUTOMATIC or MANUAL)",
      });
    }

    if (automaticCreditEnabled !== undefined) {
      updates.push({
        key: "DEPOSIT_AUTOMATIC_CREDIT_ENABLED",
        value: String(automaticCreditEnabled),
        desc: "Automatic crediting pause/resume switch (true or false)",
      });
    }

    if (depositMonitorEnabled !== undefined) {
      updates.push({
        key: "DEPOSIT_MONITOR_ENABLED",
        value: String(depositMonitorEnabled),
        desc: "BSC blockchain monitor active status (true or false)",
      });
    }

    if (requiredConfirmations !== undefined) {
      const num = Math.max(1, Math.min(100, Number(requiredConfirmations) || 3));
      updates.push({
        key: "REQUIRED_CONFIRMATIONS",
        value: String(num),
        desc: "Required BSC block confirmations before crediting USDT deposit",
      });
    }

    if (usdtContract && usdtContract.trim().startsWith("0x")) {
      updates.push({
        key: "USDT_BEP20_CONTRACT",
        value: usdtContract.trim().toLowerCase(),
        desc: "Configured official USDT BEP-20 token contract address on BSC",
      });
    }

    if (bscRpcUrl !== undefined) {
      updates.push({
        key: "BSC_RPC_URL",
        value: (bscRpcUrl || "").trim(),
        desc: "Custom BSC JSON-RPC URL",
      });
    }

    for (const item of updates) {
      await db.systemConfig.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, description: item.desc },
        update: { value: item.value, description: item.desc },
      });
    }

    invalidateConfigCache();

    await recordActivity({
      userId: session.userId,
      action: "CRYPTO_DEPOSIT_SETTINGS_UPDATE",
      category: "ADMIN",
      description: `Super Root Admin updated crypto deposit settings: ${updates.map((u) => `${u.key}=${u.value}`).join(", ")}`,
      req,
      metadata: { updates },
    });

    return NextResponse.json({
      success: true,
      message: "Crypto deposit settings successfully updated.",
    });
  } catch (error: any) {
    console.error("[Crypto Settings POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings." }, { status: 500 });
  }
}
