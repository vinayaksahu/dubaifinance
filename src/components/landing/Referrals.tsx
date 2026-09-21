"use client";

import { useState, useEffect } from "react";
import { Gift, Users, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function Referrals() {
  const [isPrelaunch, setIsPrelaunch] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.PRELAUNCH_MODE === "true") {
            const targetDateStr = data.configs.PRELAUNCH_TARGET_DATE || "2026-09-21T20:00";
            let targetTime: number;
            if (/[+-]\d{2}(:\d{2})?$|Z$/i.test(targetDateStr)) {
              targetTime = new Date(targetDateStr).getTime();
            } else {
              targetTime = new Date(`${targetDateStr}:00+04:00`).getTime();
            }

            const evaluateMode = () => {
              if (!isNaN(targetTime) && Date.now() >= targetTime) {
                setIsPrelaunch(false);
              } else {
                setIsPrelaunch(true);
              }
            };

            evaluateMode();
            timer = setInterval(evaluateMode, 1000);
          } else {
            setIsPrelaunch(false);
          }
        }
      })
      .catch(() => {});

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);
  // Exact 12-Level Royalty Matrix from Dubai_Finance_Presentation_Dark.pdf Slide 16 & 17
  const levels = [
    { level: 1, percent: 5, rule: "1 Direct Referral", totalDirects: "1 Direct", color: "text-amber-500 dark:text-amber-300" },
    { level: 2, percent: 3, rule: "+1 Direct Referral", totalDirects: "2 Directs", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 3, percent: 2, rule: "+1 Direct Referral", totalDirects: "3 Directs", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 4, percent: 2, rule: "+1 Direct Referral", totalDirects: "4 Directs", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 5, percent: 2, rule: "+1 Direct Referral", totalDirects: "5 Directs", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 6, percent: 2, rule: "+1 Direct Referral", totalDirects: "6 Directs", color: "text-emerald-500 dark:text-emerald-400" },
    { level: 7, percent: 1, rule: "+1 Direct Referral", totalDirects: "7 Directs", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 8, percent: 1, rule: "+1 Direct Referral", totalDirects: "8 Directs", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 9, percent: 1, rule: "+1 Direct Referral", totalDirects: "9 Directs", color: "text-cyan-500 dark:text-cyan-400" },
    { level: 10, percent: 1, rule: "+1 Direct Referral", totalDirects: "10 Directs", color: "text-purple-500 dark:text-purple-400" },
    { level: 11, percent: 1, rule: "+1 Direct Referral", totalDirects: "11 Directs", color: "text-purple-500 dark:text-purple-400" },
    { level: 12, percent: 1, rule: "+1 Direct Referral", totalDirects: "12 Directs Total", color: "text-amber-500 dark:text-amber-300" },
  ];

  return (
    <section id="referrals" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            INCOME STREAMS #3 &amp; #4 &bull; SLIDES 15-17
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            10% Instant Direct &amp; 12-Level Team Royalty
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Earn 10% Instant Cash Bonus on every personal partner activation, plus daily recurring royalties up to 12 generations deep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: 10% Direct Bonus Card (5 Cols) from Slide 15 */}
          <div className="lg:col-span-5 glass-card-gold p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-sm">
                <Gift className="w-7 h-7" />
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                Income Stream #3 &bull; Slide 15
              </span>

              <h3 className="font-display text-3xl sm:text-4xl font-black text-[var(--text-main)] mt-3">
                10% Instant Direct Referral
              </h3>

              <p className="text-[var(--text-muted)] text-sm sm:text-base mt-3 leading-relaxed">
                The moment your sponsored partner activates any package from <strong>$5 to $5,000 USDT</strong>, exactly <strong>10%</strong> is instantly credited to your withdrawal wallet.
              </p>

              {/* Exact Examples from Slide 15 */}
              <div className="my-6 p-4 rounded-2xl bg-inner-panel text-xs sm:text-sm space-y-2.5">
                <div className="font-bold text-amber-500 uppercase tracking-wider text-xs">
                  Direct Earning Examples (Slide 15):
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Refer $100 Package:</span>
                  <strong className="text-amber-500">+$10.00 USDT Instant</strong>
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Refer $500 Package:</span>
                  <strong className="text-amber-500">+$50.00 USDT Instant</strong>
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Refer $1,000 Package:</span>
                  <strong className="text-amber-500">+$100.00 USDT Instant</strong>
                </div>
                <div className="flex justify-between text-[var(--text-main)]">
                  <span>Direct Refer $5,000 Package:</span>
                  <strong className="text-amber-500">+$500.00 USDT Instant</strong>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--text-subtle)] mb-4 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Direct Potential &bull; 100% withdrawable immediately</span>
              </div>

              {isPrelaunch ? (
                <a
                  href="#calculator"
                  className="gold-btn w-full py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
                >
                  Calculate 10% Direct Commission <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  href="/register"
                  className="gold-btn w-full py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
                >
                  Share &amp; Earn 10% Instant <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: 12-Level Royalty Matrix (7 Cols) from Slide 16 & 17 */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[var(--border-subtle)] mb-6">
                <div>
                  <h4 className="font-display text-xl sm:text-2xl font-black text-[var(--text-main)]">
                    Daily 12-Level Team Royalty
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                    Paid every single day (Mon-Sun) based on your downline&apos;s daily ROI yield
                  </p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold shrink-0">
                  Daily Recurring (Mon-Sun)
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
                      {item.percent}% Daily
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">
                      {item.totalDirects}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crucial Direct Qualifier Box from Slide 16 & 17 */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--text-muted)] leading-relaxed">
              <strong className="text-amber-500 uppercase tracking-wider block mb-1">
                Direct Qualifier Condition (Slide 16 &amp; 17):
              </strong>
              Sponsoring a <strong>$50+ ID</strong> fulfills the condition to unlock all 12 downline levels (member&apos;s personal ID can be as low as <strong>$10 USDT</strong>). Exactly 1 direct unlocks each progressive level up to 12 Directs total. Zero flushing, zero lapse of downline volume!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}