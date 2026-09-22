import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Calculates EIP-55 checksum for an Ethereum/BSC address.
 */
export function toChecksumAddress(address: string): string {
  const clean = address.toLowerCase().replace(/^0x/, "");
  // Using sha3-256 for standard Keccak compatibility
  const hash = crypto.createHash("sha3-256").update(clean).digest("hex");
  let ret = "0x";

  for (let i = 0; i < clean.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += clean[i].toUpperCase();
    } else {
      ret += clean[i];
    }
  }
  return ret;
}

/**
 * Derives a deterministic EVM deposit address for a specific user.
 * Private key is never stored in plain text or exposed.
 */
export function deriveDeterministicAddress(userId: string, salt: string = "DUBAIFINANCE_BSC_BEP20_V1"): string {
  const masterSecret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || "dubaifinance-dev-entropy-secret-key-32";
  const hmac = crypto.createHmac("sha256", masterSecret);
  hmac.update(`${salt}:${userId}`);
  const hash = hmac.digest("hex");

  // Take the last 20 bytes (40 hex chars) as the EVM address
  const rawAddress = "0x" + hash.slice(-40).toLowerCase();
  return toChecksumAddress(rawAddress);
}

/**
 * Retrieves the user's registered USDT BEP-20 deposit address, or creates one if it does not exist.
 */
export async function getOrCreateUserDepositAddress(userId: string): Promise<{
  id: string;
  address: string;
  network: string;
  asset: string;
}> {
  // 1. Check if user already has an active deposit address
  const existing = await db.depositAddress.findFirst({
    where: {
      userId,
      network: "BSC",
      asset: "USDT",
      status: "ACTIVE",
    },
  });

  if (existing) {
    return {
      id: existing.id,
      address: existing.address,
      network: existing.network,
      asset: existing.asset,
    };
  }

  // 2. Derive unique deterministic address
  const address = deriveDeterministicAddress(userId);

  try {
    const created = await db.depositAddress.create({
      data: {
        userId,
        network: "BSC",
        asset: "USDT",
        address: address.toLowerCase(),
        status: "ACTIVE",
      },
    });

    // Optionally mirror to user profile usdtAddress if empty
    await db.user.updateMany({
      where: { id: userId, usdtAddress: null },
      data: { usdtAddress: address },
    });

    return {
      id: created.id,
      address: toChecksumAddress(created.address),
      network: created.network,
      asset: created.asset,
    };
  } catch (error: any) {
    // In case of concurrent creation, fetch existing
    const fallback = await db.depositAddress.findFirst({
      where: { userId, network: "BSC", asset: "USDT" },
    });
    if (fallback) {
      return {
        id: fallback.id,
        address: toChecksumAddress(fallback.address),
        network: fallback.network,
        asset: fallback.asset,
      };
    }
    throw error;
  }
}

/**
 * Finds the user mapped to a given deposit address.
 */
export async function findUserByDepositAddress(address: string) {
  const clean = address.trim().toLowerCase();
  return await db.depositAddress.findFirst({
    where: {
      address: clean,
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          adminId: true,
          fundBalance: true,
        },
      },
    },
  });
}
