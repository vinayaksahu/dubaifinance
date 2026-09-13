"use client";

import React, { useState } from "react";
import { Copy, Check, MessageCircle, Send, Users } from "lucide-react";

interface DashboardViewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ user, setActiveTab }: DashboardViewProps) {
  const [copied, setCopied] = useState(false);

  // Dynamic origin or fallback referral link matching the screenshot format
  const origin = typeof window !== "undefined" ? window.location.origin : "https://indiafinance.online";
  const customId = user?.customId || "IF478752";
  const referralUrl = `${origin}/register?r=${customId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Join Date
  const joinDateStr = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "19 Jul 2026";

  // Currency symbol - exactly matches screenshot ₹ (Indian Rupee)
  const currency = "₹";

  // Balance values
  const fundBal = Number(user?.fundBalance ?? 0);
  const incomeBal = Number(user?.incomeBalance ?? 14.25);
  const totalWithdrawn = Number(user?.totalWithdrawn ?? 810.25);
  const totalInc = Number(user?.totalIncome ?? (incomeBal + totalWithdrawn));
  const directBusiness = Number(user?.directBusiness ?? 700.0);

  // Team counts
  const directTeamCount = user?.directTeamCount ?? (user?.directs?.length ?? 1);
  const totalTeamCount = user?.totalTeamCount ?? (user?.teamList?.length ?? 15);

  // Breakdown values from user.incomeBreakdown or ledgers or demo defaults
  const b = user?.incomeBreakdown || {};
  const joiningBonus = Number(b.joiningBonus ?? 50.0);
  const basicReferralIncome = Number(b.basicReferralIncome ?? 170.0);
  const basicTodayRoi = Number(b.basicTodayRoi ?? 0.0);
  const basicTodayLevel = Number(b.basicTodayLevel ?? 0.0);
  const basicTotalRoi = Number(b.basicTotalRoi ?? 500.0);
  const basicTotalLevel = Number(b.basicTotalLevel ?? 104.5);

  // FD values
  const fdTodayRoi = Number(b.fdTodayRoi ?? 0.0);
  const fdTodayLevel = Number(b.fdTodayLevel ?? 0.0);
  const fdTotalRoi = Number(b.fdTotalRoi ?? 0.0);
  const fdTotalLevel = Number(b.fdTotalLevel ?? 0.0);
  const fdReferralIncome = Number(b.fdReferralIncome ?? 0.0);
  const fdReleased = Number(b.fdReleased ?? 0.0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Grid: User Identity Card (Left) & 4 Balance Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: User Identity Card */}
        <div className="lg:col-span-6 bg-[#091124] border border-[#17274a] rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center shadow-xl relative overflow-hidden h-full justify-between">
          {/* Subtle glow accent inside card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Red Avatar Emblem */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-red-500 bg-[#160608] flex items-center justify-center p-2 mb-3 shadow-2xl shadow-red-500/25 relative shrink-0">
            <div className="w-full h-full rounded-full border border-red-400/40 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-14 h-14"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>

          {/* User Full Name */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 uppercase tracking-wide mb-3">
            {user?.fullName || "BISHAL ROY"}
          </h2>

          {/* 3 Column Stats Row */}
          <div className="w-full grid grid-cols-3 py-3 border-y border-[#17274a] mb-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-1">User ID</p>
              <p className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
                {customId}
              </p>
            </div>
            <div className="border-x border-[#17274a] px-2">
              <p className="text-[11px] font-medium text-slate-400 mb-1">Status</p>
              <p
                className={`text-xs sm:text-sm font-bold ${
                  user?.status === "ACTIVE" ? "text-emerald-400" : "text-rose-500"
                }`}
              >
                {user?.status === "ACTIVE" ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-1">Join Date</p>
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                {joinDateStr}
              </p>
            </div>
          </div>

          {/* Direct Business Row */}
          <div className="w-full py-2.5 px-4 rounded-full bg-[#0d1833] border border-[#17274a] mb-3 text-center">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              Direct Business :{" "}
              <strong className="text-slate-100 font-bold font-mono">
                {currency} {directBusiness.toFixed(2)}
              </strong>
            </span>
          </div>

          {/* Referral Link Box */}
          <div className="w-full mb-4">
            <div className="flex items-center rounded-full bg-[#080e1e] border border-[#1e3460] p-1.5 overflow-hidden">
              <span className="text-cyan-400 text-sm px-2 font-mono">🔗</span>
              <span className="text-cyan-400 text-xs px-1 truncate flex-1 font-mono text-left">
                {referralUrl}
              </span>
              <button
                onClick={copyReferral}
                className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Join Us Row with WhatsApp & Telegram */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-300">
              Join Us :
            </span>
            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-600 flex items-center justify-center transition-all shadow-md"
              title="Join WhatsApp Group"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all shadow-md"
              title="Join Telegram Channel"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Right Column: 4 Summary Balance Cards (2x2 Grid) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {/* AVAILABLE FUND */}
          <div
            onClick={() => setActiveTab("recharge")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              AVAILABLE FUND
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {currency} {fundBal.toFixed(2)}
            </p>
          </div>

          {/* AVAILABLE BALANCE */}
          <div
            onClick={() => setActiveTab("tx-withdraw")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              AVAILABLE BALANCE
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {currency} {incomeBal.toFixed(2)}
            </p>
          </div>

          {/* TOTAL INCOME */}
          <div
            onClick={() => setActiveTab("income-roi")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              TOTAL INCOME
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {currency} {totalInc.toFixed(2)}
            </p>
          </div>

          {/* TOTAL WITHDRAWAL */}
          <div
            onClick={() => setActiveTab("tx-withdraw-report")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 text-center shadow-xl hover:border-rose-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              TOTAL WITHDRAWAL
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-mono">
              {currency} {totalWithdrawn.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Team Summary Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            Team Summary
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* DIRECT TEAM */}
          <div
            onClick={() => setActiveTab("downline-direct")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              DIRECT TEAM
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              {directTeamCount}
            </p>
          </div>

          {/* TOTAL TEAM */}
          <div
            onClick={() => setActiveTab("downline-team")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TOTAL TEAM
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
              {totalTeamCount}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Income Breakdown Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            Basic Income Breakdown
          </h2>
        </div>

        {/* Row 1: 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* JOINING BONUS */}
          <div
            onClick={() => setActiveTab("income-roi")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              JOINING BONUS
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
              {currency} {joiningBonus.toFixed(2)}
            </p>
          </div>

          {/* REFERRAL INCOME */}
          <div
            onClick={() => setActiveTab("income-referral")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              REFERRAL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {basicReferralIncome.toFixed(2)}
            </p>
          </div>

          {/* TODAY ROI INCOME */}
          <div
            onClick={() => setActiveTab("income-roi")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TODAY ROI INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {currency} {basicTodayRoi.toFixed(2)}
            </p>
          </div>

          {/* TODAY LEVEL INCOME */}
          <div
            onClick={() => setActiveTab("income-level")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TODAY LEVEL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {basicTodayLevel.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Row 2: 2 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* TOTAL ROI INCOME */}
          <div
            onClick={() => setActiveTab("income-roi")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TOTAL ROI INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {currency} {basicTotalRoi.toFixed(2)}
            </p>
          </div>

          {/* TOTAL LEVEL INCOME */}
          <div
            onClick={() => setActiveTab("income-level")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TOTAL LEVEL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {basicTotalLevel.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* FD Income Breakdown Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            FD Income Breakdown
          </h2>
        </div>

        {/* Row 1: 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* TODAY ROI INCOME */}
          <div
            onClick={() => setActiveTab("income-fd")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TODAY ROI INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {currency} {fdTodayRoi.toFixed(2)}
            </p>
          </div>

          {/* TODAY LEVEL INCOME */}
          <div
            onClick={() => setActiveTab("income-level")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TODAY LEVEL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {fdTodayLevel.toFixed(2)}
            </p>
          </div>

          {/* TOTAL ROI INCOME */}
          <div
            onClick={() => setActiveTab("income-fd")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TOTAL ROI INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {currency} {fdTotalRoi.toFixed(2)}
            </p>
          </div>

          {/* TOTAL LEVEL INCOME */}
          <div
            onClick={() => setActiveTab("income-level")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              TOTAL LEVEL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {fdTotalLevel.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Row 2: 2 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* REFERRAL INCOME */}
          <div
            onClick={() => setActiveTab("income-referral")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              REFERRAL INCOME
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {fdReferralIncome.toFixed(2)}
            </p>
          </div>

          {/* FD RELEASED */}
          <div
            onClick={() => setActiveTab("income-fd")}
            className="bg-[#091124] border border-[#17274a] rounded-3xl p-4 sm:p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-center items-center"
          >
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              FD RELEASED
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
              {currency} {fdReleased.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding matching the screenshot */}
      <footer className="pt-8 pb-4 border-t border-[#132042] text-center text-xs text-slate-500 font-medium">
        © 2026 India Finance. All Rights Reserved.
      </footer>
    </div>
  );
}
