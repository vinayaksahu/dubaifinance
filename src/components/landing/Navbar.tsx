import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="relative z-20 border-b border-amber-500/20 bg-[#030712]/80 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
            ⚜️
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-wider text-amber-300 uppercase">
              DUBAI FINANCE
            </span>
            <span className="block text-[10px] text-slate-400 tracking-widest uppercase">
              Official Investment Portal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#about" className="hover:text-amber-300 transition">About Us</a>
          <a href="#packages" className="hover:text-amber-300 transition">Packages</a>
          <a href="#calculator" className="hover:text-amber-300 transition">Calculator</a>
          <a href="#referrals" className="hover:text-amber-300 transition">12-Level Plan</a>
          <a href="#terms" className="hover:text-amber-300 transition">Terms & Rules</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl border border-amber-400/40 text-amber-300 text-sm font-bold hover:bg-amber-400/10 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="gold-btn px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}