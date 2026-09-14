"use client";

import React, { useState, useMemo } from "react";
import {
  Banknote,
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

interface IncomeViewProps {
  user: any;
  incomeType: "roi" | "fd" | "referral" | "level" | "fd-referral" | "fd-level";
  onRefresh?: () => void;
}

export function IncomeView({ user, incomeType, onRefresh }: IncomeViewProps) {
  const ledger: any[] = user?.ledgerEntries || user?.ledgers || [];

  const typeConfig: Record<
    string,
    { title: string; cardTitle: string; filterTypes: string[] }
  > = {
    roi: {
      title: "Basic ROI Return",
      cardTitle: "ROI Return",
      filterTypes: ["BASIC_DAILY_ROI", "BASIC_ROI"],
    },
    referral: {
      title: "Basic Referral Return",
      cardTitle: "Referral Return",
      filterTypes: ["DIRECT_REFERRAL"],
    },
    level: {
      title: "Basic Level Return",
      cardTitle: "Level Return",
      filterTypes: ["BASIC_LEVEL_INCOME"],
    },
    fd: {
      title: "FD ROI Return",
      cardTitle: "FD Return",
      filterTypes: ["FD_DAILY_ROI", "FD_ROI", "FD_MATURITY_RELEASE"],
    },
    "fd-referral": {
      title: "FD Referral Return",
      cardTitle: "FD Referral Return",
      filterTypes: ["FD_DIRECT_REFERRAL"],
    },
    "fd-level": {
      title: "FD Level Return",
      cardTitle: "FD Level Return",
      filterTypes: ["FD_LEVEL_INCOME"],
    },
  };

  const current = typeConfig[incomeType] || typeConfig.roi;

  // Filter state
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

  // Base income entries for this type
  const baseEntries = useMemo(() => {
    return ledger.filter((entry: any) =>
      current.filterTypes.includes(String(entry.type || "").toUpperCase())
    );
  }, [ledger, current]);

  // Filtered by applied date range
  const filteredEntries = useMemo(() => {
    let list = baseEntries;

    if (appliedFrom) {
      const fromTimestamp = new Date(appliedFrom).getTime();
      list = list.filter((e) => new Date(e.createdAt).getTime() >= fromTimestamp);
    }

    if (appliedTo) {
      // Include end of the selected day
      const toDateObj = new Date(appliedTo);
      toDateObj.setHours(23, 59, 59, 999);
      list = list.filter((e) => new Date(e.createdAt).getTime() <= toDateObj.getTime());
    }

    // Sort items
    return [...list].sort((a, b) => {
      if (sortField === "date") {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      if (sortField === "amount") {
        const amtA = Number(a.amount || 0);
        const amtB = Number(b.amount || 0);
        return sortOrder === "asc" ? amtA - amtB : amtB - amtA;
      }
      return 0;
    });
  }, [baseEntries, appliedFrom, appliedTo, sortField, sortOrder]);

  // Total amount
  const totalAmountUsdt = useMemo(() => {
    return filteredEntries.reduce(
      (acc: number, item: any) => acc + Number(item.amount || 0),
      0
    );
  }, [filteredEntries]);

  // Pagination calculations
  const totalItems = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pageItems = filteredEntries.slice(startIndex, startIndex + pageSize);

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

  // Sorting Handler
  const handleSort = (field: "sr" | "date" | "amount") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export Columns definition
  const exportColumns: ExportColumn[] = [
    {
      header: "SR",
      key: "sr",
      format: (_: any, idx?: number) => String((idx ?? 0) + 1),
    },
    {
      header: "DATE",
      key: "createdAt",
      format: (row) => formatDateTime(row.createdAt),
    },
    {
      header: "DESCRIPTION",
      key: "description",
      format: (row) => row.description || current.title,
    },
    {
      header: "AMOUNT",
      key: "amount",
      format: (row) => Number(row.amount || 0).toFixed(2),
    },
  ];

  // Export Handlers
  const handleCopy = async () => {
    const success = await copyTableToClipboard(exportColumns, filteredEntries);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExcel = () => {
    exportToExcel(current.cardTitle, exportColumns, filteredEntries);
  };

  const handlePdf = () => {
    printOrExportPdf(
      current.title,
      exportColumns,
      filteredEntries,
      `Total : ${totalAmountUsdt.toFixed(2)} USDT`,
      user?.fullName || user?.customId
    );
  };

  const handlePrint = () => {
    printOrExportPdf(
      current.title,
      exportColumns,
      filteredEntries,
      `Total : ${totalAmountUsdt.toFixed(2)} USDT`,
      user?.fullName || user?.customId
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-display">
          {current.title}
        </h1>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <span>🏠 Income</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">{current.title}</span>
        </div>
      </div>

      {/* 2. Main Card Container */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Card Header with Title & Total Badge (IndiaFinance style) */}
        <div className="flex items-center justify-between gap-3 border-b border-[#152342] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-blue-500 rounded-sm" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              {current.cardTitle}
            </h2>
          </div>

          {/* Red/Rose Total Badge */}
          <span className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-rose-500/20 transition-all">
            Total : {totalAmountUsdt.toFixed(2)}
          </span>
        </div>

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

        {/* 4. Table */}
        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              <tr>
                {/* SR Sortable */}
                <th
                  onClick={() => handleSort("sr")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>SR</span>
                    {sortField === "sr" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-amber-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </th>

                {/* DATE Sortable */}
                <th
                  onClick={() => handleSort("date")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>DATE</span>
                    {sortField === "date" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-amber-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </th>

                {/* DESCRIPTION */}
                <th className="py-3 px-4">DESCRIPTION</th>

                {/* AMOUNT Sortable */}
                <th
                  onClick={() => handleSort("amount")}
                  className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AMOUNT</span>
                    {sortField === "amount" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-amber-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042]">
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No records found for {current.title}
                  </td>
                </tr>
              ) : (
                pageItems.map((entry: any, idx: number) => {
                  const absoluteIndex =
                    sortOrder === "asc"
                      ? startIndex + idx + 1
                      : totalItems - (startIndex + idx);
                  return (
                    <tr
                      key={entry.id || idx}
                      className="hover:bg-[#0c1630] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {absoluteIndex}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {entry.description || current.title}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100 font-mono text-sm">
                        {Number(entry.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
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
