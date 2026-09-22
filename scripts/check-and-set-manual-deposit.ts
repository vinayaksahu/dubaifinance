import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("Checking current deposit mode in database...");

  // 1. Check SystemConfig
  const globalModeConfig = await db.systemConfig.findUnique({
    where: { key: "DEPOSIT_PROCESSING_MODE" },
  });

  console.log("Current Global DEPOSIT_PROCESSING_MODE in DB:", globalModeConfig?.value || "(Not set, defaults to AUTOMATIC)");

  // 2. Check all Admins
  const admins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, customId: true, fullName: true, depositMode: true, role: true },
  });

  console.log("Admins currently in database:");
  admins.forEach((a) => {
    console.log(` - [${a.customId}] ${a.fullName} (${a.role}): depositMode = ${a.depositMode || "GLOBAL"}`);
  });

  // 3. Set Global Mode to MANUAL
  const updatedGlobal = await db.systemConfig.upsert({
    where: { key: "DEPOSIT_PROCESSING_MODE" },
    update: { value: "MANUAL" },
    create: {
      key: "DEPOSIT_PROCESSING_MODE",
      value: "MANUAL",
      description: "Platform deposit processing mode: AUTOMATIC or MANUAL",
    },
  });

  console.log("\n>>> Global DEPOSIT_PROCESSING_MODE has been updated to:", updatedGlobal.value);

  // 4. Set all admins to MANUAL as well
  const updatedAdmins = await db.user.updateMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    data: { depositMode: "MANUAL" },
  });

  console.log(`>>> Updated ${updatedAdmins.count} admin accounts to depositMode = 'MANUAL'`);

  // Verify
  const verifiedGlobal = await db.systemConfig.findUnique({
    where: { key: "DEPOSIT_PROCESSING_MODE" },
  });
  console.log("\nVerification: Global Mode is now:", verifiedGlobal?.value);

  const verifiedAdmins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, customId: true, fullName: true, depositMode: true },
  });
  verifiedAdmins.forEach((a) => {
    console.log(` - [${a.customId}] ${a.fullName}: depositMode = ${a.depositMode}`);
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
