"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, DollarSign, Calculator as CalcIcon } from "lucide-react";

export function Calculator() {
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [dailyRoiPercent, setDailyRoiPercent] = useState<number>(5.0);
  const [tenureDays, setTenureDays] = useState<number>(30);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.configs) {
          if (data.configs.BASIC_PLAN_DAILY_ROI) {
            setDailyRoiPercent(Number(data.configs.BASIC_PLAN_DAILY_ROI));
          }
          if (data.configs.BASIC_PLAN_TENURE_DAYS) {
            setTenureDays(Number(data.configs.BASIC_PLAN_TENURE_DAYS));
          }
        }
      })
      .catch(() => {});
  }, []);

  const presets = [10, 50, 100, 500, 1000, 2000, 5000];

  const dailyReturn = calcAmount * (dailyRoiPercent / 100);
  const tenureReturn = dailyReturn * tenureDays;
  const tenureMultiplier = (dailyRoiPercent * tenureDays);

  return (
    <section id="calculator" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            EXPONENTIAL WEALTH MULTIPLIER
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Power of Compounding Calculator
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base mt-2 font-medium">
            Simulate your projected growth when compounding the Daily {dailyRoiPercent}% Basic ROI ({tenureDays} Days Term)
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
                ${val.toLocaleString()} USDT
              </button>
            ))}
          </div>

          {/* Slider input */}
          <div className="mb-10 p-6 rounded-2xl bg-inner-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <label className="text-sm font-bold text-[var(--text-main)]">
                Selected Staking Principal:
              </label>
              <div className="font-display text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-300">
                ${calcAmount.toLocaleString()} <span className="text-sm font-bold text-[var(--text-subtle)]">USDT</span>
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
              <span>$500</span>
              <span>$1,000</span>
              <span>$2,500</span>
              <span>Max: $5,000 USDT</span>
            </div>
          </div>

          {/* 4 Compounding Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1: Daily */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                Daily {dailyRoiPercent}% ROI
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mt-2">
                ${dailyReturn.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                1% Profit + 4% Principal / Day
              </div>
            </div>

            {/* 2: Tenure Days */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                {tenureDays} Days Compound
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 mt-2">
                ${tenureReturn.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                {tenureMultiplier}% Capital + Profit
              </div>
            </div>

            {/* 3: 2x Tenure */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                {tenureDays * 2} Days Compound
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-cyan-500 dark:text-cyan-400 mt-2">
                ${(tenureReturn * 2.25).toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                ~2.25x Growth Multiplier
              </div>
            </div>

            {/* 4: 3x Tenure */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider">
                {tenureDays * 3} Days Compound
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-500 dark:text-purple-400 mt-2">
                ${(tenureReturn * 4.5).toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                ~4.5x Exponential Return
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-amber-500/20 text-center text-xs text-[var(--text-subtle)]">
            *Projections based on regular compounding re-investment of daily earnings. Results settle in USDT BEP-20 with zero admin charges.
          </div>
        </div>
      </div>
    </section>
  );
}