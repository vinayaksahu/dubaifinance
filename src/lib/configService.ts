import { db } from "./db";
import { APP_CONFIG } from "./constants";

export const DEFAULT_SYSTEM_CONFIGS: Record<string, { value: string; description: string; category: string }> = {
  // 1. Financial & Wallet
  COMPANY_USDT_ADDRESS: {
    value: APP_CONFIG.depositAddress,
    description: "Official USDT BEP-20 receiving wallet address for recharges",
    category: "wallet",
  },

  // 2. Basic Saving Package (Dark PDF Slide 5-9 & 11)
  BASIC_PLAN_DAILY_ROI: {
    value: String(APP_CONFIG.basicPlan.dailyRoiRate),
    description: "Basic Saving plan daily return percentage (5.0 for 5% daily)",
    category: "plan",
  },
  BASIC_PLAN_TENURE_DAYS: {
    value: String(APP_CONFIG.basicPlan.tenureDays),
    description: "Basic Saving contract duration in days (28 days = 140% total gross / 40% net profit)",
    category: "plan",
  },
  BASIC_PLAN_MIN_USDT: {
    value: String(APP_CONFIG.basicPlan.minUsdt),
    description: "Minimum package amount in USDT for Basic Saving ($5)",
    category: "plan",
  },
  BASIC_PLAN_MAX_USDT: {
    value: String(APP_CONFIG.basicPlan.maxUsdt),
    description: "Maximum package amount in USDT for Basic Saving ($5,000)",
    category: "plan",
  },

  // 3. Fix Deposit (FD) Staking (Dark PDF Slide 12, 13, 14)
  FD_PLAN_180_DAILY_ROI: {
    value: "10.0",
    description: "180-Day FD daily yield percentage (10% daily = 1,800% / 18X total)",
    category: "plan",
  },
  FD_PLAN_180_DAYS: {
    value: "180",
    description: "180-Day FD contract duration in days",
    category: "plan",
  },
  FD_PLAN_210_DAILY_ROI: {
    value: "15.0",
    description: "210-Day FD daily yield percentage (15% daily = 3,150% / 31.5X total)",
    category: "plan",
  },
  FD_PLAN_210_DAYS: {
    value: "210",
    description: "210-Day FD contract duration in days",
    category: "plan",
  },
  FD_MIN_USDT: {
    value: "50",
    description: "Minimum investment in USDT for Fix Deposit ($50)",
    category: "plan",
  },
  FD_MAX_USDT: {
    value: "5000",
    description: "Maximum investment in USDT for Fix Deposit ($5,000)",
    category: "plan",
  },

  // 4. Direct Referral Income (Dark PDF Slide 10 & 15: 10% Instant)
  DIRECT_REFERRAL_PERCENT: {
    value: String(APP_CONFIG.directReferralPercent),
    description: "Instant direct sponsor commission percentage (10.0 for 10% instant)",
    category: "royalty",
  },

  // 5. 12-Level Daily Royalty Income (Dark PDF Slide 16 & 17 - calculated on downline daily ROI)
  LEVEL_1_PERCENT: {
    value: "5.0",
    description: "Level 1 Royalty % (Requires 1 Active Direct Referral)",
    category: "royalty",
  },
  LEVEL_2_PERCENT: {
    value: "3.0",
    description: "Level 2 Royalty % (Requires 2 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_3_PERCENT: {
    value: "2.0",
    description: "Level 3 Royalty % (Requires 3 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_4_PERCENT: {
    value: "2.0",
    description: "Level 4 Royalty % (Requires 4 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_5_PERCENT: {
    value: "2.0",
    description: "Level 5 Royalty % (Requires 5 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_6_PERCENT: {
    value: "2.0",
    description: "Level 6 Royalty % (Requires 6 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_7_PERCENT: {
    value: "1.0",
    description: "Level 7 Royalty % (Requires 7 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_8_PERCENT: {
    value: "1.0",
    description: "Level 8 Royalty % (Requires 8 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_9_PERCENT: {
    value: "1.0",
    description: "Level 9 Royalty % (Requires 9 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_10_PERCENT: {
    value: "1.0",
    description: "Level 10 Royalty % (Requires 10 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_11_PERCENT: {
    value: "1.0",
    description: "Level 11 Royalty % (Requires 11 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_12_PERCENT: {
    value: "1.0",
    description: "Level 12 Royalty % (Requires 12 Active Direct Referrals)",
    category: "royalty",
  },

  // 6. Withdrawal Rules & Timings (Dark PDF Slide 21)
  WITHDRAWAL_START_HOUR: {
    value: String(APP_CONFIG.withdrawalWindow.startHour),
    description: "Daily withdrawal window start hour in 24h IST (e.g. 10 for 10:00 AM)",
    category: "withdrawal",
  },
  WITHDRAWAL_END_HOUR: {
    value: String(APP_CONFIG.withdrawalWindow.endHour),
    description: "Daily withdrawal window close hour in 24h IST (e.g. 14 for 02:00 PM)",
    category: "withdrawal",
  },
  MIN_WITHDRAWAL_USDT: {
    value: String(APP_CONFIG.minWithdrawalUsdt),
    description: "Minimum single withdrawal amount in USDT ($2)",
    category: "withdrawal",
  },
  MAX_WITHDRAWAL_USDT: {
    value: String(APP_CONFIG.maxWithdrawalUsdt),
    description: "Maximum single withdrawal amount in USDT ($5,000)",
    category: "withdrawal",
  },
  WITHDRAWAL_FEE_PERCENT: {
    value: String(APP_CONFIG.withdrawalAdminFeePercent),
    description: "Withdrawal admin fee percentage (10% flat as per Dark PDF Slide 21)",
    category: "withdrawal",
  },

  // 7. Wallet Transfers & Bonus (Dark PDF Slide 20 & 21)
  SIGNUP_BONUS_USDT: {
    value: "0.50",
    description: "Welcome bonus credited upon registration in USDT ($0.50 as per Dark PDF Slide 21)",
    category: "transfers",
  },
  MIN_P2P_TRANSFER_USDT: {
    value: "1",
    description: "Minimum P2P fund transfer amount in USDT",
    category: "transfers",
  },
  P2P_FEE_PERCENT: {
    value: "0.0",
    description: "P2P wallet-to-wallet transfer fee percentage (0%)",
    category: "transfers",
  },
  SWIPE_FEE_PERCENT: {
    value: "0.0",
    description: "Income Wallet to Fund Wallet swipe deduction percentage (0%)",
    category: "transfers",
  },

  // 8. Corporate Information (PDF Page 2)
  OFFICIAL_EMAIL: {
    value: APP_CONFIG.officialEmail,
    description: "Official customer care & support email",
    category: "company",
  },
  CMD_NAME: {
    value: APP_CONFIG.cmd,
    description: "Platform Director / CMD name",
    category: "company",
  },
  HEADQUARTERS: {
    value: APP_CONFIG.headquarters,
    description: "Registered office and headquarters address",
    category: "company",
  },
};

// In-memory cache with 15-second TTL
let cachedConfigs: Record<string, string> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000;

export function invalidateConfigCache() {
  cachedConfigs = null;
  lastFetchTime = 0;
}

export async function getAllSystemConfigs(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedConfigs && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfigs;
  }

  const result: Record<string, string> = {};

  // 1. Fill defaults
  for (const [key, item] of Object.entries(DEFAULT_SYSTEM_CONFIGS)) {
    result[key] = item.value;
  }

  // 2. Fetch from database
  try {
    const dbRows = await db.systemConfig.findMany();
    for (const row of dbRows) {
      if (DEFAULT_SYSTEM_CONFIGS[row.key] && row.value != null && row.value !== "") {
        result[row.key] = row.value;
      }
    }
  } catch (error) {
    console.error("[configService] Error loading systemConfig from db:", error);
  }

  cachedConfigs = result;
  lastFetchTime = now;
  return result;
}

export async function getSystemConfigValue(key: string, fallback?: string): Promise<string> {
  const all = await getAllSystemConfigs();
  if (all[key] != null) {
    return all[key];
  }
  return fallback ?? DEFAULT_SYSTEM_CONFIGS[key]?.value ?? "";
}

export async function getNumericConfig(key: string, fallback: number): Promise<number> {
  const val = await getSystemConfigValue(key, String(fallback));
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export async function getStringConfig(key: string, fallback: string): Promise<string> {
  return getSystemConfigValue(key, fallback);
}
