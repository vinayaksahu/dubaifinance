"use client";

import React from "react";
import { FileText, Layers } from "lucide-react";

interface ReportsViewProps {
  user: any;
  reportType: "statement" | "packages";
}

export function ReportsView({ user, reportType }: ReportsViewProps) {
  const isStatement = reportType === "statement";
  const ledger = user.ledgerEntries || [];
  const contracts = user.contracts || [];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          {isStatement ? "Account Statement" : "Package History"}
        </h1>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Reports</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{isStatement ? "Account Statement" : "Package History"}</span>
        </div>
      </div>

      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-5 bg-blue-500 rounded-sm" />
          <h2 className="text-lg font-bold text-slate-100">{isStatement ? "Transaction Ledger" : "Active & Completed Contracts"}</h2>
        </div>

        {isStatement ? (
          <div className="overflow-x-auto rounded-xl border border-[#152342]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">WALLET</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">BALANCE AFTER</th>
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
                      <td className="py-3 px-4 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">{new Date(item.createdAt).toISOString().split("T")[0]}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.wallet === "FUND" ? "bg-blue-950/60 text-blue-400" : "bg-emerald-950/60 text-emerald-400"
                        }`}>
                          {item.wallet}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{item.type}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">{item.description}</td>
                      <td className={`py-3 px-4 font-bold ${Number(item.amount) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {Number(item.amount) >= 0 ? "+" : ""}{Number(item.amount).toFixed(4)} USDT
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {Number(item.balanceAfter).toFixed(4)} USDT
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#152342]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">PACKAGE</th>
                  <th className="py-3 px-4">AMOUNT (USDT)</th>
                  <th className="py-3 px-4">DAILY RATE</th>
                  <th className="py-3 px-4">PROGRESS</th>
                  <th className="py-3 px-4">STATUS</th>
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
                  contracts.map((c: any, idx: number) => (
                    <tr key={c.id || idx} className="hover:bg-[#0c1630] transition-colors">
                      <td className="py-3 px-4 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">{new Date(c.createdAt).toISOString().split("T")[0]}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{c.packageType === "BASIC_SAVING" ? "Basic Saving" : "Fix Deposit"}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">${Number(c.amountInUsdt != null ? c.amountInUsdt : (Number(c.amountInInr || 0) > 5000 ? Number(c.amountInInr) / 110 : Number(c.amountInInr || 0))).toFixed(2)} USDT</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">{Number(c.dailyRoiRate)}% Daily</td>
                      <td className="py-3 px-4 text-slate-300">{c.daysPaid} / {c.tenureDays} Days</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                            : "bg-blue-950/60 text-blue-400 border border-blue-500/40"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
