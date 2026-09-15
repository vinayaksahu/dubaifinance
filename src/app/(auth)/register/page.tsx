"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, KeyRound, Users, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [sponsorCode, setSponsorCode] = useState("DF478752");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("123456");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("r") || params.get("ref");
      if (ref) setSponsorCode(ref);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setOtpSuccess("");
    setSendingOtp(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "REGISTRATION" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setOtpSent(true);
      setOtpSuccess(`Verification code sent to ${email}. Check your inbox/spam folder.`);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorCode,
          fullName,
          email,
          phone,
          password,
          transactionPin,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/member");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      <div className="bg-glow-gold -top-32 -right-32" />
      <div className="bg-glow-blue -bottom-32 -left-32" />

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
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-2">
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
          <h2 className="font-display text-2xl font-black text-[var(--text-main)]">Create Account</h2>
          <p className="text-xs text-amber-500 dark:text-amber-300 font-semibold mt-1">Claim your Free $1.00 USDT Welcome Airdrop</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Sponsor Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value)}
                placeholder="e.g. DF478752"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 focus:border-amber-400 text-amber-300 text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              {countdown > 0 ? (
                <span className="text-[11px] font-semibold text-amber-400">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition underline"
                >
                  {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Get OTP"}
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || countdown > 0 || !email}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sendingOtp ? "Sending..." : countdown > 0 ? `${countdown}s` : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Email Verification Code (OTP)
              </label>
              <span className="text-[10px] text-slate-400">Check Gmail inbox/spam</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP code"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 focus:border-amber-400 text-amber-300 text-sm font-bold tracking-wider outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500"
              />
            </div>
            {otpSuccess && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{otpSuccess}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                6-Digit PIN
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </span>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 rounded-xl gold-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Verify OTP & Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-amber-300 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}