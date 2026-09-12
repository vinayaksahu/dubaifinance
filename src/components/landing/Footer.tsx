import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800 py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-xl">
            ⚜️
          </div>
          <div>
            <span className="font-black text-lg text-amber-300 uppercase tracking-wider">
              DUBAI FINANCE
            </span>
            <span className="block text-[11px] text-slate-400">
              Al Tayer Building, Sheikh Zayed Road, Dubai, UAE
            </span>
          </div>
        </div>

        <div className="flex gap-6 text-xs text-slate-400">
          <Link href="/login" className="hover:text-amber-300">Member Portal</Link>
          <Link href="/register" className="hover:text-amber-300">Register</Link>
          <a href="#about" className="hover:text-amber-300">About</a>
          <a href="#terms" className="hover:text-amber-300">Rules &amp; Terms</a>
        </div>

        <div className="text-xs text-slate-500">
          &copy; 2026 Dubai Finance. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}