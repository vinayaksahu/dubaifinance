import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordActivity } from "@/lib/auditLogger";
import { hasDepositPermission } from "@/lib/blockchain/rbac";
import { runBlockchainScan } from "@/lib/blockchain/monitor";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const canReconcile = await hasDepositPermission(session, "deposit.reconcile");
    if (!canReconcile) {
      return NextResponse.json({ error: "Forbidden. deposit.reconcile permission required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const fromBlockOverride = body.fromBlock ? BigInt(body.fromBlock) : undefined;
    const toBlockOverride = body.toBlock ? BigInt(body.toBlock) : undefined;

    const result = await runBlockchainScan({
      fromBlockOverride,
      toBlockOverride,
    });

    await recordActivity({
      userId: session.userId,
      action: "BLOCKCHAIN_RECONCILIATION_TRIGGERED",
      category: "ADMIN",
      description: `Admin ${session.customId} triggered blockchain reconciliation (Blocks: ${result.fromBlock} - ${result.toBlock})`,
      req,
      metadata: { result },
    });

    return NextResponse.json({
      success: result.success,
      message: `Reconciliation scan complete for blocks ${result.fromBlock} to ${result.toBlock}.`,
      result,
    });
  } catch (error: any) {
    console.error("[Reconcile POST Error]:", error);
    return NextResponse.json({ error: error.message || "Reconciliation failed." }, { status: 500 });
  }
}
