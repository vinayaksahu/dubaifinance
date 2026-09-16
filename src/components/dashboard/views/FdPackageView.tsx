"use client";

import React, { useState } from "react";
import { Package, X, Check } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface FdPackageViewProps {
  user: any;
  onRefresh: () => void;
}

export function FdPackageView({ user, onRefresh }: FdPackageViewProps) {
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const cfg = user?.systemConfig || {};
  const rate180 = cfg.FD_PLAN_180_DAILY_ROI !== undefined ? Number(cfg.FD_PLAN_180_DAILY_ROI) : 10.0;
  const days180 = cfg.FD_PLAN_180_DAYS !== undefined ? Number(cfg.FD_PLAN_180_DAYS) : 180;
  const rate210 = cfg.FD_PLAN_210_DAILY_ROI !== undefined ? Number(cfg.FD_PLAN_210_DAILY_ROI) : 15.0;
  const days210 = cfg.FD_PLAN_210_DAYS !== undefined ? Number(cfg.FD_PLAN_210_DAYS) : 210;

  const [selectedTenure, setSelectedTenure] = useState<number>(days180);
  const [pin, setPin] = useState("");
  const [txOtpSending, setTxOtpSending] = useState(false);
  const [txOtpSent, setTxOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSendTxOtp = async () => {
    setTxOtpSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, purpose: "TRANSACTION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setTxOtpSent(true);
      setMessage({ text: `Security OTP sent to ${user.email}. Check inbox/spam.`, error: false });
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setTxOtpSending(false);
    }
  };

  const fundBal = Number(user.fundBalance || 0);

  const FD_TIERS = [
    { id: "pkg-1", tier: "PACKAGE 1", amountUsdt: 50, featured: false },
    { id: "pkg-2", tier: "PACKAGE 2", amountUsdt: 100, featured: false },
    { id: "pkg-3", tier: "PACKAGE 3", amountUsdt: 200, featured: false },
    { id: "pkg-4", tier: "PACKAGE 4", amountUsdt: 500, featured: false },
    { id: "pkg-5", tier: "PACKAGE 5 (POPULAR)", amountUsdt: 1000, featured: true },
    { id: "pkg-6", tier: "PACKAGE 6", amountUsdt: 2000, featured: false },
    { id: "pkg-7", tier: "PACKAGE 7 (VIP)", amountUsdt: 5000, featured: false },
  ];

  const dynamicFdPlans = FD_TIERS.map((tier) => {
    const daily180 = (tier.amountUsdt * rate180) / 100;
    const profit180 = daily180 * days180;
    const daily210 = (tier.amountUsdt * rate210) / 100;
    const profit210 = daily210 * days210;

    return {
      id: tier.id,
      tier: tier.tier,
      amountUsdt: tier.amountUsdt,
      featured: tier.featured,
      plans: [
        { days: days180, rate: rate180, dailyUsdt: daily180, profitUsdt: profit180 },
        { days: days210, rate: rate210, dailyUsdt: daily210, profitUsdt: profit210 },
      ],
    };
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) {
      setMessage({ text: "Please enter your 6-digit Transaction PIN.", error: true });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/packages/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: "FIX_DEPOSIT",
          amountInUsdt: selectedTier.amountUsdt,
          amount: selectedTier.amountUsdt,
          fdTenureDays: selectedTenure,
          transactionPin: pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "FD Activation failed");
      }

      setMessage({ text: data.message || `FD Package of $${selectedTier.amountUsdt} USDT activated successfully!` });
      setPin("");
      onRefresh();
      setTimeout(() => {
        setSelectedTier(null);
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Fix Deposit (FD) Package
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Available Fund Balance :{" "}
            <span className="text-emerald-400 font-bold">
              ${fundBal.toFixed(2)} USDT
            </span>
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Package</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">FD Package</span>
        </div>
      </div>

      {/* Grid of 5 FD Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dynamicFdPlans.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-[#091124] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden ${
              pkg.featured ? "border-amber-500/50 shadow-amber-500/10" : "border-[#17274a] hover:border-blue-500/40"
            }`}
          >
            {pkg.featured && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                Popular
              </span>
            )}

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{pkg.tier}</h3>
                  <p className="text-xl font-extrabold text-amber-400">
                    ${pkg.amountUsdt.toLocaleString()} USDT
                  </p>
                </div>
              </div>

              {/* Plan Options */}
              <div className="space-y-3 mb-6">
                {pkg.plans.map((p) => (
                  <div
                    key={p.days}
                    className="p-3.5 rounded-2xl bg-[#070e20] border border-[#162544] text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">{p.days} Days Term</span>
                      <span className="text-emerald-400">{p.rate}% Daily</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Daily Profit:</span>
                      <span className="text-slate-200 font-semibold">${p.dailyUsdt.toLocaleString()}/day</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Total Payout:</span>
                      <span className="text-cyan-400 font-bold">${p.profitUsdt.toLocaleString()} USDT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedTier(pkg);
                  setSelectedTenure(days180);
                  setMessage(null);
                  setPin("");
                }}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 text-center"
              >
                {days180} Days ({rate180}%)
              </button>
              <button
                onClick={() => {
                  setSelectedTier(pkg);
                  setSelectedTenure(days210);
                  setMessage(null);
                  setPin("");
                }}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 text-center"
              >
                {days210} Days ({rate210}%)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#091124] border border-[#1f3563] rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTier(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#132042]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Confirm Fix Deposit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Activating {selectedTier.tier} (${selectedTier.amountUsdt} USDT) for {selectedTenure} Days
            </p>

            <div className="bg-[#070e20] border border-[#182a50] rounded-2xl p-4 space-y-2 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Locked Deposit:</span>
                <span className="font-bold text-slate-200">${selectedTier.amountUsdt} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tenure:</span>
                <span className="font-bold text-slate-200">{selectedTenure} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Return:</span>
                <span className="font-bold text-emerald-400">
                  {selectedTenure === days180 ? `${rate180}%` : `${rate210}%`} Daily
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Release at Maturity:</span>
                <span className="font-bold text-cyan-400">
                  ${selectedTier.plans.find((p: any) => p.days === selectedTenure)?.profitUsdt?.toLocaleString() || 0} USDT
                </span>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Transaction PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Transaction PIN"
                  className="w-full bg-[#070e20] border border-[#1a2d52] focus:border-amber-400 rounded-xl px-3.5 py-2 text-center tracking-widest text-base font-mono text-amber-300 font-bold placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  message.error ? "bg-rose-950/60 text-rose-300 border border-rose-500/40" : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Lock & Activate FD"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
