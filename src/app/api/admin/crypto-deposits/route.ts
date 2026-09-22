import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";
import { hasDepositPermission } from "@/lib/blockchain/rbac";
import { creditUserFundWalletAtomic } from "@/lib/blockchain/depositProcessor";
import { sanitizeText } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const canView = await hasDepositPermission(session, "deposit.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden. deposit.view permission required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const modeFilter = searchParams.get("mode") || "ALL";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const isSuperRoot = session.role === "SUPER_ROOT_ADMIN";

    const where: any = {};

    // Branch filtering for regular admins
    if (!isSuperRoot) {
      where.OR = [
        { user: { adminId: session.userId } },
        { userId: session.userId },
      ];
    }

    if (statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (modeFilter !== "ALL") {
      where.processingMode = modeFilter;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { txHash: { contains: search, mode: "insensitive" } },
            { toAddress: { contains: search, mode: "insensitive" } },
            { fromAddress: { contains: search, mode: "insensitive" } },
            { user: { fullName: { contains: search, mode: "insensitive" } } },
            { user: { customId: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        },
      ];
    }

    const rawDeposits = await db.depositRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            customId: true,
            fullName: true,
            email: true,
          },
        },
        depositAddress: {
          select: { address: true },
        },
      },
    });

    const [canApprove, canReject, canReconcile] = await Promise.all([
      hasDepositPermission(session, "deposit.approve"),
      hasDepositPermission(session, "deposit.reject"),
      hasDepositPermission(session, "deposit.reconcile"),
    ]);

    const deposits = rawDeposits.map((d) => ({
      id: d.id,
      userId: d.userId,
      user: {
        name: d.user?.fullName || "Member",
        fullName: d.user?.fullName || "Member",
        customId: d.user?.customId || "N/A",
        email: d.user?.email || "N/A",
      },
      amountUsdt: Number(d.amountInUsdt),
      amountInUsdt: Number(d.amountInUsdt),
      amountInr: Number(d.amountInInr),
      txHash: d.txHash || "",
      verifiedTxHash: d.verifiedTxHash || d.txHash || "",
      fromAddress: d.fromAddress || "",
      toAddress: d.toAddress || d.depositAddress?.address || "",
      network: d.network,
      tokenContract: d.tokenContract,
      blockNumber: d.blockNumber ? d.blockNumber.toString() : null,
      confirmations: d.confirmations,
      processingMode: d.processingMode,
      status: d.status,
      adminNote: d.adminNote || d.approvalNotes || d.rejectionReason,
      detectedAt: d.detectedAt,
      confirmedAt: d.confirmedAt,
      creditedAt: d.creditedAt,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({
      deposits,
      permissions: {
        canApprove,
        canReject,
        canReconcile,
      },
    });
  } catch (error: any) {
    console.error("[Admin Crypto Deposits GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch deposits." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { depositId, action, notes } = await req.json();
    if (!depositId || !action) {
      return NextResponse.json({ error: "depositId and action are required." }, { status: 400 });
    }

    const cleanedNotes = notes ? sanitizeText(notes, 300) : null;

    // Fetch target deposit
    const deposit = await db.depositRequest.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found." }, { status: 404 });
    }

    // Authorization check for regular admin
    if (session.role !== "SUPER_ROOT_ADMIN") {
      if (deposit.user.adminId && deposit.user.adminId !== session.userId && deposit.userId !== session.userId) {
        return NextResponse.json({ error: "Access denied to deposit of another branch." }, { status: 403 });
      }
    }

    if (action === "APPROVE") {
      const canApprove = await hasDepositPermission(session, "deposit.approve");
      if (!canApprove) {
        return NextResponse.json({ error: "Forbidden. deposit.approve permission required to approve deposits." }, { status: 403 });
      }

      if (deposit.status === "CREDITED" || deposit.status === "APPROVED") {
        return NextResponse.json({ error: "Deposit has already been credited." }, { status: 400 });
      }

      const creditRes = await creditUserFundWalletAtomic({
        depositId,
        adminId: session.userId,
        approvalNotes: cleanedNotes,
      });

      if (!creditRes.success) {
        return NextResponse.json({ error: creditRes.message }, { status: 400 });
      }

      await recordActivity({
        userId: session.userId,
        action: "DEPOSIT_APPROVED",
        category: "FINANCIAL",
        description: `Admin ${session.customId} approved deposit #${deposit.id.slice(0, 8)} of $${Number(deposit.amountInUsdt).toFixed(2)} USDT (Tx: ${deposit.txHash.slice(0, 10)}...)`,
        req,
        metadata: { depositId, amount: Number(deposit.amountInUsdt), txHash: deposit.txHash, notes: cleanedNotes },
      });

      return NextResponse.json({
        success: true,
        message: `Deposit #${deposit.id.slice(0, 8)} approved and $${Number(deposit.amountInUsdt).toFixed(2)} USDT credited to Fund Wallet.`,
      });
    } else if (action === "REJECT") {
      const canReject = await hasDepositPermission(session, "deposit.reject");
      if (!canReject) {
        return NextResponse.json({ error: "Forbidden. deposit.reject permission required to reject deposits." }, { status: 403 });
      }

      if (deposit.status === "CREDITED" || deposit.status === "APPROVED") {
        return NextResponse.json({ error: "Cannot reject an already credited deposit." }, { status: 400 });
      }

      await db.depositRequest.update({
        where: { id: depositId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.userId,
          rejectionReason: cleanedNotes || "Rejected by administrator",
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "DEPOSIT_REJECTED",
        category: "FINANCIAL",
        description: `Admin ${session.customId} rejected deposit #${deposit.id.slice(0, 8)} (Tx: ${deposit.txHash.slice(0, 10)}...)`,
        req,
        metadata: { depositId, rejectionReason: cleanedNotes },
      });

      return NextResponse.json({
        success: true,
        message: `Deposit #${deposit.id.slice(0, 8)} rejected.`,
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
  } catch (error: any) {
    console.error("[Admin Crypto Deposits POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process action." }, { status: 500 });
  }
}
