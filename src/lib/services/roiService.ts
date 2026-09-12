import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { processLevelIncomeForRoi } from "./levelIncomeService";
import Decimal from "decimal.js";

export async function executeDailyRoiDistribution() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Find all eligible active investment contracts
  const activeContracts = await db.investmentContract.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { lastRoiAt: null },
        { lastRoiAt: { lt: startOfDay } },
      ],
    },
    include: {
      user: { select: { id: true, customId: true, status: true } },
    },
  });

  let processedCount = 0;
  let totalDistributedUsdt = new Decimal(0);

  for (const contract of activeContracts) {
    if (contract.daysPaid >= contract.tenureDays) {
      await db.investmentContract.update({
        where: { id: contract.id },
        data: { status: "COMPLETED" },
      });
      continue;
    }

    const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
    const rateDec = new Decimal(contract.dailyRoiRate.toString());
    const dailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));

    const isBasic = contract.packageType === "BASIC_SAVING";
    const targetWallet = isBasic ? "INCOME" : "FD_LOCKED";
    const transactionType = isBasic ? "BASIC_ROI" : "FD_ROI";
    const referenceKey = `ROI_${contract.id}_${dateStr}`;

    const ledgerResult = await executeLedgerTransaction({
      userId: contract.userId,
      type: transactionType,
      wallet: targetWallet,
      amount: dailyRoiUsdt,
      referenceKey,
      description: `${isBasic ? "Basic" : "FD"} Daily ROI (${rateDec}%) on Contract ${contract.id}`,
    });

    if (ledgerResult.success) {
      const nextDaysPaid = contract.daysPaid + 1;
      const currentEarned = new Decimal(contract.totalEarned.toString());
      const nextTotalEarned = currentEarned.plus(dailyRoiUsdt);
      const isMatured = nextDaysPaid >= contract.tenureDays;

      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          daysPaid: nextDaysPaid,
          totalEarned: nextTotalEarned.toFixed(8),
          lastRoiAt: now,
          status: isMatured ? "COMPLETED" : "ACTIVE",
        },
      });

      // Distribute 12-level royalties on this daily ROI
      await processLevelIncomeForRoi(
        contract.userId,
        contract.id,
        contract.packageType,
        dailyRoiUsdt,
        dateStr
      );

      // If FD contract matured, release locked funds into Available Income wallet
      if (!isBasic && isMatured) {
        const releaseRefKey = `FD_MATURITY_RELEASE_${contract.id}`;
        // Move from FD_LOCKED to INCOME
        await executeLedgerTransaction({
          userId: contract.userId,
          type: "FD_ROI",
          wallet: "FD_LOCKED",
          amount: nextTotalEarned.negated(),
          referenceKey: `${releaseRefKey}_DEBIT`,
          description: `Maturity release of FD Contract ${contract.id}`,
        });
        await executeLedgerTransaction({
          userId: contract.userId,
          type: "FD_ROI",
          wallet: "INCOME",
          amount: nextTotalEarned,
          referenceKey: `${releaseRefKey}_CREDIT`,
          description: `Matured FD Earnings Released to Available Balance (Contract ${contract.id})`,
        });
      }

      processedCount++;
      totalDistributedUsdt = totalDistributedUsdt.plus(dailyRoiUsdt);
    }
  }

  return {
    date: dateStr,
    totalContracts: activeContracts.length,
    processedCount,
    totalDistributedUsdt: totalDistributedUsdt.toFixed(8),
  };
}