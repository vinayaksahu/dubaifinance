import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import { recordActivity } from "../auditLogger";
import Decimal from "decimal.js";

export async function processDirectReferralReward(
  buyerId: string,
  contractId: string,
  packageAmountUsdt: number | string
) {
  const buyer = await db.user.findUnique({
    where: { id: buyerId },
    select: { customId: true, fullName: true, sponsorId: true },
  });

  if (!buyer || !buyer.sponsorId) return null;

  const sponsor = await db.user.findUnique({
    where: { id: buyer.sponsorId },
    select: {
      id: true,
      customId: true,
      fullName: true,
      status: true,
      directBusiness: true,
      contracts: {
        where: { status: "ACTIVE" },
        select: { id: true, amountInUsdt: true },
      },
    },
  });

  if (!sponsor) return null;

  const directPercent = await getNumericConfig("DIRECT_REFERRAL_PERCENT", APP_CONFIG.directReferralPercent);
  const amountUsdtDec = new Decimal(packageAmountUsdt.toString());
  const commissionUsdt = amountUsdtDec.times(directPercent / 100);

  // Check if sponsor's own ID is ACTIVE with at least one active contract
  const hasActiveContract = Boolean(sponsor.contracts && sponsor.contracts.length > 0);
  const isSponsorActive = sponsor.status === "ACTIVE" && hasActiveContract;

  if (!isSponsorActive) {
    // Sponsor's ID is NOT activated -> Flush out the referral commission!
    console.log(
      `[Referral Flushed]: Sponsor ${sponsor.customId} is INACTIVE (status: ${sponsor.status}, activeContracts: ${sponsor.contracts?.length || 0}). Direct referral commission of ${directPercent}% ($${commissionUsdt.toFixed(2)} USDT) from ${buyer.customId} is FLUSHED OUT.`
    );

    await recordActivity({
      userId: sponsor.id,
      action: "REFERRAL_COMMISSION_FLUSHED",
      category: "FINANCIAL",
      description: `Direct Referral Commission of $${commissionUsdt.toFixed(2)} USDT from ${buyer.customId} was FLUSHED OUT because sponsor ID ${sponsor.customId} is not active.`,
      metadata: {
        buyerId,
        buyerCustomId: buyer.customId,
        contractId,
        packageAmountUsdt: amountUsdtDec.toNumber(),
        flushedCommissionUsdt: commissionUsdt.toNumber(),
        sponsorStatus: sponsor.status,
        hasActiveContract,
        reason: "SPONSOR_ID_NOT_ACTIVATED",
      },
    });

    // Update sponsor direct business volume in USDT so team volume is retained
    const currentDirectBiz = new Decimal(sponsor.directBusiness.toString());
    await db.user.update({
      where: { id: sponsor.id },
      data: {
        directBusiness: currentDirectBiz.plus(amountUsdtDec).toFixed(8),
      },
    });

    return { flushed: true, reason: "SPONSOR_NOT_ACTIVE", commissionUsdt: commissionUsdt.toNumber() };
  }

  const referenceKey = `DIR_REF_${contractId}_${sponsor.id}`;

  const result = await executeLedgerTransaction({
    userId: sponsor.id,
    type: "DIRECT_REFERRAL",
    wallet: "INCOME",
    amount: commissionUsdt,
    referenceKey,
    description: `${directPercent}% Direct Referral Commission from ${buyer.customId} (Deposit: $${amountUsdtDec.toFixed(2)} USDT)`,
    sourceUserId: buyerId,
    levelNumber: 1,
  });

  // Update sponsor direct business volume in USDT
  const currentDirectBiz = new Decimal(sponsor.directBusiness.toString());
  await db.user.update({
    where: { id: sponsor.id },
    data: {
      directBusiness: currentDirectBiz.plus(amountUsdtDec).toFixed(8),
    },
  });

  return result;
}