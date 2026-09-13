import { db } from "../db";
import { executeLedgerTransaction, WalletType } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

export async function processLevelIncomeForRoi(
  sourceUserId: string,
  contractId: string,
  packageType: "BASIC_SAVING" | "FIX_DEPOSIT",
  dailyRoiUsdt: Decimal,
  dateStr: string
) {
  let currentUserId = sourceUserId;
  const targetWallet: WalletType = packageType === "BASIC_SAVING" ? "INCOME" : "FD_LOCKED";

  for (let level = 1; level <= 12; level++) {
    // Find upline sponsor
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { sponsorId: true },
    });

    if (!currentUser || !currentUser.sponsorId) {
      break; // Reached root of tree
    }

    const sponsorId = currentUser.sponsorId;
    const sponsor = await db.user.findUnique({
      where: { id: sponsorId },
      select: {
        id: true,
        customId: true,
        status: true,
      },
    });

    if (!sponsor) break;

    // Check Qualification: Need 1 Direct Active Referral for each level
    const activeDirectsCount = await db.user.count({
      where: { sponsorId: sponsor.id, status: "ACTIVE" },
    });
    const isQualified = sponsor.status === "ACTIVE" && activeDirectsCount >= level;

    if (isQualified) {
      // Dynamic Level Royalty rate from System Config
      const defaultRate = APP_CONFIG.levelRates.find((r) => r.level === level)?.percent ?? 1.0;
      const ratePercent = await getNumericConfig(`LEVEL_${level}_PERCENT`, defaultRate);

      const levelIncomeUsdt = dailyRoiUsdt.times(ratePercent / 100);

      if (levelIncomeUsdt.isPositive() && !levelIncomeUsdt.isZero()) {
        const referenceKey = `LEVEL_${contractId}_${sponsor.id}_L${level}_${dateStr}`;
        const descType = packageType === "BASIC_SAVING" ? "Basic" : "FD";

        await executeLedgerTransaction({
          userId: sponsor.id,
          type: packageType === "BASIC_SAVING" ? "BASIC_LEVEL_INCOME" : "FD_LEVEL_INCOME",
          wallet: targetWallet,
          amount: levelIncomeUsdt,
          referenceKey,
          description: `${descType} Level ${level} Royalty (${ratePercent}%) from ${sourceUserId}`,
          sourceUserId,
          levelNumber: level,
        });
      }
    }

    currentUserId = sponsorId;
  }
}