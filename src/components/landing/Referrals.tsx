import { Gift, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Referrals() {
  const levels = [
    { level: 1, percent: 5, rule: "1 Direct Referral Required", color: "text-amber-500 dark:text-amber-300" },
    { level: 2, percent: 1, rule: "2 Direct Referrals", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 3, percent: 1, rule: "3 Direct Referrals", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 4, percent: 1, rule: "4 Direct Referrals", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 5, percent: 1, rule: "5 Direct Referrals", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 6, percent: 1, rule: "6 Direct Referrals", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 7, percent: 1, rule: "7 Direct Referrals", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 8, percent: 1, rule: "8 Direct Referrals", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 9, percent: 1, rule: "9 Direct Referrals", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 10, percent: 1, rule: "10 Direct Referrals", color: "text-purple-500 dark:text-purple-400" },
    { level: 11, percent: 1, rule: "11 Direct Referrals", color: "text-purple-500 dark:text-purple-400" },
    { level: 12, percent: 1, rule: "12 Direct Referrals", color: "text-amber-500 dark:text-amber-300" },
  ];

  return (
    <section id="referrals" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            MULTI-TIER TEAM RESIDUALS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Direct Bonus &amp; 12-Level Royalties
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Earn 10% Instant Cash on every direct deposit, plus recurring daily royalties calculated on team ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: 10% Direct Bonus Card (4 Cols) */}
          <div className="lg:col-span-5 glass-card-gold p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-sm">
                <Gift className="w-7 h-7" />
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                Direct Referral Reward
              </span>

              <h3 className="font-display text-3xl sm:text-4xl font-black text-[var(--text-main)] mt-3">
                10% Instant Bonus
              </h3>

              <p className="text-[var(--text-muted)] text-sm sm:text-base mt-3 leading-relaxed">
                Credited instantly to your wallet every time your direct partner makes a deposit or contract re-topup. Applies universally to both <strong>Basic Saving</strong> and <strong>Fix Deposit</strong>.
              </p>

              {/* Example calculation box from PDF */}
              <div className="my-6 p-4 rounded-2xl bg-inner-panel text-xs sm:text-sm space-y-2">
                <div className="font-bold text-amber-500 uppercase tracking-wider text-xs">
                  Instant Bonus Calculation:
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Partner Deposits $100:</span>
                  <strong className="text-amber-500">+$10.00 USDT Instant</strong>
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Partner Deposits $1,000:</span>
                  <strong className="text-amber-500">+$100.00 USDT Instant</strong>
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Partner Deposits $5,000:</span>
                  <strong className="text-amber-500">+$500.00 USDT Instant</strong>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--text-subtle)] mb-4">
                *No limit on direct sponsors. Refer 5, 50, or 500+ partners with zero restrictions.
              </div>

              <Link
                href="/register"
                className="gold-btn w-full py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                Start Referring &amp; Earn 10% <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: 12-Level Royalty Matrix (7 Cols) */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[var(--border-subtle)] mb-6">
                <div>
                  <h4 className="font-display text-xl sm:text-2xl font-black text-[var(--text-main)]">
                    12-Level Daily Royalty Matrix
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                    Calculated daily on downline ROI earnings &bull; 1 Direct referral unlocks each level
                  </p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold shrink-0">
                  Daily Recurring Yield
                </span>
              </div>

              {/* 12 Level Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {levels.map((item) => (
                  <div
                    key={item.level}
                    className={`p-3.5 rounded-2xl bg-inner-panel text-center transition hover:border-amber-400/50 ${
                      item.level === 1 ? "ring-1 ring-amber-500/40" : ""
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[var(--text-subtle)] uppercase">
                      Level {item.level}
                    </div>
                    <div className={`font-display text-2xl font-black ${item.color} mt-0.5`}>
                      {item.percent}%
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                      {item.rule}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crucial PDF Rule Note */}
            <div className="mt-6 p-4 rounded-2xl bg-inner-panel text-xs text-[var(--text-muted)] leading-relaxed">
              <strong className="text-amber-500">Official Protocol Note (Slide 9):</strong> Daily Level income is calculated on downline <strong>ROI income</strong>, not on invested capital. Exactly 1 active direct referral is required to unlock each successive level (12 Directs unlock all 12 Levels forever).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}