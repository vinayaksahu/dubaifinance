import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

/**
 * Distributes the $0.50 / 12-Level Registration Bounty equally across the upper
 * 12 sponsor generations whenever a new user signs up.
 * Total: $0.50 USDT => ~$0.04166667 USDT per upline level.
 */
export async function distribute12LevelSignupBonus(
  newUserId: string,
  initialSponsorId: string | null
) {
  if (!initialSponsorId) return;

  try {
    const newUser = await db.user.findUnique({
      where: { id: newUserId },
      select: { id: true, customId: true, fullName: true },
    });
    if (!newUser) return;

    // Configurable total 12-level bounty (Default: 0.50 USDT)
    const totalBountyUsdt = await getNumericConfig(
      "SIGNUP_LEVEL_BONUS_TOTAL_USDT",
      APP_CONFIG.signupLevelBonusTotalUsdt ?? 0.50
    );

    const totalBountyDec = new Decimal(totalBountyUsdt);
    if (!totalBountyDec.isPositive() || totalBountyDec.isZero()) return;

    const levelAmountDec = totalBountyDec.dividedBy(12);
    if (!levelAmountDec.isPositive() || levelAmountDec.isZero()) return;

    let currentSponsorId: string | null = initialSponsorId;

    for (let level = 1; level <= 12; level++) {
      if (!currentSponsorId) break;

      const sponsor: {
        id: string;
        customId: string;
        sponsorId: string | null;
        status: any;
      } | null = await db.user.findUnique({
        where: { id: currentSponsorId },
        select: { id: true, customId: true, sponsorId: true, status: true },
      });

      if (!sponsor) break;

      const referenceKey = `SIGNUP_LEVEL_BONUS_${newUser.id}_${sponsor.id}_L${level}`;

      await executeLedgerTransaction({
        userId: sponsor.id,
        type: "SIGNUP_BONUS",
        wallet: "INCOME",
        amount: levelAmountDec,
        referenceKey,
        description: `12-Level Registration Bounty ($${levelAmountDec.toFixed(4)} USDT) from ${newUser.customId} (Level ${level})`,
        sourceUserId: newUser.id,
        levelNumber: level,
      });

      currentSponsorId = sponsor.sponsorId;
    }
  } catch (error) {
    console.error("[12-Level Signup Bonus Error]:", error);
  }
}

/**
 * Validates whether a user meets the "$20+ Active IDs" criteria for using/redeeming
 * their Signup and 12-Level Registration Bounty balance.
 *
 * Rules:
 * 1. If user's active packages total >= $20 (or config), 100% of balance is unlocked.
 * 2. If user's active packages total < $20, bonus funds are reserved/locked.
 *    Any requested amount that dips into the bonus portion is blocked until they activate a $20+ package.
 */
export async function validateBonusUsageEligibility(
  userId: string,
  requestedAmount: Decimal | number | string
): Promise<{ allowed: boolean; error?: string; activeTotalUsdt: Decimal; bonusBalanceUsdt: Decimal }> {
  const reqAmountDec = new Decimal(requestedAmount.toString());

  // Get min active package requirement from config (Default: $20.00 USDT)
  const minActiveRequired = await getNumericConfig(
    "BONUS_REDEMPTION_MIN_ACTIVE_USDT",
    APP_CONFIG.bonusRedemptionMinActiveUsdt ?? 20.0
  );
  const minActiveDec = new Decimal(minActiveRequired);

  // 1. Fetch user's active investment contracts
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      customId: true,
      incomeBalance: true,
      contracts: {
        where: { status: "ACTIVE" },
        select: { amountInUsdt: true, amountInInr: true },
      },
      ledgers: {
        where: { type: "SIGNUP_BONUS" },
        select: { amount: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      error: "User not found.",
      activeTotalUsdt: new Decimal(0),
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  // Calculate total active contract investment
  let activeTotalUsdt = new Decimal(0);
  for (const c of user.contracts) {
    const amt = c.amountInUsdt
      ? new Decimal(c.amountInUsdt.toString())
      : c.amountInInr
      ? new Decimal(c.amountInInr.toString())
      : new Decimal(0);
    activeTotalUsdt = activeTotalUsdt.plus(amt);
  }

  // If user has $20+ active package, they are 100% eligible
  if (activeTotalUsdt.greaterThanOrEqualTo(minActiveDec)) {
    return {
      allowed: true,
      activeTotalUsdt,
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  // Calculate total signup/level bonus received
  let totalBonusReceived = new Decimal(0);
  for (const entry of user.ledgers) {
    totalBonusReceived = totalBonusReceived.plus(new Decimal(entry.amount.toString()));
  }

  // If the user has received no bonus, no restrictions apply
  if (totalBonusReceived.isZero() || !totalBonusReceived.isPositive()) {
    return {
      allowed: true,
      activeTotalUsdt,
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  const currentIncomeBalance = new Decimal(user.incomeBalance.toString());
  // The available income that does NOT come from the bonus
  const nonBonusAvailable = Decimal.max(0, currentIncomeBalance.minus(totalBonusReceived));

  // If requested amount exceeds non-bonus income, it requires using the bonus funds
  if (reqAmountDec.greaterThan(nonBonusAvailable)) {
    return {
      allowed: false,
      error: `Bonus funds are usable only on active IDs with $${minActiveDec.toFixed(2)}+ active package. You have $${totalBonusReceived.toFixed(2)} USDT in Signup/Level Bonus, and your current active package is $${activeTotalUsdt.toFixed(2)} USDT. Please activate a package of $${minActiveDec.toFixed(2)} or more to redeem this bonus.`,
      activeTotalUsdt,
      bonusBalanceUsdt: totalBonusReceived,
    };
  }

  return {
    allowed: true,
    activeTotalUsdt,
    bonusBalanceUsdt: totalBonusReceived,
  };
}
