import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_CONFIG } from "@/lib/constants";

export const DEFAULT_CONFIGS: Record<string, { value: string; description: string; category: string }> = {
  // Financial & Wallet
  COMPANY_USDT_ADDRESS: {
    value: APP_CONFIG.depositAddress,
    description: "Official USDT BEP-20 receiving wallet address for recharges",
    category: "wallet",
  },
  USDT_TO_INR_RATE: {
    value: String(APP_CONFIG.usdtToInrRate),
    description: "Fixed exchange peg: 1 USDT in INR",
    category: "wallet",
  },

  // Withdrawal Rules
  WITHDRAWAL_START_HOUR: {
    value: String(APP_CONFIG.withdrawalWindow.startHour),
    description: "Withdrawal window open hour in 24h format IST (e.g. 10 for 10:00 AM)",
    category: "withdrawal",
  },
  WITHDRAWAL_END_HOUR: {
    value: String(APP_CONFIG.withdrawalWindow.endHour),
    description: "Withdrawal window close hour in 24h format IST (e.g. 14 for 02:00 PM)",
    category: "withdrawal",
  },
  MIN_WITHDRAWAL_USDT: {
    value: String(APP_CONFIG.minWithdrawalUsdt),
    description: "Minimum single withdrawal amount in USDT",
    category: "withdrawal",
  },
  MAX_WITHDRAWAL_USDT: {
    value: String(APP_CONFIG.maxWithdrawalUsdt),
    description: "Maximum single withdrawal amount in USDT",
    category: "withdrawal",
  },
  MIN_WITHDRAWAL_INR: {
    value: String(APP_CONFIG.minWithdrawalInr),
    description: "Minimum single withdrawal amount in INR",
    category: "withdrawal",
  },
  MAX_WITHDRAWAL_INR: {
    value: String(APP_CONFIG.maxWithdrawalInr),
    description: "Maximum single withdrawal amount in INR",
    category: "withdrawal",
  },

  // Plan & Compensation
  DIRECT_REFERRAL_PERCENT: {
    value: String(APP_CONFIG.directReferralPercent),
    description: "Instant direct sponsor commission percentage (e.g. 15 for 15%)",
    category: "plan",
  },
  BASIC_PLAN_DAILY_ROI: {
    value: String(APP_CONFIG.basicPlan.dailyRoiRate),
    description: "Basic Saving plan daily return percentage (e.g. 5 for 5%)",
    category: "plan",
  },
  BASIC_PLAN_TENURE_DAYS: {
    value: String(APP_CONFIG.basicPlan.tenureDays),
    description: "Basic Saving contract duration in days (e.g. 30)",
    category: "plan",
  },
  SIGNUP_BONUS_INR: {
    value: String(APP_CONFIG.signupBonusInr),
    description: "Welcome credit bonus awarded upon member registration in INR",
    category: "plan",
  },

  // Company Details
  OFFICIAL_EMAIL: {
    value: APP_CONFIG.officialEmail,
    description: "Official support email displayed to members",
    category: "company",
  },
  CMD_NAME: {
    value: APP_CONFIG.cmd,
    description: "Platform CMD / Director name",
    category: "company",
  },
  HEADQUARTERS: {
    value: APP_CONFIG.headquarters,
    description: "Official company headquarters registered address",
    category: "company",
  },
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch existing configs from DB
    const dbConfigs = await db.systemConfig.findMany();
    const configMap: Record<string, { value: string; description: string; category: string; updatedAt?: Date }> = {};

    // Populate with defaults
    for (const [key, item] of Object.entries(DEFAULT_CONFIGS)) {
      configMap[key] = { ...item };
    }

    // Override with DB values
    for (const item of dbConfigs) {
      const def = DEFAULT_CONFIGS[item.key];
      configMap[item.key] = {
        value: item.value,
        description: item.description || def?.description || "",
        category: def?.category || "general",
        updatedAt: item.updatedAt,
      };
    }

    return NextResponse.json({ configs: configMap });
  } catch (error: any) {
    console.error("GET /api/admin/config error:", error);
    return NextResponse.json({ error: error.message || "Failed to load configurations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { configs } = body;

    if (!configs || typeof configs !== "object") {
      return NextResponse.json({ error: "Invalid configs payload" }, { status: 400 });
    }

    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(configs)) {
      const def = DEFAULT_CONFIGS[key];
      const stringVal = String(value).trim();

      updates.push(
        db.systemConfig.upsert({
          where: { key },
          update: { value: stringVal },
          create: {
            key,
            value: stringVal,
            description: def?.description || "",
          },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "System configurations successfully updated and applied in real-time.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/config error:", error);
    return NextResponse.json({ error: error.message || "Failed to save configurations" }, { status: 500 });
  }
}
