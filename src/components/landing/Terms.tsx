import { CreditCard, Clock, ShieldCheck, Unlock, ArrowRightLeft, Coins, Sparkles, Percent } from "lucide-react";

export function Terms() {
  // Exact Transparency Protocol from Dubai_Finance_Presentation_Dark.pdf Slide 20 & 21
  const termsList = [
    {
      icon: CreditCard,
      title: "Withdrawal Limits",
      desc: "Minimum Withdrawal is $2 USDT. Maximum single transaction limit is $5,000 USDT.",
      tag: "Slide 21 Rule",
      color: "text-amber-500",
    },
    {
      icon: Percent,
      title: "10% Admin Charge",
      desc: "A flat 10% Admin Charge applies on withdrawals to maintain liquidity reserve pools and blockchain infrastructure.",
      tag: "Liquidity Reserve",
      color: "text-cyan-500",
    },
    {
      icon: Sparkles,
      title: "$0.50 Signup & Level Bonus",
      desc: "$0.50 Signup Bonus + $0.50/12-Level Bonus ($1 total distributed across 12 levels; usable on $20+ active IDs).",
      tag: "Community Bounty",
      color: "text-amber-500",
    },
    {
      icon: Unlock,
      title: "No Withdrawal Conditions",
      desc: "Zero mandatory direct referrals required to withdraw your daily basic ROI income. Full financial freedom.",
      tag: "Zero Forced Directs",
      color: "text-emerald-500",
    },
    {
      icon: Clock,
      title: "28-Day Contract Tenure",
      desc: "Basic ROI plans run on disciplined 28-day contracts delivering 140% gross payout. Re-topup available anytime.",
      tag: "28 Days Fixed",
      color: "text-cyan-500",
    },
    {
      icon: Coins,
      title: "USDT (BEP-20) Standard",
      desc: "Operates strictly on the Binance Smart Chain (BEP-20) standard for lightning speed and minimal network gas fees.",
      tag: "Binance Smart Chain",
      color: "text-amber-500",
    },
    {
      icon: ArrowRightLeft,
      title: "Zero-Fee P2P Transfer",
      desc: "Transfer internal wallet balance instantly to other members with 0% fee to activate new downline accounts.",
      tag: "Slide 20 Ecosystem",
      color: "text-purple-500",
    },
    {
      icon: ShieldCheck,
      title: "7 Days Active Yield",
      desc: "Daily 5% Basic ROI is credited Monday through Sunday with zero non-trading days via automated quantitative bots.",
      tag: "Mon - Sun Cashflow",
      color: "text-emerald-500",
    },
  ];

  return (
    <section id="terms" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            TRANSPARENCY PROTOCOL &bull; SLIDES 20 &amp; 21
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Official Terms &amp; Conditions
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Clear, member-first guidelines ensuring seamless daily operation and guaranteed payout protection.
          </p>
        </div>

        {/* 8 Rules Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {termsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-amber-400/50 hover:-translate-y-1 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-inner-panel text-[var(--text-subtle)] uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}