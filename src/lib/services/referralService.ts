import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

export async function processDirectReferralReward(
  buyerId: string,
  contractId: string,
  packageAmountInr: number | string
) {
  const buyer = await db.user.findUnique({
    where: { id: buyerId },
    select: { customId: true, fullName: true, sponsorId: true },
  });

  if (!buyer || !buyer.sponsorId) return null;

  const sponsor = await db.user.findUnique({
    where: { id: buyer.sponsorId },
    select: { id: true, customId: true, status: true, directBusiness: true },
  });

  if (!sponsor) return null;

  const amountInrDec = new Decimal(packageAmountInr.toString());
  // 10% Instant Cash Reward
  const commissionInr = amountInrDec.times(APP_CONFIG.directReferralPercent / 100);
  const commissionUsdt = commissionInr.dividedBy(APP_CONFIG.usdtToInrRate);

  const referenceKey = `DIR_REF_${contractId}_${sponsor.id}`;

  const result = await executeLedgerTransaction({
    userId: sponsor.id,
    type: "DIRECT_REFERRAL",
    wallet: "INCOME",
    amount: commissionUsdt,
    referenceKey,
    description: `${APP_CONFIG.directReferralPercent}% Direct Referral Commission from ${buyer.customId} (Deposit: $${amountInrDec.dividedBy(APP_CONFIG.usdtToInrRate).toFixed(2)} USDT)`,
    sourceUserId: buyerId,
    levelNumber: 1,
  });

  // Update sponsor direct business volume
  const currentDirectBiz = new Decimal(sponsor.directBusiness.toString());
  await db.user.update({
    where: { id: sponsor.id },
    data: {
      directBusiness: currentDirectBiz.plus(amountInrDec).toFixed(8),
    },
  });

  return result;
}