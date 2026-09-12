import { formatInr, formatUsdt, usdtToInr } from "@/lib/utils";
import { Wallet, Coins, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function BalanceCards({ user }: { user: any }) {
  const fundInr = usdtToInr(Number(user.fundBalance));
  const incomeInr = usdtToInr(Number(user.incomeBalance));
  const totalWithdrawnInr = usdtToInr(Number(user.totalWithdrawn));
  const fdLockedInr = usdtToInr(Number(user.fdLockedBalance));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Available Fund */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Available Fund</span>
          <Wallet className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-300">
          {formatInr(fundInr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {formatUsdt(user.fundBalance)}
        </div>
      </div>

      {/* Available Income */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Available Balance (Income)</span>
          <Coins className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-400">
          {formatInr(incomeInr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {formatUsdt(user.incomeBalance)} (Withdrawable)
        </div>
      </div>

      {/* FD Locked Earnings */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cyan-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>FD Staking Vault</span>
          <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-cyan-400">
          {formatInr(fdLockedInr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {formatUsdt(user.fdLockedBalance)} (Locked to Maturity)
        </div>
      </div>

      {/* Total Withdrawal */}
      <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-400">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Total Withdrawn</span>
          <ArrowUpRight className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl sm:text-2xl font-black text-purple-300">
          {formatInr(totalWithdrawnInr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {formatUsdt(user.totalWithdrawn)}
        </div>
      </div>
    </div>
  );
}