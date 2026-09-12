import { db } from "../src/lib/db";
import { hashPassword, hashPin } from "../src/lib/auth";

async function main() {
  console.log("Seeding Dubai Finance database...");

  // Seed System Configs
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
    await db.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value, description: cfg.description },
    });
  }

  // Seed Super Admin
  const adminPass = await hashPassword("adminPassword123!");
  const adminPin = await hashPin("123456");

  const admin = await db.user.upsert({
    where: { customId: "DF000001" },
    update: {},
    create: {
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
  console.log("Super Admin seeded:", admin.customId);

  // Seed Member DF478752 (with qwer1234)
  const memberPass = await hashPassword("qwer1234");
  const memberPin = await hashPin("123456");

  const member = await db.user.upsert({
    where: { customId: "DF478752" },
    update: {},
    create: {
      customId: "DF478752",
      fullName: "Bishal Roy",
      email: "bishal@dubaifinance.online",
      phone: "+919876543210",
      passwordHash: memberPass,
      transactionPin: memberPin,
      role: "USER",
      status: "ACTIVE",
      sponsorId: admin.id,
      fundBalance: 10000,   // ₹10,000 for activating packages/P2P
      incomeBalance: 5000,  // ₹5,000 for withdrawals/swipe
      usdtAddress: "0x71C...vinayakBep20Address",
    },
  });
  console.log("Member seeded:", member.customId, "Password: qwer1234, PIN: 123456");

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });