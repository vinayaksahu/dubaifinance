import { db } from "@/lib/db";
import { SessionPayload } from "@/lib/auth";

export const ALL_DEPOSIT_PERMISSIONS = [
  { id: "deposit.view", label: "View Deposits", description: "View list of deposits and transaction statuses" },
  { id: "deposit.view_transaction", label: "View Transaction Details", description: "Inspect full blockchain transaction receipt & logs" },
  { id: "deposit.verify", label: "Verify On-Chain", description: "Trigger on-chain verification for a transaction" },
  { id: "deposit.manual_review", label: "Manual Review Queue", description: "Inspect suspicious and exception transactions" },
  { id: "deposit.approve", label: "Approve Deposits", description: "Approve pending review deposits and credit Fund Wallet" },
  { id: "deposit.reject", label: "Reject Deposits", description: "Reject invalid or suspicious deposit requests" },
  { id: "deposit.reconcile", label: "Trigger Reconciliation", description: "Run blockchain block reconciliation scan" },
  { id: "deposit.export", label: "Export Records", description: "Export deposit records to CSV / Excel" },
  { id: "deposit.address.view", label: "View Deposit Addresses", description: "Inspect user deposit addresses and derivation index" },
  { id: "deposit.blockchain.monitor", label: "Monitor Health", description: "View RPC connection status and block checkpoints" },
  { id: "deposit.settings.view", label: "View Settings", description: "View USDT contract and confirmation settings" },
  { id: "deposit.settings.update", label: "Update Settings", description: "Change USDT contract, RPC, or confirmations" },
  { id: "deposit.mode.view", label: "View Processing Mode", description: "View current deposit mode (AUTOMATIC / MANUAL)" },
  { id: "deposit.mode.change", label: "Change Processing Mode", description: "Switch global deposit processing mode" },
  { id: "deposit.system.pause", label: "Pause System", description: "Pause automatic Fund Wallet crediting" },
  { id: "deposit.system.resume", label: "Resume System", description: "Resume automatic Fund Wallet crediting" },
  { id: "deposit.audit.view", label: "View Audit Logs", description: "View deposit-related administrative audit logs" },
] as const;

export type DepositPermissionId = typeof ALL_DEPOSIT_PERMISSIONS[number]["id"];

/**
 * Checks whether a logged-in user/admin has a specific deposit permission.
 * SUPER_ROOT_ADMIN always has full unrestricted access.
 */
export async function hasDepositPermission(
  session: SessionPayload | null | undefined,
  permission: DepositPermissionId | string
): Promise<boolean> {
  if (!session) return false;

  // SuperRootAdmin has unrestricted access to everything
  if (session.role === "SUPER_ROOT_ADMIN") {
    return true;
  }

  // Regular USER never has administrative deposit permissions
  if (session.role === "USER") {
    return false;
  }

  // Admins are checked against the AdminDepositPermission table
  try {
    const perm = await db.adminDepositPermission.findUnique({
      where: {
        adminId_permission: {
          adminId: session.userId,
          permission,
        },
      },
    });
    return !!perm;
  } catch {
    return false;
  }
}

/**
 * Returns all active deposit permissions granted to an admin.
 */
export async function getAdminDepositPermissions(adminId: string): Promise<string[]> {
  const perms = await db.adminDepositPermission.findMany({
    where: { adminId },
    select: { permission: true },
  });
  return perms.map((p) => p.permission);
}

/**
 * Sets (replaces) the deposit permissions for a target admin.
 * Only callable by SUPER_ROOT_ADMIN.
 */
export async function setAdminDepositPermissions(
  adminId: string,
  permissions: string[],
  grantedById: string
): Promise<string[]> {
  // Validate that target admin exists and is not a super root admin
  const target = await db.user.findUnique({
    where: { id: adminId },
    select: { id: true, role: true },
  });

  if (!target || target.role === "SUPER_ROOT_ADMIN") {
    throw new Error("Target admin not found or is Super Root Admin");
  }

  // Prevent self-permission escalation
  if (adminId === grantedById) {
    throw new Error("Admins cannot modify their own permissions.");
  }

  const validPermissionSet = new Set(ALL_DEPOSIT_PERMISSIONS.map((p) => p.id));
  const filtered = permissions.filter((p) => validPermissionSet.has(p as DepositPermissionId));

  // Atomic replace of permissions
  await db.$transaction(async (tx) => {
    await tx.adminDepositPermission.deleteMany({
      where: { adminId },
    });

    if (filtered.length > 0) {
      await tx.adminDepositPermission.createMany({
        data: filtered.map((perm) => ({
          adminId,
          permission: perm,
          grantedById,
        })),
      });
    }
  });

  return filtered;
}
