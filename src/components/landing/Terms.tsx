import { CreditCard, Clock, ShieldCheck, Unlock, ArrowRightLeft, Coins, Sparkles, AlertCircle } from "lucide-react";

export function Terms() {
  const termsList = [
    {
      icon: CreditCard,
      title: "Withdrawal Limits",
      desc: "Minimum withdrawal is $1.36 / $2.00 USDT (₹150). Maximum single transaction limit is $5,000 USDT (₹5 Lakh).",
      tag: "Flexible Limits",
      color: "text-amber-500",
    },
    {
      icon: Clock,
      title: "Daily Withdrawal Window",
      desc: "Withdrawal requests are processed daily between 10:00 AM To 02:00 PM (IST) for automated blockchain dispatch.",
      tag: "Strict Timing",
      color: "text-cyan-500",
    },
    {
      icon: ShieldCheck,
      title: "100% Zero Deductions",
      desc: "Zero Admin Charge, Zero TDS, Zero Withdrawal Fees. You receive 100% of your earnings straight to your wallet.",
      tag: "100% Net Payout",
      color: "text-emerald-500",
    },
    {
      icon: Unlock,
      title: "No Direct Sponsor Condition",
      desc: "No mandatory direct referrals required to withdraw your Basic Saving earnings. Full financial freedom.",
      tag: "Unconditional",
      color: "text-amber-500",
    },
    {
      icon: ArrowRightLeft,
      title: "Free P2P Fund Transfers",
      desc: "Instantly transfer funds between member wallets with zero transaction fees. Activate accounts directly from income.",
      tag: "Zero Fee P2P",
      color: "text-purple-500",
    },
    {
      icon: Coins,
      title: "USDT BEP-20 Standard",
      desc: "All deposits and withdrawals operate exclusively on BNB Smart Chain (BEP-20) in dollar-pegged USDT.",
      tag: "Stable Currency",
      color: "text-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Free $1.00 Airdrop Bonus",
      desc: "New registrations receive a free $1.00 USDT bounty upon sign-up. Usable towards packages upon $20+ activation.",
      tag: "Welcome Bounty",
      color: "text-amber-500",
    },
    {
      icon: Clock,
      title: "FD Staking Maturity",
      desc: "Fix Deposit principal and accumulated high-yield profits unlock upon maturity tenure completion (180 or 210 Days).",
      tag: "Guaranteed Lock",
      color: "text-emerald-500",
    },
  ];

  return (
    <section id="terms" className="relative z-10 py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            TRANSPARENCY &amp; PROTOCOLS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Official Terms &amp; Rules
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Clear, automated, zero-deduction guidelines for global investors (Slides 10, 27, 35 &amp; 37).
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