"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, KeyRound, Users, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [sponsorCode, setSponsorCode] = useState("DF478752");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("r");
      if (ref) setSponsorCode(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030712]">
      <div className="bg-glow-gold -top-32 -right-32" />
      <div className="bg-glow-blue -bottom-32 -left-32" />

      <div className="w-full max-w-md glass-card-gold p-8 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
              ⚜️
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white">Create Account</h2>
          <p className="text-xs text-amber-300 font-semibold mt-1">Claim your $5 Free Welcome Bonus</p>
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
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none"
              />
            </div>
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
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-4"
          >
            {loading ? "Registering..." : "Create Account & Get $5 Bonus"} <ArrowRight className="w-4 h-4" />
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