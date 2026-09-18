import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export interface DatabaseBackupPayload {
  metadata: {
    platform: string;
    version: string;
    exportedAt: string;
    totalRecords: number;
    schema: string;
    tableCounts: Record<string, number>;
  };
  data: {
    systemConfigs: any[];
    users: any[];
    investmentContracts: any[];
    ledgerEntries: any[];
    depositRequests: any[];
    withdrawalRequests: any[];
    supportTickets: any[];
    queuePositions: any[];
  };
}

/**
 * Format records for JSON/Excel serialization (handling Decimals, Dates, and BigInts)
 */
function sanitizeRows(rows: any[]): any[] {
  return rows.map((row) => {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      if (val === null || val === undefined) {
        clean[key] = val;
      } else if (typeof val === "bigint") {
        clean[key] = val.toString();
      } else if (val instanceof Date) {
        clean[key] = val.toISOString();
      } else if (typeof val === "object" && "toFixed" in val) {
        // Prisma Decimal object
        clean[key] = (val as any).toString();
      } else {
        clean[key] = val;
      }
    }
    return clean;
  });
}

/**
 * Fetch all platform data across models
 */
export async function getFullDatabaseDump(): Promise<DatabaseBackupPayload> {
  const [
    systemConfigs,
    users,
    investmentContracts,
    ledgerEntries,
    depositRequests,
    withdrawalRequests,
    supportTickets,
    queuePositions,
  ] = await Promise.all([
    db.systemConfig.findMany({ orderBy: { key: "asc" } }),
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.investmentContract.findMany({ orderBy: { createdAt: "asc" } }),
    db.ledgerEntry.findMany({ orderBy: { createdAt: "asc" } }),
    db.depositRequest.findMany({ orderBy: { createdAt: "asc" } }),
    db.withdrawalRequest.findMany({ orderBy: { createdAt: "asc" } }),
    db.supportTicket.findMany({ orderBy: { createdAt: "asc" } }),
    db.queuePosition.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const cleanConfigs = sanitizeRows(systemConfigs);
  const cleanUsers = sanitizeRows(users);
  const cleanContracts = sanitizeRows(investmentContracts);
  const cleanLedgers = sanitizeRows(ledgerEntries);
  const cleanDeposits = sanitizeRows(depositRequests);
  const cleanWithdrawals = sanitizeRows(withdrawalRequests);
  const cleanTickets = sanitizeRows(supportTickets);
  const cleanQueue = sanitizeRows(queuePositions);

  const tableCounts = {
    systemConfigs: cleanConfigs.length,
    users: cleanUsers.length,
    investmentContracts: cleanContracts.length,
    ledgerEntries: cleanLedgers.length,
    depositRequests: cleanDeposits.length,
    withdrawalRequests: cleanWithdrawals.length,
    supportTickets: cleanTickets.length,
    queuePositions: cleanQueue.length,
  };

  const totalRecords = Object.values(tableCounts).reduce((a, b) => a + b, 0);

  return {
    metadata: {
      platform: "Dubai Finance",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      totalRecords,
      schema: "dubaifinance",
      tableCounts,
    },
    data: {
      systemConfigs: cleanConfigs,
      users: cleanUsers,
      investmentContracts: cleanContracts,
      ledgerEntries: cleanLedgers,
      depositRequests: cleanDeposits,
      withdrawalRequests: cleanWithdrawals,
      supportTickets: cleanTickets,
      queuePositions: cleanQueue,
    },
  };
}

/**
 * Generate JSON backup buffer
 */
export async function exportDatabaseAsJson(): Promise<string> {
  const dump = await getFullDatabaseDump();
  return JSON.stringify(dump, null, 2);
}

/**
 * Generate multi-sheet Excel (.xlsx) buffer
 */
export async function exportDatabaseAsExcel(): Promise<Buffer> {
  const dump = await getFullDatabaseDump();
  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet
  const overviewRows = [
    { Property: "Platform", Value: dump.metadata.platform },
    { Property: "Exported At", Value: dump.metadata.exportedAt },
    { Property: "Total Records", Value: dump.metadata.totalRecords },
    { Property: "Database Schema", Value: dump.metadata.schema },
    { Property: "Total Users", Value: dump.metadata.tableCounts.users },
    { Property: "Total System Configs", Value: dump.metadata.tableCounts.systemConfigs },
    { Property: "Total Active Contracts", Value: dump.metadata.tableCounts.investmentContracts },
    { Property: "Total Ledger Transactions", Value: dump.metadata.tableCounts.ledgerEntries },
    { Property: "Total Deposits", Value: dump.metadata.tableCounts.depositRequests },
    { Property: "Total Withdrawals", Value: dump.metadata.tableCounts.withdrawalRequests },
    { Property: "Total Support Tickets", Value: dump.metadata.tableCounts.supportTickets },
  ];
  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
  XLSX.utils.book_append_sheet(wb, overviewSheet, "Overview");

  // 2. Data Sheets
  const sheetMap: Record<string, any[]> = {
    Users: dump.data.users,
    SystemConfig: dump.data.systemConfigs,
    Contracts: dump.data.investmentContracts,
    LedgerEntries: dump.data.ledgerEntries,
    DepositRequests: dump.data.depositRequests,
    WithdrawalRequests: dump.data.withdrawalRequests,
    SupportTickets: dump.data.supportTickets,
    QueuePositions: dump.data.queuePositions,
  };

  for (const [sheetName, rows] of Object.entries(sheetMap)) {
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Note: "No records found" }]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return excelBuffer;
}

/**
 * Parse Excel file buffer into structured table data
 */
export function parseExcelBackup(buffer: Buffer): DatabaseBackupPayload["data"] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const result: DatabaseBackupPayload["data"] = {
    systemConfigs: [],
    users: [],
    investmentContracts: [],
    ledgerEntries: [],
    depositRequests: [],
    withdrawalRequests: [],
    supportTickets: [],
    queuePositions: [],
  };

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows: any[] = XLSX.utils.sheet_to_json(ws);
    // Skip empty or placeholder rows
    const cleanRows = rows.filter((r) => !r.Note);

    const nameLower = sheetName.toLowerCase();
    if (nameLower.includes("user")) {
      result.users = cleanRows;
    } else if (nameLower.includes("config")) {
      result.systemConfigs = cleanRows;
    } else if (nameLower.includes("contract")) {
      result.investmentContracts = cleanRows;
    } else if (nameLower.includes("ledger")) {
      result.ledgerEntries = cleanRows;
    } else if (nameLower.includes("deposit")) {
      result.depositRequests = cleanRows;
    } else if (nameLower.includes("withdraw")) {
      result.withdrawalRequests = cleanRows;
    } else if (nameLower.includes("ticket")) {
      result.supportTickets = cleanRows;
    } else if (nameLower.includes("queue")) {
      result.queuePositions = cleanRows;
    }
  }

  return result;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  summary: {
    users: number;
    systemConfigs: number;
    contracts: number;
    ledgers: number;
    deposits: number;
    withdrawals: number;
    tickets: number;
    queuePositions: number;
  };
  errors?: string[];
}

/**
 * Execute restore/import into database with foreign-key dependency safety
 */
export async function restoreDatabaseData(
  data: DatabaseBackupPayload["data"],
  mode: "merge" | "replace" = "merge"
): Promise<RestoreResult> {
  const errors: string[] = [];
  const summary = {
    users: 0,
    systemConfigs: 0,
    contracts: 0,
    ledgers: 0,
    deposits: 0,
    withdrawals: 0,
    tickets: 0,
    queuePositions: 0,
  };

  try {
    // If 'replace' mode, carefully clear child tables first, then users
    if (mode === "replace") {
      await db.$transaction([
        db.queuePosition.deleteMany(),
        db.supportTicket.deleteMany(),
        db.withdrawalRequest.deleteMany(),
        db.depositRequest.deleteMany(),
        db.ledgerEntry.deleteMany(),
        db.investmentContract.deleteMany(),
        db.user.deleteMany(),
        db.systemConfig.deleteMany(),
      ]);
    }

    // 1. Restore SystemConfigs
    if (data.systemConfigs && Array.isArray(data.systemConfigs)) {
      for (const row of data.systemConfigs) {
        if (!row.key || row.value === undefined) continue;
        try {
          await db.systemConfig.upsert({
            where: { key: String(row.key) },
            create: {
              id: row.id ? String(row.id) : undefined,
              key: String(row.key),
              value: String(row.value),
              description: row.description ? String(row.description) : null,
              updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
            },
            update: {
              value: String(row.value),
              description: row.description ? String(row.description) : null,
              updatedAt: new Date(),
            },
          });
          summary.systemConfigs++;
        } catch (e: any) {
          errors.push(`Config ${row.key}: ${e.message}`);
        }
      }
    }

    // 2. Restore Users - PASS 1: Create without circular self-references (sponsorId, adminId set null initially)
    if (data.users && Array.isArray(data.users)) {
      for (const u of data.users) {
        if (!u.id || !u.email) continue;
        try {
          const userData = {
            customId: String(u.customId),
            fullName: String(u.fullName || "Member"),
            email: String(u.email),
            phone: u.phone ? String(u.phone) : null,
            passwordHash: String(u.passwordHash),
            transactionPin: u.transactionPin ? String(u.transactionPin) : null,
            role: u.role || "USER",
            status: u.status || "ACTIVE",
            teamPrefix: u.teamPrefix ? String(u.teamPrefix) : null,
            usdtAddress: u.usdtAddress ? String(u.usdtAddress) : null,
            fundBalance: Number(u.fundBalance || 0),
            incomeBalance: Number(u.incomeBalance || 0),
            fdLockedBalance: Number(u.fdLockedBalance || 0),
            totalWithdrawn: Number(u.totalWithdrawn || 0),
            directBusiness: Number(u.directBusiness || 0),
            currentRank: Number(u.currentRank || 0),
            rankHoldingValue: Number(u.rankHoldingValue || 0),
            autoUpgradeEnabled: u.autoUpgradeEnabled !== false && u.autoUpgradeEnabled !== "false",
            isRankBanned: u.isRankBanned === true || u.isRankBanned === "true",
            isUltimaCompleted: u.isUltimaCompleted === true || u.isUltimaCompleted === "true",
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          };

          await db.user.upsert({
            where: { id: String(u.id) },
            create: {
              id: String(u.id),
              ...userData,
            },
            update: userData,
          });
          summary.users++;
        } catch (e: any) {
          errors.push(`User Pass1 ${u.customId || u.email}: ${e.message}`);
        }
      }

      // PASS 2: Link sponsorId and adminId now that all users exist in DB
      for (const u of data.users) {
        if (!u.id) continue;
        const updates: any = {};
        if (u.sponsorId) updates.sponsorId = String(u.sponsorId);
        if (u.adminId) updates.adminId = String(u.adminId);

        if (Object.keys(updates).length > 0) {
          try {
            await db.user.update({
              where: { id: String(u.id) },
              data: updates,
            });
          } catch (e: any) {
            // Ignore if sponsorId no longer exists
          }
        }
      }
    }

    // 3. Restore Investment Contracts
    if (data.investmentContracts && Array.isArray(data.investmentContracts)) {
      for (const c of data.investmentContracts) {
        if (!c.id || !c.userId) continue;
        try {
          const contractData = {
            userId: String(c.userId),
            packageType: c.packageType || "BASIC_SAVING",
            amountInInr: Number(c.amountInInr || 0),
            amountInUsdt: Number(c.amountInUsdt || 0),
            dailyRoiRate: Number(c.dailyRoiRate || 5),
            tenureDays: Number(c.tenureDays || 28),
            daysPaid: Number(c.daysPaid || 0),
            totalEarned: Number(c.totalEarned || 0),
            status: c.status || "ACTIVE",
            startDate: c.startDate ? new Date(c.startDate) : new Date(),
            maturityDate: c.maturityDate ? new Date(c.maturityDate) : new Date(),
            lastRoiAt: c.lastRoiAt ? new Date(c.lastRoiAt) : null,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          };

          await db.investmentContract.upsert({
            where: { id: String(c.id) },
            create: { id: String(c.id), ...contractData },
            update: contractData,
          });
          summary.contracts++;
        } catch (e: any) {
          errors.push(`Contract ${c.id}: ${e.message}`);
        }
      }
    }

    // 4. Restore Ledger Entries
    if (data.ledgerEntries && Array.isArray(data.ledgerEntries)) {
      for (const l of data.ledgerEntries) {
        if (!l.id || !l.userId || !l.referenceKey) continue;
        try {
          const ledgerData = {
            userId: String(l.userId),
            type: l.type || "DEPOSIT",
            wallet: String(l.wallet || "FUND"),
            amount: Number(l.amount || 0),
            balanceAfter: Number(l.balanceAfter || 0),
            referenceKey: String(l.referenceKey),
            description: String(l.description || ""),
            sourceUserId: l.sourceUserId ? String(l.sourceUserId) : null,
            levelNumber: l.levelNumber ? Number(l.levelNumber) : null,
            createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
          };

          await db.ledgerEntry.upsert({
            where: { id: String(l.id) },
            create: { id: String(l.id), ...ledgerData },
            update: ledgerData,
          });
          summary.ledgers++;
        } catch (e: any) {
          errors.push(`Ledger ${l.referenceKey}: ${e.message}`);
        }
      }
    }

    // 5. Restore Deposit Requests
    if (data.depositRequests && Array.isArray(data.depositRequests)) {
      for (const d of data.depositRequests) {
        if (!d.id || !d.userId || !d.txHash) continue;
        try {
          const depositData = {
            userId: String(d.userId),
            amountInUsdt: Number(d.amountInUsdt || 0),
            amountInInr: Number(d.amountInInr || 0),
            txHash: String(d.txHash),
            network: String(d.network || "USDT_BEP20"),
            screenshotUrl: d.screenshotUrl ? String(d.screenshotUrl) : null,
            adminNote: d.adminNote ? String(d.adminNote) : null,
            status: String(d.status || "PENDING"),
            reviewedAt: d.reviewedAt ? new Date(d.reviewedAt) : null,
            createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          };

          await db.depositRequest.upsert({
            where: { id: String(d.id) },
            create: { id: String(d.id), ...depositData },
            update: depositData,
          });
          summary.deposits++;
        } catch (e: any) {
          errors.push(`Deposit ${d.txHash}: ${e.message}`);
        }
      }
    }

    // 6. Restore Withdrawal Requests
    if (data.withdrawalRequests && Array.isArray(data.withdrawalRequests)) {
      for (const w of data.withdrawalRequests) {
        if (!w.id || !w.userId || !w.toAddress) continue;
        try {
          const withdrawalData = {
            userId: String(w.userId),
            amountInInr: Number(w.amountInInr || 0),
            amountInUsdt: Number(w.amountInUsdt || 0),
            feePercent: Number(w.feePercent || 10),
            feeAmount: Number(w.feeAmount || 0),
            netAmount: Number(w.netAmount || 0),
            toAddress: String(w.toAddress),
            network: String(w.network || "USDT_BEP20"),
            txHash: w.txHash ? String(w.txHash) : null,
            adminNote: w.adminNote ? String(w.adminNote) : null,
            status: String(w.status || "PENDING"),
            processedAt: w.processedAt ? new Date(w.processedAt) : null,
            createdAt: w.createdAt ? new Date(w.createdAt) : new Date(),
          };

          await db.withdrawalRequest.upsert({
            where: { id: String(w.id) },
            create: { id: String(w.id), ...withdrawalData },
            update: withdrawalData,
          });
          summary.withdrawals++;
        } catch (e: any) {
          errors.push(`Withdrawal ${w.id}: ${e.message}`);
        }
      }
    }

    // 7. Restore Support Tickets
    if (data.supportTickets && Array.isArray(data.supportTickets)) {
      for (const t of data.supportTickets) {
        if (!t.id || !t.userId) continue;
        try {
          const ticketData = {
            userId: String(t.userId),
            subject: String(t.subject || "Support Request"),
            category: String(t.category || "GENERAL"),
            message: String(t.message || ""),
            status: String(t.status || "OPEN"),
            adminReply: t.adminReply ? String(t.adminReply) : null,
            createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
          };

          await db.supportTicket.upsert({
            where: { id: String(t.id) },
            create: { id: String(t.id), ...ticketData },
            update: ticketData,
          });
          summary.tickets++;
        } catch (e: any) {
          errors.push(`Ticket ${t.id}: ${e.message}`);
        }
      }
    }

    // 8. Restore Queue Positions
    if (data.queuePositions && Array.isArray(data.queuePositions)) {
      for (const q of data.queuePositions) {
        if (!q.id || !q.userId) continue;
        try {
          const queueData = {
            userId: String(q.userId),
            rankTier: Number(q.rankTier || 1),
            rankName: String(q.rankName || ""),
            entryAmount: Number(q.entryAmount || 0),
            rankValue: Number(q.rankValue || 0),
            child1Id: q.child1Id ? String(q.child1Id) : null,
            child2Id: q.child2Id ? String(q.child2Id) : null,
            childrenCount: Number(q.childrenCount || 0),
            status: q.status || "WAITING",
            queueOrder: BigInt(q.queueOrder || 1),
            completedAt: q.completedAt ? new Date(q.completedAt) : null,
            exitedAt: q.exitedAt ? new Date(q.exitedAt) : null,
            createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
            updatedAt: q.updatedAt ? new Date(q.updatedAt) : new Date(),
          };

          await db.queuePosition.upsert({
            where: { id: String(q.id) },
            create: { id: String(q.id), ...queueData },
            update: queueData,
          });
          summary.queuePositions++;
        } catch (e: any) {
          errors.push(`QueuePosition ${q.id}: ${e.message}`);
        }
      }
    }

    return {
      success: true,
      message: `Database restored successfully. Mode: ${mode}.`,
      summary,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined,
    };
  } catch (globalError: any) {
    console.error("[restoreDatabaseData Error]", globalError);
    return {
      success: false,
      message: `Database restoration encountered a fatal error: ${globalError.message}`,
      summary,
      errors: [globalError.message],
    };
  }
}
