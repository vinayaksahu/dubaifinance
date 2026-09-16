"use client";

import { Download, ExternalLink, FileText, CheckCircle2, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function PresentationDownload() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const downloadFeatures = [
    "Full 23 High-Definition Slides (1920x1080 Landscape Deck)",
    "All 10 Investment Packages ($5, $10, $25, $50, $100, $200, $500, $1,000, $2,500, $5,000)",
    "New Growth Ruby ($200 USDT): $10.00/Day | $280.00 Gross (140%) | $80.00 Net (40%)",
    "Complete 28-Day Projections Matrix (7-Day, 14-Day, 28-Day Returns)",
    "10% Instant Direct Commission & 12-Level Team Royalty Income Matrix",
    "8 Milestone Leadership Ranks with Luxury Cars, Villas & Royalties",
    "Fix Deposit (FD) High-Yield Modules: 10% & 15% Daily Yield (180D & 210D)",
    "Official CMD Corporate Office Details: Latifa Tower, Sheikh Zayed Road, Dubai",
  ];

  return (
    <section id="download" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>OFFICIAL PRESENTATION DECK &bull; 23 SLIDES (USDT BEP-20)</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] tracking-tight">
            Download Business Presentation
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Get the official Dubai Finance investor pitch deck featuring all <strong>10 Basic Investment Packages</strong> (including the newly added <strong>$200 Growth Ruby</strong>), transparent 28-day ROI matrix, and multi-tier team compensation structures.
          </p>
        </div>

        {/* 2 Download Cards: Dark Edition & Light Edition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Card 1: Dark Edition */}
          <div className="glass-card-gold p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-all duration-300 shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" /> Official Edition
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">23 Slides &bull; PDF</span>
              </div>

              <h3 className="font-display text-2xl font-black text-[var(--text-main)] mb-2">
                Dubai Finance &bull; Dark Luxury Deck
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 font-medium">
                The flagship Dubai Gold &amp; Midnight Navy luxury presentation deck. Ideal for desktop pitch presentations, projector conferences, and high-impact investor showcases.
              </p>

              <div className="p-4 rounded-2xl bg-inner-panel mb-6 space-y-2.5 text-xs text-[var(--text-main)]">
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Package Range:</span>
                  <strong className="text-amber-500 font-black">10 Packages ($5 to $5,000 USDT)</strong>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Includes New Tier:</span>
                  <strong className="text-emerald-500 font-bold">$200 USDT (Growth Ruby)</strong>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Design Standard:</span>
                  <span>1920x1080 16:9 Ultra-HD</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/api/download-presentation?theme=dark&v=20260916"
                download="Dubai_Finance_Presentation_Dark.pdf"
                className="flex-1 gold-btn py-3.5 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" /> Download Dark PDF
              </a>
              <a
                href="/Dubai_Finance_Presentation_Dark.pdf?v=20260916"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded-xl border border-amber-500/30 bg-[var(--bg-card)] hover:border-amber-400 text-[var(--text-main)] text-sm font-bold flex items-center justify-center gap-1.5 transition"
                title="View in Browser"
              >
                <ExternalLink className="w-4 h-4 text-amber-500" /> View
              </a>
            </div>
          </div>

          {/* Card 2: Light Edition */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all duration-300 shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> Print &amp; Mobile
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">23 Slides &bull; PDF</span>
              </div>

              <h3 className="font-display text-2xl font-black text-[var(--text-main)] mb-2">
                Dubai Finance &bull; Light Print Edition
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 font-medium">
                Crisp high-contrast edition optimized for reading on mobile screens, monochrome/color office printing, and daytime community sharing.
              </p>

              <div className="p-4 rounded-2xl bg-inner-panel mb-6 space-y-2.5 text-xs text-[var(--text-main)]">
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Package Range:</span>
                  <strong className="text-amber-500 font-black">10 Packages ($5 to $5,000 USDT)</strong>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Includes New Tier:</span>
                  <strong className="text-emerald-500 font-bold">$200 USDT (Growth Ruby)</strong>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-[var(--text-muted)]">Optimal Usage:</span>
                  <span>Direct Color / B&amp;W Printing</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/api/download-presentation?theme=light&v=20260916"
                download="Dubai_Finance_Presentation_Light.pdf"
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
              >
                <Download className="w-4 h-4" /> Download Light PDF
              </a>
              <a
                href="/Dubai_Finance_Presentation_Light.pdf?v=20260916"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-cyan-400 text-[var(--text-main)] text-sm font-bold flex items-center justify-center gap-1.5 transition"
                title="View in Browser"
              >
                <ExternalLink className="w-4 h-4 text-cyan-500" /> View
              </a>
            </div>
          </div>
        </div>

        {/* Deck Contents Checklist */}
        <div className="max-w-5xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-display text-lg font-bold text-[var(--text-main)]">
                Verified Presentation Deck Checklist
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                All contents are mathematically reconciled with Dubai Finance blockchain contracts and system payout engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {downloadFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-muted)]">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}