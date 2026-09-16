"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Award, Building2 } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const pdfHref = `/api/download-presentation?theme=${isLight ? "light" : "dark"}&v=20260916`;
  const pdfFileName = isLight ? "Dubai_Finance_Presentation_Light.pdf" : "Dubai_Finance_Presentation_Dark.pdf";
  const pdfTitle = isLight
    ? "Download Light PDF Deck (23 Slides)"
    : "Download Dark PDF Deck (23 Slides)";

  return (
    <section className="relative z-10 pt-10 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Skyline with Theme-Aware Gradient Masks */}
      <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden opacity-15 dark:opacity-25 pointer-events-none">
        <Image
          src="/assets/hero_skyline.jpg"
          alt="Dubai Skyline Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)] via-transparent to-[var(--bg-main)]" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Official Brand Badge from Slide 1 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>DUBAI FINANCE &bull; PRE-LAUNCHING PHASE &bull; POWERED BY USDT (BEP-20)</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-[var(--text-main)]">
          Decentralized High-Yield <br />
          <span className="gold-gradient">Wealth Ecosystem.</span>
        </h1>

        {/* Subtitle & Value Proposition strictly from Dubai_Finance_Presentation_Dark.pdf Slide 1 & 2 */}
        <p className="text-base sm:text-xl text-[var(--text-muted)] leading-relaxed mb-8 max-w-3xl mx-auto font-medium">
          Join with as low as <strong className="text-amber-500 dark:text-amber-300 font-bold">$5 USDT</strong>.
          Backed by <strong>30+ Years</strong> of cross-industry mastery and <strong>10+ Years</strong> of crypto market leadership ($25+ Million generated). Earn{" "}
          <span className="text-amber-500 dark:text-amber-300 font-bold">5% Daily Basic ROI for 28 Days (140% Return)</span>,{" "}
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">10% &amp; 15% Fix Deposit (FD)</span>, and{" "}
          <span className="text-cyan-500 dark:text-cyan-400 font-bold">10% Instant Direct Commission</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          <Link
            href="/register"
            className="w-full sm:w-auto gold-btn px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20"
          >
            Start with $5 USDT <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Theme-Aware Dynamic PDF Download Button */}
          <a
            href={pdfHref}
            download={pdfFileName}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-amber-500/30 bg-[var(--bg-card)] hover:border-amber-400 text-[var(--text-main)] text-base font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5 text-amber-500" />
            {pdfTitle}
          </a>

          <a
            href="#packages"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-amber-500/40 text-[var(--text-muted)] text-base font-semibold transition flex items-center justify-center gap-2"
          >
            View Packages ($5 - $5,000)
          </a>
        </div>

        {/* Live Trust Bar from Slide 1 & 3 */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-[var(--text-subtle)] mb-12 font-medium">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-500" />
            Latifa Tower, Sheikh Zayed Road, Dubai
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% USDT (BEP-20) Binance Smart Chain
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-500" />
            $25+ Million Institutional Liquidity
          </span>
        </div>
      </div>

      {/* 4 Core Pillars Metric Cards strictly from Dubai_Finance_Presentation_Dark.pdf */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {/* Card 1: Daily Basic ROI */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mb-1">
            5% Daily
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Basic ROI (28 Days)
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            140% Total Gross Payout
          </div>
        </div>

        {/* Card 2: Fix Deposit (FD) */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto mb-3">
            🏦
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 mb-1">
            10% &amp; 15%
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Fix Deposit (FD) ROI
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            18X &amp; 31.5X Total Return
          </div>
        </div>

        {/* Card 3: Direct Referral */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
            ⚡
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mb-1">
            10% Instant
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Direct Referral Bonus
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            Every sponsor ($5 - $5,000)
          </div>
        </div>

        {/* Card 4: Team Royalties */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mx-auto mb-3">
            👥
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-cyan-500 dark:text-cyan-400 mb-1">
            12 Levels
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Daily Team Royalty
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            5% - 3% - 2% - 1% Matrix
          </div>
        </div>
      </div>
    </section>
  );
}