import "dotenv/config";
import { db } from "../src/lib/db";
import { BlockchainProvider, defaultBlockchainProvider } from "../src/lib/blockchain/provider";
import {
  getOrCreateUserDepositAddress,
  findUserByDepositAddress,
  deriveDeterministicAddress,
} from "../src/lib/blockchain/addressService";
import {
  verifyOnChainTransaction,
  creditUserFundWalletAtomic,
} from "../src/lib/blockchain/depositProcessor";
import {
  hasDepositPermission,
  setAdminDepositPermissions,
  getAdminDepositPermissions,
  ALL_DEPOSIT_PERMISSIONS,
} from "../src/lib/blockchain/rbac";
import {
  getDepositProcessingMode,
  getDepositProcessingModeForUser,
  isAutomaticCreditingEnabled,
  getRequiredConfirmations,
  OFFICIAL_USDT_BEP20_CONTRACT,
  getEffectiveDepositVault,
} from "../src/lib/blockchain/config";
import Decimal from "decimal.js";

async function runTests() {
  console.log("==========================================================");
  console.log("  DUBAI FINANCE — CRYPTO DEPOSIT SYSTEM TEST SUITE");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra: string = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  }

  // Find or use a test user and admin
  let testUser = await db.user.findFirst({ where: { role: "USER" } });
  if (!testUser) {
    testUser = await db.user.create({
      data: {
        customId: "DF_TEST_USER_99",
        fullName: "Test Crypto User",
        email: "crypto_test_user@dubaifinance.online",
        passwordHash: "mock_hash",
        fundBalance: 100,
        status: "ACTIVE",
      },
    });
  }

  let testAdmin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!testAdmin) {
    testAdmin = await db.user.create({
      data: {
        customId: "DF_TEST_ADM_99",
        fullName: "Test Crypto Admin",
        email: "crypto_test_admin@dubaifinance.online",
        passwordHash: "mock_hash",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
  }

  let superRoot = await db.user.findFirst({ where: { role: "SUPER_ROOT_ADMIN" } });
  if (!superRoot) {
    superRoot = await db.user.create({
      data: {
        customId: "DF_SUPER_ROOT_99",
        fullName: "Master Super Root",
        email: "crypto_superroot@dubaifinance.online",
        passwordHash: "mock_hash",
        role: "SUPER_ROOT_ADMIN",
        status: "ACTIVE",
      },
    });
  }

  console.log(`Test Context: User=${testUser.customId}, Admin=${testAdmin.customId}, SuperRoot=${superRoot.customId}\n`);

  // -------------------------------------------------------------
  // TEST 1: Address Derivation & Uniqueness
  // -------------------------------------------------------------
  console.log("[Suite 1: Deposit Address Management]");
  const addr1 = deriveDeterministicAddress(testUser.id);
  const addr2 = deriveDeterministicAddress(testUser.id);
  assert(addr1 === addr2, "Deterministic Address Consistency", `Address: ${addr1}`);
  assert(/^0x[a-fA-F0-9]{40}$/.test(addr1), "Valid EVM Address Format");

  const registered = await getOrCreateUserDepositAddress(testUser.id);
  assert(registered.address.toLowerCase() === addr1.toLowerCase(), "Address Registration & Retrieval Match");

  const mapped = await findUserByDepositAddress(registered.address);
  assert(mapped?.user.id === testUser.id, "Address to User Reverse Resolution");

  const diffUserAddr = deriveDeterministicAddress("DIFFERENT_USER_ID_123");
  assert(diffUserAddr.toLowerCase() !== addr1.toLowerCase(), "Address Uniqueness Across Different Users");

  // -------------------------------------------------------------
  // TEST 2: RBAC Permissions & Privilege Escalation Protection
  // -------------------------------------------------------------
  console.log("\n[Suite 2: Granular RBAC Permissions]");
  const mockUserSession: any = { userId: testUser.id, role: "USER" };
  const mockAdminSession: any = { userId: testAdmin.id, role: "ADMIN" };
  const mockSuperSession: any = { userId: superRoot.id, role: "SUPER_ROOT_ADMIN" };

  // USER must never have deposit permissions
  const userPerm = await hasDepositPermission(mockUserSession, "deposit.approve");
  assert(!userPerm, "Regular Member Access Denial for deposit.approve");

  // SUPER_ROOT_ADMIN always has all permissions
  const superPerm = await hasDepositPermission(mockSuperSession, "deposit.approve");
  assert(superPerm, "SuperRootAdmin Master Access to deposit.approve");

  // Initially testAdmin should not have deposit.approve
  await setAdminDepositPermissions(testAdmin.id, ["deposit.view"], superRoot.id);
  const adminViewPerm = await hasDepositPermission(mockAdminSession, "deposit.view");
  const adminApprovePerm = await hasDepositPermission(mockAdminSession, "deposit.approve");
  assert(adminViewPerm, "Admin deposit.view Permission Check");
  assert(!adminApprovePerm, "Admin Without deposit.approve Access Denied");

  // Grant deposit.approve via SuperRootAdmin
  await setAdminDepositPermissions(testAdmin.id, ["deposit.view", "deposit.approve"], superRoot.id);
  const adminApproveGranted = await hasDepositPermission(mockAdminSession, "deposit.approve");
  assert(adminApproveGranted, "Admin With Granted deposit.approve Successfully Authorized");

  // Revoke deposit.approve
  await setAdminDepositPermissions(testAdmin.id, ["deposit.view"], superRoot.id);
  const adminRevoked = await hasDepositPermission(mockAdminSession, "deposit.approve");
  assert(!adminRevoked, "Revocation of deposit.approve Successfully Enforced");

  // Prevent self-permission escalation
  let selfEscalationBlocked = false;
  try {
    await setAdminDepositPermissions(testAdmin.id, ["deposit.approve"], testAdmin.id);
  } catch (err: any) {
    selfEscalationBlocked = true;
  }
  assert(selfEscalationBlocked, "Self-Permission Escalation Blocked");

  // -------------------------------------------------------------
  // TEST 3: Wallet Credit Atomicity & Double-Credit Protection
  // -------------------------------------------------------------
  console.log("\n[Suite 3: Wallet Crediting & Duplicate Protection]");
  const initialUser = await db.user.findUnique({ where: { id: testUser.id } });
  const initialBalance = new Decimal(initialUser!.fundBalance.toString());

  const mockTxHash = `0x${Math.random().toString(16).slice(2).padStart(64, "0")}`;
  const depositAmount = new Decimal(50);

  // Create test deposit record in PENDING status
  const testDeposit = await db.depositRequest.create({
    data: {
      userId: testUser.id,
      amountInUsdt: depositAmount.toFixed(8),
      amountInInr: depositAmount.toFixed(2),
      txHash: mockTxHash,
      verifiedTxHash: mockTxHash,
      status: "PENDING_REVIEW",
      processingMode: "AUTOMATIC",
      tokenContract: OFFICIAL_USDT_BEP20_CONTRACT,
      toAddress: registered.address,
    },
  });

  // Credit deposit atomically
  const creditRes1 = await creditUserFundWalletAtomic({
    depositId: testDeposit.id,
    adminId: superRoot.id,
  });
  assert(creditRes1.success, "Atomic Wallet Credit Succeeded");

  const afterUser = await db.user.findUnique({ where: { id: testUser.id } });
  const afterBalance = new Decimal(afterUser!.fundBalance.toString());
  assert(afterBalance.minus(initialBalance).equals(depositAmount), "Fund Wallet Balance Credited Exactly $50 USDT");

  const updatedDep = await db.depositRequest.findUnique({ where: { id: testDeposit.id } });
  assert(updatedDep?.status === "CREDITED", "Deposit Status Transitioned to CREDITED");

  // Attempt duplicate credit on the exact same deposit
  const creditRes2 = await creditUserFundWalletAtomic({
    depositId: testDeposit.id,
    adminId: superRoot.id,
  });
  assert(Boolean(!creditRes2.success && creditRes2.alreadyCredited), "Duplicate Credit Blocked by Idempotency Guard");

  const balanceAfterDup = await db.user.findUnique({ where: { id: testUser.id } });
  assert(
    new Decimal(balanceAfterDup!.fundBalance.toString()).equals(afterBalance),
    "Double-Credit Protection Guaranteed (Balance Unchanged)"
  );

  // -------------------------------------------------------------
  // TEST 4: Blockchain Provider & Health Check
  // -------------------------------------------------------------
  console.log("\n[Suite 4: Blockchain Provider & BSC Connectivity]");
  try {
    const health = await defaultBlockchainProvider.checkHealth();
    assert(health.connected, `BSC RPC Node Live Connectivity (Current Block: ${health.currentBlock})`);
    assert(health.currentBlock > BigInt(0), "Valid Positive Block Number Returned from BSC RPC");
  } catch (err: any) {
    console.warn("  ⚠️ Warning: External BSC public RPC unreachable or rate limited in local sandbox:", err.message);
  }

  // -------------------------------------------------------------
  // TEST 5: System Pause & Configuration
  // -------------------------------------------------------------
  console.log("\n[Suite 5: System Configuration & Mode Control]");
  const mode = await getDepositProcessingMode();
  assert(mode === "AUTOMATIC" || mode === "MANUAL", "Valid Configured Deposit Mode", `Mode: ${mode}`);

  const autoCrediting = await isAutomaticCreditingEnabled();
  assert(typeof autoCrediting === "boolean", "System Pause Switch Readability");

  const reqConfirmations = await getRequiredConfirmations();
  assert(reqConfirmations >= 1, "Required Confirmations Config Valid", `Confirmations: ${reqConfirmations}`);

  // -------------------------------------------------------------
  // TEST 6: Admin-Wise & Branch-Wise Deposit Mode Control
  // -------------------------------------------------------------
  console.log("\n[Suite 6: Admin-Wise & Branch-Wise Mode Switching]");

  // Create or upsert Admin A with MANUAL mode
  let adminA = await db.user.upsert({
    where: { customId: "DF_ADMIN_BRANCH_A" },
    update: { depositMode: "MANUAL", role: "ADMIN" },
    create: {
      customId: "DF_ADMIN_BRANCH_A",
      fullName: "Admin Branch Alpha",
      email: "admin_a_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "ADMIN",
      depositMode: "MANUAL",
      teamPrefix: "ALPHA",
      status: "ACTIVE",
    },
  });

  // Create or upsert Admin B with AUTOMATIC mode
  let adminB = await db.user.upsert({
    where: { customId: "DF_ADMIN_BRANCH_B" },
    update: { depositMode: "AUTOMATIC", role: "ADMIN" },
    create: {
      customId: "DF_ADMIN_BRANCH_B",
      fullName: "Admin Branch Beta",
      email: "admin_b_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "ADMIN",
      depositMode: "AUTOMATIC",
      teamPrefix: "BETA",
      status: "ACTIVE",
    },
  });

  // Create or upsert Admin C with GLOBAL mode
  let adminC = await db.user.upsert({
    where: { customId: "DF_ADMIN_BRANCH_C" },
    update: { depositMode: "GLOBAL", role: "ADMIN" },
    create: {
      customId: "DF_ADMIN_BRANCH_C",
      fullName: "Admin Branch Gamma",
      email: "admin_c_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "ADMIN",
      depositMode: "GLOBAL",
      teamPrefix: "GAMMA",
      status: "ACTIVE",
    },
  });

  // Create or update User A assigned to Admin A
  let userA = await db.user.upsert({
    where: { customId: "DF_USER_BRANCH_A" },
    update: { adminId: adminA.id, role: "USER" },
    create: {
      customId: "DF_USER_BRANCH_A",
      fullName: "User Under Admin A",
      email: "user_a_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "USER",
      adminId: adminA.id,
      status: "ACTIVE",
    },
  });

  // Create or update User B assigned to Admin B
  let userB = await db.user.upsert({
    where: { customId: "DF_USER_BRANCH_B" },
    update: { adminId: adminB.id, role: "USER" },
    create: {
      customId: "DF_USER_BRANCH_B",
      fullName: "User Under Admin B",
      email: "user_b_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "USER",
      adminId: adminB.id,
      status: "ACTIVE",
    },
  });

  // Create or update User C assigned to Admin C
  let userC = await db.user.upsert({
    where: { customId: "DF_USER_BRANCH_C" },
    update: { adminId: adminC.id, role: "USER" },
    create: {
      customId: "DF_USER_BRANCH_C",
      fullName: "User Under Admin C",
      email: "user_c_branch@dubaifinance.online",
      passwordHash: "mock_hash",
      role: "USER",
      adminId: adminC.id,
      status: "ACTIVE",
    },
  });

  const adminAMode = await getDepositProcessingMode(adminA.id);
  const adminBMode = await getDepositProcessingMode(adminB.id);
  const adminCMode = await getDepositProcessingMode(adminC.id);

  assert(adminAMode === "MANUAL", "Admin A Direct Branch Mode is MANUAL", `Got: ${adminAMode}`);
  assert(adminBMode === "AUTOMATIC", "Admin B Direct Branch Mode is AUTOMATIC", `Got: ${adminBMode}`);
  assert(adminCMode === mode, "Admin C Inherits Global Mode", `Got: ${adminCMode} (Global: ${mode})`);

  const userAMode = await getDepositProcessingModeForUser(userA.id);
  const userBMode = await getDepositProcessingModeForUser(userB.id);
  const userCMode = await getDepositProcessingModeForUser(userC.id);

  assert(userAMode === "MANUAL", "User A under Admin A inherits MANUAL mode", `Got: ${userAMode}`);
  assert(userBMode === "AUTOMATIC", "User B under Admin B inherits AUTOMATIC mode", `Got: ${userBMode}`);
  assert(userCMode === mode, "User C under Admin C inherits Global mode", `Got: ${userCMode}`);

  // Dynamic Switch: SuperRootAdmin changes Admin A from MANUAL to AUTOMATIC
  await db.user.update({
    where: { id: adminA.id },
    data: { depositMode: "AUTOMATIC" },
  });
  const userAModeAfterSwitch = await getDepositProcessingModeForUser(userA.id);
  assert(userAModeAfterSwitch === "AUTOMATIC", "Dynamic Switch: User A immediately receives AUTOMATIC mode after Admin A update");

  // Revert Admin A back to MANUAL for pristine state
  await db.user.update({
    where: { id: adminA.id },
    data: { depositMode: "MANUAL" },
  });
  const userAModeReverted = await getDepositProcessingModeForUser(userA.id);
  assert(userAModeReverted === "MANUAL", "Revert Check: User A is back to MANUAL mode");

  // ========================================================
  // 10. BRANCH DEPOSIT VAULT ISOLATION TESTS
  // ========================================================
  console.log("\n--- SECTION 10: BRANCH DEPOSIT VAULT ISOLATION ---");

  const addressA = "0x1111111111111111111111111111111111111111";
  const addressB = "0x2222222222222222222222222222222222222222";
  const qrA = "https://example.com/qr-admin-a.png";
  const qrB = "https://example.com/qr-admin-b.png";

  // Configure Admin A's branch vault in SystemConfig and user record
  await db.systemConfig.upsert({
    where: { key: `ADMIN_DEPOSIT_ADDRESS_${adminA.id}` },
    update: { value: addressA },
    create: { key: `ADMIN_DEPOSIT_ADDRESS_${adminA.id}`, value: addressA, description: "Admin A vault" },
  });
  await db.systemConfig.upsert({
    where: { key: `ADMIN_DEPOSIT_QR_${adminA.id}` },
    update: { value: qrA },
    create: { key: `ADMIN_DEPOSIT_QR_${adminA.id}`, value: qrA, description: "Admin A QR" },
  });
  await db.user.update({
    where: { id: adminA.id },
    data: { usdtAddress: addressA },
  });

  // Configure Admin B's branch vault in SystemConfig and user record
  await db.systemConfig.upsert({
    where: { key: `ADMIN_DEPOSIT_ADDRESS_${adminB.id}` },
    update: { value: addressB },
    create: { key: `ADMIN_DEPOSIT_ADDRESS_${adminB.id}`, value: addressB, description: "Admin B vault" },
  });
  await db.systemConfig.upsert({
    where: { key: `ADMIN_DEPOSIT_QR_${adminB.id}` },
    update: { value: qrB },
    create: { key: `ADMIN_DEPOSIT_QR_${adminB.id}`, value: qrB, description: "Admin B QR" },
  });
  await db.user.update({
    where: { id: adminB.id },
    data: { usdtAddress: addressB },
  });

  // Verify Admin A vault resolution
  const vaultAdminA = await getEffectiveDepositVault(adminA.id);
  assert(vaultAdminA.address.toLowerCase() === addressA.toLowerCase(), "Admin A resolves their own dedicated deposit address", `Got: ${vaultAdminA.address}`);
  assert(vaultAdminA.qr === qrA, "Admin A resolves their own dedicated QR code", `Got: ${vaultAdminA.qr}`);

  // Verify Admin B vault resolution
  const vaultAdminB = await getEffectiveDepositVault(adminB.id);
  assert(vaultAdminB.address.toLowerCase() === addressB.toLowerCase(), "Admin B resolves their own dedicated deposit address", `Got: ${vaultAdminB.address}`);
  assert(vaultAdminB.qr === qrB, "Admin B resolves their own dedicated QR code", `Got: ${vaultAdminB.qr}`);

  // Crucial check: Address A and Address B must be DIFFERENT
  assert(vaultAdminA.address !== vaultAdminB.address, "Admin A and Admin B have completely different deposit addresses");

  // Verify Downline User A under Admin A receives Admin A's vault
  const vaultUserA = await getEffectiveDepositVault(userA.id);
  assert(vaultUserA.address.toLowerCase() === addressA.toLowerCase(), "User A receives Admin A's deposit address", `Got: ${vaultUserA.address}`);
  assert(vaultUserA.qr === qrA, "User A receives Admin A's deposit QR", `Got: ${vaultUserA.qr}`);

  // Verify Downline User B under Admin B receives Admin B's vault
  const vaultUserB = await getEffectiveDepositVault(userB.id);
  assert(vaultUserB.address.toLowerCase() === addressB.toLowerCase(), "User B receives Admin B's deposit address", `Got: ${vaultUserB.address}`);
  assert(vaultUserB.qr === qrB, "User B receives Admin B's deposit QR", `Got: ${vaultUserB.qr}`);

  // Isolation check: modifying Admin A's address must NOT affect Admin B or User B
  const updatedAddressA = "0x9999999999999999999999999999999999999999";
  await db.systemConfig.upsert({
    where: { key: `ADMIN_DEPOSIT_ADDRESS_${adminA.id}` },
    update: { value: updatedAddressA },
    create: { key: `ADMIN_DEPOSIT_ADDRESS_${adminA.id}`, value: updatedAddressA, description: "Admin A vault" },
  });

  const vaultAdminBAfterAUpdate = await getEffectiveDepositVault(adminB.id);
  const vaultUserBAfterAUpdate = await getEffectiveDepositVault(userB.id);
  assert(vaultAdminBAfterAUpdate.address.toLowerCase() === addressB.toLowerCase(), "Admin B's deposit address remains unchanged after Admin A modifies theirs");
  assert(vaultUserBAfterAUpdate.address.toLowerCase() === addressB.toLowerCase(), "User B's deposit address remains unchanged after Admin A modifies theirs");

  const vaultUserAAfterUpdate = await getEffectiveDepositVault(userA.id);
  assert(vaultUserAAfterUpdate.address.toLowerCase() === updatedAddressA.toLowerCase(), "User A receives newly updated deposit address of Admin A");

  console.log("\n==========================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
