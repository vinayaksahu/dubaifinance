import { Trophy, Award, Plane, Watch, Car, Crown, Sparkles, CheckCircle2 } from "lucide-react";

export function Ranks() {
  const milestoneRanks = [
    {
      rank: "Star Executive",
      target: "$1,000 Team",
      reward: "$50 USDT Instant Bonus",
      icon: Trophy,
      badge: "Tier 1",
      color: "from-amber-400 to-amber-600",
    },
    {
      rank: "Silver Director",
      target: "$2,500 Team",
      reward: "$150 USDT Instant Bonus",
      icon: Award,
      badge: "Tier 2",
      color: "from-slate-300 to-slate-500",
    },
    {
      rank: "Gold Ambassador",
      target: "$5,000 Team",
      reward: "Dubai VIP Luxury Tour (3 Days)",
      icon: Plane,
      badge: "VIP Trip",
      color: "from-amber-400 to-yellow-500",
      featured: true,
    },
    {
      rank: "Ruby Regional",
      target: "$15,000 Team",
      reward: "International Luxury Holiday Trip",
      icon: Plane,
      badge: "Global Tour",
      color: "from-rose-400 to-red-600",
    },
    {
      rank: "Emerald President",
      target: "$50,000 Team",
      reward: "Exclusive Solid Gold Sovereign Kit",
      icon: Sparkles,
      badge: "Gold Award",
      color: "from-emerald-400 to-teal-600",
    },
    {
      rank: "Diamond Legend",
      target: "$100,000 Team",
      reward: "Authentic Rolex Luxury Chronometer",
      icon: Watch,
      badge: "Rolex Watch",
      color: "from-cyan-400 to-blue-600",
      featured: true,
    },
    {
      rank: "Blue Diamond",
      target: "$250,000 Team",
      reward: "Mercedes-Benz Luxury Automobile",
      icon: Car,
      badge: "Luxury Sedan",
      color: "from-indigo-400 to-purple-600",
    },
    {
      rank: "Crown King",
      target: "$500,000+ Team",
      reward: "Dubai Supercar & Lifetime Royalty",
      icon: Crown,
      badge: "Supercar",
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
            EXECUTIVE LEADERSHIP HONORS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Milestone Rank Rewards
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            From instant cash bonuses and Dubai VIP tours to Rolex watches and luxury supercars (Slides 29-34).
          </p>
        </div>

        {/* 50:50 Balanced Ratio Banner */}
        <div className="max-w-4xl mx-auto mb-12 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              ⚖️
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--text-main)]">
                Balanced 50:50 Team Leg Ratio Rule
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Team business volume is evaluated across two legs (50% Stronger Leg : 50% All Other Legs).
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shrink-0">
            Slide 34 Criteria
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
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-[var(--text-main)] mb-1">
                    {item.rank}
                  </h4>
                  <div className="text-xs font-bold text-amber-500">
                    Team Target: {item.target}
                  </div>

                  <div className="my-5 p-3.5 rounded-2xl bg-inner-panel">
                    <div className="text-[10px] text-[var(--text-subtle)] uppercase font-bold tracking-wider">
                      Award &amp; Reward
                    </div>
                    <div className="text-sm font-black text-[var(--text-main)] mt-1 leading-snug">
                      {item.reward}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-subtle)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Recognized at Dubai Annual Gala
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
