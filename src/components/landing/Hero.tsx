import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <div className="max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
          <span>⚜️ Official Business Plan &bull; Launch Dec 15, 2023 ⚜️</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
          Trusted Financial Solutions, <br />
          <span className="gold-gradient">Tailored For You.</span>
        </h1>

        <p className="text-lg text-slate-300 leading-relaxed mb-8">
          Experience institutional-grade daily staking returns in <strong>USDT BEP-20</strong>.
          Backed by 25+ years of real-world business legacy and 7+ years of crypto proprietary trading.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="gold-btn px-8 py-4 rounded-xl text-base font-bold flex items-center gap-3 shadow-xl"
          >
            Claim $5 Welcome Bonus <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#packages"
            className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-amber-400/50 text-slate-200 text-base font-semibold transition"
          >
            View Investment Packages
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
            5% &bull; 10% &bull; 15%
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Daily ROI Packages
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">
            USDT BEP-20
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Base Dollar Currency
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
            15% Instant
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Direct Referral Reward
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-1">
            12 Levels Deep
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Daily Team Royalty
          </div>
        </div>
      </div>
    </section>
  );
}