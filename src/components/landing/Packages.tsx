"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Packages() {
  const [activePlanType, setActivePlanType] = useState<"basic" | "fd">("basic");
  const [fdActiveTenure, setFdActiveTenure] = useState<180 | 210>(180);

  const basicSpotlights = [
    { amount: 5, dailyProfit: 0.25, totalProfit: 7.5, days: 30, tag: "Starter Trial" },
    { amount: 10, dailyProfit: 0.50, totalProfit: 15.0, days: 30, tag: "Micro Basic" },
    { amount: 20, dailyProfit: 1.00, totalProfit: 30.0, days: 30, tag: "Airdrop Unlock" },
    { amount: 50, dailyProfit: 2.50, totalProfit: 75.0, days: 30, tag: "Bronze Growth" },
    { amount: 100, dailyProfit: 5.00, totalProfit: 150.0, days: 30, tag: "Silver Essential", popular: true },
    { amount: 500, dailyProfit: 25.00, totalProfit: 750.0, days: 30, tag: "Gold Momentum" },
    { amount: 1000, dailyProfit: 50.00, totalProfit: 1500.0, days: 30, tag: "Platinum Pro" },
    { amount: 2000, dailyProfit: 100.00, totalProfit: 3000.0, days: 30, tag: "Diamond Elite" },
    { amount: 5000, dailyProfit: 250.00, totalProfit: 7500.0, days: 30, tag: "Crown Whale", popular: true },
  ];

  return (
    <section id="packages" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            HIGH-YIELD WEALTH PORTFOLIOS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Investment Packages
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Choose between flexible daily cashflow in Basic Saving or high-yield exponential staking in Fix Deposit.
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
              Basic Saving (Daily 5%)
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
              Fix Deposit (10% - 15% Daily)
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
                    Daily Flexible Liquidity
                  </span>
                  <h3 className="font-display text-2xl sm:text-4xl font-black text-[var(--text-main)] mt-2">
                    Basic Saving Package
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm sm:text-base mt-1 font-medium">
                    Investment Range: <strong>$5 to $5,000 USDT</strong> &bull; Settlement: <strong>USDT BEP-20</strong>
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="font-display text-4xl sm:text-5xl font-black text-emerald-500 dark:text-emerald-400">
                    5% Daily ROI
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-semibold">
                    1% Profit + 4% Principal for 25-30 Days (150% Total Return)
                  </div>
                </div>
              </div>

              {/* 3 Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-inner-panel">
                  <div className="text-xs text-[var(--text-subtle)] font-semibold uppercase">Daily Return Formula</div>
                  <div className="text-lg font-bold text-[var(--text-main)] mt-1">1% Net Profit + 4% Principal Return</div>
                </div>

                <div className="p-4 rounded-2xl bg-inner-panel">
                  <div className="text-xs text-[var(--text-subtle)] font-semibold uppercase">Withdrawal Window</div>
                  <div className="text-lg font-bold text-amber-500 dark:text-amber-300 mt-1">Daily 10:00 AM - 02:00 PM IST</div>
                </div>

                <div className="p-4 rounded-2xl bg-inner-panel">
                  <div className="text-xs text-[var(--text-subtle)] font-semibold uppercase">Fee Structure</div>
                  <div className="text-lg font-bold text-emerald-500 dark:text-emerald-400 mt-1">0% Admin Fee &bull; 0% TDS</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Instant wallet credit &bull; Principal amortized daily &bull; Minimum withdrawal $2.00 USDT
                </span>
                <Link
                  href="/register"
                  className="w-full sm:w-auto gold-btn px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  Activate Basic Package <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Spotlight Grid of Basic Tiers (from PDF slides 8-16) */}
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h4 className="font-display text-xl font-bold text-[var(--text-main)]">
                  Popular Basic Saving Spotlights
                </h4>
                <p className="text-xs text-[var(--text-subtle)]">
                  Choose an investment amount and view your guaranteed daily yield
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicSpotlights.map((tier) => (
                  <div
                    key={tier.amount}
                    className={`glass-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 ${
                      tier.popular ? "border-amber-400/80 shadow-amber-500/10 shadow-lg ring-1 ring-amber-400/30" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                          {tier.tag}
                        </span>
                        {tier.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="font-display text-3xl font-black text-[var(--text-main)]">
                        ${tier.amount} <span className="text-xs font-bold text-[var(--text-subtle)]">USDT</span>
                      </div>

                      <div className="my-4 p-3 rounded-xl bg-inner-panel space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Daily 5% ROI:</span>
                          <span className="font-bold text-emerald-500 dark:text-emerald-400">
                            ${tier.dailyProfit.toFixed(2)}/day
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">30-Day Return:</span>
                          <span className="font-bold text-[var(--text-main)]">
                            ${tier.totalProfit.toFixed(2)} USDT (150%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">10% Direct Bonus:</span>
                          <span className="font-bold text-amber-500">
                            ${(tier.amount * 0.1).toFixed(2)} USDT
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold text-center transition block"
                    >
                      Invest ${tier.amount}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIX DEPOSIT (FD) PROGRAM VIEW */}
        {activePlanType === "fd" && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-cyan-500 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest">
                INSTITUTIONAL FIXED CAPITAL STAKING
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-black text-[var(--text-main)] mt-1">
                Fix Deposit (FD) Program
              </h3>
              <p className="text-[var(--text-muted)] text-sm sm:text-base mt-2">
                Yield 10% To 15% Daily. Principal and profits released at contract maturity (180 or 210 Days).
              </p>

              {/* FD Tenure Switcher */}
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
                  180 Days Plan (10% Daily ROI)
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
                  210 Days Plan (15% Daily ROI)
                </button>
              </div>
            </div>

            {/* FD Packages Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {APP_CONFIG.fdPlans.map((pkg) => {
                const selectedPlan = pkg.plans.find((p) => p.days === fdActiveTenure)!;
                return (
                  <div
                    key={pkg.id}
                    className={`glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition ${
                      pkg.featured ? "border-amber-400/80 shadow-amber-500/10 shadow-lg ring-1 ring-amber-400/30" : ""
                    }`}
                  >
                    <div>
                      {pkg.featured && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2">
                          Most Popular
                        </span>
                      )}
                      <div className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-wider">
                        {pkg.tier}
                      </div>
                      <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mt-1">
                        ${pkg.amountUsdt} <span className="text-xs text-[var(--text-subtle)]">USDT</span>
                      </div>

                      <div className="my-6 p-4 rounded-2xl bg-inner-panel space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Daily Return:</span>
                          <span className="font-bold text-[var(--text-main)]">${selectedPlan.dailyUsdt}/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Total Profit:</span>
                          <span className="font-bold text-emerald-500 dark:text-emerald-400">
                            ${selectedPlan.profitUsdt} USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Maturity:</span>
                          <span className="font-bold text-cyan-500 dark:text-cyan-400">{selectedPlan.days} Days</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)]">Direct Bonus:</span>
                          <span className="font-bold text-amber-500">
                            ${(pkg.amountUsdt * 0.1).toFixed(2)} USDT
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold text-center transition block"
                    >
                      Choose {pkg.tier}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}