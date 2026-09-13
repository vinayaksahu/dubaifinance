"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Download, ShieldCheck, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  // Clean, non-wrapping navigation links
  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Packages", href: "#packages" },
    { name: "Calculator", href: "#calculator" },
    { name: "12-Levels", href: "#referrals" },
    { name: "Milestones", href: "#ranks" },
    { name: "Rules", href: "#terms" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-20 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-b border-amber-500/20 shadow-lg shadow-black/20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title Lockup (Never wraps, clean spacing) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src="/dubaiLogo.png"
                alt="Dubai Finance Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col justify-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg sm:text-xl tracking-wider text-amber-400 dark:text-amber-300 uppercase whitespace-nowrap leading-none">
                DUBAI FINANCE
              </span>
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 dark:text-amber-400 font-black border border-amber-500/30 uppercase leading-none">
                PRE-LAUNCH
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-subtle)] tracking-widest uppercase font-semibold mt-1 whitespace-nowrap leading-none">
              Official Investment Portal
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Strictly single line on xl+ screens) */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Controls & Actions (Clean, proportional, zero cramming) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Compact Theme Dropdown (Only 36px wide!) */}
          <ThemeToggle variant="compact" />

          {/* Download Dark PDF Deck */}
          <a
            href="/Dubai_Finance_Presentation_Dark.pdf"
            download
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 text-amber-500 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold transition whitespace-nowrap"
            title="Download Dark Presentation Deck (23 Slides)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Deck</span>
          </a>

          {/* Sign In */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl border border-amber-500/30 text-amber-500 dark:text-amber-300 text-xs font-bold hover:bg-amber-400/10 transition whitespace-nowrap"
          >
            Sign In
          </Link>

          {/* Get Started Button */}
          <Link
            href="/register"
            className="gold-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile / Tablet Hamburger Button (< xl screens) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl border border-amber-500/30 text-[var(--text-main)] hover:bg-amber-400/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-20 bottom-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-t border-amber-500/20 overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="max-w-md mx-auto px-5 py-6 space-y-5">
            {/* Theme switcher card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/20 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                Theme Mode
              </span>
              <ThemeToggle variant="segmented" />
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-main)] hover:border-amber-400 hover:text-amber-500 transition flex items-center justify-between group shadow-sm"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-amber-500 transition-colors" />
                </a>
              ))}
            </nav>

            {/* Download Dark PDF Button in Drawer */}
            <a
              href="/Dubai_Finance_Presentation_Dark.pdf"
              download
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl border border-amber-500/40 text-amber-500 dark:text-amber-300 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm bg-amber-400/5 hover:bg-amber-400/10 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-500" />
              Download Dark Presentation PDF (23 Slides)
            </a>

            {/* Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-xl border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-500 dark:text-amber-300 hover:bg-amber-400/10 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="gold-btn py-3 px-4 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust footer */}
            <div className="pt-4 text-center">
              <span className="text-[11px] text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Office 3802, Latifa Tower &bull; Dubai, UAE
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}