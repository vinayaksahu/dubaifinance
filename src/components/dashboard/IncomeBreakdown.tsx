import { formatInr } from "@/lib/utils";

export function IncomeBreakdown({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Basic Income Breakdown */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h4 className="font-extrabold text-amber-300 text-sm tracking-wide uppercase">
            Basic Income Breakdown
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            Daily 5% ROI
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Joining Bonus:</span>
            <span className="font-bold text-white">₹50.00</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Direct Referral Income (10%):</span>
            <span className="font-bold text-amber-300">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Today Basic ROI:</span>
            <span className="font-bold text-emerald-400">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Today Basic Level Income:</span>
            <span className="font-bold text-cyan-400">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Direct Business Volume:</span>
            <span className="font-bold text-white">
              {formatInr(Number(user.directBusiness))}
            </span>
          </div>
        </div>
      </div>

      {/* FD Income Breakdown */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h4 className="font-extrabold text-cyan-300 text-sm tracking-wide uppercase">
            Fix Deposit (FD) Breakdown
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
            10% - 15% Daily
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Today FD ROI Income:</span>
            <span className="font-bold text-cyan-300">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Today FD Level Income:</span>
            <span className="font-bold text-purple-400">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Total FD Accumulated:</span>
            <span className="font-bold text-white">
              {formatInr(Number(user.fdLockedBalance) * 110)}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">FD Capital Released to Balance:</span>
            <span className="font-bold text-emerald-400">₹0.00</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Direct Active Partners:</span>
            <span className="font-bold text-white">{user.directTeamCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}