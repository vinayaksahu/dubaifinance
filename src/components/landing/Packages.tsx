"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function Packages() {
  const [activePlanType, setActivePlanType] = useState<"basic" | "fd">("basic");
  const [fdActiveTenure, setFdActiveTenure] = useState<180 | 210>(180);

  // Exact 9 Basic Packages from Dubai_Finance_Presentation_Dark.pdf Slides 05-09
  const basicPackages = [
    { amount: 5, dailyProfit: 0.25, day7: 1.75, day14: 3.50, gross: 7.00, netProfit: 2.00, tier: "Micro Starter", category: "Starter" },
    { amount: 10, dailyProfit: 0.50, day7: 3.50, day14: 7.00, gross: 14.00, netProfit: 4.00, tier: "Basic Starter", category: "Starter" },
    { amount: 20, dailyProfit: 1.00, day7: 7.00, day14: 14.00, gross: 28.00, netProfit: 8.00, tier: "Advanced Starter", category: "Starter" },
    { amount: 50, dailyProfit: 2.50, day7: 17.50, day14: 35.00, gross: 70.00, netProfit: 20.00, tier: "Growth Pro", category: "Growth", qualifier: true },
    { amount: 100, dailyProfit: 5.00, day7: 35.00, day14: 70.00, gross: 140.00, netProfit: 40.00, tier: "Growth Standard", category: "Growth", popular: true },
    { amount: 500, dailyProfit: 25.00, day7: 175.00, day14: 350.00, gross: 700.00, netProfit: 200.00, tier: "Growth Elite", category: "Growth" },
    { amount: 1000, dailyProfit: 50.00, day7: 350.00, day14: 700.00, gross: 1400.00, netProfit: 400.00, tier: "VIP Platinum", category: "VIP" },
    { amount: 2000, dailyProfit: 100.00, day7: 700.00, day14: 1400.00, gross: 2800.00, netProfit: 800.00, tier: "VIP Diamond", category: "VIP" },
    { amount: 5000, dailyProfit: 250.00, day7: 1750.00, day14: 3500.00, gross: 7000.00, netProfit: 2000.00, tier: "Royal Crown VIP", category: "VIP", popular: true },
  ];

  // Exact FD Plans from Slides 12-14
  const fd180Plans = [
    { amount: 50, daily: 5, m30: 150, m90: 450, total: 900, mult: "18X" },
    { amount: 100, daily: 10, m30: 300, m90: 900, total: 1800, mult: "18X" },
    { amount: 500, daily: 50, m30: 1500, m90: 4500, total: 9000, mult: "18X", popular: true },
    { amount: 1000, daily: 100, m30: 3000, m90: 9000, total: 18000, mult: "18X" },
    { amount: 2000, daily: 200, m30: 6000, m90: 18000, total: 36000, mult: "18X" },
    { amount: 5000, daily: 500, m30: 15000, m90: 45000, total: 90000, mult: "18X", popular: true },
  ];

  const fd210Plans = [
    { amount: 100, daily: 15, m30: 450, m90: 1350, total: 3150, mult: "31.5X" },
    { amount: 500, daily: 75, m30: 2250, m90: 6750, total: 15750, mult: "31.5X", popular: true },
    { amount: 1000, daily: 150, m30: 4500, m90: 13500, total: 31500, mult: "31.5X" },
    { amount: 2000, daily: 300, m30: 9000, m90: 27000, total: 63000, mult: "31.5X" },
    { amount: 5000, daily: 750, m30: 22500, m90: 67500, total: 157500, mult: "31.5X", popular: true },
  ];

  return (
    <section id="packages" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            ACTIVATION TIERS &bull; SLIDES 05-14
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Joining Packages: $5 To $5,000 USDT
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            All Basic packages run on a disciplined <strong>28-Day Tenure at 5% Daily ROI (140% Return)</strong>.
          </p>

          {/* Plan Type Selector (Basic vs FD) */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 mt-8 shadow-md">
            <button
              type="button"
              onClick={() => setActivePlanType("basic")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activePlanType === "basic"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-[1.02]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <Zap className="w-4 h-4" />
              Basic ROI: 5% Daily (28 Days)
            </button>
            <button
              type="button"
              onClick={() => setActivePlanType("fd")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activePlanType === "fd"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 scale-[1.02]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Fix Deposit: 10% &amp; 15% Daily
            </button>
          </div>
        </div>

        {/* BASIC SAVING PLAN VIEW */}
        {activePlanType === "basic" && (
          <div className="animate-in fade-in duration-300">
            {/* Overview Banner Card */}
            <div className="glass-card-gold p-8 sm:p-10 rounded-3xl mb-12 max-w-5xl mx-auto shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-amber-500/30 mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    Disciplined 28-Day Tenure
                  </span>
                  <h3 className="font-display text-2xl sm:text-4xl font-black text-[var(--text-main)] mt-2">
                    Basic Daily ROI: 5% Every Day
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm sm:text-base mt-1 font-medium">
                    Monday Through Sunday (No Non-Trading Days!) &bull; Packages: <strong>$5 to $5,000 USDT</strong>
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="font-display text-4xl sm:text-5xl font-black text-emerald-500 dark:text-emerald-400">
                    140% Gross
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-semibold">
                    100% Principal Returned + 40% Pure Net Profit
                  </div>
                </div>
              </div>

              {/* 3 Key Parameters from Slide 11 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-6">
                <div className="p-3.5 rounded-2xl bg-inner-panel text-center">
                  <div className="text-[11px] text-[var(--text-subtle)] font-bold uppercase">Contract Tenure</div>
                  <div className="text-base font-black text-[var(--text-main)] mt-1">28 Days Fixed</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-inner-panel text-center">
                  <div className="text-[11px] text-[var(--text-subtle)] font-bold uppercase">Daily Cash Flow</div>
                  <div className="text-base font-black text-amber-500 mt-1">5% Every Day</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-inner-panel text-center">
                  <div className="text-[11px] text-[var(--text-subtle)] font-bold uppercase">Net ROI Profit</div>
                  <div className="text-base font-black text-emerald-500 mt-1">40% Pure Gain</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-inner-panel text-center">
                  <div className="text-[11px] text-[var(--text-subtle)] font-bold uppercase">Re-Topup Facility</div>
                  <div className="text-base font-black text-cyan-500 mt-1">Available Anytime</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  Zero forced direct referrals required to withdraw &bull; Min withdrawal $2 USDT &bull; Flat 10% admin charge
                </span>
                <Link
                  href="/register"
                  className="w-full sm:w-auto gold-btn px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  Join With $5 USDT <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 9 Complete Packages from Slides 05-09 */}
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h4 className="font-display text-xl font-bold text-[var(--text-main)]">
                  All 9 Joining Tiers &bull; 28-Day Projections Matrix (Slide 09)
                </h4>
                <p className="text-xs text-[var(--text-subtle)]">
                  Full transparent calculation of 7-Day, 14-Day, 28-Day gross payout &amp; net profit
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicPackages.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`glass-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 ${
                      pkg.popular ? "border-amber-400/80 shadow-amber-500/10 shadow-lg ring-1 ring-amber-400/30" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                          {pkg.tier}
                        </span>
                        {pkg.qualifier && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 text-[10px] font-black uppercase">
                            12-Level Qualifier
                          </span>
                        )}
                        {pkg.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                            Most Popular
                          </span>
                        )}
                      </div>

                      <div className="font-display text-3xl font-black text-[var(--text-main)]">
                        ${pkg.amount} <span className="text-xs font-bold text-[var(--text-subtle)]">USDT BEP-20</span>
                      </div>

                      <div className="my-4 p-3.5 rounded-xl bg-inner-panel space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Daily Yield (5%):</span>
                          <span className="font-bold text-emerald-500 dark:text-emerald-400">
                            ${pkg.dailyProfit.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">7 Days Return:</span>
                          <span className="font-semibold text-[var(--text-main)]">
                            ${pkg.day7.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">14 Days Return:</span>
                          <span className="font-semibold text-[var(--text-main)]">
                            ${pkg.day14.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                          <span className="text-[var(--text-main)] font-bold">28 Days Gross (140%):</span>
                          <span className="font-black text-amber-500">
                            ${pkg.gross.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-500 font-bold">Net Profit (40%):</span>
                          <span className="font-bold text-emerald-500">
                            +${pkg.netProfit.toFixed(2)} USDT
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold text-center transition block"
                    >
                      Activate ${pkg.amount} Package
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIX DEPOSIT (FD) VIEW */}
        {activePlanType === "fd" && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-cyan-500 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest">
                INSTITUTIONAL STAKING CONTRACTS &bull; SLIDES 12-14
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-black text-[var(--text-main)] mt-1">
                Fix Deposit (FD) High-Yield Staking
              </h3>
              <p className="text-[var(--text-muted)] text-sm sm:text-base mt-2">
                Lock your capital in premier liquidity pools for massive guaranteed multiplier returns.
              </p>

              {/* FD Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mt-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setFdActiveTenure(180)}
                  className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                    fdActiveTenure === 180
                      ? "bg-amber-400 text-slate-950 shadow font-black"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  FD Plan A: 10% Daily (180 Days &bull; 18X Return)
                </button>
                <button
                  type="button"
                  onClick={() => setFdActiveTenure(210)}
                  className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                    fdActiveTenure === 210
                      ? "bg-emerald-500 text-slate-950 shadow font-black"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  FD Plan B (VIP): 15% Daily (210 Days &bull; 31.5X Return)
                </button>
              </div>
            </div>

            {/* 180 Days Grid (Slide 13) */}
            {fdActiveTenure === 180 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {fd180Plans.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`glass-card p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition ${
                      pkg.popular ? "border-amber-400/80 shadow-amber-500/10 shadow-lg ring-1 ring-amber-400/30" : ""
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[var(--text-subtle)] uppercase">180 Days Contract</span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-500 text-[10px] font-black">{pkg.mult} Return</span>
                      </div>

                      <div className="font-display text-3xl font-black text-amber-500 dark:text-amber-300">
                        ${pkg.amount} <span className="text-xs font-bold text-[var(--text-subtle)]">USDT</span>
                      </div>

                      <div className="my-5 p-4 rounded-xl bg-inner-panel space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Daily Return (10%):</span>
                          <span className="font-bold text-[var(--text-main)]">${pkg.daily}.00 / day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">30 Days Profit:</span>
                          <span className="font-semibold text-cyan-500">${pkg.m30.toLocaleString()} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">90 Days Profit:</span>
                          <span className="font-semibold text-cyan-500">${pkg.m90.toLocaleString()} USDT</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                          <span className="font-bold text-[var(--text-main)]">Total 180 Days (1,800%):</span>
                          <span className="font-black text-emerald-500">${pkg.total.toLocaleString()} USDT</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold text-center transition block"
                    >
                      Choose ${pkg.amount} Plan
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 210 Days Grid (Slide 14) */}
            {fdActiveTenure === 210 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {fd210Plans.map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`glass-card p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition ${
                      pkg.popular ? "border-emerald-400/80 shadow-emerald-500/10 shadow-lg ring-1 ring-emerald-400/30" : ""
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[var(--text-subtle)] uppercase">210 Days VIP Contract</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-black">{pkg.mult} Return</span>
                      </div>

                      <div className="font-display text-3xl font-black text-emerald-500 dark:text-emerald-400">
                        ${pkg.amount} <span className="text-xs font-bold text-[var(--text-subtle)]">USDT</span>
                      </div>

                      <div className="my-5 p-4 rounded-xl bg-inner-panel space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Daily Return (15%):</span>
                          <span className="font-bold text-[var(--text-main)]">${pkg.daily}.00 / day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">30 Days Profit:</span>
                          <span className="font-semibold text-cyan-500">${pkg.m30.toLocaleString()} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">90 Days Profit:</span>
                          <span className="font-semibold text-cyan-500">${pkg.m90.toLocaleString()} USDT</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                          <span className="font-bold text-[var(--text-main)]">Total 210 Days (3,150%):</span>
                          <span className="font-black text-emerald-500">${pkg.total.toLocaleString()} USDT</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-400/10 text-xs font-bold text-center transition block"
                    >
                      Choose ${pkg.amount} VIP Plan
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}