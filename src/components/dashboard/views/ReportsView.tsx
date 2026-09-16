"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  Wallet,
  Banknote,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableExportToolbar } from "@/components/dashboard/TableExportToolbar";
import {
  copyTableToClipboard,
  exportToExcel,
  printOrExportPdf,
  ExportColumn,
} from "@/lib/exportUtils";

export type ReportType =
  | "daily"
  | "monthly"
  | "fund-wallet"
  | "income-wallet"
  | "statement"
  | "packages";

interface ReportsViewProps {
  user: any;
  reportType: ReportType;
  onRefresh?: () => void;
}

export function ReportsView({ user, reportType, onRefresh }: ReportsViewProps) {
  // Global table state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);

  // Sub-filter tabs (e.g. ALL, CREDIT, DEBIT)
  const [walletFilter, setWalletFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const ledger: any[] = user?.ledgerEntries || user?.ledgers || [];
  const contracts: any[] = user?.contracts || [];
  const deposits: any[] = user?.deposits || [];
  const withdrawals: any[] = user?.withdrawals || [];

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toISOString().split("T")[0];
  };

  const formatDateTime = (dateStr: string | Date) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${d.toISOString().split("T")[0]} ${d.toTimeString().slice(0, 8)}`;
  };

  const num = (v: any) => Number(v || 0);

  const formatTxType = (type: string) => {
    const t = String(type || "").toUpperCase();
    if (t === "BASIC_ROI" || t === "BASIC_DAILY_ROI") return "Basic Daily ROI";
    if (t === "FD_ROI" || t === "FD_DAILY_ROI") return "FD Daily ROI";
    if (t === "DIRECT_REFERRAL") return "Direct Referral Bonus";
    if (t === "BASIC_LEVEL_INCOME") return "Basic Level Bonus";
    if (t === "FD_DIRECT_REFERRAL") return "FD Referral Bonus";
    if (t === "FD_LEVEL_INCOME") return "FD Level Bonus";
    if (t === "SIGNUP_BONUS") return "Signup Bonus";
    if (t === "DEPOSIT_APPROVED") return "Deposit Approved";
    if (t === "PACKAGE_PURCHASE") return "Package Activation";
    if (t === "FUND_TRANSFER_SENT") return "P2P Transfer Sent";
    if (t === "FUND_TRANSFER_RECEIVED") return "P2P Transfer Received";
    if (t === "SWIPE_FUND_CREDITED") return "Swipe Inflow";
    if (t === "SWIPE_INCOME_TO_FUND") return "Swipe to Fund";
    if (t === "WITHDRAWAL_REQUEST") return "Withdrawal";
    return type || "Transaction";
  };

  // Filter Handlers
  const handleSearch = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    setCurrentPage(1);
  };

  // -------------------------------------------------------------
  // 1. DAILY INCOME AGGREGATION
  // -------------------------------------------------------------
  const dailyData = useMemo(() => {
    const incomeEntries = ledger.filter((entry) => {
      const isIncomeWallet = entry.wallet === "INCOME";
      const isCredit = num(entry.amount) > 0;
      const type = String(entry.type || "").toUpperCase();
      const isIncomeType =
        type.includes("ROI") ||
        type.includes("REFERRAL") ||
        type.includes("LEVEL") ||
        type.includes("BONUS");
      return (isIncomeWallet && isCredit) || isIncomeType;
    });

    const dayMap = new Map<
      string,
      {
        date: string;
        roi: number;
        referral: number;
        level: number;
        other: number;
        total: number;
        items: any[];
      }
    >();

    for (const item of incomeEntries) {
      const dStr = formatDate(item.createdAt);
      if (!dayMap.has(dStr)) {
        dayMap.set(dStr, {
          date: dStr,
          roi: 0,
          referral: 0,
          level: 0,
          other: 0,
          total: 0,
          items: [],
        });
      }

      const dayObj = dayMap.get(dStr)!;
      const amt = num(item.amount);
      const type = String(item.type || "").toUpperCase();

      if (type.includes("ROI")) {
        dayObj.roi += amt;
      } else if (type.includes("REFERRAL")) {
        dayObj.referral += amt;
      } else if (type.includes("LEVEL")) {
        dayObj.level += amt;
      } else {
        dayObj.other += amt;
      }
      dayObj.total += amt;
      dayObj.items.push(item);
    }

    let arr = Array.from(dayMap.values());

    // Date range filter
    if (appliedFrom) {
      arr = arr.filter((d) => d.date >= appliedFrom);
    }
    if (appliedTo) {
      arr = arr.filter((d) => d.date <= appliedTo);
    }

    return arr.sort((a, b) => {
      if (sortField === "total") {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      }
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [ledger, appliedFrom, appliedTo, sortField, sortOrder]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = dailyData.find((d) => d.date === todayStr);
  const todayIncome = todayEntry ? todayEntry.total : 0;
  const peakDayIncome = dailyData.reduce((max, d) => Math.max(max, d.total), 0);
  const totalDailyIncome = dailyData.reduce((sum, d) => sum + d.total, 0);

  // -------------------------------------------------------------
  // 2. MONTHLY INCOME AGGREGATION
  // -------------------------------------------------------------
  const monthlyData = useMemo(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const monthMap = new Map<
      string,
      {
        key: string;
        label: string;
        year: number;
        month: number;
        roi: number;
        referral: number;
        level: number;
        total: number;
        txCount: number;
      }
    >();

    for (const day of dailyData) {
      const parts = day.date.split("-");
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const monthNum = parseInt(parts[1], 10);
        const key = `${year}-${String(monthNum).padStart(2, "0")}`;

        if (!monthMap.has(key)) {
          monthMap.set(key, {
            key,
            label: `${monthNames[monthNum - 1] || "Month"} ${year}`,
            year,
            month: monthNum,
            roi: 0,
            referral: 0,
            level: 0,
            total: 0,
            txCount: 0,
          });
        }

        const mObj = monthMap.get(key)!;
        mObj.roi += day.roi;
        mObj.referral += day.referral;
        mObj.level += day.level;
        mObj.total += day.total;
        mObj.txCount += day.items.length;
      }
    }

    return Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [dailyData]);

  const currentMonthKey = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;
  const currentMonthObj = monthlyData.find((m) => m.key === currentMonthKey);
  const currentMonthIncome = currentMonthObj ? currentMonthObj.total : 0;
  const bestMonthIncome = monthlyData.reduce((max, m) => Math.max(max, m.total), 0);

  // -------------------------------------------------------------
  // 3. FUND WALLET SUMMARY
  // -------------------------------------------------------------
  const fundEntries = useMemo(() => {
    let entries = ledger.filter((item) => item.wallet === "FUND");

    if (entries.length === 0 && deposits.length > 0) {
      entries = deposits.map((d: any) => ({
        id: d.id,
        createdAt: d.createdAt,
        wallet: "FUND",
        type: "DEPOSIT_APPROVED",
        description: `Deposit via ${d.network || "USDT"} (${d.status})`,
        amount: d.amountUsdt || d.amountInUsdt || num(d.amountInInr) / 110,
        balanceAfter: d.amountUsdt || d.amountInUsdt || num(d.amountInInr) / 110,
        status: d.status,
      }));
    }

    if (appliedFrom) {
      const fromT = new Date(appliedFrom).getTime();
      entries = entries.filter((e) => new Date(e.createdAt).getTime() >= fromT);
    }
    if (appliedTo) {
      const toDateObj = new Date(appliedTo);
      toDateObj.setHours(23, 59, 59, 999);
      entries = entries.filter((e) => new Date(e.createdAt).getTime() <= toDateObj.getTime());
    }

    if (walletFilter === "CREDIT") {
      entries = entries.filter((e) => num(e.amount) > 0);
    } else if (walletFilter === "DEBIT") {
      entries = entries.filter((e) => num(e.amount) < 0);
    }

    return entries.sort((a, b) => {
      if (sortField === "amount") {
        return sortOrder === "asc"
          ? num(a.amount) - num(b.amount)
          : num(b.amount) - num(a.amount);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ledger, deposits, appliedFrom, appliedTo, walletFilter, sortField, sortOrder]);

  const fundCredits = fundEntries
    .filter((e) => num(e.amount) > 0)
    .reduce((acc, e) => acc + num(e.amount), 0);
  const fundDebits = fundEntries
    .filter((e) => num(e.amount) < 0)
    .reduce((acc, e) => acc + Math.abs(num(e.amount)), 0);

  // -------------------------------------------------------------
  // 4. INCOME WALLET SUMMARY
  // -------------------------------------------------------------
  const incomeEntries = useMemo(() => {
    let entries = ledger.filter((item) => item.wallet === "INCOME");

    const hasWithdrawalLedger = entries.some((e) =>
      String(e.type).toUpperCase().includes("WITHDRAW")
    );
    if (!hasWithdrawalLedger && withdrawals.length > 0) {
      const wEntries = withdrawals.map((w: any) => ({
        id: w.id,
        createdAt: w.createdAt,
        wallet: "INCOME",
        type: "WITHDRAWAL_REQUEST",
        description: `Withdrawal to ${
          w.usdtAddress ? w.usdtAddress.slice(0, 8) + "..." : "Wallet"
        } (${w.status})`,
        amount: -Math.abs(num(w.amountUsdt || w.amountInUsdt || num(w.amountInInr) / 110)),
        balanceAfter: 0,
        status: w.status,
      }));
      entries = [...entries, ...wEntries];
    }

    if (appliedFrom) {
      const fromT = new Date(appliedFrom).getTime();
      entries = entries.filter((e) => new Date(e.createdAt).getTime() >= fromT);
    }
    if (appliedTo) {
      const toDateObj = new Date(appliedTo);
      toDateObj.setHours(23, 59, 59, 999);
      entries = entries.filter((e) => new Date(e.createdAt).getTime() <= toDateObj.getTime());
    }

    if (walletFilter === "CREDIT") {
      entries = entries.filter((e) => num(e.amount) > 0);
    } else if (walletFilter === "DEBIT") {
      entries = entries.filter((e) => num(e.amount) < 0);
    }

    return entries.sort((a, b) => {
      if (sortField === "amount") {
        return sortOrder === "asc"
          ? num(a.amount) - num(b.amount)
          : num(b.amount) - num(a.amount);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ledger, withdrawals, appliedFrom, appliedTo, walletFilter, sortField, sortOrder]);

  const incomeCredits = incomeEntries
    .filter((e) => num(e.amount) > 0)
    .reduce((acc, e) => acc + num(e.amount), 0);

  // -------------------------------------------------------------
  // 5. ACCOUNT STATEMENT (ALL LEDGERS)
  // -------------------------------------------------------------
  const statementEntries = useMemo(() => {
    let list = ledger;
    if (appliedFrom) {
      const fromT = new Date(appliedFrom).getTime();
      list = list.filter((e) => new Date(e.createdAt).getTime() >= fromT);
    }
    if (appliedTo) {
      const toDateObj = new Date(appliedTo);
      toDateObj.setHours(23, 59, 59, 999);
      list = list.filter((e) => new Date(e.createdAt).getTime() <= toDateObj.getTime());
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [ledger, appliedFrom, appliedTo]);

  // -------------------------------------------------------------
  // 6. PACKAGE HISTORY
  // -------------------------------------------------------------
  const packageEntries = useMemo(() => {
    let list = contracts;
    if (appliedFrom) {
      const fromT = new Date(appliedFrom).getTime();
      list = list.filter((c) => new Date(c.createdAt).getTime() >= fromT);
    }
    if (appliedTo) {
      const toDateObj = new Date(appliedTo);
      toDateObj.setHours(23, 59, 59, 999);
      list = list.filter((c) => new Date(c.createdAt).getTime() <= toDateObj.getTime());
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contracts, appliedFrom, appliedTo]);

  // Titles and icons
  const titles: Record<
    ReportType,
    { title: string; cardTitle: string; subtitle: string; icon: any; totalBadge: string }
  > = {
    daily: {
      title: "Daily Income Report",
      cardTitle: "Daily Income Records",
      subtitle: "Day-by-day distribution of your Daily ROI, Referral Bonus & 12-Level Royalties",
      icon: Calendar,
      totalBadge: `Total : ${totalDailyIncome.toFixed(2)}`,
    },
    monthly: {
      title: "Monthly Income Report",
      cardTitle: "Monthly Consolidated Statements",
      subtitle: "Month-on-month consolidated earnings across all active revenue streams",
      icon: TrendingUp,
      totalBadge: `Total : ${totalDailyIncome.toFixed(2)}`,
    },
    "fund-wallet": {
      title: "Fund Wallet Summary",
      cardTitle: "Fund Wallet Ledger",
      subtitle: "Complete audit ledger of recharge deposits, package investments & P2P transfers",
      icon: Wallet,
      totalBadge: `Balance : ${num(user?.fundBalance).toFixed(2)}`,
    },
    "income-wallet": {
      title: "Income Wallet Summary",
      cardTitle: "Income Wallet Ledger",
      subtitle: "Statement of all credited profits, withdrawals, and swipe conversions",
      icon: Banknote,
      totalBadge: `Total : ${incomeCredits.toFixed(2)}`,
    },
    statement: {
      title: "Account Statement",
      cardTitle: "Combined Account Ledger",
      subtitle: "Full historical ledger of all transactions across both Fund & Income wallets",
      icon: FileText,
      totalBadge: `Entries : ${statementEntries.length}`,
    },
    packages: {
      title: "Package History",
      cardTitle: "Active & Completed Contracts",
      subtitle: "Complete list of active and completed investment contracts and progress",
      icon: Layers,
      totalBadge: `Contracts : ${packageEntries.length}`,
    },
  };

  const currentConfig = titles[reportType] || titles.daily;
  const HeaderIcon = currentConfig.icon;

  // Active dataset for current report type
  const currentDataset = useMemo(() => {
    switch (reportType) {
      case "daily":
        return dailyData;
      case "monthly":
        return monthlyData;
      case "fund-wallet":
        return fundEntries;
      case "income-wallet":
        return incomeEntries;
      case "statement":
        return statementEntries;
      case "packages":
        return packageEntries;
      default:
        return [];
    }
  }, [
    reportType,
    dailyData,
    monthlyData,
    fundEntries,
    incomeEntries,
    statementEntries,
    packageEntries,
  ]);

  // Paginated records
  const totalItems = currentDataset.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedData = currentDataset.slice(startIndex, startIndex + pageSize);

  // Sorting helper
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export Columns based on active report type
  const exportColumns = useMemo<ExportColumn[]>(() => {
    switch (reportType) {
      case "daily":
        return [
          { header: "SR", key: "sr", format: (_: any, i?: number) => String((i ?? 0) + 1) },
          { header: "DATE", key: "date", format: (r: any) => r.date },
          { header: "DAILY ROI", key: "roi", format: (r: any) => r.roi.toFixed(2) },
          { header: "REFERRAL BONUS", key: "referral", format: (r: any) => r.referral.toFixed(2) },
          { header: "LEVEL BONUS", key: "level", format: (r: any) => r.level.toFixed(2) },
          { header: "TOTAL EARNED", key: "total", format: (r: any) => r.total.toFixed(2) },
          { header: "ENTRIES", key: "entries", format: (r: any) => String(r.items?.length || 0) },
          { header: "STATUS", key: "status", format: () => "Credited" },
        ];
      case "monthly":
        return [
          { header: "SR", key: "sr", format: (_: any, i?: number) => String((i ?? 0) + 1) },
          { header: "MONTH", key: "label", format: (r: any) => r.label },
          { header: "ROI PROFIT", key: "roi", format: (r: any) => r.roi.toFixed(2) },
          { header: "REFERRAL BONUS", key: "referral", format: (r: any) => r.referral.toFixed(2) },
          { header: "LEVEL BONUS", key: "level", format: (r: any) => r.level.toFixed(2) },
          { header: "TOTAL MONTHLY INCOME", key: "total", format: (r: any) => r.total.toFixed(2) },
          { header: "TRANSACTIONS", key: "txCount", format: (r: any) => String(r.txCount || 0) },
          { header: "STATUS", key: "status", format: () => "Processed" },
        ];
      case "fund-wallet":
      case "income-wallet":
        return [
          { header: "SR", key: "sr", format: (_: any, i?: number) => String((i ?? 0) + 1) },
          { header: "DATE & TIME", key: "createdAt", format: (r: any) => formatDateTime(r.createdAt) },
          { header: "TRANSACTION TYPE", key: "type", format: (r: any) => formatTxType(r.type) },
          { header: "TYPE", key: "cr_dr", format: (r: any) => (num(r.amount) >= 0 ? "CR" : "DR") },
          { header: "AMOUNT (USDT)", key: "amount", format: (r: any) => num(r.amount).toFixed(2) },
          { header: "BALANCE AFTER", key: "balanceAfter", format: (r: any) => num(r.balanceAfter).toFixed(2) },
          { header: "DESCRIPTION", key: "description", format: (r: any) => r.description || "-" },
          { header: "STATUS", key: "status", format: () => "Completed" },
        ];
      case "statement":
        return [
          { header: "SR", key: "sr", format: (_: any, i?: number) => String((i ?? 0) + 1) },
          { header: "DATE", key: "createdAt", format: (r: any) => formatDate(r.createdAt) },
          { header: "WALLET", key: "wallet", format: (r: any) => r.wallet },
          { header: "TYPE", key: "type", format: (r: any) => formatTxType(r.type) },
          { header: "DESCRIPTION", key: "description", format: (r: any) => r.description || "-" },
          { header: "AMOUNT (USDT)", key: "amount", format: (r: any) => num(r.amount).toFixed(2) },
          { header: "BALANCE AFTER", key: "balanceAfter", format: (r: any) => num(r.balanceAfter).toFixed(2) },
        ];
      case "packages":
        return [
          { header: "SR", key: "sr", format: (_: any, i?: number) => String((i ?? 0) + 1) },
          { header: "DATE", key: "createdAt", format: (r: any) => formatDate(r.createdAt) },
          {
            header: "PACKAGE",
            key: "packageType",
            format: (r) =>
              r.packageType === "BASIC_SAVING"
                ? "Basic Saving (5% Daily)"
                : "Fix Deposit (15% Daily)",
          },
          {
            header: "AMOUNT (USDT)",
            key: "amountInUsdt",
            format: (r) =>
              Number(
                r.amountInUsdt != null
                  ? r.amountInUsdt
                  : num(r.amountInInr) > 5000
                  ? num(r.amountInInr) / 110
                  : num(r.amountInInr)
              ).toFixed(2),
          },
          { header: "DAILY RATE", key: "dailyRoiRate", format: (r) => `${r.dailyRoiRate}% Daily` },
          { header: "PROGRESS", key: "progress", format: (r) => `${r.daysPaid} / ${r.tenureDays} Days` },
          { header: "STATUS", key: "status", format: (r) => r.status },
        ];
      default:
        return [];
    }
  }, [reportType]);

  // Export handlers
  const handleCopy = async () => {
    const success = await copyTableToClipboard(exportColumns, currentDataset);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExcel = () => {
    exportToExcel(currentConfig.title, exportColumns, currentDataset);
  };

  const handlePdf = () => {
    printOrExportPdf(
      currentConfig.title,
      exportColumns,
      currentDataset,
      currentConfig.totalBadge,
      user?.fullName || user?.customId
    );
  };

  const handlePrint = () => {
    printOrExportPdf(
      currentConfig.title,
      exportColumns,
      currentDataset,
      currentConfig.totalBadge,
      user?.fullName || user?.customId
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#17274a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <HeaderIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-display">
              {currentConfig.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentConfig.subtitle}</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>📊 Reports</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-semibold">{currentConfig.title}</span>
        </div>
      </div>

      {/* 2. Main Card Container with Total Badge */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Card Header (India Finance style with Red Total Badge) */}
        <div className="flex items-center justify-between gap-3 border-b border-[#152342] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-blue-500 rounded-sm" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              {currentConfig.cardTitle}
            </h2>
          </div>

          {/* Red/Rose Total Badge */}
          <span className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-rose-500/20 transition-all">
            {currentConfig.totalBadge}
          </span>
        </div>

        {/* Optional Sub-filter tabs for Fund & Income Wallets */}
        {(reportType === "fund-wallet" || reportType === "income-wallet") && (
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => {
                setWalletFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                walletFilter === "ALL"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletFilter("CREDIT");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                walletFilter === "CREDIT"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Credits (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletFilter("DEBIT");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                walletFilter === "DEBIT"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Debits (-)
            </button>
          </div>
        )}

        {/* 3. Toolbar: Date Pickers + Search/Reset/Refresh + Entries dropdown + Copy/Excel/PDF/Print */}
        <TableExportToolbar
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onSearch={handleSearch}
          onReset={handleReset}
          onRefresh={onRefresh}
          pageSize={pageSize}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onCopy={handleCopy}
          onExcel={handleExcel}
          onPdf={handlePdf}
          onPrint={handlePrint}
          isCopied={isCopied}
        />

        {/* 4. Table Views */}
        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              {/* Daily Table Header */}
              {reportType === "daily" && (
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th
                    onClick={() => handleSort("date")}
                    className="py-3 px-4 cursor-pointer select-none hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">DAILY ROI</th>
                  <th className="py-3 px-4 text-right">REFERRAL BONUS</th>
                  <th className="py-3 px-4 text-right">LEVEL BONUS</th>
                  <th
                    onClick={() => handleSort("total")}
                    className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>TOTAL EARNED</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">ENTRIES</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              )}

              {/* Monthly Table Header */}
              {reportType === "monthly" && (
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">MONTH</th>
                  <th className="py-3 px-4 text-right">ROI PROFIT</th>
                  <th className="py-3 px-4 text-right">REFERRAL BONUS</th>
                  <th className="py-3 px-4 text-right">LEVEL BONUS</th>
                  <th className="py-3 px-4 text-right">TOTAL MONTHLY INCOME</th>
                  <th className="py-3 px-4 text-center">TRANSACTIONS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              )}

              {/* Fund or Income Wallet Table Header */}
              {(reportType === "fund-wallet" || reportType === "income-wallet") && (
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE & TIME</th>
                  <th className="py-3 px-4">TRANSACTION TYPE</th>
                  <th className="py-3 px-4 text-center">TYPE</th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>AMOUNT (USDT)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">BALANCE AFTER</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              )}

              {/* Statement Header */}
              {reportType === "statement" && (
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">WALLET</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4 text-right">AMOUNT</th>
                  <th className="py-3 px-4 text-right">BALANCE AFTER</th>
                </tr>
              )}

              {/* Packages Header */}
              {reportType === "packages" && (
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">PACKAGE</th>
                  <th className="py-3 px-4 text-right">AMOUNT (USDT)</th>
                  <th className="py-3 px-4 text-center">DAILY RATE</th>
                  <th className="py-3 px-4 text-center">PROGRESS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-[#132042]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    No records found for {currentConfig.title}.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row: any, idx: number) => {
                  const absoluteIndex = startIndex + idx + 1;

                  // Daily Row
                  if (reportType === "daily") {
                    const isExpanded = expandedRow === row.date;
                    return (
                      <React.Fragment key={row.date}>
                        <tr className="hover:bg-[#0c1630] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{absoluteIndex}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {row.date}
                            {row.date === todayStr && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                TODAY
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                            +${row.roi.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-amber-400">
                            +${row.referral.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-cyan-400">
                            +${row.level.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                            +${row.total.toFixed(2)} USDT
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-medium">
                              {row.items?.length || 0} records
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              Credited
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedRow(isExpanded ? null : row.date)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>Close <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>Details <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan={9} className="p-4">
                              <div className="bg-[#070e20] border border-slate-800/80 rounded-xl p-3 space-y-2">
                                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  Transactions on {row.date}
                                </div>
                                <div className="space-y-1.5">
                                  {row.items?.map((item: any, iIdx: number) => (
                                    <div
                                      key={item.id || iIdx}
                                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800/50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-slate-500">
                                          {formatDateTime(item.createdAt).slice(11)}
                                        </span>
                                        <span className="font-semibold text-slate-200">
                                          {formatTxType(item.type)}
                                        </span>
                                        <span className="text-slate-400 text-[11px]">
                                          - {item.description}
                                        </span>
                                      </div>
                                      <span className="font-bold text-emerald-400">
                                        +${num(item.amount).toFixed(2)} USDT
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }

                  // Monthly Row
                  if (reportType === "monthly") {
                    return (
                      <tr key={row.key} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{absoluteIndex}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-100 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          {row.label}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                          +${row.roi.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-amber-400">
                          +${row.referral.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-cyan-400">
                          +${row.level.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                          +${row.total.toFixed(2)} USDT
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-medium">
                            {row.txCount} entries
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Processed
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  // Fund & Income Wallet Row
                  if (reportType === "fund-wallet" || reportType === "income-wallet") {
                    const isCredit = num(row.amount) >= 0;
                    return (
                      <tr key={row.id || idx} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{absoluteIndex}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {formatDateTime(row.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">
                          {formatTxType(row.type)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCredit
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-950/80 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {isCredit ? "CR" : "DR"}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold text-sm ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? "+" : ""}${Number(row.amount).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          ${Number(row.balanceAfter || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-[240px] truncate">
                          {row.description || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  // Statement Row
                  if (reportType === "statement") {
                    return (
                      <tr key={row.id || idx} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{absoluteIndex}</td>
                        <td className="py-3 px-4">{formatDate(row.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.wallet === "FUND"
                                ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {row.wallet}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {formatTxType(row.type)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-[220px]">
                          {row.description}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            Number(row.amount) >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {Number(row.amount) >= 0 ? "+" : ""}${Number(row.amount).toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          ${Number(row.balanceAfter).toFixed(2)} USDT
                        </td>
                      </tr>
                    );
                  }

                  // Package Row
                  if (reportType === "packages") {
                    const usdtVal =
                      row.amountInUsdt != null
                        ? Number(row.amountInUsdt)
                        : Number(row.amountInInr || 0) > 5000
                        ? Number(row.amountInInr) / 110
                        : Number(row.amountInInr || 0);
                    return (
                      <tr key={row.id || idx} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{absoluteIndex}</td>
                        <td className="py-3 px-4">{formatDate(row.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-slate-100">
                          {row.packageType === "BASIC_SAVING"
                            ? "Basic Saving (5% Daily)"
                            : "Fix Deposit (15% Daily)"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-200">
                          ${usdtVal.toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                          {Number(row.dailyRoiRate)}% Daily
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300 font-mono">
                          {row.daysPaid} / {row.tenureDays} Days
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === "ACTIVE"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                                : "bg-blue-950/60 text-blue-400 border border-blue-500/40"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  return null;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="px-3 py-1 font-semibold text-slate-300">
                {validCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
