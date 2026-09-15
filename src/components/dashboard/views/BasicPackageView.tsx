"use client";

import React, { useState } from "react";
import { Package, Check, X, ShieldCheck, AlertCircle } from "lucide-react";

interface BasicPackageViewProps {
  user: any;
  onRefresh?: () => void;
  onRefreshUser?: () => void;
}

const PACKAGE_TEMPLATES = [
  { id: 1, name: "Starter", amount: 5 },
  { id: 2, name: "Basic", amount: 10 },
  { id: 3, name: "Silver", amount: 20 },
  { id: 4, name: "Gold", amount: 50 },
  { id: 5, name: "Platinum", amount: 100 },
  { id: 6, name: "Ruby", amount: 200 },
  { id: 7, name: "Diamond", amount: 500 },
  { id: 8, name: "Elite", amount: 1000 },
  { id: 9, name: "Royal", amount: 2000 },
  { id: 10, name: "Crown", amount: 5000 },
];

export function BasicPackageView({ user, onRefresh, onRefreshUser }: BasicPackageViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [transactionPin, setTransactionPin] = useState("");
  const [txOtpSending, setTxOtpSending] = useState(false);
  const [txOtpSent, setTxOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendTxOtp = async () => {
    setTxOtpSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, purpose: "TRANSACTION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setTxOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTxOtpSending(false);
    }
  };

  // Safe numerical fund balance
  const fundBal = Number(user?.fundBalance ?? 0);

  // Dynamic system configurations set by Admin
  const cfg = user?.systemConfig || {};
  const dailyRoiRate = cfg.BASIC_PLAN_DAILY_ROI !== undefined ? Number(cfg.BASIC_PLAN_DAILY_ROI) : 5.0;
  const tenureDays = cfg.BASIC_PLAN_TENURE_DAYS !== undefined ? Number(cfg.BASIC_PLAN_TENURE_DAYS) : 28;

  const dynamicPackages = PACKAGE_TEMPLATES.map((tmpl) => {
    const dailyRoi = (tmpl.amount * dailyRoiRate) / 100;
    const totalReturn = dailyRoi * tenureDays;
    return {
      ...tmpl,
      dailyRoi,
      days: tenureDays,
      totalReturn,
    };
  });

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    if (transactionPin.length !== 6) {
      setError("Transaction PIN must be 6 digits");
      return;
    }

    if (fundBal < selectedPlan.amount) {
      setError(`Insufficient fund balance ($${fundBal.toFixed(2)} USDT). Please recharge first.`);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/packages/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: "BASIC_SAVING",
          amountInUsdt: selectedPlan.amount,
          amount: selectedPlan.amount,
          transactionPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to purchase package");
      }

      setSuccess(`Successfully activated ${selectedPlan.name} package for $${selectedPlan.amount} USDT!`);
      setSelectedPlan(null);
      setTransactionPin("");
      if (onRefresh) onRefresh();
      if (onRefreshUser) onRefreshUser();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Basic Daily ROI Package
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Available Fund Balance :{" "}
            <span className="text-emerald-400 font-bold font-mono">
              ${fundBal.toFixed(2)} USDT
            </span>
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Package</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Basic Package</span>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-1">
            Daily Growth Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Earn fixed <strong className="text-amber-400">{dailyRoiRate}% daily ROI</strong> for{" "}
            <strong className="text-cyan-400">{tenureDays} days</strong> (Total {((dailyRoiRate * tenureDays)).toFixed(0)}% Return)
          </p>
        </div>
        <div className="bg-[#0c1836] py-2.5 px-4 rounded-xl border border-[#1d3360] flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Recharge Wallet</p>
            <p className="text-base font-extrabold text-emerald-400 font-mono">
              ${fundBal.toFixed(2)} USDT
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dynamicPackages.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#091124] border border-[#17274a] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all group relative overflow-hidden"
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {plan.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                {dailyRoiRate}% Daily
              </span>
            </div>

            {/* Price Header */}
            <div className="mb-4 pb-3 border-b border-[#17274a]">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                  ${plan.amount.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">USDT</span>
              </div>
            </div>

            {/* Details Rows */}
            <div className="space-y-2 mb-5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Daily Return:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  +${plan.dailyRoi.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Duration:</span>
                <span className="text-slate-200 font-semibold">{plan.days} Days</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Total Return:</span>
                <span className="text-cyan-400 font-bold font-mono">
                  ${plan.totalReturn.toFixed(2)} USDT
                </span>
              </div>
            </div>

            {/* Activation Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedPlan(plan);
                setTransactionPin("");
                setError("");
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-md text-xs sm:text-sm tracking-wide"
            >
              Activate Package
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Purchase Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#091124] border border-[#1e3460] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#17274a] flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Confirm Package Activation
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setTransactionPin("");
                  setError("");
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-[#060c1c] p-4 rounded-xl border border-[#17274a] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Selected Package:</span>
                  <span className="text-slate-100 font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Package Amount:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    ${selectedPlan.amount} USDT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Daily Return:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    +${selectedPlan.dailyRoi.toFixed(2)} USDT / day
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#17274a]">
                  <span className="text-slate-400">Total Return ({selectedPlan.days} Days):</span>
                  <span className="text-cyan-400 font-bold font-mono">
                    ${selectedPlan.totalReturn.toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Transaction PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Transaction PIN"
                  className="w-full bg-[#060c1c] border border-[#17274a] text-amber-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono tracking-widest text-center font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    setTransactionPin("");
                    setError("");
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#0c1836] hover:bg-[#12234e] border border-[#17274a] text-slate-300 rounded-xl font-semibold transition-colors text-xs"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={loading || transactionPin.length !== 6}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-md text-xs"
                >
                  {loading ? "Activating..." : "Confirm & Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
