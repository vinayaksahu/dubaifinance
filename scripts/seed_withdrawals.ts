import { db } from "../src/lib/db";
import Decimal from "decimal.js";

async function main() {
  console.log("Starting withdrawal seed...");
  const user = await db.user.findFirst({ where: { role: "USER" } });
  if (!user) {
    console.log("No regular user found in db");
    return;
  }

  // Create demo member 2 if not exists
  let user2 = await db.user.findFirst({ where: { customId: "DF836419" } });
  if (!user2) {
    user2 = await db.user.create({
      data: {
        customId: "DF836419",
        fullName: "Rahul Sharma",
        email: "rahul@dubaifinance.online",
        phone: "+971523456789",
        passwordHash: user.passwordHash,
        transactionPin: user.transactionPin,
        role: "USER",
        status: "ACTIVE",
        sponsorId: user.id,
        fundBalance: 5000,
        incomeBalance: 2500,
        usdtAddress: "0x94B2C8d87920436dF067d02F93C93005A311D7aB",
      },
    });
    console.log("Created user DF836419");
  }

  // Create demo member 3
  let user3 = await db.user.findFirst({ where: { customId: "DF293810" } });
  if (!user3) {
    user3 = await db.user.create({
      data: {
        customId: "DF293810",
        fullName: "Fatima Al-Mansoor",
        email: "fatima@dubaifinance.online",
        phone: "+971509876543",
        passwordHash: user.passwordHash,
        transactionPin: user.transactionPin,
        role: "USER",
        status: "ACTIVE",
        sponsorId: user.id,
        fundBalance: 12000,
        incomeBalance: 6000,
        usdtAddress: "0x3A94c798E2F9081b203c1A07b53D50284F49B903",
      },
    });
    console.log("Created user DF293810");
  }

  const existingCount = await db.withdrawalRequest.count();
  console.log("Current withdrawal count:", existingCount);

  if (existingCount === 0) {
    const now = Date.now();
    const records = [
      {
        userId: user.id,
        amountInUsdt: new Decimal(500),
        amountInInr: new Decimal(55000),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(50),
        netAmount: new Decimal(450),
        toAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
        network: "USDT_BEP20",
        status: "PENDING",
        createdAt: new Date(now - 3600000 * 2), // 2 hours ago
      },
      {
        userId: user.id,
        amountInUsdt: new Decimal(1000),
        amountInInr: new Decimal(110000),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(100),
        netAmount: new Decimal(900),
        toAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
        network: "USDT_BEP20",
        txHash: "0x8f3a9e1d2c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a01",
        adminNote: "Processed via Binance Hot Wallet",
        status: "PROCESSED",
        processedAt: new Date(now - 3600000 * 24 * 1),
        createdAt: new Date(now - 3600000 * 24 * 1 - 1800000),
      },
      {
        userId: user2.id,
        amountInUsdt: new Decimal(2500),
        amountInInr: new Decimal(275000),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(250),
        netAmount: new Decimal(2250),
        toAddress: "0x94B2C8d87920436dF067d02F93C93005A311D7aB",
        network: "USDT_BEP20",
        txHash: "0x4c2b9a1f8e3d7c5b6a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c22",
        adminNote: "High tier investor weekly payout",
        status: "PROCESSED",
        processedAt: new Date(now - 3600000 * 24 * 2),
        createdAt: new Date(now - 3600000 * 24 * 2 - 3600000),
      },
      {
        userId: user3.id,
        amountInUsdt: new Decimal(1500),
        amountInInr: new Decimal(165000),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(150),
        netAmount: new Decimal(1350),
        toAddress: "0x3A94c798E2F9081b203c1A07b53D50284F49B903",
        network: "USDT_BEP20",
        txHash: "0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d33",
        adminNote: "ROI contract payout",
        status: "PROCESSED",
        processedAt: new Date(now - 3600000 * 24 * 3),
        createdAt: new Date(now - 3600000 * 24 * 3 - 2700000),
      },
      {
        userId: user.id,
        amountInUsdt: new Decimal(750),
        amountInInr: new Decimal(82500),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(75),
        netAmount: new Decimal(675),
        toAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e",
        network: "USDT_BEP20",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a24",
        adminNote: "Instant ROI settlement",
        status: "PROCESSED",
        processedAt: new Date(now - 3600000 * 24 * 4),
        createdAt: new Date(now - 3600000 * 24 * 4 - 2400000),
      },
      {
        userId: user2.id,
        amountInUsdt: new Decimal(300),
        amountInInr: new Decimal(33000),
        feePercent: new Decimal(10),
        feeAmount: new Decimal(30),
        netAmount: new Decimal(270),
        toAddress: "0x94B2C8d87920436dF067d02F93C93005A311D7aB",
        network: "USDT_BEP20",
        txHash: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e75",
        adminNote: "Referral commission payout",
        status: "PROCESSED",
        processedAt: new Date(now - 3600000 * 24 * 6),
        createdAt: new Date(now - 3600000 * 24 * 6 - 1200000),
      },
    ];

    for (const r of records) {
      await db.withdrawalRequest.create({ data: r });
    }
    console.log(`Successfully seeded ${records.length} withdrawal records!`);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
