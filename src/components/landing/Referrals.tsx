import { APP_CONFIG } from "@/lib/constants";

export function Referrals() {
  return (
    <section id="referrals" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            MULTI-TIER TEAM RESIDUALS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Direct Reward &amp; 12-Level Team Royalty
          </h2>
          <p className="text-slate-400 mt-2">
            Earn 10% Instant Cash on every direct deposit, plus recurring daily royalties across 12 levels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 glass-card-gold p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="text-5xl mb-4">🎁</div>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-wider">
                Direct Commission
              </span>
              <h3 className="text-3xl font-black text-white mt-3">
                15% Instant Reward
              </h3>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Received instantly on every deposit and contract re-topup made by your sponsored members. Universal coverage for Basic Saving and Fix Deposit.
              </p>

              <div className="my-6 p-4 rounded-xl bg-black/50 border border-dashed border-amber-500/40 text-xs text-slate-300">
                <div className="text-amber-300 font-bold mb-1">EXAMPLE:</div>
                Partner deposits $500 USDT &rarr; You earn <strong className="text-amber-300">$75 USDT</strong> instantly!
              </div>
            </div>

            <div className="text-xs text-slate-400">
              No limit on direct referrals. Refer 5, 50, or 500+ partners.
            </div>
          </div>

          <div className="lg:col-span-8 glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h4 className="text-xl font-bold text-white">12-Level Royalty Matrix</h4>
                <p className="text-xs text-slate-400">
                  Calculated daily on downline ROI earnings (1-to-1 direct referral unlocks each level)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                Daily Recurring
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-xs text-slate-400 font-semibold">Level 1 (Directs)</div>
                <div className="text-xl font-black text-amber-300 mt-1">10% Daily</div>
                <div className="text-[10px] text-slate-500">1 Direct Needed</div>
              </div>

              {APP_CONFIG.levelRates.slice(1).map((lvl) => (
                <div key={lvl.level} className="p-3 rounded-xl bg-black/40 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-semibold">Level {lvl.level}</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{lvl.percent}% Daily</div>
                  <div className="text-[10px] text-slate-500">{lvl.level} Directs Needed</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-900/60 text-xs text-slate-400">
              <strong>Note:</strong> 12 Direct Active Referrals unlock all 12 Levels forever.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}