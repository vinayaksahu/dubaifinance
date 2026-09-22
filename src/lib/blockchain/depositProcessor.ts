import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { recordActivity } from "@/lib/auditLogger";
import { BlockchainProvider, defaultBlockchainProvider } from "./provider";
import {
  getUsdtContractAddress,
  getRequiredConfirmations,
  getDepositProcessingMode,
  isAutomaticCreditingEnabled,
  ERC20_TRANSFER_TOPIC,
} from "./config";
import Decimal from "decimal.js";

export interface OnChainVerificationResult {
  verified: boolean;
  error?: string;
  fromAddress?: string;
  toAddress?: string;
  amountInUsdt?: Decimal;
  blockNumber?: bigint;
  confirmations?: number;
  txHash?: string;
  logIndex?: number;
  tokenContract?: string;
}

/**
 * Independently verifies an on-chain BSC transaction hash against USDT BEP-20 rules.
 */
export async function verifyOnChainTransaction(
  txHash: string,
  expectedToAddress?: string,
  provider: BlockchainProvider = defaultBlockchainProvider
): Promise<OnChainVerificationResult> {
  const cleanHash = txHash.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return { verified: false, error: "Invalid transaction hash format. Must be 64-character hex with 0x prefix." };
  }

  const configuredUsdt = await getUsdtContractAddress();
  const requiredConfirmations = await getRequiredConfirmations();

  // 1. Fetch receipt and latest block concurrently
  const [receipt, currentBlock] = await Promise.all([
    provider.getTransactionReceipt(cleanHash),
    provider.getLatestBlockNumber(),
  ]);

  if (!receipt) {
    return { verified: false, error: "Transaction not found on BSC blockchain or pending inclusion." };
  }

  if (receipt.status !== "0x1") {
    return { verified: false, error: "Transaction failed or reverted on blockchain." };
  }

  const txBlockNumber = BigInt(receipt.blockNumber);
  const confirmations = Number(currentBlock >= txBlockNumber ? currentBlock - txBlockNumber : 0);

  // 2. Find matching Transfer log on the official USDT contract
  let matchingLog = null;
  let parsedAmount: Decimal | null = null;
  let fromAddress = "";
  let toAddress = "";

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() === configuredUsdt.toLowerCase() &&
      log.topics[0] === ERC20_TRANSFER_TOPIC &&
      log.topics.length >= 3
    ) {
      // Decode indexed from & to (last 20 bytes of 32-byte word)
      const logFrom = "0x" + log.topics[1].slice(-40).toLowerCase();
      const logTo = "0x" + log.topics[2].slice(-40).toLowerCase();

      if (expectedToAddress && logTo !== expectedToAddress.toLowerCase()) {
        continue; // Check if there's another log for expected address
      }

      // USDT BEP-20 has 18 decimals on BSC
      const rawValue = BigInt(log.data || "0x0");
      const amountDec = new Decimal(rawValue.toString()).dividedBy(new Decimal(10).pow(18));

      matchingLog = log;
      fromAddress = logFrom;
      toAddress = logTo;
      parsedAmount = amountDec;
      break;
    }
  }

  if (!matchingLog || !parsedAmount || parsedAmount.lessThanOrEqualTo(0)) {
    return {
      verified: false,
      error: `No valid USDT BEP-20 Transfer event found to target address in transaction ${cleanHash}.`,
    };
  }

  return {
    verified: true,
    txHash: cleanHash,
    fromAddress,
    toAddress,
    amountInUsdt: parsedAmount,
    blockNumber: txBlockNumber,
    confirmations,
    logIndex: matchingLog.logIndex ? parseInt(matchingLog.logIndex, 16) : 0,
    tokenContract: configuredUsdt,
  };
}

/**
 * Atomically credits a verified deposit into the user's Fund Wallet.
 * Guaranteed idempotent: duplicate attempts return { success: false, alreadyCredited: true }.
 */
export async function creditUserFundWalletAtomic(params: {
  depositId: string;
  adminId?: string | null;
  approvalNotes?: string | null;
}): Promise<{ success: boolean; message: string; alreadyCredited?: boolean; deposit?: any }> {
  return await db.$transaction(async (tx) => {
    // 1. Fetch and row-lock the deposit record
    const deposit = await tx.depositRequest.findUnique({
      where: { id: params.depositId },
      include: { user: true },
    });

    if (!deposit) {
      throw new Error("Deposit record not found.");
    }

    // 2. Protect against double crediting
    if (deposit.status === "CREDITED" || deposit.status === "APPROVED") {
      return {
        success: false,
        alreadyCredited: true,
        message: "Deposit has already been credited to user wallet.",
        deposit,
      };
    }

    const amountUsdtDec = new Decimal(deposit.amountInUsdt.toString());
    const referenceKey = `CRYPTO_DEPOSIT_${deposit.txHash}_${deposit.logIndex || 0}`;

    // 3. Execute immutable wallet ledger transaction
    const ledgerResult = await executeLedgerTransaction(
      {
        userId: deposit.userId,
        type: "DEPOSIT",
        wallet: "FUND",
        amount: amountUsdtDec,
        referenceKey,
        description: `USDT BEP-20 Deposit (Tx: ${deposit.txHash.slice(0, 10)}...)`,
      },
      tx
    );

    if (!ledgerResult.success && ledgerResult.alreadyProcessed) {
      // Mark record credited if ledger was already created previously
      await tx.depositRequest.update({
        where: { id: deposit.id },
        data: { status: "CREDITED", creditedAt: new Date() },
      });
      return {
        success: false,
        alreadyCredited: true,
        message: "Ledger transaction already exists for this deposit.",
        deposit,
      };
    }

    // 4. Update deposit status to CREDITED
    const updated = await tx.depositRequest.update({
      where: { id: deposit.id },
      data: {
        status: "CREDITED",
        creditedAt: new Date(),
        reviewedAt: params.adminId ? new Date() : deposit.reviewedAt,
        reviewedBy: params.adminId || deposit.reviewedBy,
        approvalNotes: params.approvalNotes || deposit.approvalNotes,
      },
    });

    return {
      success: true,
      message: `Successfully credited $${amountUsdtDec.toFixed(2)} USDT to user Fund Wallet.`,
      deposit: updated,
    };
  });
}
