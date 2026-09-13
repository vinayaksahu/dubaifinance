"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Download, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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

  const navLinks = [
    { name: "About Us", href: "#about" },
    { name: "Packages", href: "#packages" },
    { name: "Compounding", href: "#calculator" },
    { name: "12-Level Plan", href: "#referrals" },
    { name: "VIP Ranks", href: "#ranks" },
    { name: "Rules & Terms", href: "#terms" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-amber-500/25 bg-[var(--bg-main)]/90 backdrop-blur-md shadow-lg"
          : "border-b border-amber-500/15 bg-[var(--bg-main)]/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/30 group-hover:scale-105 transition duration-200">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src="/dubaiLogo.png"
                alt="Dubai Finance Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-wider text-amber-500 dark:text-amber-300 uppercase">
                DUBAI FINANCE
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 text-[10px]">
                OFFICIAL
              </span>
            </div>
            <span className="block text-[10px] text-[var(--text-subtle)] tracking-widest uppercase font-medium">
              Institutional Yield Protocol
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[var(--text-muted)]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Right Actions: Theme Toggle + Auth / CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle variant="segmented" />

          <a
            href="/Dubai_Finance_Presentation_Dark.pdf"
            download
            className="p-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 transition flex items-center gap-1.5 text-xs font-bold"
            title="Download Dubai Finance Dark Presentation Deck (23 Slides)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline">Dark Deck PDF</span>
          </a>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-bold hover:bg-amber-400/10 transition"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="gold-btn px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger & Quick Theme */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle variant="compact" />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-amber-500/30 text-[var(--text-main)] hover:bg-amber-400/10 transition"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-50 bg-[var(--bg-main)]/95 backdrop-blur-xl border-t border-amber-500/20 overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-6 space-y-6">
            {/* Theme switcher for mobile */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/20 flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text-main)]">Interface Theme</span>
              <ThemeToggle variant="segmented" />
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-base font-bold text-[var(--text-main)] hover:border-amber-400 transition flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </a>
              ))}
            </nav>

            {/* PDF Presentation Deck Download */}
            <a
              href="/Dubai_Finance_Presentation_Dark.pdf"
              download
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold flex items-center justify-center gap-2 text-sm bg-amber-400/5 hover:bg-amber-400/10 transition"
            >
              <Download className="w-4 h-4" /> Download Dark Presentation PDF (23 Slides)
            </a>

            {/* Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-xl border border-amber-500/30 text-center font-bold text-sm text-amber-600 dark:text-amber-300 hover:bg-amber-400/10 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="gold-btn py-3 px-4 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-1.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-subtle)] pt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>USDT BEP-20 Verified &bull; Multi-Signature Cold Vault</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}