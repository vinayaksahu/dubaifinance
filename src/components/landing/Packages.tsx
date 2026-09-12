"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { formatInr, formatUsdt, inrToUsdt } from "@/lib/utils";

export function Packages() {
  const [fdActiveTab, setFdActiveTab] = useState<180 | 210>(180);

  return (
    <section id="packages" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            PROVEN WEALTH PORTFOLIOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Investment Packages
          </h2>
          <p className="text-slate-400 mt-2">
            Choose between flexible daily basic growth or long-term high-yield fixed staking.
          </p>
        </div>

        {/* BASIC SAVING PLAN */}
        <div className="glass-card-gold p-8 rounded-3xl mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-amber-500/30 mb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Flexible Daily Capital
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Basic Saving Package
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Investment Range: <strong>$5 to $5,000 USDT</strong>
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                5% Daily ROI
              </div>
              <div className="text-xs text-slate-300 mt-1">30 Consecutive Days (150% Total Return)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
              <div className="text-xs text-slate-400">Daily Return Breakdown</div>
              <div className="text-lg font-bold text-white mt-1">1% Profit + 4% Principal</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
              <div className="text-xs text-slate-400">Contract Tenure</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">30 Days</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
              <div className="text-xs text-slate-400">Withdrawal Availability</div>
              <div className="text-lg font-bold text-amber-300 mt-1">Daily 10 AM - 2 PM</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero deduction on withdrawals &bull; Instant wallet credits
            </span>
            <Link
              href="/register"
              className="gold-btn px-6 py-2.5 rounded-xl text-sm font-bold"
            >
              Invest Now
            </Link>
          </div>
        </div>

        {/* FIX DEPOSIT (FD) PROGRAM */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
              INSTITUTIONAL FIXED STAKING
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Fix Deposit (FD) Program
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Earn 10% To 15% Daily Fixed Yield. Released upon maturity (180 or 210 Days).
            </p>

            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6">
              <button
                onClick={() => setFdActiveTab(180)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                  fdActiveTab === 180
                    ? "bg-amber-400 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Plan 180 Days (10% Daily)
              </button>
              <button
                onClick={() => setFdActiveTab(210)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                  fdActiveTab === 210
                    ? "bg-emerald-400 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Plan 210 Days (15% Daily)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {APP_CONFIG.fdPlans.map((pkg) => {
              const selectedPlan = pkg.plans.find((p) => p.days === fdActiveTab)!;
              return (
                <div
                  key={pkg.id}
                  className={`glass-card p-6 rounded-2xl flex flex-col justify-between transition hover:-translate-y-1 ${
                    pkg.featured ? "border-amber-400/80 shadow-amber-500/20 shadow-xl" : ""
                  }`}
                >
                  <div>
                    {pkg.featured && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider mb-2">
                        Most Popular
                      </span>
                    )}
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {pkg.tier}
                    </div>
                    <div className="text-2xl font-black text-amber-300 mt-1">
                      ${pkg.amountUsdt || (pkg.amountInr / 110).toFixed(0)} USDT
                    </div>

                    <div className="my-6 p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Daily Return:</span>
                        <span className="font-bold text-white">${selectedPlan.dailyUsdt || (selectedPlan.dailyInr / 110).toFixed(1)}/day</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Profit:</span>
                        <span className="font-bold text-emerald-400">
                          ${selectedPlan.profitUsdt || (selectedPlan.profitInr / 110).toFixed(0)} USDT
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-bold text-cyan-400">{selectedPlan.days} Days</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="w-full py-2.5 rounded-xl border border-amber-400/40 text-amber-300 text-xs font-bold text-center hover:bg-amber-400/10 transition block"
                  >
                    Choose Plan
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}