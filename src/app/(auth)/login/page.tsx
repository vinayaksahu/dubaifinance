"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Database, Clock, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [systemMode, setSystemMode] = useState<"LIVE" | "PRELAUNCH" | "MAINTENANCE">("LIVE");
  const [noticeText, setNoticeText] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.MAINTENANCE_MODE === "true") {
            setSystemMode("MAINTENANCE");
            setNoticeText(
              data.configs.MAINTENANCE_NOTICE_TEXT ||
                "Dubai Finance is currently undergoing scheduled infrastructure upgrades and database optimization. Public member access will resume shortly."
            );
          } else if (data.configs.PRELAUNCH_MODE === "true") {
            setSystemMode("PRELAUNCH");
            setNoticeText(
              data.configs.PRELAUNCH_NOTICE_TEXT ||
                "Dubai Finance is currently in its official Pre-Launch phase. Public member registration and user dashboards will open shortly."
            );
          } else {
            setSystemMode("LIVE");
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, portal: "member" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectTo || "/member");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (systemMode === "MAINTENANCE") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
        <div className="bg-glow-gold -top-32 -left-32" />
        <div className="bg-glow-blue -bottom-32 -right-32" />

        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Link
            href="/"
            className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-[var(--bg-card)] backdrop-blur-md"
          >
            &larr; Back to Home
          </Link>
          <ThemeToggle variant="compact" />
        </div>

        <div className="w-full max-w-lg glass-card-gold p-8 sm:p-10 rounded-3xl relative z-10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 mx-auto mb-5">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <img src="/dubaiLogo.png" alt="Dubai Finance Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>System Maintenance Active</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-[var(--text-main)]">
            Maintenance in Progress
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            {noticeText}
          </p>

          <div className="grid grid-cols-3 gap-3 my-6 text-left">
            <div className="p-3 rounded-xl bg-inner-panel">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
              <div className="text-[11px] font-bold text-[var(--text-main)]">Funds Safe</div>
              <div className="text-[10px] text-[var(--text-subtle)] leading-snug">100% balance security</div>
            </div>
            <div className="p-3 rounded-xl bg-inner-panel">
              <Database className="w-4 h-4 text-cyan-500 mb-1" />
              <div className="text-[11px] font-bold text-[var(--text-main)]">Nodes Syncing</div>
              <div className="text-[10px] text-[var(--text-subtle)] leading-snug">Database optimization</div>
            </div>
            <div className="p-3 rounded-xl bg-inner-panel">
              <Clock className="w-4 h-4 text-amber-500 mb-1" />
              <div className="text-[11px] font-bold text-[var(--text-main)]">Resuming Soon</div>
              <div className="text-[10px] text-[var(--text-subtle)] leading-snug">Momentarily active</div>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-3 rounded-xl gold-btn text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (systemMode === "PRELAUNCH") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
        <div className="bg-glow-gold -top-32 -left-32" />
        <div className="bg-glow-blue -bottom-32 -right-32" />

        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Link
            href="/"
            className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-[var(--bg-card)] backdrop-blur-md"
          >
            &larr; Back to Home
          </Link>
          <ThemeToggle variant="compact" />
        </div>

        <div className="w-full max-w-lg glass-card-gold p-8 sm:p-10 rounded-3xl relative z-10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 mx-auto mb-5">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <img src="/dubaiLogo.png" alt="Dubai Finance Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Pre-Launching Phase</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-[var(--text-main)]">
            Member Access Opening Shortly
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            {noticeText}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-inner-panel border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] leading-relaxed">
            Dubai Finance is in its pre-launching phase. Institutional onboarding and smart staking protocol contracts are being finalized. Public member access will open upon launch.
          </div>

          <Link
            href="/"
            className="w-full py-3 rounded-xl gold-btn text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <span>Explore Dubai Finance Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      <div className="bg-glow-gold -top-32 -left-32" />
      <div className="bg-glow-blue -bottom-32 -right-32" />

      {/* Top Bar with Home & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-[var(--bg-card)] backdrop-blur-md"
        >
          &larr; Back to Home
        </Link>
        <ThemeToggle variant="compact" />
      </div>

      <div className="w-full max-w-md glass-card-gold p-8 rounded-3xl relative z-10 shadow-2xl mt-12 sm:mt-0">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src="/dubaiLogo.png"
                  alt="Dubai Finance Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </Link>
          <h2 className="font-display text-2xl font-black text-[var(--text-main)]">Member Portal</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Sign in to your Dubai Finance investor account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              User ID or Email
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. DF478752"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
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
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition"
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="checkbox" defaultChecked className="rounded accent-amber-400" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-amber-400 hover:underline font-semibold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-6"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-amber-300 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}