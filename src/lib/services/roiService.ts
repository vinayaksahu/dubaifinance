import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { processLevelIncomeForRoi } from "./levelIncomeService";
import Decimal from "decimal.js";

export async function executeDailyRoiDistribution() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Find all active investment contracts that haven't reached maturity
  const activeContracts = await db.investmentContract.findMany({
    where: {
      status: "ACTIVE",
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

    // Calculate how many calendar days have elapsed since creation (minimum 1 for day of creation)
    const contractCreated = new Date(contract.createdAt);
    const startOfCreatedDay = new Date(
      contractCreated.getFullYear(),
      contractCreated.getMonth(),
      contractCreated.getDate()
    );
    const msDiff = Math.max(0, startOfDay.getTime() - startOfCreatedDay.getTime());
    const calendarDaysElapsed = Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1;

    // Total days this contract is eligible to be paid up to today
    const eligibleDaysTotal = Math.min(calendarDaysElapsed, contract.tenureDays);
    const daysToPay = Math.max(0, eligibleDaysTotal - contract.daysPaid);

    if (daysToPay <= 0) {
      continue;
    }

    const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
    const rateDec = new Decimal(contract.dailyRoiRate.toString());
    const dailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));

    const isBasic = contract.packageType === "BASIC_SAVING";
    const targetWallet = isBasic ? "INCOME" : "FD_LOCKED";
    const transactionType = isBasic ? "BASIC_ROI" : "FD_ROI";

    let contractDaysPaid = contract.daysPaid;
    let contractTotalEarned = new Decimal(contract.totalEarned.toString());

    // Process each unpaid day
    for (let i = 0; i < daysToPay; i++) {
      const currentDayNumber = contractDaysPaid + 1;
      const targetDate = new Date(
        startOfCreatedDay.getTime() + (currentDayNumber - 1) * 24 * 60 * 60 * 1000
      );
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const referenceKey = `ROI_${contract.id}_${targetDateStr}`;

      const ledgerResult = await executeLedgerTransaction({
        userId: contract.userId,
        type: transactionType,
        wallet: targetWallet,
        amount: dailyRoiUsdt,
        referenceKey,
        description: `${isBasic ? "Basic" : "FD"} Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${currentDayNumber}/${contract.tenureDays})`,
      });

      if (ledgerResult.success) {
        contractDaysPaid = currentDayNumber;
        contractTotalEarned = contractTotalEarned.plus(dailyRoiUsdt);

        // Distribute 12-level royalties for this daily ROI
        try {
          await processLevelIncomeForRoi(
            contract.userId,
            contract.id,
            contract.packageType,
            dailyRoiUsdt,
            targetDateStr
          );
        } catch (levelErr) {
          console.error("Level income distribution error:", levelErr);
        }

        totalDistributedUsdt = totalDistributedUsdt.plus(dailyRoiUsdt);
      } else if (ledgerResult.alreadyProcessed) {
        // If already processed, advance count
        contractDaysPaid = currentDayNumber;
      }
    }

    const isMatured = contractDaysPaid >= contract.tenureDays;

    await db.investmentContract.update({
      where: { id: contract.id },
      data: {
        daysPaid: contractDaysPaid,
        totalEarned: contractTotalEarned.toFixed(8),
        lastRoiAt: now,
        status: isMatured ? "COMPLETED" : "ACTIVE",
      },
    });

    // If FD contract matured, release locked funds into Available Income wallet
    if (!isBasic && isMatured) {
      const releaseRefKey = `FD_MATURITY_RELEASE_${contract.id}`;
      await executeLedgerTransaction({
        userId: contract.userId,
        type: "FD_ROI",
        wallet: "FD_LOCKED",
        amount: contractTotalEarned.negated(),
        referenceKey: `${releaseRefKey}_DEBIT`,
        description: `Maturity release of FD Contract ${contract.id}`,
      });
      await executeLedgerTransaction({
        userId: contract.userId,
        type: "FD_ROI",
        wallet: "INCOME",
        amount: contractTotalEarned,
        referenceKey: `${releaseRefKey}_CREDIT`,
        description: `Matured FD Earnings Released to Available Balance (Contract ${contract.id})`,
      });
    }

    if (contractDaysPaid > contract.daysPaid) {
      processedCount++;
    }
  }

  return {
    date: dateStr,
    totalContracts: activeContracts.length,
    processedCount,
    totalDistributedUsdt: totalDistributedUsdt.toFixed(8),
  };
}