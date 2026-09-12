"use client";

import React, { useState } from "react";
import { Copy, Check, MessageCircle, Send, Gift } from "lucide-react";
import Link from "next/link";

interface DashboardViewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ user, setActiveTab }: DashboardViewProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register?r=${user.customId}`
    : `https://dubaifinance.online/register?r=${user.customId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinDateStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "24 Jul 2026";

  const basicPkg = Number(user.basicPackageTotal || 0);
  const fdPkg = Number(user.fdPackageTotal || 0);
  const fundBal = Number(user.fundBalance || 0);
  const incomeBal = Number(user.incomeBalance || 0);
  const totalInc = Number(user.totalIncome || (incomeBal + Number(user.totalWithdrawn || 0)));
  const totalWithdrawn = Number(user.totalWithdrawn || 0);
  const directBusiness = Number(user.directBusiness || 0);

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Main Grid: Identity Card on Left, Summary Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Identity Card */}
        <div className="lg:col-span-6 xl:col-span-5 bg-[#091124] border border-[#17274a] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle Glow inside card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Red Avatar Emblem */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-red-500 bg-[#160608] flex items-center justify-center p-2 mb-4 shadow-2xl shadow-red-500/30 relative">
            <div className="w-full h-full rounded-full border border-red-400/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>

          {/* User Name */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 uppercase tracking-wide mb-5">
            {user.fullName || "BISHAL ROY"}
          </h2>

          {/* 3 Column Stats Row */}
          <div className="w-full grid grid-cols-3 gap-2 py-3 border-y border-[#17274a] mb-5">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-1">User ID</p>
              <p className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
                {user.customId}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-1">Status</p>
              <p className={`text-xs sm:text-sm font-bold ${
                user.status === "ACTIVE" ? "text-emerald-400" : "text-rose-500"
              }`}>
                {user.status === "ACTIVE" ? "Active" : "Inactive"}
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
          <div className="w-full py-2.5 px-4 rounded-xl bg-[#0d1833] border border-[#17274a] mb-5 text-center">
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              Direct Business : <strong className="text-slate-100 font-bold">$ {directBusiness.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
            </span>
          </div>

          {/* Referral Link Box */}
          <div className="w-full mb-6">
            <div className="flex items-center rounded-xl bg-[#080e1e] border border-[#1e3460] p-1.5 overflow-hidden">
              <span className="text-blue-400 text-xs px-2 truncate flex-1 font-mono text-left">
                {referralUrl}
              </span>
              <button
                onClick={copyReferral}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Join Us Row with WhatsApp & Telegram */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-300">Join Us :</span>
            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all shadow-md"
              title="Join WhatsApp Group"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all shadow-md"
              title="Join Telegram Channel"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Packages & Balance Summary */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {/* Top 2 Cards: BASIC PACKAGE & FD PACKAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BASIC PACKAGE Card */}
            <div
              onClick={() => setActiveTab("package-base")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                BASIC PACKAGE
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                $ {basicPkg.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* FD PACKAGE Card */}
            <div
              onClick={() => setActiveTab("package-fd")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                FD PACKAGE
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                $ {fdPkg.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Balance Summary Header */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xl">🎁</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-200 tracking-tight">
              Balance Summary
            </h2>
          </div>

          {/* 2x2 Grid: AVAILABLE FUND, AVAILABLE BALANCE, TOTAL INCOME, TOTAL WITHDRAWAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AVAILABLE FUND */}
            <div
              onClick={() => setActiveTab("recharge")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                AVAILABLE FUND
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                $ {fundBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* AVAILABLE BALANCE */}
            <div
              onClick={() => setActiveTab("tx-withdraw")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                AVAILABLE BALANCE
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                $ {incomeBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* TOTAL INCOME */}
            <div
              onClick={() => setActiveTab("income-roi")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                TOTAL INCOME
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                $ {totalInc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* TOTAL WITHDRAWAL */}
            <div
              onClick={() => setActiveTab("tx-withdraw-report")}
              className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 hover:border-rose-500/40 transition-all cursor-pointer shadow-lg"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                TOTAL WITHDRAWAL
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-500">
                $ {totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
