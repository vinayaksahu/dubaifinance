"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "admin" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin authentication failed");
      }

      router.push(data.redirectTo || "/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIdentifier("DF000001");
    setPassword("adminPassword123!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Ambient Cyber / Admin Security Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Home link */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md transition-colors"
        >
          &larr; Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> SECURE ADMIN AREA
          </span>
          <ThemeToggle variant="compact" />
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-3xl relative z-10 shadow-2xl mt-12 sm:mt-0 backdrop-blur-xl">
        {/* Security Shield Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 p-1 mb-4 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Dubai Finance <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Authorized Super Admin &amp; Management Console Access
          </p>
        </div>

        {/* Demo Fast Fill Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            Fill Super Admin Credentials (DF000001)
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold mb-6 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Admin Identifier
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Admin ID (e.g. DF000001)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-6 transition disabled:opacity-50"
          >
            {loading ? "Authenticating Admin..." : "Sign In to Admin Console"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer separation note */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Are you an investor?{" "}
            <Link href="/login" className="text-amber-400 font-bold hover:underline">
              Go to Member Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
