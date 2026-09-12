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
        { key: "USDT_TO_INR_RATE", value: "110", description: "Fixed peg for 1 USDT in INR" },
        { key: "WITHDRAWAL_START_HOUR", value: "10", description: "Withdrawal window open hour (IST)" },
        { key: "WITHDRAWAL_END_HOUR", value: "14", description: "Withdrawal window close hour (IST)" },
        { key: "MIN_WITHDRAWAL_INR", value: "150", description: "Minimum single withdrawal in INR" },
        { key: "MAX_WITHDRAWAL_INR", value: "500000", description: "Maximum single withdrawal in INR" },
        { key: "SIGNUP_BONUS_INR", value: "50", description: "Welcome bonus upon registration" },
        { key: "COMPANY_USDT_ADDRESS", value: "0x39a0B29A5c66e927598Fa4eCE9bFf84a44bA8812", description: "USDT BEP-20 Official Receiving Address" },
      ];

      for (const cfg of configs) {
        await prismaClient.systemConfig.upsert({
          where: { key: cfg.key },
          update: { value: cfg.value },
          create: { key: cfg.key, value: cfg.value, description: cfg.description },
        });
      }
      console.log("[AutoSeed] Done! Users DF478752 and DF000001 ready.");
    }
    isSeeded = true;
  } catch (err) {
    console.error("[AutoSeed Error]", err);
  } finally {
    isSeeding = false;
  }
}
