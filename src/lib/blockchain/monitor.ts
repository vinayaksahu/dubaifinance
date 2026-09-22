import { db } from "@/lib/db";
import { BlockchainProvider, defaultBlockchainProvider } from "./provider";
import {
  getUsdtContractAddress,
  getRequiredConfirmations,
  getDepositProcessingMode,
  getDepositProcessingModeForUser,
  isAutomaticCreditingEnabled,
  isBlockchainMonitorEnabled,
  ERC20_TRANSFER_TOPIC,
} from "./config";
import { findUserByDepositAddress } from "./addressService";
import { creditUserFundWalletAtomic } from "./depositProcessor";
import Decimal from "decimal.js";

const CHECKPOINT_ID = "bsc_usdt_mainnet";
const MAX_BLOCKS_PER_BATCH = BigInt(100); // Respect free RPC getLogs limits

export interface ScanResult {
  success: boolean;
  fromBlock: string;
  toBlock: string;
  latestBlock: string;
  detectedCount: number;
  creditedCount: number;
  pendingReviewCount: number;
  error?: string;
}

/**
 * Gets or initializes the BSC blockchain checkpoint in DB.
 */
export async function getOrCreateCheckpoint(provider: BlockchainProvider = defaultBlockchainProvider) {
  let checkpoint = await db.blockchainCheckpoint.findUnique({
    where: { id: CHECKPOINT_ID },
  });

  if (!checkpoint) {
    const latestBlock = await provider.getLatestBlockNumber();
    // Start 20 blocks back to catch recent transactions
    const startBlock = latestBlock > BigInt(20) ? latestBlock - BigInt(20) : latestBlock;

    checkpoint = await db.blockchainCheckpoint.create({
      data: {
        id: CHECKPOINT_ID,
        network: "BSC",
        lastProcessedBlock: startBlock,
        latestKnownBlock: latestBlock,
        status: "IDLE",
        lastSuccessfulScan: new Date(),
      },
    });
  }

  return checkpoint;
}

/**
 * Executes a monitoring and reconciliation scan of the BSC blockchain for USDT BEP-20 transfers.
 */
export async function runBlockchainScan(
  options: {
    fromBlockOverride?: bigint;
    toBlockOverride?: bigint;
    provider?: BlockchainProvider;
  } = {}
): Promise<ScanResult> {
  const provider = options.provider || defaultBlockchainProvider;

  const monitorEnabled = await isBlockchainMonitorEnabled();
  if (!monitorEnabled) {
    return {
      success: false,
      fromBlock: "0",
      toBlock: "0",
      latestBlock: "0",
      detectedCount: 0,
      creditedCount: 0,
      pendingReviewCount: 0,
      error: "Blockchain monitor is disabled in system config.",
    };
  }

  const usdtContract = await getUsdtContractAddress();
  const requiredConfirmations = await getRequiredConfirmations();
  const currentMode = await getDepositProcessingMode();
  const autoCreditEnabled = await isAutomaticCreditingEnabled();

  let detectedCount = 0;
  let creditedCount = 0;
  let pendingReviewCount = 0;

  try {
    const latestBlock = await provider.getLatestBlockNumber();
    const checkpoint = await getOrCreateCheckpoint(provider);

    const fromBlock = options.fromBlockOverride ?? (checkpoint.lastProcessedBlock + BigInt(1));
    if (fromBlock > latestBlock) {
      // Up to date
      await db.blockchainCheckpoint.update({
        where: { id: CHECKPOINT_ID },
        data: {
          latestKnownBlock: latestBlock,
          lastSuccessfulScan: new Date(),
          status: "IDLE",
          lastError: null,
        },
      });

      // Still check unconfirmed pending transactions
      await updateConfirmingDeposits(latestBlock, requiredConfirmations, currentMode, autoCreditEnabled);

      return {
        success: true,
        fromBlock: fromBlock.toString(),
        toBlock: latestBlock.toString(),
        latestBlock: latestBlock.toString(),
        detectedCount: 0,
        creditedCount: 0,
        pendingReviewCount: 0,
      };
    }

    // Limit chunk size to avoid RPC provider query timeouts
    const toBlock = options.toBlockOverride ?? (
      fromBlock + MAX_BLOCKS_PER_BATCH < latestBlock ? fromBlock + MAX_BLOCKS_PER_BATCH : latestBlock
    );

    // Update status to RUNNING
    await db.blockchainCheckpoint.update({
      where: { id: CHECKPOINT_ID },
      data: { status: "RUNNING" },
    });

    // Fetch USDT Transfer logs
    const logs = await provider.getLogs({
      fromBlock,
      toBlock,
      address: usdtContract,
      topics: [ERC20_TRANSFER_TOPIC],
    });

    for (const log of logs) {
      if (log.topics.length < 3 || log.removed) continue;

      const toAddress = ("0x" + log.topics[2].slice(-40)).toLowerCase();
      const fromAddress = ("0x" + log.topics[1].slice(-40)).toLowerCase();

      // Check if destination address matches a registered DubaiFinance user
      const matchedAddress = await findUserByDepositAddress(toAddress);
      if (!matchedAddress) {
        // Transfer is for someone else on BSC, ignore
        continue;
      }

      const rawAmount = BigInt(log.data || "0x0");
      if (rawAmount <= BigInt(0)) continue;

      const amountDec = new Decimal(rawAmount.toString()).dividedBy(new Decimal(10).pow(18));
      const logBlockNumber = BigInt(log.blockNumber);
      const logIndex = parseInt(log.logIndex, 16);
      const txHash = log.transactionHash.toLowerCase();
      const confirmations = Number(latestBlock >= logBlockNumber ? latestBlock - logBlockNumber : 0);

      // Check for existing record
      let deposit = await db.depositRequest.findUnique({
        where: { txHash },
      });

      if (!deposit) {
        detectedCount++;
        const userMode = await getDepositProcessingModeForUser(matchedAddress.userId);
        const initialStatus = confirmations >= requiredConfirmations
          ? (userMode === "AUTOMATIC" ? (autoCreditEnabled ? "CONFIRMED" : "CREDIT_PENDING_PAUSED") : "PENDING_REVIEW")
          : (confirmations > 0 ? "CONFIRMING" : "PENDING");

        deposit = await db.depositRequest.create({
          data: {
            userId: matchedAddress.userId,
            depositAddressId: matchedAddress.id,
            amountInUsdt: amountDec.toFixed(8),
            amountInInr: amountDec.toFixed(2),
            txHash,
            network: "USDT_BEP20",
            tokenContract: usdtContract,
            fromAddress,
            toAddress,
            blockNumber: logBlockNumber,
            transactionIndex: parseInt(log.transactionIndex, 16),
            logIndex,
            confirmations,
            processingMode: userMode,
            status: initialStatus,
            detectedAt: new Date(),
            confirmedAt: confirmations >= requiredConfirmations ? new Date() : null,
          },
        });

        // If eligible for automatic credit immediately
        if (confirmations >= requiredConfirmations) {
          if (userMode === "AUTOMATIC" && autoCreditEnabled) {
            const creditRes = await creditUserFundWalletAtomic({ depositId: deposit.id });
            if (creditRes.success) creditedCount++;
          } else if (userMode === "MANUAL") {
            pendingReviewCount++;
          }
        }
      } else {
        // Update confirmation count
        if (deposit.status === "PENDING" || deposit.status === "CONFIRMING") {
          const isConfirmed = confirmations >= requiredConfirmations;
          const nextStatus = isConfirmed
            ? (deposit.processingMode === "AUTOMATIC" ? (autoCreditEnabled ? "CONFIRMED" : "CREDIT_PENDING_PAUSED") : "PENDING_REVIEW")
            : "CONFIRMING";

          deposit = await db.depositRequest.update({
            where: { id: deposit.id },
            data: {
              confirmations,
              status: nextStatus,
              confirmedAt: isConfirmed && !deposit.confirmedAt ? new Date() : deposit.confirmedAt,
            },
          });

          if (isConfirmed && deposit.processingMode === "AUTOMATIC" && autoCreditEnabled) {
            const creditRes = await creditUserFundWalletAtomic({ depositId: deposit.id });
            if (creditRes.success) creditedCount++;
          }
        }
      }
    }

    // Update pending confirmation progress for earlier deposits
    const confirmedEarly = await updateConfirmingDeposits(
      latestBlock,
      requiredConfirmations,
      currentMode,
      autoCreditEnabled
    );
    creditedCount += confirmedEarly;

    // Checkpoint progress
    await db.blockchainCheckpoint.update({
      where: { id: CHECKPOINT_ID },
      data: {
        lastProcessedBlock: toBlock,
        latestKnownBlock: latestBlock,
        status: "IDLE",
        lastSuccessfulScan: new Date(),
        lastError: null,
      },
    });

    return {
      success: true,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      latestBlock: latestBlock.toString(),
      detectedCount,
      creditedCount,
      pendingReviewCount,
    };
  } catch (error: any) {
    console.error("[Blockchain Monitor Scan Error]:", error);

    await db.blockchainCheckpoint.upsert({
      where: { id: CHECKPOINT_ID },
      create: {
        id: CHECKPOINT_ID,
        network: "BSC",
        status: "ERROR",
        lastError: error.message || String(error),
      },
      update: {
        status: "ERROR",
        lastError: error.message || String(error),
      },
    });

    return {
      success: false,
      fromBlock: "0",
      toBlock: "0",
      latestBlock: "0",
      detectedCount: 0,
      creditedCount: 0,
      pendingReviewCount: 0,
      error: error.message || String(error),
    };
  }
}

/**
 * Checks existing PENDING / CONFIRMING deposits in database and advances their confirmations.
 */
async function updateConfirmingDeposits(
  latestBlock: bigint,
  requiredConfirmations: number,
  currentMode: "AUTOMATIC" | "MANUAL",
  autoCreditEnabled: boolean
): Promise<number> {
  let credited = 0;

  const pendingDeposits = await db.depositRequest.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMING"] },
      blockNumber: { not: null },
    },
  });

  for (const dep of pendingDeposits) {
    if (!dep.blockNumber) continue;
    const confirmations = Number(latestBlock >= dep.blockNumber ? latestBlock - dep.blockNumber : 0);

    if (confirmations >= requiredConfirmations) {
      const isAuto = dep.processingMode === "AUTOMATIC";
      const newStatus = isAuto
        ? (autoCreditEnabled ? "CONFIRMED" : "CREDIT_PENDING_PAUSED")
        : "PENDING_REVIEW";

      await db.depositRequest.update({
        where: { id: dep.id },
        data: {
          confirmations,
          status: newStatus,
          confirmedAt: new Date(),
        },
      });

      if (isAuto && autoCreditEnabled) {
        const res = await creditUserFundWalletAtomic({ depositId: dep.id });
        if (res.success) credited++;
      }
    } else if (confirmations > dep.confirmations) {
      await db.depositRequest.update({
        where: { id: dep.id },
        data: { confirmations, status: "CONFIRMING" },
      });
    }
  }

  return credited;
}
