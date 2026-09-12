export const APP_CONFIG = {
  name: "Dubai Finance",
  tagline: "Trusted Financial Solutions & High Yield Daily Growth",
  domain: "dubaifinance.online",
  officialEmail: "dubaifinanceofficial@gmail.com",
  cmd: "Abhilash Verma Sir",
  headquarters: "Al Tayer Building, 147/2A Sheikh Zayed Road, Al Wasl, Dubai, UAE",
  depositAddress: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812", // Default Company USDT BEP-20
  depositNetwork: "USDT BEP-20 (BNB Smart Chain)",
  usdtToInrRate: 110,
  signupBonusInr: 50,
  directReferralPercent: 15.0, // Updated: 10% → 15% INSTANT
  minWithdrawalUsdt: 2,    // Min $2 withdrawal
  maxWithdrawalUsdt: 5000,  // Max $5,000 withdrawal
  minWithdrawalInr: 220,    // ~$2 * 110
  maxWithdrawalInr: 550000, // ~$5000 * 110
  withdrawalWindow: {
    startHour: 10, // 10:00 AM IST
    endHour: 14,   // 02:00 PM IST
    timezone: "Asia/Kolkata",
  },
  // USD-based Basic Saving packages
  basicPackagesUsd: [5, 10, 20, 50, 100, 500, 1000, 2000, 5000],
  basicPlan: {
    minUsdt: 5,
    maxUsdt: 5000,
    minInr: 550,      // $5 * 110
    maxInr: 550000,    // $5000 * 110
    dailyRoiRate: 5.0, // 5% daily
    tenureDays: 30,    // Updated: 25 → 30 days
    netProfitPercent: 1.0,
    principalPercent: 4.0,
    totalReturnPercent: 150.0, // Updated: 125% → 150% (30 days * 5%)
  },
  fdPlans: [
    {
      id: "pkg-1",
      tier: "PACKAGE 1",
      amountUsdt: 10,
      amountInr: 1100,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 1, profitUsdt: 180 },
        { days: 210, rate: 15.0, dailyUsdt: 1.5, profitUsdt: 315 },
      ],
    },
    {
      id: "pkg-2",
      tier: "PACKAGE 2",
      amountUsdt: 100,
      amountInr: 11000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 10, profitUsdt: 1800 },
        { days: 210, rate: 15.0, dailyUsdt: 15, profitUsdt: 3150 },
      ],
    },
    {
      id: "pkg-3",
      tier: "PACKAGE 3 (MOST POPULAR)",
      featured: true,
      amountUsdt: 500,
      amountInr: 55000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 50, profitUsdt: 9000 },
        { days: 210, rate: 15.0, dailyUsdt: 75, profitUsdt: 15750 },
      ],
    },
    {
      id: "pkg-4",
      tier: "PACKAGE 4",
      amountUsdt: 1000,
      amountInr: 110000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 100, profitUsdt: 18000 },
        { days: 210, rate: 15.0, dailyUsdt: 150, profitUsdt: 31500 },
      ],
    },
    {
      id: "pkg-5",
      tier: "PACKAGE 5 (VIP)",
      amountUsdt: 5000,
      amountInr: 550000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 500, profitUsdt: 90000 },
        { days: 210, rate: 15.0, dailyUsdt: 750, profitUsdt: 157500 },
      ],
    },
  ],
  // Updated 12-Level Royalty Rates
  levelRates: [
    { level: 1, percent: 10.0 }, // L1: 10%
    { level: 2, percent: 5.0 },  // L2: 5%
    { level: 3, percent: 3.0 },  // L3: 3% (FIXED: was typo 'border')
    { level: 4, percent: 2.0 },  // L4: 2%
    { level: 5, percent: 2.0 },  // L5: 2%
    { level: 6, percent: 2.0 },  // L6: 2%
    { level: 7, percent: 1.0 },  // L7: 1%
    { level: 8, percent: 1.0 },  // L8: 1%
    { level: 9, percent: 1.0 },  // L9: 1%
    { level: 10, percent: 1.0 }, // L10: 1%
    { level: 11, percent: 1.0 }, // L11: 1%
    { level: 12, percent: 1.0 }, // L12: 1%
  ],
};

export function isWithdrawalWindowOpen(): boolean {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  // IST is UTC + 5:30
  let istHours = (utcHours + 5) % 24;
  let istMinutes = utcMinutes + 30;
  if (istMinutes >= 60) {
    istHours = (istHours + 1) % 24;
    istMinutes -= 60;
  }
  // 10:00 AM to 14:00 (2:00 PM)
  return istHours >= APP_CONFIG.withdrawalWindow.startHour && istHours < APP_CONFIG.withdrawalWindow.endHour;
}

export function inrToUsdt(inrAmount: number): number {
  return Number((inrAmount / APP_CONFIG.usdtToInrRate).toFixed(4));
}

export function usdtToInr(usdtAmount: number): number {
  return Number((usdtAmount * APP_CONFIG.usdtToInrRate).toFixed(2));
}

