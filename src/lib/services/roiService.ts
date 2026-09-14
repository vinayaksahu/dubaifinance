import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { processLevelIncomeForRoi } from "./levelIncomeService";
import Decimal from "decimal.js";

/**
 * Returns accurate Dubai Time (GST = UTC+4) information and next cycle schedule (12:01 AM GST)
 */
export function getDubaiTimeInfo(date: Date = new Date()) {
  const gstMs = date.getTime() + 4 * 60 * 60 * 1000; // Shift UTC to GST (+4h)
  const gstDate = new Date(gstMs);

  const year = gstDate.getUTCFullYear();
  const month = gstDate.getUTCMonth();
  const day = gstDate.getUTCDate();
  const hours = gstDate.getUTCHours();
  const minutes = gstDate.getUTCMinutes();
  const seconds = gstDate.getUTCSeconds();

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const startOfDayMs = Date.UTC(year, month, day, 0, 0, 0);

  // Next cycle is at 12:01 AM GST
  // If current Dubai time is 00:00, next cycle is at 00:01 today.
  // If current Dubai time is past 00:01, next cycle is at 00:01 tomorrow.
  let nextCycleGstDate: Date;
  if (hours === 0 && minutes < 1) {
    nextCycleGstDate = new Date(Date.UTC(year, month, day, 0, 1, 0));
  } else {
    nextCycleGstDate = new Date(Date.UTC(year, month, day + 1, 0, 1, 0));
  }

  // Convert GST timestamp back to real UTC timestamp (-4h)
  const nextCycleUtcTimestamp = nextCycleGstDate.getTime() - 4 * 60 * 60 * 1000;
  const nextCycleUtc = new Date(nextCycleUtcTimestamp);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDubaiFormatted = `${day} ${monthNames[month]} ${year}, ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} GST`;
  const nextCycleDubaiFormatted = `${nextCycleGstDate.getUTCDate()} ${monthNames[nextCycleGstDate.getUTCMonth()]} ${nextCycleGstDate.getUTCFullYear()}, 12:01 AM GST`;

  return {
    dateStr,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    startOfDayMs,
    currentDubaiFormatted,
    nextCycleUtc,
    nextCycleUtcTimestamp,
    nextCycleDubaiFormatted,
  };
}

/**
 * Distributes daily ROI for all eligible active contracts based on Dubai midnight cycle (12:01 AM GST).
 * New contracts activated today do NOT receive Day 1 ROI immediately; Day 1 is credited at the first 12:01 AM cycle.
 */
export async function executeDailyRoiDistribution() {
  const now = new Date();
  const nowInfo = getDubaiTimeInfo(now);

  // Find all active investment contracts
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

    // Dubai calendar day calculation:
    // If contract was created today in Dubai, calendarDaysElapsed = 0.
    // Day 1 ROI will only be paid once Dubai time reaches 12:01 AM of the next calendar day (calendarDaysElapsed = 1).
    const createdInfo = getDubaiTimeInfo(new Date(contract.createdAt));
    const msDiff = Math.max(0, nowInfo.startOfDayMs - createdInfo.startOfDayMs);
    const calendarDaysElapsed = Math.floor(msDiff / (1000 * 60 * 60 * 24));

    // Eligible days strictly capped at tenureDays
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

    // Process each unpaid cycle
    for (let i = 0; i < daysToPay; i++) {
      const currentDayNumber = contractDaysPaid + 1;
      const targetDateMs = createdInfo.startOfDayMs + currentDayNumber * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetDateMs);
      const targetDateStr = `${targetDate.getUTCFullYear()}-${String(targetDate.getUTCMonth() + 1).padStart(2, "0")}-${String(targetDate.getUTCDate()).padStart(2, "0")}`;
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
    date: nowInfo.dateStr,
    dubaiTime: nowInfo.currentDubaiFormatted,
    totalContracts: activeContracts.length,
    processedCount,
    totalDistributedUsdt: totalDistributedUsdt.toFixed(8),
  };
}

/**
 * Computes exact upcoming cycle payout forecast for the next 12:01 AM Dubai Time execution.
 */
export async function getUpcomingCycleForecast() {
  const now = new Date();
  const nowInfo = getDubaiTimeInfo(now);

  const activeContracts = await db.investmentContract.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          id: true,
          customId: true,
          fullName: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let projectedBasicRoiUsdt = new Decimal(0);
  let projectedFdRoiUsdt = new Decimal(0);
  let scheduledContractsCount = 0;
  const queuedContracts: any[] = [];

  for (const contract of activeContracts) {
    if (contract.daysPaid >= contract.tenureDays) {
      continue;
    }

    const createdInfo = getDubaiTimeInfo(new Date(contract.createdAt));
    const msDiff = Math.max(0, nowInfo.startOfDayMs - createdInfo.startOfDayMs);
    const currentDaysElapsed = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const nextDaysElapsed = currentDaysElapsed + 1;
    const nextEligibleDays = Math.min(nextDaysElapsed, contract.tenureDays);

    if (nextEligibleDays > contract.daysPaid) {
      const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
      const rateDec = new Decimal(contract.dailyRoiRate.toString());
      const dailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));

      const isBasic = contract.packageType === "BASIC_SAVING";
      if (isBasic) {
        projectedBasicRoiUsdt = projectedBasicRoiUsdt.plus(dailyRoiUsdt);
      } else {
        projectedFdRoiUsdt = projectedFdRoiUsdt.plus(dailyRoiUsdt);
      }

      scheduledContractsCount++;
      const nextCycleNumber = contract.daysPaid + 1;
      const isFirstCycle = contract.daysPaid === 0;
      const isFinalCycle = nextCycleNumber >= contract.tenureDays;

      queuedContracts.push({
        contractId: contract.id,
        userCustomId: contract.user?.customId || "Unknown",
        userFullName: contract.user?.fullName || "Member",
        packageType: contract.packageType,
        amountInUsdt: Number(contract.amountInUsdt),
        dailyRoiRate: Number(contract.dailyRoiRate),
        upcomingRoiUsdt: Number(dailyRoiUsdt.toFixed(4)),
        daysPaid: contract.daysPaid,
        tenureDays: contract.tenureDays,
        nextCycleNumber,
        isFirstCycle,
        isFinalCycle,
        cycleLabel: isFirstCycle
          ? "Cycle 1 (First Return)"
          : isFinalCycle
          ? `Final Cycle (Day ${contract.tenureDays} - Maturity)`
          : `Day ${nextCycleNumber} / ${contract.tenureDays}`,
        targetWallet: isBasic ? "Income Wallet" : "FD Locked Wallet",
      });
    }
  }

  const totalRoiDec = projectedBasicRoiUsdt.plus(projectedFdRoiUsdt);
  // Level royalties estimated at ~10-15% of daily ROI
  const projectedLevelIncomeUsdt = totalRoiDec.times(0.12);
  const totalProjectedPayoutUsdt = totalRoiDec.plus(projectedLevelIncomeUsdt);

  return {
    currentDubaiTime: nowInfo.currentDubaiFormatted,
    nextCycleDubaiTime: nowInfo.nextCycleDubaiFormatted,
    nextCycleUtcTimestamp: nowInfo.nextCycleUtcTimestamp,
    totalScheduledContracts: scheduledContractsCount,
    projectedBasicRoiUsdt: Number(projectedBasicRoiUsdt.toFixed(2)),
    projectedFdRoiUsdt: Number(projectedFdRoiUsdt.toFixed(2)),
    projectedTotalRoiUsdt: Number(totalRoiDec.toFixed(2)),
    projectedLevelIncomeUsdt: Number(projectedLevelIncomeUsdt.toFixed(2)),
    projectedTotalPayoutUsdt: Number(totalProjectedPayoutUsdt.toFixed(2)),
    queuedContracts,
  };
}