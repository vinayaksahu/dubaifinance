"use client";

import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Rocket, Calendar, ShieldCheck, Globe } from "lucide-react";

interface CountdownBannerProps {
  targetDateStr?: string;
  title?: string;
}

export function CountdownBanner({
  targetDateStr = "2026-09-21T20:00",
  title = "OFFICIAL GLOBAL PLATFORM LAUNCH • SEPTEMBER 21, 2026",
}: CountdownBannerProps) {
  const [activeTz, setActiveTz] = useState<"ALL" | "GST" | "IST" | "UTC">("ALL");
  const [clocks, setClocks] = useState({
    gst: "",
    ist: "",
    utc: "",
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      // 100% accurate multi-timezone clocks using native IANA timezones
      const nowDate = new Date();
      const formatT = (date: Date, timeZone: string) => {
        try {
          return new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(date);
        } catch {
          return date.toLocaleTimeString();
        }
      };

      setClocks({
        gst: formatT(nowDate, "Asia/Dubai"),
        ist: formatT(nowDate, "Asia/Kolkata"),
        utc: formatT(nowDate, "UTC"),
      });

      // Parse target time with Dubai timezone (GST, UTC+04:00) support
      let targetTime: number;
      if (!targetDateStr) {
        targetTime = NaN;
      } else if (/[+-]\d{2}(:\d{2})?$|Z$/i.test(targetDateStr)) {
        targetTime = new Date(targetDateStr).getTime();
      } else {
        // Standardize YYYY-MM-DDTHH:MM to Dubai timezone (UTC+4)
        targetTime = new Date(`${targetDateStr}:00+04:00`).getTime();
      }
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-4 mb-8 sm:mb-12">
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1322] via-[#090f1d] to-[#161226] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70" />

        <div className="relative z-10 text-center">
          {/* Badge & Title Lockup */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider mb-3 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pre-Launching Phase Live Countdown</span>
          </div>

          <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto font-medium">
            Institutional USDT (BEP-20) Wealth Protocol. Public member registration and live package activations unlock in:
          </p>

          {/* Big Digital Timer Grid */}
          {timeLeft.isPast ? (
            <div className="my-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto">
              <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
              <h3 className="font-display text-xl font-bold text-amber-300">
                LAUNCH DAY IS HERE!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Public member access and contract activations are now opening.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto my-6 sm:my-8">
              {/* DAYS */}
              <div className="relative rounded-2xl p-3 sm:p-5 bg-black/60 border border-amber-500/30 shadow-inner backdrop-blur-md flex flex-col items-center justify-center group hover:border-amber-400/60 transition">
                <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-amber-400 tracking-tight leading-none drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  {pad(timeLeft.days)}
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                  Days
                </div>
              </div>

              {/* HOURS */}
              <div className="relative rounded-2xl p-3 sm:p-5 bg-black/60 border border-amber-500/30 shadow-inner backdrop-blur-md flex flex-col items-center justify-center group hover:border-amber-400/60 transition">
                <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-amber-300 tracking-tight leading-none drop-shadow-[0_0_15px_rgba(252,211,77,0.3)]">
                  {pad(timeLeft.hours)}
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                  Hours
                </div>
              </div>

              {/* MINUTES */}
              <div className="relative rounded-2xl p-3 sm:p-5 bg-black/60 border border-amber-500/30 shadow-inner backdrop-blur-md flex flex-col items-center justify-center group hover:border-amber-400/60 transition">
                <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-cyan-400 tracking-tight leading-none drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  {pad(timeLeft.minutes)}
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                  Minutes
                </div>
              </div>

              {/* SECONDS */}
              <div className="relative rounded-2xl p-3 sm:p-5 bg-black/60 border border-amber-500/30 shadow-inner backdrop-blur-md flex flex-col items-center justify-center group hover:border-amber-400/60 transition">
                <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-emerald-400 tracking-tight leading-none drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse">
                  {pad(timeLeft.seconds)}
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                  Seconds
                </div>
              </div>
            </div>
          )}

          {/* Multi-Timezone Selector Bar */}
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Timezone:</span>
            </span>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTz("GST")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTz === "GST"
                    ? "bg-amber-500 text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🇦🇪 GST (Dubai • Primary)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTz("IST")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTz === "IST"
                    ? "bg-blue-500 text-white shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🇮🇳 IST (India)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTz("UTC")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTz === "UTC"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🌐 UTC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTz("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTz === "ALL"
                    ? "bg-purple-500 text-white shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>All Zones</span>
              </button>
            </div>
          </div>

          {/* Multi-Timezone Live Details - Always Display All 3 Cards with Active Highlighting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto my-3 text-left">
            {/* 1. DUBAI (GST) */}
            <div
              onClick={() => setActiveTz("GST")}
              className={`p-3 rounded-2xl bg-black/60 border cursor-pointer transition-all ${
                activeTz === "GST"
                  ? "border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40 scale-[1.02]"
                  : "border-amber-500/40 hover:border-amber-400/70"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <span>🇦🇪 Dubai (GST, UTC+4)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black">PRIMARY</span>
              </div>
              <div className="text-sm font-black text-white mt-1">08:00 PM GST</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Live Clock: <span className="text-amber-300 font-bold">{clocks.gst || "..."}</span>
              </div>
            </div>

            {/* 2. INDIA (IST) */}
            <div
              onClick={() => setActiveTz("IST")}
              className={`p-3 rounded-2xl bg-black/60 border cursor-pointer transition-all ${
                activeTz === "IST"
                  ? "border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/40 scale-[1.02]"
                  : "border-blue-500/40 hover:border-blue-400/70"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                <span>🇮🇳 India (IST, UTC+5:30)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">IST</span>
              </div>
              <div className="text-sm font-black text-white mt-1">09:30 PM IST</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Live Clock: <span className="text-blue-300 font-bold">{clocks.ist || "..."}</span>
              </div>
            </div>

            {/* 3. GLOBAL (UTC) */}
            <div
              onClick={() => setActiveTz("UTC")}
              className={`p-3 rounded-2xl bg-black/60 border cursor-pointer transition-all ${
                activeTz === "UTC"
                  ? "border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/40 scale-[1.02]"
                  : "border-cyan-500/40 hover:border-cyan-400/70"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                <span>🌐 Global (UTC, UTC+0)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">UTC</span>
              </div>
              <div className="text-sm font-black text-white mt-1">04:00 PM UTC</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Live Clock: <span className="text-cyan-300 font-bold">{clocks.utc || "..."}</span>
              </div>
            </div>
          </div>

          {/* Highlights Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 pt-3 font-medium border-t border-white/5 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: September 21, 2026</span>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {activeTz === "GST" && "08:00 PM GST (Dubai Time • Primary) Live Activation"}
                {activeTz === "IST" && "09:30 PM IST (India Time) Live Activation"}
                {activeTz === "UTC" && "04:00 PM UTC (Universal Time) Live Activation"}
                {activeTz === "ALL" && "08:00 PM GST / 09:30 PM IST / 04:00 PM UTC Live Activation"}
              </span>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Packages: $5 to $5,000 USDT</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
