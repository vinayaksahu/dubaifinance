"use client";

import React from "react";
import { Banknote, TrendingUp, Users, Award } from "lucide-react";

interface IncomeViewProps {
  user: any;
  incomeType: "roi" | "fd" | "referral" | "level" | "fd-referral" | "fd-level";
}

export function IncomeView({ user, incomeType }: IncomeViewProps) {
  const ledger = user.ledgerEntries || [];

  const typeConfig: Record<string, { title: string; filterTypes: string[] }> = {
    roi: { title: "Basic ROI Income", filterTypes: ["BASIC_DAILY_ROI"] },
    referral: { title: "Basic Referral Income (15%)", filterTypes: ["DIRECT_REFERRAL"] },
    level: { title: "Basic Level Income", filterTypes: ["BASIC_LEVEL_INCOME"] },
    fd: { title: "FD ROI Income", filterTypes: ["FD_DAILY_ROI", "FD_MATURITY_RELEASE"] },
    "fd-referral": { title: "FD Referral Income", filterTypes: ["FD_DIRECT_REFERRAL"] },
    "fd-level": { title: "FD Level Income", filterTypes: ["FD_LEVEL_INCOME"] },
  };

  const current = typeConfig[incomeType] || typeConfig.roi;
  const filtered = ledger.filter((entry: any) => current.filterTypes.includes(entry.type));
  const totalAmountUsdt = filtered.reduce((acc: number, item: any) => acc + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Total Earned :{" "}
            <span className="text-emerald-400 font-bold">
              ${totalAmountUsdt.toFixed(2)} USDT
            </span>
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Income</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{current.title}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-5 bg-blue-500 rounded-sm" />
          <h2 className="text-lg font-bold text-slate-100">Earning Records</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">AMOUNT (USDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No income records found
                  </td>
                </tr>
              ) : (
                filtered.map((entry: any, idx: number) => {
                  return (
                    <tr key={entry.id || idx} className="hover:bg-[#0c1630] transition-colors">
                      <td className="py-3 px-4 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">{new Date(entry.createdAt).toISOString().split("T")[0]}</td>
                      <td className="py-3 px-4 text-slate-200">{entry.description}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">+${Number(entry.amount).toFixed(4)} USDT</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
