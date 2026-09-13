import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Award, Building2 } from "lucide-react";

export function Hero() {
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
        {/* Official Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>DUBAI FINANCE &bull; OFFICIAL PRESENTATION &bull; LAUNCHED DEC 15, 2023</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-[var(--text-main)]">
          Institutional Crypto Trading, <br />
          <span className="gold-gradient">Guaranteed Daily Yields.</span>
        </h1>

        {/* Subtitle & Value Proposition from PDF */}
        <p className="text-base sm:text-xl text-[var(--text-muted)] leading-relaxed mb-8 max-w-3xl mx-auto font-medium">
          Automated wealth generation powered by <strong>25+ Years</strong> of real-world business legacy and{" "}
          <strong>7+ Years</strong> of elite crypto proprietary trading. Earn{" "}
          <span className="text-amber-500 dark:text-amber-300 font-bold">5% to 15% Daily ROI</span> settled in{" "}
          <strong className="text-emerald-500 dark:text-emerald-400">USDT BEP-20</strong> with zero deductions.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          <Link
            href="/register"
            className="w-full sm:w-auto gold-btn px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20"
          >
            Claim Free $1.00 USDT Airdrop <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="/Dubai_Finance_Presentation.pdf"
            download
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-amber-500/30 bg-[var(--bg-card)] hover:border-amber-400 text-[var(--text-main)] text-base font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5 text-amber-500" />
            Download PDF Deck (40+ Slides)
          </a>

          <a
            href="#packages"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-amber-500/40 text-[var(--text-muted)] text-base font-semibold transition flex items-center justify-center gap-2"
          >
            Explore Packages
          </a>
        </div>

        {/* Live Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-[var(--text-subtle)] mb-12 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Zero Admin Charge &bull; Zero TDS
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-500" />
            Al Tayer Building, S.Z Road, Dubai
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-500" />
            100+ Crore $ Crypto Volume
          </span>
        </div>
      </div>

      {/* 4 Core Pillars Metric Cards from PDF */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {/* Card 1: Daily ROI */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mb-1">
            5% - 15%
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Daily ROI Packages
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            Basic 5% &bull; FD 10%-15%
          </div>
        </div>

        {/* Card 2: Currency */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto mb-3">
            💵
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 mb-1">
            USDT BEP-20
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Stable Dollar Settlement
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            Instant on-chain speed
          </div>
        </div>

        {/* Card 3: Direct Referral */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
            🎁
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-300 mb-1">
            10% Instant
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Direct Referral Bonus
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            Every deposit &amp; re-topup
          </div>
        </div>

        {/* Card 4: Team Royalties */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mx-auto mb-3">
            👑
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-cyan-500 dark:text-cyan-400 mb-1">
            12 Levels Deep
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Daily Team Royalties
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1">
            Calculated on team ROI
          </div>
        </div>
      </div>
    </section>
  );
}