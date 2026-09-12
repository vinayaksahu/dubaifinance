"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
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
        body: JSON.stringify({ identifier, password }),
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

  const handleDemoFill = (type: "member" | "admin") => {
    if (type === "member") {
      setIdentifier("DF478752");
      setPassword("qwer1234");
    } else {
      setIdentifier("DF000001");
      setPassword("adminPassword123!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030712]">
      <div className="bg-glow-gold -top-32 -left-32" />
      <div className="bg-glow-blue -bottom-32 -right-32" />

      <div className="w-full max-w-md glass-card-gold p-8 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
              ⚜️
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white">Welcome Back!</h2>
          <p className="text-xs text-slate-400 mt-1">Please sign in to your Dubai Finance account</p>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleDemoFill("member")}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-amber-500/30 text-[11px] font-bold text-amber-300 hover:bg-amber-500/10 transition"
          >
            Demo Member (DF478752)
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill("admin")}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/10 transition"
          >
            Demo Admin (DF000001)
          </button>
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
            <Link href="#" className="text-amber-400 hover:underline font-semibold">
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