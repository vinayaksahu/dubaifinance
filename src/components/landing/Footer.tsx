"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, ShieldCheck, Mail, MapPin, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [systemMode, setSystemMode] = useState<"LIVE" | "PRELAUNCH" | "MAINTENANCE">("LIVE");

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.MAINTENANCE_MODE === "true") {
            setSystemMode("MAINTENANCE");
          } else if (data.configs.PRELAUNCH_MODE === "true") {
            const targetDateStr = data.configs.PRELAUNCH_TARGET_DATE || "2026-09-21T20:00";
            let targetTime: number;
            if (/[+-]\d{2}(:\d{2})?$|Z$/i.test(targetDateStr)) {
              targetTime = new Date(targetDateStr).getTime();
            } else {
              targetTime = new Date(`${targetDateStr}:00+04:00`).getTime();
            }

            const evaluateMode = () => {
              if (!isNaN(targetTime) && Date.now() >= targetTime) {
                setSystemMode("LIVE");
              } else {
                setSystemMode("PRELAUNCH");
              }
            };

            evaluateMode();
            timer = setInterval(evaluateMode, 1000);
          } else {
            setSystemMode("LIVE");
          }
        }
      })
      .catch(() => {});

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const isLight = resolvedTheme === "light";
  const pdfHref = `/api/download-presentation?theme=${isLight ? "light" : "dark"}&v=20260916`;
  const pdfFileName = isLight ? "Dubai_Finance_Presentation_Light.pdf" : "Dubai_Finance_Presentation_Dark.pdf";
  const pdfLabel = isLight
    ? "Dubai Finance Presentation (Light PDF)"
    : "Dubai Finance Presentation (Dark PDF)";
  return (
    <footer className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--bg-main)] transition-colors duration-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[var(--border-subtle)]">
          {/* Brand & Address (5 Cols) from Slide 03 & 22 */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/20">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/dubaiLogo.png"
                    alt="Dubai Finance Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-wider text-amber-500 dark:text-amber-300 uppercase">
                  DUBAI FINANCE
                </span>
                <span className="block text-[10px] text-[var(--text-subtle)] tracking-widest uppercase font-medium">
                  Pre-Launching Phase &bull; USDT (BEP-20)
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md font-medium">
              Decentralized High-Yield Wealth Ecosystem powered by USDT on Binance Smart Chain. Backed by 30+ years of proven track record and headquartered in Dubai&apos;s financial district.
            </p>

            <div className="space-y-2 text-xs text-[var(--text-subtle)] pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{APP_CONFIG.headquarters}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{APP_CONFIG.officialEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>CMD: {APP_CONFIG.cmd}</span>
              </div>
            </div>
          </div>

          {/* Quick Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[var(--text-muted)]">
              <li>
                <a href="#about" className="hover:text-amber-500 transition">About &amp; Leadership (Slide 02)</a>
              </li>
              <li>
                <a href="#packages" className="hover:text-amber-500 transition">Joining Packages ($5 - $5,000)</a>
              </li>
              <li>
                <a href="#packages" className="hover:text-amber-500 transition">Fix Deposit (FD 180D &bull; 210D)</a>
              </li>
              <li>
                <a href="#referrals" className="hover:text-amber-500 transition">10% Direct &amp; 12-Level Royalty</a>
              </li>
              <li>
                <a href="#ranks" className="hover:text-amber-500 transition">Milestone Rewards (Slide 19)</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-amber-500 transition">Transparency Terms (Slide 21)</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-500 transition">Frequently Asked Questions</a>
              </li>
            </ul>
          </div>

          {/* Member Portals & Presentation Download (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-display text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
              Official Resources
            </h4>

            <a
              href={pdfHref}
              download={pdfFileName}
              className="w-full py-3 px-4 rounded-xl border border-amber-500/30 bg-[var(--bg-card)] hover:border-amber-400 text-[var(--text-main)] text-xs font-bold transition flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                {pdfLabel}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300">
                23 Slides
              </span>
            </a>

            {systemMode === "MAINTENANCE" ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center text-xs text-rose-300 font-bold">
                System Maintenance Active &bull; Member Login Paused
              </div>
            ) : systemMode === "PRELAUNCH" ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-400 font-bold">
                Pre-Launching Phase Active &bull; Public Access Opening Soon
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-center text-xs font-bold text-[var(--text-main)] hover:border-amber-400 transition"
                >
                  Sign In Portal
                </Link>
                <Link
                  href="/register"
                  className="gold-btn py-2.5 px-3 rounded-xl text-center text-xs font-bold"
                >
                  Join with $5 USDT
                </Link>
              </div>
            )}

            <div className="p-3 rounded-xl bg-inner-panel flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-main)]">Theme Preference</span>
              <ThemeToggle variant="segmented" />
            </div>
          </div>
        </div>

        {/* Bottom copyright & security bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-subtle)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>&copy; Dubai Finance &bull; Latifa Tower, Sheikh Zayed Road, Dubai, UAE. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>100% USDT (BEP-20)</span>
            <span>&bull;</span>
            <span>28-Day Disciplined Tenure</span>
            <span>&bull;</span>
            <span>Zero-Fee P2P</span>
          </div>
        </div>
      </div>
    </footer>
  );
}