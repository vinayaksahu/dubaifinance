"use client";

import React, { useState } from "react";
import { Users, Search } from "lucide-react";

interface DownlineViewProps {
  user: any;
  mode: "direct" | "team";
  onNavigateTab?: (tab: string) => void;
}

export function DownlineView({ user, mode, onNavigateTab }: DownlineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const title = mode === "direct" ? "Direct Team" : "Team List";
  const rawList = mode === "direct" ? (user.directs || []) : (user.teamList || []);

  const filteredList = rawList.filter((item: any) => {
    const q = searchTerm.toLowerCase();
    return (
      item.id?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.referralId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb / Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {title}
          </h1>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
            <span>🏠 Downline</span>
            <span>/</span>
            <span className="text-slate-200 font-semibold">{title}</span>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-[#091124] border border-[#17274a] p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-direct")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              mode === "direct"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Direct Team
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-team")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              mode === "team"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Team List
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-tree")}
            className="px-3 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-5 bg-blue-500 rounded-sm" />
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        </div>

        {/* Controls: Per-Page, Search, Export Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <select className="bg-[#070e20] border border-[#1a2d52] rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#070e20] border border-[#1a2d52] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["Copy", "Excel", "PDF", "Print"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export feature triggered.`)}
                  className="px-3 py-1 rounded-lg bg-[#0d1a36] border border-[#1d335e] text-slate-300 text-xs font-medium hover:bg-[#13244a] hover:text-white transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">REFERRAL ID</th>
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">DOA</th>
                <th className="py-3 px-4">ACTIVATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredList.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#0c1630] transition-colors">
                    <td className="py-3 px-4 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">{row.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{row.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200 capitalize">{row.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{row.referralId}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">L{row.level}</td>
                    <td className="py-3 px-4 text-slate-400">{row.doa}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.activation === "Active"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                          : "bg-rose-950/60 text-rose-400 border border-rose-500/40"
                      }`}>
                        {row.activation}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-xs text-slate-400">
          <p>Showing {filteredList.length > 0 ? 1 : 0} to {filteredList.length} of {filteredList.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>«</button>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>‹</button>
            <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</span>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>›</button>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
