"use client";

import React, { useState } from "react";
import { Play, Users, Wallet, Banknote, Zap, Activity, Ticket, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2, Landmark, Clock, Calendar, ChevronDown, ChevronUp, Search, Layers } from "lucide-react";
import { formatUsdt } from "@/lib/utils";

interface AdminDashboardViewProps {
  stats: any;
  onTriggerCron: () => void;
  cronLoading: boolean;
  cronMsg: string | null;
  setActiveTab?: (tab: string) => void;
}

export function AdminDashboardView({ 
  stats, 
  onTriggerCron, 
  cronLoading, 
  cronMsg,
  setActiveTab 
}: AdminDashboardViewProps) {
  const safeStats = stats || {};
  
  return (
    <div className="space-y-6">
      {/* Top Welcome & Health Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0c1322] border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-black text-lg text-slate-100 uppercase tracking-wide">
              Executive Overview
            </h2>
            <p className="text-xs text-slate-400">
              Real-time analytics for Dubai Finance Pre-Launching Phase &bull; Binance Smart Chain (BEP-20)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          System Operational &bull; 100% USDT
        </div>
      </div>

      {/* Stats row - 6 High-Impact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Members */}
        <div 
          onClick={() => setActiveTab?.("users")}
          className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl transition-all duration-200 group cursor-pointer shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-slate-100 mb-1">
            {safeStats.totalUsers || 0}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span><strong className="text-emerald-600 dark:text-emerald-400">{safeStats.activeUsers || 0}</strong> active</span>
          </div>
        </div>
        
        {/* Active Contracts */}
        <div className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Contracts</span>
            <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-amber-600 dark:text-amber-400 mb-1">
            {safeStats.activeContracts || 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">28-Day &amp; FD</p>
        </div>

        {/* Pending Deposits */}
        <div 
          onClick={() => setActiveTab?.("deposits")}
          className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400 p-4 sm:p-5 rounded-2xl transition-all duration-200 group cursor-pointer shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Deposits</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-cyan-600 dark:text-cyan-300 mb-1">
            {safeStats.pendingDeposits || 0}
          </h3>
          <p className="text-xs text-cyan-600/80 dark:text-cyan-400/80 font-medium">Review &rarr;</p>
        </div>

        {/* Pending Withdrawals */}
        <div 
          onClick={() => setActiveTab?.("withdrawals")}
          className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-rose-500/30 hover:border-rose-400 p-4 sm:p-5 rounded-2xl transition-all duration-200 group cursor-pointer shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-rose-600 dark:text-rose-400 mb-1">
            {safeStats.pendingWithdrawals || 0}
          </h3>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">Process &rarr;</p>
        </div>

        {/* Admin Fee Income (10%) */}
        <div 
          onClick={() => setActiveTab?.("admin-income")}
          className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-amber-500/30 hover:border-amber-400 p-4 sm:p-5 rounded-2xl transition-all duration-200 group cursor-pointer shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Admin Fee (10%)</span>
            <Landmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-amber-600 dark:text-amber-400 mb-1 truncate" title={formatUsdt(safeStats.adminFeeIncomeUsdt || 0)}>
            {formatUsdt(safeStats.adminFeeIncomeUsdt || 0)}
          </h3>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">Platform Profit &rarr;</p>
        </div>

        {/* Total Approved USDT */}
        <div className="bg-white dark:bg-[#0c1322]/90 backdrop-blur-xl border border-emerald-500/30 p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Approved</span>
            <Wallet className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-emerald-600 dark:text-emerald-400 mb-1 truncate" title={formatUsdt(safeStats.totalApprovedDepositsUsdt || 0)}>
            {formatUsdt(safeStats.totalApprovedDepositsUsdt || 0)}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Liquidity Pool</p>
        </div>
      </div>

      {/* ROI Engine Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-amber-100/30 dark:from-amber-500/15 dark:via-[#0c1322] dark:to-amber-900/10 border border-amber-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>Smart Contract Automation</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100">
              Automated Daily ROI &amp; 12-Level Royalty Distribution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Distributes 5% Daily Basic ROI (28-Day Tenure), 10% &amp; 15% Fix Deposit returns, and 12-Level Downline Royalties. Scheduled daily via background cron, with on-demand manual override.
            </p>
          </div>
          
          <button
            type="button"
            onClick={onTriggerCron}
            disabled={cronLoading}
            className="gold-btn px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 whitespace-nowrap self-start lg:self-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cronLoading ? (
              <>
                <Activity className="h-5 w-5 animate-spin text-slate-950" />
                <span>Executing Cycle...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-slate-950 fill-slate-950" />
                <span>Execute Daily ROI Cycle</span>
              </>
            )}
          </button>
        </div>

        {cronMsg && (
          <div className="mt-5 p-3.5 bg-white/90 dark:bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{cronMsg}</span>
          </div>
        )}
      </div>

      {/* Admin Revenue & 10% Fee Breakdown Banner */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#091124] to-[#1a120a] border border-amber-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Platform Revenue Accounting</span>
            </div>
            <h3 className="font-display font-black text-xl text-white">
              Admin Income (10% Withdrawal Charges)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every withdrawal automatically retains 10% as pure admin profit. For example, $450 is dispatched per $500 requested.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab?.("admin-income")}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open Revenue Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-[#050b18] border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gross Requested (100%)
            </span>
            <span className="text-xl font-black text-white">
              {formatUsdt(safeStats.totalProcessedWithdrawalsUsdt || 0)}
            </span>
          </div>

          <div className="bg-[#050b18] border border-emerald-500/30 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Net Member Payouts (90%)
            </span>
            <span className="text-xl font-black text-emerald-300">
              {formatUsdt(safeStats.totalNetDispatchedUsdt || 0)}
            </span>
          </div>

          <div className="bg-[#050b18] border border-amber-500/30 rounded-xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Retained Admin Profit (10%)
            </span>
            <span className="text-xl font-black text-amber-300">
              +{formatUsdt(safeStats.adminFeeIncomeUsdt || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (Interactive navigation cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Quick Management Actions
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click any card to open view</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Deposits Action */}
          <div 
            onClick={() => setActiveTab?.("deposits")}
            className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cyan-500/5 transition-all duration-200 group shadow-md"
          >
            <div className="h-12 w-12 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-3 transition-transform border border-cyan-500/20">
              <Wallet className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
              Deposits
            </h4>
            <span className="text-xs text-cyan-700 dark:text-cyan-400/90 font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {safeStats.pendingDeposits || 0} pending
            </span>
          </div>
          
          {/* Withdrawals Action */}
          <div 
            onClick={() => setActiveTab?.("withdrawals")}
            className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 hover:border-rose-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-rose-500/5 transition-all duration-200 group shadow-md"
          >
            <div className="h-12 w-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-3 transition-transform border border-rose-500/20">
              <Banknote className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
              Withdrawals
            </h4>
            <span className="text-xs text-rose-700 dark:text-rose-400/90 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              {safeStats.pendingWithdrawals || 0} pending
            </span>
          </div>

          {/* Admin Income Action */}
          <div 
            onClick={() => setActiveTab?.("admin-income")}
            className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-500/5 transition-all duration-200 group shadow-md"
          >
            <div className="h-12 w-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-3 transition-transform border border-amber-500/20">
              <Landmark className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              Admin Income
            </h4>
            <span className="text-xs text-amber-700 dark:text-amber-400/90 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              10% Fee Ledger
            </span>
          </div>
          
          {/* Users Action */}
          <div 
            onClick={() => setActiveTab?.("users")}
            className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-500/5 transition-all duration-200 group shadow-md"
          >
            <div className="h-12 w-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-3 transition-transform border border-amber-500/20">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              Users
            </h4>
            <span className="text-xs text-amber-700 dark:text-amber-400/90 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {safeStats.totalUsers || 0} total registered
            </span>
          </div>
          
          {/* Tickets Action */}
          <div 
            onClick={() => setActiveTab?.("tickets")}
            className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-500/5 transition-all duration-200 group shadow-md"
          >
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-3 transition-transform border border-emerald-500/20">
              <Ticket className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Tickets
            </h4>
            <span className="text-xs text-emerald-700 dark:text-emerald-400/90 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Support Desk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
