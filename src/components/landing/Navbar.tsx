"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Download, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-amber-500/25 bg-[var(--bg-main)]/90 backdrop-blur-xl shadow-lg shadow-black/10"
          : "border-b border-amber-500/15 bg-[var(--bg-main)]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title Lockup (Single-line, strictly never wraps) */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src="/dubaiLogo.png"
                alt="Dubai Finance Logo"
                width={38}
                height={38}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg sm:text-xl tracking-wider text-amber-500 dark:text-amber-300 uppercase whitespace-nowrap">
                DUBAI FINANCE
              </span>
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black border border-amber-500/30 uppercase">
                PRE-LAUNCH
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[var(--text-subtle)] tracking-widest uppercase font-semibold whitespace-nowrap">
              Official Investment Portal
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Clean, single-line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold text-[var(--text-muted)]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-2.5 xl:px-3 py-1.5 rounded-xl whitespace-nowrap hover:text-amber-500 dark:hover:text-amber-300 hover:bg-amber-400/5 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Desktop Controls (Compact Icon Theme Switcher + Deck + Auth CTAs) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          {/* Ultra-compact icon theme toggle (takes only ~80px) */}
          <ThemeToggle variant="icons" />

          {/* Download Dark PDF Deck */}
          <a
            href="/Dubai_Finance_Presentation_Dark.pdf"
            download
            className="px-2.5 xl:px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
            title="Download Dark Presentation Deck (23 Slides)"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Deck PDF</span>
          </a>

          {/* Sign In */}
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold hover:bg-amber-400/10 transition whitespace-nowrap"
          >
            Sign In
          </Link>

          {/* Get Started */}
          <Link
            href="/register"
            className="gold-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile / Tablet Controls (< 1024px) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Compact theme toggle for mobile */}
          <ThemeToggle variant="icons" />

          {/* Direct deck download icon on mobile */}
          <a
            href="/Dubai_Finance_Presentation_Dark.pdf"
            download
            className="p-2 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-400/10 transition"
            title="Download PDF Deck"
            aria-label="Download Presentation PDF"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Hamburger toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-amber-500/30 text-[var(--text-main)] hover:bg-amber-400/10 transition"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Slide-Over) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] sm:top-[80px] bottom-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-t border-amber-500/20 overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="max-w-md mx-auto px-5 py-6 space-y-5">
            {/* Theme switcher card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/20 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                Theme Mode
              </span>
              <ThemeToggle variant="segmented" />
            </div>

            {/* Navigation link list */}
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

            {/* Download Dark PDF button */}
            <a
              href="/Dubai_Finance_Presentation_Dark.pdf"
              download
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm bg-amber-400/5 hover:bg-amber-400/10 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-500" />
              Download Dark Presentation PDF (23 Slides)
            </a>

            {/* Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-xl border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 transition"
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

            {/* Trust note */}
            <div className="pt-4 text-center">
              <span className="text-[11px] text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Latifa Tower &bull; Sheikh Zayed Road, Dubai, UAE
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}