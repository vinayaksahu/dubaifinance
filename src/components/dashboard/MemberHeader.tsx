"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";

export function MemberHeader({ user }: { user: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const origin =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? window.location.origin
      : "https://dubaifinance.online";
  const referralUrl = `${origin}/register?r=${user?.customId || "DF000001"}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-2xl shadow-md shadow-amber-500/30">
            ⚜️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">{user.fullName}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase">
                UID: {user.customId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {user.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Rank: <strong className="text-amber-300">L0</strong> &bull; Sponsor:{" "}
              <strong>{user.sponsor?.customId || "DF000001"}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role !== "USER" && (
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-500/30"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-bold hover:bg-red-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="p-4 rounded-2xl glass-card-gold flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-300">
          <span className="font-bold text-amber-300">Your Referral Link: </span>
          <span className="text-white font-mono bg-black/40 px-2 py-1 rounded-md text-[11px] break-all">
            {referralUrl}
          </span>
        </div>
        <button
          onClick={copyLink}
          className="gold-btn px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}