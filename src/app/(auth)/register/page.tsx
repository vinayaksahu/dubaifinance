"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, KeyRound, Users, ArrowRight, ShieldCheck, CheckCircle2, Copy, Check, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [sponsorCode, setSponsorCode] = useState("DF478752");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [registeredCreds, setRegisteredCreds] = useState<{
    customId: string;
    pin: string;
    fullName: string;
    email: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
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

    if (!transactionPin || transactionPin.trim().length !== 6) {
      setError("Please create a 6-digit Transaction PIN.");
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
          transactionPin: transactionPin.trim(),
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.credentials) {
        setRegisteredCreds({
          customId: data.credentials.customId,
          pin: data.credentials.transactionPin,
          fullName: data.credentials.fullName || fullName,
          email: data.credentials.email || email,
        });
      } else {
        router.push("/member");
      }
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

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Create Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create login password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Create 6-Digit Transaction PIN
              </label>
              <span className="text-[10px] text-amber-400 font-semibold">For P2P & Packages</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 123456"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm font-mono tracking-widest outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || transactionPin.length !== 6}
            className="w-full py-3.5 rounded-xl gold-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Verify OTP & Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-amber-300 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* CONGRATULATIONS MODAL */}
      {registeredCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#080f1e] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center animate-in zoom-in-95 duration-200">
            {/* Gold Glow Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40 mb-4 animate-bounce">
              <Sparkles className="w-9 h-9" />
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Registration Complete
            </span>

            <h2 className="text-2xl font-black text-white mt-2">
              🎉 Congratulations!
            </h2>
            <p className="text-sm font-bold text-amber-300 mt-0.5">
              {registeredCreds.fullName}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Your Dubai Finance account is successfully registered. We have also emailed your User ID and Transaction PIN to <strong className="text-slate-200">{registeredCreds.email}</strong>.
            </p>

            {/* Credentials Box */}
            <div className="my-5 p-4 rounded-2xl bg-[#040812] border border-amber-500/30 space-y-3.5 text-left">
              {/* User ID */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Your Member User ID (Login ID)
                </span>
                <div className="flex items-center justify-between bg-black/60 border border-amber-500/20 rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-lg font-extrabold text-white tracking-wide">
                    {registeredCreds.customId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(registeredCreds.customId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Transaction PIN */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Your 6-Digit Transaction PIN
                </span>
                <div className="flex items-center justify-between bg-black/60 border border-amber-500/20 rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-lg font-extrabold text-amber-300 tracking-widest">
                    {registeredCreds.pin}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(registeredCreds.pin);
                      setCopiedPin(true);
                      setTimeout(() => setCopiedPin(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                  >
                    {copiedPin ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5">
                <span className="text-amber-400 font-bold">Security Note:</span> Store this PIN safely. You will need it to authorize P2P Transfers, Wallet Swipes, and Package Activations.
              </div>
            </div>

            {/* Dashboard Redirect */}
            <button
              type="button"
              onClick={() => router.push("/member")}
              className="w-full py-3.5 rounded-xl gold-btn font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
            >
              Enter Member Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}