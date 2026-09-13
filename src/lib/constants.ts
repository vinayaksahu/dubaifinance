export const APP_CONFIG = {
  name: "Dubai Finance",
  tagline: "Decentralized High-Yield Wealth Ecosystem • Powered by USDT (BEP-20)",
  domain: "dubaifinance.online",
  officialEmail: "support@dubaifinance.online",
  cmd: "Mr. Sheikh Tariq Al Mansoori",
  headquarters: "Office 3802, Latifa Tower, Sheikh Zayed Road, Financial District, Dubai, UAE",
  depositAddress: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812", // Company USDT BEP-20
  depositNetwork: "USDT BEP-20 (Binance Smart Chain)",
  signupBonusUsdt: 0.50, // Dark PDF Slide 21: $0.50 Signup Bonus
  signupBonusInr: 50,
  usdtToInrRate: 110,
  directReferralPercent: 10.0, // Dark PDF Slide 1, 10, 15: 10% INSTANT DIRECT
  minWithdrawalUsdt: 2, // Dark PDF Slide 21: Min $2 USDT
  maxWithdrawalUsdt: 5000, // Dark PDF Slide 21: Max $5,000 USDT
  withdrawalAdminFeePercent: 10.0, // Dark PDF Slide 21: Flat 10% Admin Charge
  withdrawalWindow: {
    startHour: 10, // 10:00 AM IST
    endHour: 14, // 02:00 PM IST
    timezone: "Asia/Kolkata",
  },
  // Dark PDF Slide 5-9: $5 to $5,000 USDT Packages (28 Days)
  basicPackagesUsd: [5, 10, 20, 50, 100, 500, 1000, 2000, 5000],
  basicPlan: {
    minUsdt: 5,
    maxUsdt: 5000,
    dailyRoiRate: 5.0, // 5% daily (Dark PDF Slide 1, 5, 11)
    tenureDays: 28, // 28 Days Fixed Contract (Dark PDF Slide 1, 4, 5, 9, 11, 21)
    netProfitPercent: 40.0, // 40% Net Profit (Dark PDF Slide 6, 7, 8, 9, 11)
    principalPercent: 100.0,
    totalReturnPercent: 140.0, // 140% Gross Total Payout (28 * 5%)
  },
  // Slide 12, 13, 14: Fix Deposit (FD) High-Yield
  fdPlans: [
    {
      id: "pkg-1",
      tier: "STARTER FD",
      amountUsdt: 50,
      amountInr: 5500,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 5, profitUsdt: 900, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 7.5, profitUsdt: 1575, multiple: "31.5X" },
      ],
    },
    {
      id: "pkg-2",
      tier: "GROWTH FD",
      amountUsdt: 100,
      amountInr: 11000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 10, profitUsdt: 1800, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 15, profitUsdt: 3150, multiple: "31.5X" },
      ],
    },
    {
      id: "pkg-3",
      tier: "POPULAR FD",
      featured: true,
      amountUsdt: 500,
      amountInr: 55000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 50, profitUsdt: 9000, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 75, profitUsdt: 15750, multiple: "31.5X" },
      ],
    },
    {
      id: "pkg-4",
      tier: "VIP PLATINUM FD",
      amountUsdt: 1000,
      amountInr: 110000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 100, profitUsdt: 18000, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 150, profitUsdt: 31500, multiple: "31.5X" },
      ],
    },
    {
      id: "pkg-5",
      tier: "VIP DIAMOND FD",
      amountUsdt: 2000,
      amountInr: 220000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 200, profitUsdt: 36000, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 300, profitUsdt: 63000, multiple: "31.5X" },
      ],
    },
    {
      id: "pkg-6",
      tier: "ROYAL CROWN VIP FD",
      featured: true,
      amountUsdt: 5000,
      amountInr: 550000,
      plans: [
        { days: 180, rate: 10.0, dailyUsdt: 500, profitUsdt: 90000, multiple: "18X" },
        { days: 210, rate: 15.0, dailyUsdt: 750, profitUsdt: 157500, multiple: "31.5X" },
      ],
    },
  ],
  // Slide 16 & 17: Official 12-Level Team Royalty Distribution
  levelRates: [
    { level: 1, percent: 5.0, directsNeeded: 1 }, // Level 1: 5% Daily (1 Direct)
    { level: 2, percent: 3.0, directsNeeded: 2 }, // Level 2: 3% Daily (2 Directs)
    { level: 3, percent: 2.0, directsNeeded: 3 }, // Level 3: 2% Daily (3 Directs)
    { level: 4, percent: 2.0, directsNeeded: 4 }, // Level 4: 2% Daily (4 Directs)
    { level: 5, percent: 2.0, directsNeeded: 5 }, // Level 5: 2% Daily (5 Directs)
    { level: 6, percent: 2.0, directsNeeded: 6 }, // Level 6: 2% Daily (6 Directs)
    { level: 7, percent: 1.0, directsNeeded: 7 }, // Level 7: 1% Daily (7 Directs)
    { level: 8, percent: 1.0, directsNeeded: 8 }, // Level 8: 1% Daily (8 Directs)
    { level: 9, percent: 1.0, directsNeeded: 9 }, // Level 9: 1% Daily (9 Directs)
    { level: 10, percent: 1.0, directsNeeded: 10 }, // Level 10: 1% Daily (10 Directs)
    { level: 11, percent: 1.0, directsNeeded: 11 }, // Level 11: 1% Daily (11 Directs)
    { level: 12, percent: 1.0, directsNeeded: 12 }, // Level 12: 1% Daily (12 Directs Total)
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
  return istHours >= APP_CONFIG.withdrawalWindow.startHour && istHours < APP_CONFIG.withdrawalWindow.endHour;
}

export function inrToUsdt(inrAmount: number): number {
  return Number(Number(inrAmount).toFixed(4));
}

export function usdtToInr(usdtAmount: number): number {
  return Number(Number(usdtAmount).toFixed(2));
}
