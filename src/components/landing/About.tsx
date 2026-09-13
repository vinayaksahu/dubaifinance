import Image from "next/image";
import { Building, TrendingUp, DollarSign, Globe, MapPin, Calendar, Mail, CheckCircle2, Shield } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function About() {
  return (
    <section id="about" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            CORPORATE PROFILE &amp; LEADERSHIP
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            About Dubai Finance
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            25+ Years of Business Legacy &amp; 7+ Years of Crypto Market Mastery
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 4 Pillars (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-amber-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
                  <Building className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  25+ Years Experience
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Proven multi-decade track record in prime Real Estate development, luxury Hospitality, Wholesale trade, and global Tour &amp; Travel operations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Solid Physical Asset Base
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-emerald-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  7+ Years Crypto Trading
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Institutional quantitative desk specializing in Futures, Options hedging, Forex trading, and High-Frequency Cross-Exchange Arbitrage.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> AI &amp; Algorithmic Execution
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-amber-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  100+ Crore $ Generated
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Documented historical profit generation exceeding 100 Crore $ with rigorous delta-neutral risk mitigation and multi-sig vaults.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> High Capital Reserves
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-cyan-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  Global Investor Mission
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Tailored for individuals without time or trading expertise. We manage the markets and distribute consistent daily dividends to your wallet.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-cyan-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Community First Economy
              </div>
            </div>
          </div>

          {/* Right Leadership & HQ Card (5 Cols) */}
          <div className="lg:col-span-5 glass-card-gold p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            {/* Background luxury office subtle preview */}
            <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none rounded-bl-full overflow-hidden">
              <Image
                src="/assets/office_building.jpg"
                alt="Dubai Office"
                fill
                className="object-cover"
              />
            </div>

            <div>
              {/* CMD Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-amber-500/30 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
                  AV
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-[var(--text-main)]">
                    {APP_CONFIG.cmd}
                  </h3>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-300 tracking-wider uppercase">
                    Chairman &amp; Managing Director (CMD)
                  </span>
                </div>
              </div>

              {/* Verified Details from PDF */}
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-inner-panel">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--text-subtle)] text-xs uppercase tracking-wider">
                      Dubai Corporate Headquarters
                    </div>
                    <div className="text-[var(--text-main)] font-semibold mt-0.5 leading-snug">
                      {APP_CONFIG.headquarters}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-inner-panel">
                  <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--text-subtle)] text-xs uppercase tracking-wider">
                      Official Protocol Launch
                    </div>
                    <div className="text-[var(--text-main)] font-semibold mt-0.5">
                      15th December 2023 &bull; Global Operations
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-inner-panel">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--text-subtle)] text-xs uppercase tracking-wider">
                      Corporate Communications
                    </div>
                    <div className="text-[var(--text-main)] font-semibold mt-0.5">
                      {APP_CONFIG.officialEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-inner-panel">
                  <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[var(--text-subtle)] text-xs uppercase tracking-wider">
                      Security &amp; Compliance
                    </div>
                    <div className="text-[var(--text-main)] font-semibold mt-0.5">
                      Cold Storage Multi-Sig Vaults &bull; Regular Audits
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Entity Badge */}
            <div className="mt-8 pt-6 border-t border-amber-500/25 flex items-center justify-between text-xs text-amber-700 dark:text-amber-200">
              <span className="font-medium">Registered Dubai Commercial Entity</span>
              <span className="font-black px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                Al Tayer Tower #147/2A
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}