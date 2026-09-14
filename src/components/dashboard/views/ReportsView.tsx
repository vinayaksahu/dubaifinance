"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  Wallet,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Package,
  Landmark,
  ShieldCheck,
} from "lucide-react";

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
}

export function ReportsView({ user, reportType }: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const ledger: any[] = user?.ledgerEntries || user?.ledgers || [];
  const contracts: any[] = user?.contracts || [];
  const deposits: any[] = user?.deposits || [];
  const withdrawals: any[] = user?.withdrawals || [];

  // Helper to format date
  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toISOString().split("T")[0];
  };

  const formatDateTime = (dateStr: string | Date) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return `${d.toISOString().split("T")[0]} ${d.toTimeString().slice(0, 5)}`;
  };

  // Helper for numeric amounts
  const num = (v: any) => Number(v || 0);

  // -------------------------------------------------------------
  // 1. DAILY INCOME AGGREGATION
  // -------------------------------------------------------------
  const dailyData = useMemo(() => {
    // Filter income ledger entries
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

    const arr = Array.from(dayMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return arr;
  }, [ledger]);

  // Daily summary stats
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
      "July", "August", "September", "October", "November", "December"
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

    return Array.from(monthMap.values()).sort(
      (a, b) => b.key.localeCompare(a.key)
    );
  }, [dailyData]);

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const currentMonthObj = monthlyData.find((m) => m.key === currentMonthKey);
  const currentMonthIncome = currentMonthObj ? currentMonthObj.total : 0;
  const bestMonthIncome = monthlyData.reduce((max, m) => Math.max(max, m.total), 0);

  // -------------------------------------------------------------
  // 3. FUND WALLET SUMMARY
  // -------------------------------------------------------------
  const fundEntries = useMemo(() => {
    // Ledger entries where wallet === 'FUND'
    let entries = ledger.filter((item) => item.wallet === "FUND");

    // If no fund ledger entries exist, fallback to user deposits as credits
    if (entries.length === 0 && deposits.length > 0) {
      entries = deposits.map((d: any) => ({
        id: d.id,
        createdAt: d.createdAt,
        wallet: "FUND",
        type: "DEPOSIT_APPROVED",
        description: `Deposit via ${d.network || "USDT"} (${d.status})`,
        amount: d.amountUsdt || d.amountInUsdt || (num(d.amountInInr) / 110),
        balanceAfter: d.amountUsdt || d.amountInUsdt || (num(d.amountInInr) / 110),
        status: d.status,
      }));
    }

    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [ledger, deposits]);

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

    // If withdrawals exist and not in ledger, include them
    const hasWithdrawalLedger = entries.some((e) =>
      String(e.type).toUpperCase().includes("WITHDRAW")
    );
    if (!hasWithdrawalLedger && withdrawals.length > 0) {
      const wEntries = withdrawals.map((w: any) => ({
        id: w.id,
        createdAt: w.createdAt,
        wallet: "INCOME",
        type: "WITHDRAWAL_REQUEST",
        description: `Withdrawal to ${w.usdtAddress ? w.usdtAddress.slice(0, 8) + "..." : "Wallet"} (${w.status})`,
        amount: -Math.abs(num(w.amountUsdt || w.amountInUsdt || (num(w.amountInInr) / 110))),
        balanceAfter: 0,
        status: w.status,
      }));
      entries = [...entries, ...wEntries];
    }

    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [ledger, withdrawals]);

  const incomeCredits = incomeEntries
    .filter((e) => num(e.amount) > 0)
    .reduce((acc, e) => acc + num(e.amount), 0);
  const incomeDebits = incomeEntries
    .filter((e) => num(e.amount) < 0)
    .reduce((acc, e) => acc + Math.abs(num(e.amount)), 0);

  // Filtered daily search
  const filteredDaily = useMemo(() => {
    return dailyData.filter((d) =>
      searchTerm ? d.date.includes(searchTerm) : true
    );
  }, [dailyData, searchTerm]);

  // Filtered Fund entries
  const filteredFund = useMemo(() => {
    return fundEntries.filter((e) => {
      const matchesSearch = searchTerm
        ? (e.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(e.createdAt).includes(searchTerm)
        : true;
      if (!matchesSearch) return false;
      if (filterType === "CREDIT") return num(e.amount) > 0;
      if (filterType === "DEBIT") return num(e.amount) < 0;
      return true;
    });
  }, [fundEntries, searchTerm, filterType]);

  // Filtered Income entries
  const filteredIncome = useMemo(() => {
    return incomeEntries.filter((e) => {
      const matchesSearch = searchTerm
        ? (e.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(e.createdAt).includes(searchTerm)
        : true;
      if (!matchesSearch) return false;
      if (filterType === "CREDIT") return num(e.amount) > 0;
      if (filterType === "DEBIT") return num(e.amount) < 0;
      return true;
    });
  }, [incomeEntries, searchTerm, filterType]);

  // Helper to format ledger type nicely
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

  // -------------------------------------------------------------
  // RENDER CONFIGURATION BASED ON REPORT TYPE
  // -------------------------------------------------------------
  const titles: Record<ReportType, { title: string; subtitle: string; icon: any }> = {
    daily: {
      title: "Daily Income Report",
      subtitle: "Day-by-day distribution of your Daily ROI, Referral Bonus & 12-Level Royalties",
      icon: Calendar,
    },
    monthly: {
      title: "Monthly Income Report",
      subtitle: "Month-on-month consolidated earnings across all active revenue streams",
      icon: TrendingUp,
    },
    "fund-wallet": {
      title: "Fund Wallet Summary",
      subtitle: "Complete audit ledger of recharge deposits, package investments & P2P transfers",
      icon: Wallet,
    },
    "income-wallet": {
      title: "Income Wallet Summary",
      subtitle: "Statement of all credited profits, withdrawals, and swipe conversions",
      icon: Banknote,
    },
    statement: {
      title: "Account Statement",
      subtitle: "Full historical ledger of all transactions across both Fund & Income wallets",
      icon: FileText,
    },
    packages: {
      title: "Package History",
      subtitle: "Complete list of active and completed investment contracts and progress",
      icon: Layers,
    },
  };

  const currentConfig = titles[reportType] || titles.daily;
  const HeaderIcon = currentConfig.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#17274a]">
        <div>
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
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>📊 Reports</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-semibold">{currentConfig.title}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DAILY INCOME REPORT VIEW */}
      {/* ========================================================= */}
      {reportType === "daily" && (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Today&apos;s Income
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ${todayIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Date: {todayStr}</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Active Earning Days
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                {dailyData.length} <span className="text-xs text-slate-400 font-normal">Days</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">With positive payout</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Peak Day Earning
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 block">
                ${peakDayIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Highest single day</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Accrued
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                ${totalDailyIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Cumulative profits</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-amber-500 rounded-sm" />
                <h2 className="text-lg font-bold text-slate-100">Daily Earning Breakdown</h2>
                <span className="text-xs text-slate-400 ml-1">({filteredDaily.length} Days)</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Date (YYYY-MM)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#152342]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                  <tr>
                    <th className="py-3 px-4">SR</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4 text-right">DAILY ROI</th>
                    <th className="py-3 px-4 text-right">REFERRAL BONUS</th>
                    <th className="py-3 px-4 text-right">LEVEL BONUS</th>
                    <th className="py-3 px-4 text-right">TOTAL EARNED</th>
                    <th className="py-3 px-4 text-center">ENTRIES</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                    <th className="py-3 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132042]">
                  {filteredDaily.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                        No daily income records found. Activate packages or earn team bonuses to see daily reports.
                      </td>
                    </tr>
                  ) : (
                    filteredDaily.map((d, idx) => {
                      const isExpanded = expandedRow === d.date;
                      return (
                        <React.Fragment key={d.date}>
                          <tr className="hover:bg-[#0c1630] transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              {d.date}
                              {d.date === todayStr && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                  TODAY
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                              +${d.roi.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-amber-400">
                              +${d.referral.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-cyan-400">
                              +${d.level.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                              +${d.total.toFixed(2)} USDT
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-medium">
                                {d.items.length} records
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
                                onClick={() => setExpandedRow(isExpanded ? null : d.date)}
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

                          {/* Expanded Items for that date */}
                          {isExpanded && (
                            <tr className="bg-slate-950/60">
                              <td colSpan={9} className="p-4">
                                <div className="bg-[#070e20] border border-slate-800/80 rounded-xl p-3 space-y-2">
                                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    Detailed Transactions on {d.date}
                                  </div>
                                  <div className="space-y-1.5">
                                    {d.items.map((item, iIdx) => (
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
                                          +${num(item.amount).toFixed(4)} USDT
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. MONTHLY INCOME REPORT VIEW */}
      {/* ========================================================= */}
      {reportType === "monthly" && (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Current Month
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ${currentMonthIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Active month revenue</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Best Month
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                ${bestMonthIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">All-time record</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Active Months
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 block">
                {monthlyData.length} <span className="text-xs text-slate-400 font-normal">Months</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Earning history span</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Lifetime Total
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                ${totalDailyIncome.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Total credited earnings</span>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-amber-500 rounded-sm" />
              <h2 className="text-lg font-bold text-slate-100">Monthly Consolidated Statements</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#152342]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
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
                </thead>
                <tbody className="divide-y divide-[#132042]">
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        No monthly records found yet.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.map((m, idx) => (
                      <tr key={m.key} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-100 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          {m.label}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                          +${m.roi.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-amber-400">
                          +${m.referral.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-cyan-400">
                          +${m.level.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                          +${m.total.toFixed(2)} USDT
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-medium">
                            {m.txCount} entries
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Processed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 3. FUND WALLET SUMMARY VIEW */}
      {/* ========================================================= */}
      {reportType === "fund-wallet" && (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Current Fund Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                ${num(user?.fundBalance).toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Ready for investment</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Inflow (Deposits)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                +${fundCredits.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Credits & Swipes in</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Outflow (Used)
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
                -${fundDebits.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Purchases & P2P sent</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Operations
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-200 mt-1 block">
                {fundEntries.length} <span className="text-xs text-slate-400 font-normal">Txs</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Fund ledger records</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-amber-500 rounded-sm" />
                <h2 className="text-lg font-bold text-slate-100">Fund Wallet Ledger</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Filter tabs */}
                <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFilterType("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "ALL"
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("CREDIT")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "CREDIT"
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Credits (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("DEBIT")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "DEBIT"
                        ? "bg-rose-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Debits (-)
                  </button>
                </div>

                <div className="relative w-48 hidden sm:block">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#152342]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                  <tr>
                    <th className="py-3 px-4">SR</th>
                    <th className="py-3 px-4">DATE & TIME</th>
                    <th className="py-3 px-4">TRANSACTION TYPE</th>
                    <th className="py-3 px-4 text-center">TYPE</th>
                    <th className="py-3 px-4 text-right">AMOUNT (USDT)</th>
                    <th className="py-3 px-4 text-right">BALANCE AFTER</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132042]">
                  {filteredFund.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        No transactions found in Fund Wallet.
                      </td>
                    </tr>
                  ) : (
                    filteredFund.map((item, idx) => {
                      const isCredit = num(item.amount) >= 0;
                      return (
                        <tr key={item.id || idx} className="hover:bg-[#0c1630] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-100">
                            {formatTxType(item.type)}
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
                            {isCredit ? "+" : ""}${Number(item.amount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            ${Number(item.balanceAfter || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-[240px] truncate">
                            {item.description || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              Completed
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 4. INCOME WALLET SUMMARY VIEW */}
      {/* ========================================================= */}
      {reportType === "income-wallet" && (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Current Income Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ${num(user?.incomeBalance).toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Withdrawable profits</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Incomes Credited
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                +${incomeCredits.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">ROI + Level + Referral</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Withdrawn
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
                -${num(user?.totalWithdrawn).toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Dispatched to wallet</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                Total Operations
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 block">
                {incomeEntries.length} <span className="text-xs text-slate-400 font-normal">Records</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Income ledger history</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-amber-500 rounded-sm" />
                <h2 className="text-lg font-bold text-slate-100">Income Wallet Ledger</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFilterType("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "ALL"
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("CREDIT")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "CREDIT"
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Earnings (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("DEBIT")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterType === "DEBIT"
                        ? "bg-rose-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Payouts & Swipes (-)
                  </button>
                </div>

                <div className="relative w-48 hidden sm:block">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#152342]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                  <tr>
                    <th className="py-3 px-4">SR</th>
                    <th className="py-3 px-4">DATE & TIME</th>
                    <th className="py-3 px-4">INCOME / EVENT TYPE</th>
                    <th className="py-3 px-4 text-center">TYPE</th>
                    <th className="py-3 px-4 text-right">AMOUNT (USDT)</th>
                    <th className="py-3 px-4 text-right">BALANCE AFTER</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132042]">
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        No transactions found in Income Wallet.
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((item, idx) => {
                      const isCredit = num(item.amount) >= 0;
                      return (
                        <tr key={item.id || idx} className="hover:bg-[#0c1630] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-100">
                            {formatTxType(item.type)}
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
                            {isCredit ? "+" : ""}${Number(item.amount).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            ${Number(item.balanceAfter || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-[240px] truncate">
                            {item.description || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              Credited
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. ACCOUNT STATEMENT (ALL LEDGERS) */}
      {/* ========================================================= */}
      {reportType === "statement" && (
        <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-amber-500 rounded-sm" />
            <h2 className="text-lg font-bold text-slate-100">Combined Account Ledger</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#152342]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">WALLET</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4 text-right">AMOUNT</th>
                  <th className="py-3 px-4 text-right">BALANCE AFTER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132042]">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No ledger transactions found
                    </td>
                  </tr>
                ) : (
                  ledger.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-[#0c1630] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">{formatDate(item.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.wallet === "FUND"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {item.wallet}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{formatTxType(item.type)}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[220px]">
                        {item.description}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          Number(item.amount) >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {Number(item.amount) >= 0 ? "+" : ""}${Number(item.amount).toFixed(2)} USDT
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        ${Number(item.balanceAfter).toFixed(2)} USDT
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PACKAGE HISTORY */}
      {/* ========================================================= */}
      {reportType === "packages" && (
        <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-amber-500 rounded-sm" />
            <h2 className="text-lg font-bold text-slate-100">Active & Completed Contracts</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#152342]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">PACKAGE</th>
                  <th className="py-3 px-4 text-right">AMOUNT (USDT)</th>
                  <th className="py-3 px-4 text-center">DAILY RATE</th>
                  <th className="py-3 px-4 text-center">PROGRESS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132042]">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No package contracts found
                    </td>
                  </tr>
                ) : (
                  contracts.map((c: any, idx: number) => {
                    const usdtVal =
                      c.amountInUsdt != null
                        ? Number(c.amountInUsdt)
                        : Number(c.amountInInr || 0) > 5000
                        ? Number(c.amountInInr) / 110
                        : Number(c.amountInInr || 0);
                    return (
                      <tr key={c.id || idx} className="hover:bg-[#0c1630] transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">{formatDate(c.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-slate-100">
                          {c.packageType === "BASIC_SAVING" ? "Basic Saving (5% Daily)" : "Fix Deposit (15% Daily)"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-200">
                          ${usdtVal.toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                          {Number(c.dailyRoiRate)}% Daily
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300 font-mono">
                          {c.daysPaid} / {c.tenureDays} Days
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                                : "bg-blue-950/60 text-blue-400 border border-blue-500/40"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
