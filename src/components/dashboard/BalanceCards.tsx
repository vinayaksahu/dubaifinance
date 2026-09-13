import { formatUsdt } from "@/lib/utils";
import { Wallet, Coins, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function BalanceCards({ user }: { user: any }) {
  const fundBal = Number(user.fundBalance || 0);
  const incomeBal = Number(user.incomeBalance || 0);
  const totalWithdrawn = Number(user.totalWithdrawn || 0);
  const fdLocked = Number(user.fdLockedBalance || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Available Fund */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Available Fund</span>
          <Wallet className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-300">
          ${fundBal.toFixed(2)} USDT
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          Pure USDT (BEP-20)
        </div>
      </div>

      {/* Available Income */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Available Income</span>
          <Coins className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-400">
          ${incomeBal.toFixed(2)} USDT
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          Withdrawable Balance
        </div>
      </div>

      {/* FD Locked Earnings */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>FD Staking Vault</span>
          <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-cyan-400">
          ${fdLocked.toFixed(2)} USDT
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          Locked to Maturity
        </div>
      </div>

      {/* Total Withdrawal */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Total Withdrawn</span>
          <ArrowUpRight className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-purple-300">
          ${totalWithdrawn.toFixed(2)} USDT
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          Dispatched to Wallet
        </div>
      </div>
    </div>
  );
}