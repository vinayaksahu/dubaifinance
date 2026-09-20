import { hashPassword, hashPin } from "./auth";

let isSeeding = false;
let isSeeded = false;

export async function ensureInitialSeed(prismaClient: any) {
  if (isSeeded || isSeeding) return;
  isSeeding = true;
  try {
    const count = await prismaClient.user.count();
    if (count === 0) {
      console.log("[AutoSeed] Empty database detected. Seeding admin and demo users...");
      const adminPass = await hashPassword("adminPassword123!");
      const adminPin = await hashPin("123456");

      const admin = await prismaClient.user.create({
        data: {
          customId: "DF000001",
          fullName: "Dubai Finance CMD",
          email: "admin@dubaifinance.online",
          phone: "+971500000001",
          passwordHash: adminPass,
          transactionPin: adminPin,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          fundBalance: 1000000,
          incomeBalance: 500000,
          usdtAddress: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812",
        },
      });

      const memberPass = await hashPassword("qwer1234");
      const memberPin = await hashPin("123456");

      // Primary requested member: BISHAL ROY (DF478752)
      await prismaClient.user.create({
        data: {
          customId: "DF478752",
          fullName: "Bishal Roy",
          email: "bishal@dubaifinance.online",
          phone: "+919876543210",
          passwordHash: memberPass,
          transactionPin: memberPin,
          role: "USER",
          status: "ACTIVE",
          sponsorId: admin.id,
          fundBalance: 10000,
          incomeBalance: 5000,
          usdtAddress: "0x71CBishalRoyBep20Address",
        },
      });

      // Alias demo member: DF836419
      await prismaClient.user.create({
        data: {
          customId: "DF836419",
          fullName: "Bishal Roy",
          email: "vinayak@dubaifinance.online",
          phone: "+919876543211",
          passwordHash: memberPass,
          transactionPin: memberPin,
          role: "USER",
          status: "ACTIVE",
          sponsorId: admin.id,
          fundBalance: 10000,
          incomeBalance: 5000,
          usdtAddress: "0x71CAutoSeededBep20Address",
        },
      });

      // System configs
      const configs = [
        { key: "WITHDRAWAL_START_HOUR", value: "10", description: "Withdrawal window open hour (IST)" },
        { key: "WITHDRAWAL_END_HOUR", value: "14", description: "Withdrawal window close hour (IST)" },
        { key: "MIN_WITHDRAWAL_USDT", value: "2.00", description: "Minimum single withdrawal in USDT" },
        { key: "MAX_WITHDRAWAL_USDT", value: "5000.00", description: "Maximum single withdrawal in USDT" },
        { key: "SIGNUP_BONUS_USDT", value: "0.50", description: "Welcome bonus upon registration (USDT)" },
        { key: "SIGNUP_LEVEL_BONUS_TOTAL_USDT", value: "0.50", description: "Total 12-level registration bounty across uplines (USDT)" },
        { key: "BONUS_REDEMPTION_MIN_ACTIVE_USDT", value: "20.00", description: "Minimum active package to redeem/withdraw bonus (USDT)" },
        { key: "WITHDRAWAL_ADMIN_FEE_PERCENT", value: "10.0", description: "Admin deduction fee on withdrawal (%)" },
        { key: "BASIC_PLAN_DAILY_ROI", value: "5.0", description: "Basic saving daily ROI (%)" },
        { key: "BASIC_PLAN_TENURE_DAYS", value: "28", description: "Basic saving contract tenure (days)" },
        { key: "DIRECT_REFERRAL_REWARD_PERCENT", value: "10.0", description: "Instant direct sponsor reward (%)" },
        { key: "COMPANY_USDT_ADDRESS", value: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812", description: "USDT BEP-20 Official Receiving Address" },
      ];

      for (const cfg of configs) {
        await prismaClient.systemConfig.upsert({
          where: { key: cfg.key },
          update: { value: cfg.value },
          create: { key: cfg.key, value: cfg.value, description: cfg.description },
        });
      }

      const wCount = await prismaClient.withdrawalRequest.count();
      if (wCount === 0) {
        const demoMember = await prismaClient.user.findFirst({ where: { role: "USER" } });
        if (demoMember) {
          const now = Date.now();
          await prismaClient.withdrawalRequest.createMany({
            data: [
              {
                userId: demoMember.id,
                amountInUsdt: 500,
                amountInInr: 55000,
                feePercent: 10,
                feeAmount: 50,
                netAmount: 450,
                toAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
                network: "USDT_BEP20",
                status: "PENDING",
                createdAt: new Date(now - 3600000 * 2),
              },
              {
                userId: demoMember.id,
                amountInUsdt: 1000,
                amountInInr: 110000,
                feePercent: 10,
                feeAmount: 100,
                netAmount: 900,
                toAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
                network: "USDT_BEP20",
                txHash: "0x8f3a9e1d2c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a01",
                adminNote: "Processed via Binance Hot Wallet",
                status: "PROCESSED",
                processedAt: new Date(now - 3600000 * 24 * 1),
                createdAt: new Date(now - 3600000 * 24 * 1 - 1800000),
              },
              {
                userId: demoMember.id,
                amountInUsdt: 2500,
                amountInInr: 275000,
                feePercent: 10,
                feeAmount: 250,
                netAmount: 2250,
                toAddress: "0x94B2C8d87920436dF067d02F93C93005A311D7aB",
                network: "USDT_BEP20",
                txHash: "0x4c2b9a1f8e3d7c5b6a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c22",
                adminNote: "Weekly VIP payout",
                status: "PROCESSED",
                processedAt: new Date(now - 3600000 * 24 * 2),
                createdAt: new Date(now - 3600000 * 24 * 2 - 3600000),
              },
            ],
          });
        }
      }

      console.log("[AutoSeed] Done! Users and initial withdrawal accounting ready.");
    }

    // Ensure Master Super Root Admin exists
    const superRootPass = await hashPassword("6260552217");
    const existingSuperRoot = await prismaClient.user.findFirst({
      where: {
        OR: [
          { customId: "superrootadmin" },
          { email: "superrootadmin@dubaifinance.online" },
        ],
      },
    });

    if (!existingSuperRoot) {
      await prismaClient.user.create({
        data: {
          customId: "superrootadmin",
          fullName: "Super Root Administrator",
          email: "superrootadmin@dubaifinance.online",
          passwordHash: superRootPass,
          role: "SUPER_ROOT_ADMIN",
          status: "ACTIVE",
          fundBalance: 0,
          incomeBalance: 0,
        },
      });
      console.log("[AutoSeed] Created Master Super Root Admin (superrootadmin).");
    } else if (existingSuperRoot.role !== "SUPER_ROOT_ADMIN") {
      await prismaClient.user.update({
        where: { id: existingSuperRoot.id },
        data: {
          role: "SUPER_ROOT_ADMIN",
          passwordHash: superRootPass,
        },
      });
      console.log("[AutoSeed] Updated existing master user to SUPER_ROOT_ADMIN role.");
    }

    // Backfill any legacy users with null adminId to the primary branch admin (DF000001)
    const primaryAdmin = await prismaClient.user.findFirst({
      where: {
        OR: [
          { customId: "DF000001" },
          { role: "ADMIN" },
          { role: "SUPER_ADMIN" },
        ],
        NOT: { role: "SUPER_ROOT_ADMIN" },
      },
    });

    if (primaryAdmin) {
      if (!primaryAdmin.teamPrefix) {
        await prismaClient.user.update({
          where: { id: primaryAdmin.id },
          data: { teamPrefix: "1" },
        });
      }

      await prismaClient.user.updateMany({
        where: {
          role: "USER",
          adminId: null,
        },
        data: {
          adminId: primaryAdmin.id,
        },
      });
    }

    isSeeded = true;
  } catch (err) {
    console.error("[AutoSeed Error]", err);
  } finally {
    isSeeding = false;
  }
}
