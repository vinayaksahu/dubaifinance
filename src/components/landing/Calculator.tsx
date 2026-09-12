"use client";

import { useState } from "react";
import { formatInr } from "@/lib/utils";

export function Calculator() {
  const [calcAmount, setCalcAmount] = useState<number>(100);

  const daily5Percent = calcAmount * 0.05;
  const in30Days = calcAmount * 1.50;
  const in60Days = calcAmount * 3.0;
  const in90Days = calcAmount * 6.5;

  return (
    <section id="calculator" className="relative z-10 py-20 border-t border-slate-800 bg-slate-950/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            WEALTH MULTIPLICATION ENGINE
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            Power of Compounding Calculator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            See projected returns when reinvesting your Daily 5% Basic ROI
          </p>
        </div>

        <div className="glass-card-gold p-8 rounded-3xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-300">
                Select Investment Amount:
              </label>
              <span className="text-2xl font-black text-amber-300">
                ${calcAmount.toLocaleString()} USDT
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="5000"
              step="5"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>$5</span>
              <span>$500</span>
              <span>$2,000</span>
              <span>$5,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold">Daily 5% ROI</div>
              <div className="text-xl font-black text-amber-300 mt-1">
                ${daily5Percent.toFixed(2)} USDT
              </div>
              <div className="text-[10px] text-slate-500">Every Single Day</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold">30 Days Return</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                ${in30Days.toFixed(2)} USDT
              </div>
              <div className="text-[10px] text-slate-500">150% Maturity</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold">60 Days Compound</div>
              <div className="text-xl font-black text-cyan-400 mt-1">
                ${in60Days.toFixed(2)} USDT
              </div>
              <div className="text-[10px] text-slate-500">3.0x Multiplier</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold">90 Days Compound</div>
              <div className="text-xl font-black text-purple-400 mt-1">
                ${in90Days.toFixed(2)} USDT
              </div>
              <div className="text-[10px] text-slate-500">6.5x Growth</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}