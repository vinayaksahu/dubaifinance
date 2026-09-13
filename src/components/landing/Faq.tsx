"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Dubai Finance generate sustainable daily returns?",
      a: "Our yields are backed by dual pillars: a solid physical asset foundation built over 25+ years in prime Real Estate, luxury Hospitality, and Tour & Travels, coupled with 7+ years of elite quantitative trading in Crypto Futures, Options hedging, Forex, and high-frequency cross-exchange arbitrage.",
    },
    {
      q: "What is the base currency and blockchain network?",
      a: "All deposits and withdrawals operate strictly in USDT on the BNB Smart Chain (BEP-20). This provides stable dollar pricing, negligible blockchain gas fees, and lightning-fast confirmation times.",
    },
    {
      q: "Are there any withdrawal fees or administrative deductions?",
      a: "No. Unlike other platforms, Dubai Finance enforces a strict Zero Deduction Policy: 0% Admin Charge, 0% TDS, and 0% Processing Fees. You receive 100% of your earnings directly into your BEP-20 wallet.",
    },
    {
      q: "What is the difference between Basic Saving and Fix Deposit (FD)?",
      a: "Basic Saving ($5 to $5,000 USDT) pays 5% Daily ROI (1% profit + 4% principal return) for 25-30 days with daily withdrawal liquidity. Fix Deposit offers higher exponential staking yields of 10% to 15% Daily, with principal and profits unlocked upon 180-day or 210-day maturity.",
    },
    {
      q: "When can I place daily withdrawal requests?",
      a: "Withdrawals are open 7 days a week strictly between 10:00 AM and 02:00 PM (IST). Requests placed during this window are queued for automated blockchain dispatch without delay.",
    },
    {
      q: "How does the 12-Level Team Royalty income work?",
      a: "Team royalty is paid daily as a percentage of your downline's ROI earnings (5% on Level 1, 1% on Levels 2 through 12). Sponsoring 1 active direct referral unlocks Level 1, and each additional direct referral unlocks subsequent levels up to all 12 levels.",
    },
  ];

  return (
    <section id="faq" className="relative z-10 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Everything you need to know about the official Dubai Finance presentation and business plan (Slide 40).
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg text-[var(--text-main)] hover:text-amber-500 transition"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--text-subtle)] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-4 font-medium animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
