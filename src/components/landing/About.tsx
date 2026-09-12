import { APP_CONFIG } from "@/lib/constants";

export function About() {
  return (
    <section id="about" className="relative z-10 py-20 border-t border-slate-800 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            COMPANY PROFILE &amp; LEADERSHIP
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            About Dubai Finance
          </h2>
          <p className="text-slate-400 mt-2">
            25+ Years of Business Legacy &amp; 7+ Years of Crypto Market Mastery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-4">
                🏢
              </div>
              <h4 className="text-lg font-bold text-white mb-2">25+ Years Experience</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Proven multi-decade track record in Real Estate, Hospitality, Hotel Industry, and Tour &amp; Travels.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                📈
              </div>
              <h4 className="text-lg font-bold text-white mb-2">7+ Years Crypto Trading</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Elite proprietary strategies across Crypto Futures, Options, Forex Trading, and High-Frequency Arbitrage.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-4">
                💰
              </div>
              <h4 className="text-lg font-bold text-white mb-2">100+ Crore $ Generated</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Institutional success generating over 100 Crore $ from crypto markets with disciplined risk protection.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl mb-4">
                🌍
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Global Community Vision</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                We trade on your behalf and deliver sustainable daily returns for individuals worldwide.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 glass-card-gold p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 pb-6 border-b border-amber-500/30 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40">
                  👨‍💼
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{APP_CONFIG.cmd}</h3>
                  <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">
                    Chairman &amp; Managing Director (CMD)
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">📍</span>
                  <div>
                    <div className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Corporate Headquarters</div>
                    <div className="text-white font-medium mt-0.5">{APP_CONFIG.headquarters}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">🗓️</span>
                  <div>
                    <div className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Launch Date</div>
                    <div className="text-white font-medium mt-0.5">15th December 2023</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg">✉️</span>
                  <div>
                    <div className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Official Email</div>
                    <div className="text-white font-medium mt-0.5">{APP_CONFIG.officialEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
              <span>Verified Dubai Corporate Entity</span>
              <span className="font-bold">License #147/2A</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}