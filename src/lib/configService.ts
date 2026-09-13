import { db } from "./db";
import { APP_CONFIG } from "./constants";

export async function getSystemConfigValue(key: string, defaultValue?: string): Promise<string> {
  try {
    const record = await db.systemConfig.findUnique({
      where: { key },
      select: { value: true },
    });
    if (record?.value != null && record.value !== "") {
      return record.value;
    }
  } catch (error) {
    console.error(`Error reading config ${key} from database:`, error);
  }

  // Fallbacks from APP_CONFIG
  switch (key) {
    case "COMPANY_USDT_ADDRESS":
      return APP_CONFIG.depositAddress;
    case "USDT_TO_INR_RATE":
      return String(APP_CONFIG.usdtToInrRate);
    case "WITHDRAWAL_START_HOUR":
      return String(APP_CONFIG.withdrawalWindow.startHour);
    case "WITHDRAWAL_END_HOUR":
      return String(APP_CONFIG.withdrawalWindow.endHour);
    case "MIN_WITHDRAWAL_USDT":
      return String(APP_CONFIG.minWithdrawalUsdt);
    case "MAX_WITHDRAWAL_USDT":
      return String(APP_CONFIG.maxWithdrawalUsdt);
    case "DIRECT_REFERRAL_PERCENT":
      return String(APP_CONFIG.directReferralPercent);
    case "BASIC_PLAN_DAILY_ROI":
      return String(APP_CONFIG.basicPlan.dailyRoiRate);
    case "BASIC_PLAN_TENURE_DAYS":
      return String(APP_CONFIG.basicPlan.tenureDays);
    default:
      return defaultValue ?? "";
  }
}
