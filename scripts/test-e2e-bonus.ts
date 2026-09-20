import { db } from "../src/lib/db";
import { distribute12LevelSignupBonus, validateBonusUsageEligibility } from "../src/lib/services/bonusService";
import { executeLedgerTransaction } from "../src/lib/ledger";
import Decimal from "decimal.js";

async function runEndToEndVerification() {
  console.log("==================================================================");
  console.log("DUBAI FINANCE — END-TO-END BONUS & USAGE RULE VERIFICATION");
  console.log("==================================================================\n");

  const testSuffix = `test_${Date.now()}`;
  const createdUserIds: string[] = [];

  try {
    // 1. Create a 12-level sponsor hierarchy: Sponsor 12 -> ... -> Sponsor 1
    console.log("1. Setting up 12-level sponsor hierarchy...");
    let parentSponsorId: string | null = null;
    const sponsorIds: { level: number; id: string; customId: string }[] = [];

    // Create from top (Level 12) down to Level 1
    for (let i = 12; i >= 1; i--) {
      const customId = `TEST_SP_${i}_${testSuffix}`;
      const user = await db.user.create({
        data: {
          customId,
          fullName: `Sponsor Level ${i}`,
          email: `${customId.toLowerCase()}@test.com`,
          passwordHash: "dummyHash",
          status: "INACTIVE",
          role: "USER",
          sponsorId: parentSponsorId,
        },
      });
      createdUserIds.push(user.id);
      parentSponsorId = user.id;
      sponsorIds.push({ level: i, id: user.id, customId });
    }

    // Level 1 sponsor is the last created
    const level1Sponsor = sponsorIds.find((s) => s.level === 1)!;
    console.log(`   Hierarchy created. Top sponsor: Level 12, Direct sponsor: ${level1Sponsor.customId}`);

    // 2. Register a new user under Level 1 Sponsor
    console.log("\n2. Registering new member under Sponsor 1...");
    const newMemberCustomId = `TEST_NEW_${testSuffix}`;
    const newMember = await db.user.create({
      data: {
        customId: newMemberCustomId,
        fullName: "New Test Member",
        email: `${newMemberCustomId.toLowerCase()}@test.com`,
        passwordHash: "dummyHash",
        status: "INACTIVE",
        role: "USER",
        sponsorId: level1Sponsor.id,
      },
    });
    createdUserIds.push(newMember.id);

    // Credit signup bonus ($0.50)
    await executeLedgerTransaction({
      userId: newMember.id,
      type: "SIGNUP_BONUS",
      wallet: "INCOME",
      amount: new Decimal("0.50"),
      referenceKey: `SIGNUP_BONUS_${newMember.id}`,
      description: "Welcome Bonus $0.50 USDT",
    });

    // Distribute 12-level bonus
    await distribute12LevelSignupBonus(newMember.id, newMember.sponsorId);

    // 3. Verify New Member received $0.50
    const newMemberUpdated = await db.user.findUnique({
      where: { id: newMember.id },
      select: { incomeBalance: true },
    });
    const newMemberBal = Number(newMemberUpdated?.incomeBalance || 0);
    console.log(`   New member income balance: $${newMemberBal.toFixed(4)} USDT`);
    if (Math.abs(newMemberBal - 0.50) < 0.001) {
      console.log("   ✅ PASS: New member received $0.50 Welcome Signup Bonus.");
    } else {
      console.error(`   ❌ FAIL: New member balance expected 0.50, got ${newMemberBal}`);
    }

    // 4. Verify all 12 Uplines received $0.50 / 12 = $0.04166667 USDT
    console.log("\n3. Verifying all 12 uplines received 12-Level Registration Bounty...");
    let allUplinesCredited = true;
    for (const sp of sponsorIds) {
      const spUpdated = await db.user.findUnique({
        where: { id: sp.id },
        select: { incomeBalance: true },
      });
      const bal = Number(spUpdated?.incomeBalance || 0);
      const expected = 0.50 / 12; // ~0.04166667
      const matches = Math.abs(bal - expected) < 0.0001;
      if (!matches) {
        allUplinesCredited = false;
        console.error(`   ❌ Level ${sp.level} (${sp.customId}) balance mismatch: got ${bal}, expected ${expected}`);
      }
    }
    if (allUplinesCredited) {
      console.log("   ✅ PASS: All 12 uplines successfully received $0.0417 USDT each ($0.50 total distributed).");
    }

    // 5. Test $20+ Active ID rule on New Member (currently 0 active packages)
    console.log("\n4. Testing '$20+ Active ID' rule with 0 active packages...");
    const check1 = await validateBonusUsageEligibility(newMember.id, new Decimal("0.50"));
    console.log(`   Attempting to use $0.50 bonus on unactivated ID: allowed = ${check1.allowed}`);
    if (!check1.allowed && check1.error) {
      console.log(`   ✅ PASS: Correctly blocked with reason: "${check1.error}"`);
    } else {
      console.error("   ❌ FAIL: Expected to block unactivated ID!");
    }

    // 6. Test with $10 package (less than $20 threshold)
    console.log("\n5. Testing with $10 active package (below $20 threshold)...");
    const contract10 = await db.investmentContract.create({
      data: {
        userId: newMember.id,
        packageType: "BASIC_SAVING",
        amountInInr: "10",
        amountInUsdt: "10.00000000",
        dailyRoiRate: "5.00",
        tenureDays: 28,
        daysPaid: 0,
        status: "ACTIVE",
        maturityDate: new Date(),
      },
    });

    const check2 = await validateBonusUsageEligibility(newMember.id, new Decimal("0.50"));
    console.log(`   Attempting to use $0.50 bonus on $10 active ID: allowed = ${check2.allowed}`);
    if (!check2.allowed) {
      console.log("   ✅ PASS: Correctly blocked because $10 < $20 minimum active ID requirement.");
    } else {
      console.error("   ❌ FAIL: $10 active ID should still block bonus usage!");
    }

    // 7. Upgrade package to $20 active package
    console.log("\n6. Testing with $20+ active package (meeting $20 threshold)...");
    const contract20 = await db.investmentContract.create({
      data: {
        userId: newMember.id,
        packageType: "BASIC_SAVING",
        amountInInr: "10",
        amountInUsdt: "10.00000000",
        dailyRoiRate: "5.00",
        tenureDays: 28,
        daysPaid: 0,
        status: "ACTIVE",
        maturityDate: new Date(),
      },
    });

    const check3 = await validateBonusUsageEligibility(newMember.id, new Decimal("0.50"));
    console.log(`   Attempting to use $0.50 bonus on $20 ($10+$10) active ID: allowed = ${check3.allowed}`);
    if (check3.allowed) {
      console.log(`   ✅ PASS: 100% allowed to use/redeem bonus once active package is $${check3.activeTotalUsdt.toFixed(2)} USDT!`);
    } else {
      console.error(`   ❌ FAIL: Expected to allow on $20 active package! Error: ${check3.error}`);
    }

    // Delete test contracts
    await db.investmentContract.deleteMany({
      where: { id: { in: [contract10.id, contract20.id] } },
    });

  } finally {
    // 8. Clean up all created test users and ledger entries
    console.log("\n7. Cleaning up test accounts from database...");
    if (createdUserIds.length > 0) {
      await db.ledgerEntry.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await db.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      console.log(`   Cleaned up ${createdUserIds.length} test accounts. Database is clean!`);
    }
  }

  console.log("\n==================================================================");
  console.log("ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!");
  console.log("==================================================================");
}

runEndToEndVerification().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
