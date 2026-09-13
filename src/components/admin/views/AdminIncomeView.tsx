"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Landmark, 
  Wallet, 
  TrendingUp, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Percent
} from "lucide-react";
import { formatUsdt } from "@/lib/utils";

interface AdminIncomeViewProps {
  onRefresh?: () => void;
}

export function AdminIncomeView({ onRefresh }: AdminIncomeViewProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalProcessedGross: 0,
    totalProcessedFee: 0,
    totalProcessedNet: 0,
    pendingGross: 0,
    pendingFee: 0,
    pendingNet: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PROCESSED" | "PENDING">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const itemsPerPage = 15;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/withdrawals");
      if (!res.ok) throw new Error("Failed to fetch admin income data");
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("AdminIncomeView fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesFilter = filter === "ALL" || w.status === filter;
      const q = search.toLowerCase();
      const userName = (w.user?.fullName || w.user?.name || "").toLowerCase();
      const customId = (w.user?.customId || "").toLowerCase();
      const address = (w.payoutAddress || w.toAddress || "").toLowerCase();
      const matchesSearch = q === "" || userName.includes(q) || customId.includes(q) || address.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [withdrawals, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const processedCount = withdrawals.filter((w) => w.status === "PROCESSED").length;
  const pendingCount = withdrawals.filter((w) => w.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Platform Revenue Accounting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Admin Income &amp; Fee Revenue</span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10% Flat Deduction
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Track platform revenue generated from member withdrawals. Every withdrawal automatically applies a 10% admin charge ($50 per $500) credited as pure platform profit, while $450 is dispatched to the member.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#070e20] border border-amber-500/30 px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Configured Admin Fee</div>
              <div className="text-lg font-black text-amber-400">10.0% Flat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admin Income Collected */}
        <div className="bg-slate-900/60 backdrop-blur border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Admin Income</span>
            <Landmark className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
            {formatUsdt(summary.totalProcessedFee || 0)}
          </h3>
          <p className="text-xs text-slate-400">
            Retained 10% fee from <strong className="text-slate-200">{processedCount}</strong> processed payout{processedCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Pending Fee Receivable */}
        <div className="bg-slate-900/60 backdrop-blur border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Pending Fee Income</span>
            <Clock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-300 mb-1">
            {formatUsdt(summary.pendingFee || 0)}
          </h3>
          <p className="text-xs text-slate-400">
            Awaiting approval from <strong className="text-slate-200">{pendingCount}</strong> pending request{pendingCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Total Net Payouts Dispatched */}
        <div className="bg-slate-900/60 backdrop-blur border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Net Member Dispatches</span>
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 mb-1">
            {formatUsdt(summary.totalProcessedNet || 0)}
          </h3>
          <p className="text-xs text-slate-400">
            Actual 90% funds transferred to member wallets ($450 base)
          </p>
        </div>

        {/* Total Gross Withdrawals Requested */}
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Gross Withdrawals</span>
            <TrendingUp className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-1">
            {formatUsdt(summary.totalProcessedGross || 0)}
          </h3>
          <p className="text-xs text-slate-400">
            Total income deducted from user accounts ($500 base)
          </p>
        </div>
      </div>

      {/* Visual Revenue Distribution Bar */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Platform Payout vs Admin Revenue Split
          </span>
          <span className="text-xs text-slate-400">
            90% Member Net Payout &bull; 10% Retained Admin Revenue
          </span>
        </div>
        <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
            style={{ width: "90%" }}
            title="90% Member Net Payout"
          />
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500" 
            style={{ width: "10%" }}
            title="10% Admin Revenue"
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Member Payout (90%): {formatUsdt(summary.totalProcessedNet || 0)}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Admin Income (10%): {formatUsdt(summary.totalProcessedFee || 0)}
          </span>
        </div>
      </div>

      {/* Fee Breakdown Transaction Table */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/60 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-[#050b18] p-1 rounded-xl border border-[#152238]">
            {(["ALL", "PROCESSED", "PENDING"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f === "ALL" ? "All Requests" : f === "PROCESSED" ? "Processed (Completed)" : "Pending Payouts"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, ID or address..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#050b18] border border-[#152238] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading fee revenue ledger...</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No withdrawal fee transactions match your criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-3">
                  <th className="pb-3 font-semibold">SR</th>
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Gross Requested</th>
                  <th className="pb-3 font-semibold text-amber-400">10% Admin Fee</th>
                  <th className="pb-3 font-semibold text-emerald-400">Net Payout (90%)</th>
                  <th className="pb-3 font-semibold">Receiving Address</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {paginatedItems.map((w, index) => {
                  const gross = w.grossAmount ?? w.amountGross ?? w.amountInUsdt ?? 0;
                  const fee = w.feeAmount ?? (gross * 0.1);
                  const net = w.netPayout ?? w.netAmount ?? (gross - fee);
                  const address = w.payoutAddress || w.toAddress || "";

                  return (
                    <tr key={w.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 text-slate-400">
                        {(page - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-semibold">{w.user?.fullName || w.user?.name || "Member"}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{w.user?.customId || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-300 font-semibold">
                        {formatUsdt(gross)}
                      </td>
                      <td className="py-4">
                        <span className="font-extrabold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                          +{formatUsdt(fee)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                          {formatUsdt(net)}
                        </span>
                      </td>
                      <td className="py-4">
                        {address ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-400 text-[11px]">
                              {address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address}
                            </span>
                            <button
                              onClick={() => copyToClipboard(address, w.id)}
                              className="text-slate-500 hover:text-slate-300 transition"
                              title="Copy address"
                            >
                              {copiedId === w.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          w.status === "PROCESSED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : w.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredItems.length)} of {filteredItems.length} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-200">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
