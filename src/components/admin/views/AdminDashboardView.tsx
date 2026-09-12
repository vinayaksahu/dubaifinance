"use client";

import React from "react";
import { Play, Users, Wallet, Banknote, Zap, Activity, Ticket } from "lucide-react";
import { formatUsdt } from "@/lib/utils";

interface AdminDashboardViewProps {
  stats: any;
  onTriggerCron: () => void;
  cronLoading: boolean;
  cronMsg: string | null;
}

export function AdminDashboardView({ stats, onTriggerCron, cronLoading, cronMsg }: AdminDashboardViewProps) {
  const safeStats = stats || {};
  
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 mb-1">Total Members</p>
          <h3 className="text-2xl font-bold text-white mb-1">{safeStats.totalUsers || 0}</h3>
          <p className="text-xs text-slate-500">{safeStats.activeUsers || 0} active</p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 mb-1">Active Contracts</p>
          <h3 className="text-2xl font-bold text-amber-400 mb-1">{safeStats.activeContracts || 0}</h3>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 mb-1">Pending Deposits</p>
          <h3 className="text-2xl font-bold text-cyan-400 mb-1">{safeStats.pendingDeposits || 0}</h3>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 mb-1">Pending Withdrawals</p>
          <h3 className="text-2xl font-bold text-red-400 mb-1">{safeStats.pendingWithdrawals || 0}</h3>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 mb-1">Total Approved</p>
          <h3 className="text-2xl font-bold text-emerald-400 mb-1">{formatUsdt(safeStats.totalApprovedDepositsUsdt || 0)}</h3>
        </div>
      </div>

      {/* ROI Engine Banner */}
      <div className="bg-gradient-to-r from-amber-900/20 to-purple-900/20 border border-amber-500/20 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-400" />
              Automated Daily ROI & 12-Level Royalty Distribution
            </h2>
            <p className="text-sm text-slate-300">
              Runs automatically via cron. Manual trigger available.
            </p>
          </div>
          
          <button
            onClick={onTriggerCron}
            disabled={cronLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {cronLoading ? (
              <Activity className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            Execute Daily ROI Cycle
          </button>
        </div>
        {cronMsg && (
          <div className="mt-4 p-3 bg-black/30 border border-amber-500/20 rounded-lg text-sm text-amber-200">
            {cronMsg}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mb-3">
              <Wallet className="h-5 w-5" />
            </div>
            <h4 className="font-medium text-white mb-1">Deposits</h4>
            <p className="text-xs text-slate-400">{safeStats.pendingDeposits || 0} pending</p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="h-10 w-10 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-3">
              <Banknote className="h-5 w-5" />
            </div>
            <h4 className="font-medium text-white mb-1">Withdrawals</h4>
            <p className="text-xs text-slate-400">{safeStats.pendingWithdrawals || 0} pending</p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="h-10 w-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="font-medium text-white mb-1">Users</h4>
            <p className="text-xs text-slate-400">{safeStats.totalUsers || 0} total</p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-3">
              <Ticket className="h-5 w-5" />
            </div>
            <h4 className="font-medium text-white mb-1">Tickets</h4>
            <p className="text-xs text-slate-400">Manage support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
