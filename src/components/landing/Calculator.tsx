"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, DollarSign, Calculator as CalcIcon } from "lucide-react";

export function Calculator() {
  const [calcAmount, setCalcAmount] = useState<number>(100);

  const presets = [5, 10, 20, 50, 100, 500, 1000, 2000, 5000];

  // Exact 28-day tenure calculations from Dubai_Finance_Presentation_Dark.pdf Slides 05-09 & 11
  const daily5Percent = calcAmount * 0.05;
  const day7Return = calcAmount * 0.35;
  const day14Return = calcAmount * 0.70;
  const day28Gross = calcAmount * 1.40;
  const day28NetProfit = calcAmount * 0.40;

  // Cycle compounding projections
  const cycle2 = calcAmount * 1.96; // 56 days (1.4^2)
  const cycle3 = calcAmount * 2.74; // 84 days (1.4^3)
  const cycle4 = calcAmount * 3.84; // 112 days (1.4^4)

  return (
    <section id="calculator" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            28-DAY FINANCIAL RETURNS CALCULATOR &bull; SLIDES 09 &amp; 11
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Interactive Yield Calculator
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base mt-2 font-medium">
            Calculate your exact daily cashflow and 28-day 140% contractual return based on Dubai Finance parameters.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="glass-card-gold p-6 sm:p-10 rounded-3xl shadow-2xl">
          {/* Preset buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs font-bold text-[var(--text-muted)] mr-2 flex items-center gap-1">
              <CalcIcon className="w-3.5 h-3.5 text-amber-500" /> Presets:
            </span>
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCalcAmount(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  calcAmount === val
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "bg-inner-panel text-[var(--text-main)] hover:border-amber-400/50"
                }`}
              >
                ${val} USDT
              </button>
            ))}
          </div>

          {/* Slider input */}
          <div className="mb-10 p-6 rounded-2xl bg-inner-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <label className="text-sm font-bold text-[var(--text-main)]">
                Selected Staking Amount:
              </label>
              <div className="font-display text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-300">
                ${calcAmount.toLocaleString()} <span className="text-sm font-bold text-[var(--text-subtle)]">USDT BEP-20</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="5000"
              step="5"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full h-3 bg-slate-800/20 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 transition"
            />
            <div className="flex justify-between text-xs text-[var(--text-subtle)] mt-2 font-semibold">
              <span>Min: $5</span>
              <span>$100</span>
              <span>$500</span>
              <span>$1,000</span>
              <span>Max: $5,000 USDT</span>
            </div>
          </div>

          {/* 4 Compounding Cards Grid strictly following Slide 09 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1: Daily */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                Daily 5% ROI
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mt-2">
                ${daily5Percent.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                7 Days a Week (Mon-Sun)
              </div>
            </div>

            {/* 2: 7 Days */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                7 Days Payout
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 mt-2">
                ${day7Return.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                35% of Principal
              </div>
            </div>

            {/* 3: 14 Days */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                14 Days Payout
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-cyan-500 dark:text-cyan-400 mt-2">
                ${day14Return.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                70% of Principal
              </div>
            </div>

            {/* 4: 28 Days Gross & Net */}
            <div className="glass-card p-5 rounded-2xl text-center ring-1 ring-amber-400/40">
              <div className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                28 Days Gross (140%)
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mt-2">
                ${day28Gross.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-500 mt-1 font-bold">
                +${day28NetProfit.toFixed(2)} Pure Profit (40%)
              </div>
            </div>
          </div>

          {/* Re-topup Multi-Cycle Compounding Table */}
          <div className="mt-8 pt-6 border-t border-amber-500/20">
            <div className="text-xs font-bold text-[var(--text-main)] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Re-Topup Facility Compounding Multipliers (Slide 11):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-inner-panel flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Cycle 2 (56 Days):</span>
                <strong className="text-emerald-500 font-bold">${cycle2.toFixed(2)} USDT (1.96x)</strong>
              </div>
              <div className="p-3 rounded-xl bg-inner-panel flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Cycle 3 (84 Days):</span>
                <strong className="text-cyan-500 font-bold">${cycle3.toFixed(2)} USDT (2.74x)</strong>
              </div>
              <div className="p-3 rounded-xl bg-inner-panel flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Cycle 4 (112 Days):</span>
                <strong className="text-purple-500 font-bold">${cycle4.toFixed(2)} USDT (3.84x)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}