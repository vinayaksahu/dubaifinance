import { Trophy, Award, Plane, Watch, Car, Crown, Smartphone, Laptop, Sparkles, CheckCircle2 } from "lucide-react";

export function Ranks() {
  // Exact 8 Milestone Ranks from Dubai_Finance_Presentation_Dark.pdf Slide 19
  const milestoneRanks = [
    {
      rank: "Star Leader",
      strong: "$500 USDT",
      weak: "$500 USDT",
      total: "$1,000 USDT",
      reward: "Premium Smart Watch",
      cash: "$50 USDT",
      icon: Watch,
      color: "from-amber-400 to-amber-600",
    },
    {
      rank: "Silver Leader",
      strong: "$1,250 USDT",
      weak: "$1,250 USDT",
      total: "$2,500 USDT",
      reward: "5G Android Smartphone",
      cash: "$125 USDT",
      icon: Smartphone,
      color: "from-slate-300 to-slate-500",
    },
    {
      rank: "Gold Leader",
      strong: "$2,500 USDT",
      weak: "$2,500 USDT",
      total: "$5,000 USDT",
      reward: "Apple iPad / Business Laptop",
      cash: "$250 USDT",
      icon: Laptop,
      color: "from-amber-400 to-yellow-500",
      featured: true,
    },
    {
      rank: "Ruby Director",
      strong: "$5,000 USDT",
      weak: "$5,000 USDT",
      total: "$10,000 USDT",
      reward: "All-Expense Paid Dubai VIP Trip (3N/4D)",
      cash: "$600 USDT",
      icon: Plane,
      color: "from-rose-400 to-red-600",
      featured: true,
    },
    {
      rank: "Emerald Director",
      strong: "$12,500 USDT",
      weak: "$12,500 USDT",
      total: "$25,000 USDT",
      reward: "Luxury Gold Watch / iPhone Pro Max",
      cash: "$1,500 USDT",
      icon: Sparkles,
      color: "from-emerald-400 to-teal-600",
    },
    {
      rank: "Diamond Ambassador",
      strong: "$25,000 USDT",
      weak: "$25,000 USDT",
      total: "$50,000 USDT",
      reward: "International Luxury Holiday (Europe/Bali)",
      cash: "$3,500 USDT",
      icon: Plane,
      color: "from-cyan-400 to-blue-600",
      featured: true,
    },
    {
      rank: "Blue Diamond",
      strong: "$50,000 USDT",
      weak: "$50,000 USDT",
      total: "$100,000 USDT",
      reward: "Sedan Car Fund / Royal Gold Bullion",
      cash: "$8,000 USDT",
      icon: Car,
      color: "from-indigo-400 to-purple-600",
    },
    {
      rank: "Crown King President",
      strong: "$125,000 USDT",
      weak: "$125,000 USDT",
      total: "$250,000 USDT",
      reward: "Luxury Sports Car (BMW / Mercedes / Porsche)",
      cash: "$25,000 USDT",
      icon: Crown,
      color: "from-amber-400 to-amber-600",
      featured: true,
    },
  ];

  return (
    <section id="ranks" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            INCOME STREAM #5 &bull; SLIDES 18 &amp; 19
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Mega Milestone Rewards Structure
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Cumulative team volume unlocks elite luxury assets or 100% instant USDT cash equivalent!
          </p>
        </div>

        {/* 50:50 Balanced Ratio Banner from Slide 19 */}
        <div className="max-w-4xl mx-auto mb-12 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              ⚖️
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--text-main)]">
                TEAM BUSINESS RATIO: 50% STRONG LEG / 50% WEAK LEG
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Turnover counts cumulatively. Members can choose between physical reward delivery or instant USDT wallet credit.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shrink-0">
            Slide 19 Schedule
          </span>
        </div>

        {/* 8 Ranks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {milestoneRanks.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.rank}
                className={`glass-card p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1.5 transition duration-300 relative ${
                  item.featured
                    ? "border-amber-400/80 shadow-amber-500/15 shadow-xl ring-1 ring-amber-400/40"
                    : ""
                }`}
              >
                {item.featured && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    VIP Milestone
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-inner-panel text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                      Turnover: {item.total}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-[var(--text-main)] mb-1">
                    {item.rank}
                  </h4>
                  <div className="text-xs font-semibold text-[var(--text-subtle)]">
                    Strong Leg: {item.strong} &bull; Weak: {item.weak}
                  </div>

                  <div className="my-5 p-3.5 rounded-2xl bg-inner-panel space-y-1.5">
                    <div className="text-[10px] text-[var(--text-subtle)] uppercase font-bold tracking-wider">
                      Guaranteed Reward:
                    </div>
                    <div className="text-sm font-black text-[var(--text-main)] leading-snug">
                      {item.reward}
                    </div>
                    <div className="text-xs font-bold text-emerald-500 pt-1 border-t border-[var(--border-subtle)]">
                      Cash Equivalent: {item.cash}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-subtle)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Physical delivery or instant USDT payout</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
