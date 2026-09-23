"use client";

import React, { useState, useMemo } from "react";
import {
  Gift,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Users,
  Sparkles,
} from "lucide-react";
import { TableExportToolbar } from "@/components/dashboard/TableExportToolbar";
import {
  copyTableToClipboard,
  exportToExcel,
  printOrExportPdf,
  ExportColumn,
} from "@/lib/exportUtils";

interface JoiningBonusViewProps {
  user: any;
  onRefresh?: () => void;
}

export function JoiningBonusView({ user, onRefresh }: JoiningBonusViewProps) {
  const ledger: any[] = user?.ledgerEntries || user?.ledgers || [];

  // Filter state
  const [filterCategory, setFilterCategory] = useState<"all" | "self" | "team">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<"sr" | "date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Date format helper
  const formatDateTime = (dateStr: string | Date) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const date = d.toISOString().split("T")[0];
    const time = d.toTimeString().slice(0, 8);
    return `${date} ${time}`;
  };

  // Extract all SIGNUP_BONUS entries from user ledger
  const allBonusEntries = useMemo(() => {
    return ledger
      .filter((entry: any) => String(entry.type || "").toUpperCase() === "SIGNUP_BONUS")
      .map((entry: any) => {
        const isTeam =
          Boolean(entry.levelNumber && Number(entry.levelNumber) > 0) ||
          Boolean(entry.referenceKey?.includes("SIGNUP_LEVEL_BONUS")) ||
          Boolean(entry.description?.toLowerCase().includes("level"));

        let memberCustomId = "-";
        if (entry.description) {
          const match = entry.description.match(/from\s+([A-Za-z0-9_]+)/i);
          if (match && match[1]) {
            memberCustomId = match[1];
          }
        }

        return {
          ...entry,
          category: isTeam ? "TEAM" : "SELF",
          levelNumber: entry.levelNumber || (isTeam ? 1 : null),
          memberCustomId,
          amountNum: Number(entry.amount || 0),
        };
      });
  }, [ledger]);

  // Aggregate stats
  const stats = useMemo(() => {
    let selfTotal = 0;
    let teamTotal = 0;

    for (const b of allBonusEntries) {
      if (b.category === "SELF") {
        selfTotal += b.amountNum;
      } else {
        teamTotal += b.amountNum;
      }
    }

    const totalJoiningBonus = selfTotal + teamTotal;

    // Check active package qualification ($20 criteria)
    const basicPkg = Number(user?.basicPackageTotal || 0);
    const fdPkg = Number(user?.fdPackageTotal || 0);
    const totalActivePkg = basicPkg + fdPkg;
    const isQualified = totalActivePkg >= 20.0;

    return {
      selfTotal,
      teamTotal,
      totalJoiningBonus: totalJoiningBonus > 0 ? totalJoiningBonus : Number(user?.incomeBreakdown?.joiningBonus || 0),
      totalActivePkg,
      isQualified,
    };
  }, [allBonusEntries, user]);

  // Filtered by applied date range & category
  const filteredEntries = useMemo(() => {
    let list = allBonusEntries;

    if (filterCategory === "self") {
      list = list.filter((e) => e.category === "SELF");
    } else if (filterCategory === "team") {
      list = list.filter((e) => e.category === "TEAM");
    }

    if (appliedFrom) {
      const fromTimestamp = new Date(appliedFrom).setHours(0, 0, 0, 0);
      list = list.filter((e: any) => new Date(e.createdAt).getTime() >= fromTimestamp);
    }
    if (appliedTo) {
      const toTimestamp = new Date(appliedTo).setHours(23, 59, 59, 999);
      list = list.filter((e: any) => new Date(e.createdAt).getTime() <= toTimestamp);
    }

    return list;
  }, [allBonusEntries, filterCategory, appliedFrom, appliedTo]);

  // Sort entries
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "amount") {
        comparison = a.amountNum - b.amountNum;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredEntries, sortField, sortOrder]);

  // Pagination calculation
  const totalRecords = sortedEntries.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedEntries = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedEntries.slice(start, start + pageSize);
  }, [sortedEntries, validCurrentPage, pageSize]);

  // Column definitions for export
  const exportColumns: ExportColumn[] = [
    {
      header: "SR",
      key: "sr",
      format: (_row: any, idx?: number) => String((idx ?? 0) + 1),
    },
    {
      header: "DATE & TIME",
      key: "createdAt",
      format: (row: any) => formatDateTime(row.createdAt),
    },
    {
      header: "BONUS TYPE",
      key: "category",
      format: (row: any) => (row.category === "SELF" ? "Welcome Bonus" : "Team Bounty"),
    },
    {
      header: "LEVEL",
      key: "levelNumber",
      format: (row: any) => (row.levelNumber ? `Level ${row.levelNumber}` : "Self"),
    },
    {
      header: "FROM MEMBER",
      key: "memberCustomId",
      format: (row: any) => row.memberCustomId || "-",
    },
    {
      header: "DESCRIPTION",
      key: "description",
      format: (row: any) => row.description || "Registration Bonus",
    },
    {
      header: "AMOUNT (USDT)",
      key: "amount",
      format: (row: any) => `$${Number(row.amount || 0).toFixed(4)}`,
    },
  ];

  const handleCopy = async () => {
    const success = await copyTableToClipboard(exportColumns, sortedEntries);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExcel = () => {
    exportToExcel("Joining_Bonus_Report", exportColumns, sortedEntries);
  };

  const handlePdf = () => {
    printOrExportPdf(
      "Joining Bonus Report",
      exportColumns,
      sortedEntries,
      `Total Joining Bonus: $${stats.totalJoiningBonus.toFixed(4)} USDT`,
      user?.fullName || user?.customId
    );
  };

  const handlePrint = () => {
    printOrExportPdf(
      "Joining Bonus Report",
      exportColumns,
      sortedEntries,
      `Total Joining Bonus: $${stats.totalJoiningBonus.toFixed(4)} USDT`,
      user?.fullName || user?.customId
    );
  };

  const handleSort = (field: "sr" | "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            Joining Bonus Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detailed breakdown of your Welcome Signup Bonus & 12-Level Downline Registration Bounties.
          </p>
        </div>

        {/* Redemption Qualification Status Badge */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
            stats.isQualified
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/30 text-amber-300"
          }`}
        >
          {stats.isQualified ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="font-bold">
              {stats.isQualified ? "Bonus Status: Unlocked (100% Withdrawable)" : "Bonus Status: Locked ($20 Active ID Criteria)"}
            </div>
            <div className="text-[10px] text-slate-400 font-normal">
              Active Package: ${stats.totalActivePkg.toFixed(2)} / $20.00 USDT
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Joining Bonus */}
        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Total Joining Bonus
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            ${stats.totalJoiningBonus.toFixed(4)} <span className="text-xs text-slate-400 font-normal">USDT</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2">Combined Self & Team Registration Earnings</p>
        </div>

        {/* Self Welcome Bonus */}
        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-blue-400" />
            Self Welcome Bonus
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono mt-1">
            ${stats.selfTotal.toFixed(4)} <span className="text-xs text-slate-400 font-normal">USDT</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2">Credited upon your account registration</p>
        </div>

        {/* Team 12-Level Bounties */}
        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Team Downline Bounties
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            ${stats.teamTotal.toFixed(4)} <span className="text-xs text-slate-400 font-normal">USDT</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2">12-Level registration rewards from your team</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17274a] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilterCategory("all");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === "all"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-[#0c162d] border border-[#1c2e54] text-slate-400 hover:text-slate-200"
              }`}
            >
              All Bonuses ({allBonusEntries.length})
            </button>
            <button
              onClick={() => {
                setFilterCategory("self");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === "self"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-[#0c162d] border border-[#1c2e54] text-slate-400 hover:text-slate-200"
              }`}
            >
              Self Welcome Bonus ({allBonusEntries.filter((e) => e.category === "SELF").length})
            </button>
            <button
              onClick={() => {
                setFilterCategory("team");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === "team"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-[#0c162d] border border-[#1c2e54] text-slate-400 hover:text-slate-200"
              }`}
            >
              Team Bounties ({allBonusEntries.filter((e) => e.category === "TEAM").length})
            </button>
          </div>
        </div>

        {/* Standard Table Export & Search Toolbar */}
        <TableExportToolbar
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onSearch={() => {
            setAppliedFrom(fromDate);
            setAppliedTo(toDate);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFromDate("");
            setToDate("");
            setAppliedFrom("");
            setAppliedTo("");
            setCurrentPage(1);
          }}
          onRefresh={onRefresh}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onCopy={handleCopy}
          onExcel={handleExcel}
          onPdf={handlePdf}
          onPrint={handlePrint}
          isCopied={isCopied}
        />

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-[#17274a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0c162d] text-slate-400 border-b border-[#17274a] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3 w-12 text-center">SR</th>
                <th
                  onClick={() => handleSort("date")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Date & Time
                    {sortField === "date" ? (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3">Bonus Type</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">From Member</th>
                <th className="py-3 px-3">Description</th>
                <th
                  onClick={() => handleSort("amount")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount (USDT)
                    {sortField === "amount" ? (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17274a]/60 font-mono text-slate-200">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans text-xs">
                    No joining bonus records found.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((item: any, idx: number) => {
                  const srNum = (validCurrentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-[#0c162d]/70 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-sans">{srNum}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {item.category === "SELF" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            Welcome Bonus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Team Bounty
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {item.levelNumber ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Level {item.levelNumber}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                        {item.memberCustomId !== "-" ? item.memberCustomId : "Self"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans max-w-xs truncate" title={item.description}>
                        {item.description || "Registration Bonus"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        +${item.amountNum.toFixed(4)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-200">
              {totalRecords === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-200">
              {Math.min(validCurrentPage * pageSize, totalRecords)}
            </span>{" "}
            of <span className="font-bold text-slate-200">{totalRecords}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="px-2.5 py-1 rounded-lg border border-[#1c2e54] bg-[#070e20] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-200">
              Page {validCurrentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-[#1c2e54] bg-[#070e20] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
