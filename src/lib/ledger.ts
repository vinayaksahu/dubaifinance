import { Prisma } from "@prisma/client";
import { db } from "./db";
import Decimal from "decimal.js";

export type WalletType = "FUND" | "INCOME" | "FD_LOCKED";

export interface CreateLedgerParams {
  userId: string;
  type:
    | "SIGNUP_BONUS"
    | "DEPOSIT"
    | "BASIC_ROI"
    | "FD_ROI"
    | "DIRECT_REFERRAL"
    | "BASIC_LEVEL_INCOME"
    | "FD_LEVEL_INCOME"
    | "P2P_SENT"
    | "P2P_RECEIVED"
    | "SWIPE_INCOME_TO_FUND"
    | "PACKAGE_PURCHASE"
    | "WITHDRAWAL"
    | "WITHDRAWAL_REFUND";
  wallet: WalletType;
  amount: number | string | Decimal;
  referenceKey: string;
  description: string;
  sourceUserId?: string;
  levelNumber?: number;
}

export async function executeLedgerTransaction(
  params: CreateLedgerParams,
  externalTx?: Prisma.TransactionClient
) {
  const tx = externalTx || db;
  const amountDec = new Decimal(params.amount.toString());

  // Verify idempotency
  const existing = await tx.ledgerEntry.findUnique({
    where: { referenceKey: params.referenceKey },
  });
  if (existing) {
    return { success: false, alreadyProcessed: true, ledger: existing };
  }

  // Fetch current user wallet balance
  const user = await tx.user.findUnique({
    where: { id: params.userId },
    select: {
      fundBalance: true,
      incomeBalance: true,
      fdLockedBalance: true,
    },
  });

  if (!user) {
    throw new Error(`User ${params.userId} not found for ledger transaction`);
  }

  let currentBalance: Decimal;
  let updateData: Prisma.UserUpdateInput = {};

  if (params.wallet === "FUND") {
    currentBalance = new Decimal(user.fundBalance.toString());
    const newBalance = currentBalance.plus(amountDec);
    if (newBalance.isNegative()) {
      throw new Error(`Insufficient Fund Wallet balance. Current: ${currentBalance}, Required: ${amountDec.abs()}`);
    }
    updateData = { fundBalance: newBalance.toFixed(8) };
  } else if (params.wallet === "INCOME") {
    currentBalance = new Decimal(user.incomeBalance.toString());
    const newBalance = currentBalance.plus(amountDec);
    if (newBalance.isNegative()) {
      throw new Error(`Insufficient Income Wallet balance. Current: ${currentBalance}, Required: ${amountDec.abs()}`);
    }
    updateData = { incomeBalance: newBalance.toFixed(8) };
  } else if (params.wallet === "FD_LOCKED") {
    currentBalance = new Decimal(user.fdLockedBalance.toString());
    const newBalance = currentBalance.plus(amountDec);
    updateData = { fdLockedBalance: newBalance.toFixed(8) };
  } else {
    throw new Error(`Invalid wallet type: ${params.wallet}`);
  }

  const finalBalance = currentBalance.plus(amountDec);

  // Update user balance
  await tx.user.update({
    where: { id: params.userId },
    data: updateData,
  });

  // Create immutable ledger entry
  const entry = await tx.ledgerEntry.create({
    data: {
      userId: params.userId,
      type: params.type,
      wallet: params.wallet,
      amount: amountDec.toFixed(8),
      balanceAfter: finalBalance.toFixed(8),
      referenceKey: params.referenceKey,
      description: params.description,
      sourceUserId: params.sourceUserId,
      levelNumber: params.levelNumber,
    },
  });

  return { success: true, alreadyProcessed: false, ledger: entry };
}