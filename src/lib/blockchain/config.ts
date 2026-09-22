import { getSystemConfigValue, getNumericConfig } from "@/lib/configService";
import { db } from "@/lib/db";

export const OFFICIAL_USDT_BEP20_CONTRACT = "0x55d398326f99059fF775485246999027B3197955".toLowerCase();
export const BSC_CHAIN_ID = 56;
export const ERC20_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const DEFAULT_BSC_RPC_ENDPOINTS = [
  "https://binance.llamarpc.com",
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
  "https://rpc.ankr.com/bsc",
];

export async function getBscRpcEndpoints(): Promise<string[]> {
  const customRpc = await getSystemConfigValue("BSC_RPC_URL", "");
  if (customRpc && customRpc.trim().startsWith("http")) {
    return [customRpc.trim(), ...DEFAULT_BSC_RPC_ENDPOINTS];
  }
  return DEFAULT_BSC_RPC_ENDPOINTS;
}

export async function getUsdtContractAddress(): Promise<string> {
  const custom = await getSystemConfigValue("USDT_BEP20_CONTRACT", OFFICIAL_USDT_BEP20_CONTRACT);
  return (custom && custom.trim().startsWith("0x")) ? custom.trim().toLowerCase() : OFFICIAL_USDT_BEP20_CONTRACT;
}

export async function getRequiredConfirmations(): Promise<number> {
  return getNumericConfig("REQUIRED_CONFIRMATIONS", 3);
}

/**
 * Returns the effective deposit processing mode for a given admin branch.
 * If adminId is provided and the admin has an explicit mode ("AUTOMATIC" or "MANUAL"), it is used.
 * Otherwise, falls back to the global DEPOSIT_PROCESSING_MODE.
 */
export async function getDepositProcessingMode(adminId?: string | null): Promise<"AUTOMATIC" | "MANUAL"> {
  if (adminId) {
    try {
      const admin = await db.user.findUnique({
        where: { id: adminId },
        select: { depositMode: true },
      });
      if (admin?.depositMode === "AUTOMATIC" || admin?.depositMode === "MANUAL") {
        return admin.depositMode;
      }
    } catch (err) {
      console.warn("[getDepositProcessingMode] Failed to fetch admin override:", err);
    }
  }
  const mode = await getSystemConfigValue("DEPOSIT_PROCESSING_MODE", "AUTOMATIC");
  return mode.toUpperCase() === "MANUAL" ? "MANUAL" : "AUTOMATIC";
}

/**
 * Resolves the effective deposit processing mode for a user based on their assigned admin branch.
 */
export async function getDepositProcessingModeForUser(userId?: string | null): Promise<"AUTOMATIC" | "MANUAL"> {
  if (!userId) return getDepositProcessingMode();

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, adminId: true, depositMode: true },
    });

    if (!user) return getDepositProcessingMode();

    // If user is an admin themselves
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      if (user.depositMode === "AUTOMATIC" || user.depositMode === "MANUAL") {
        return user.depositMode;
      }
    }

    // If user belongs to an admin branch
    if (user.adminId) {
      return getDepositProcessingMode(user.adminId);
    }
  } catch (err) {
    console.warn("[getDepositProcessingModeForUser] Failed to fetch user admin branch:", err);
  }

  return getDepositProcessingMode();
}

export async function isAutomaticCreditingEnabled(): Promise<boolean> {
  const val = await getSystemConfigValue("DEPOSIT_AUTOMATIC_CREDIT_ENABLED", "true");
  return val.toLowerCase() === "true" || val === "1";
}

export async function isBlockchainMonitorEnabled(): Promise<boolean> {
  const val = await getSystemConfigValue("DEPOSIT_MONITOR_ENABLED", "true");
  return val.toLowerCase() === "true" || val === "1";
}
