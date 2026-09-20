"use client";

import React, { useState } from "react";
import { Repeat, ArrowRightLeft, Send, Clock, ShieldCheck, AlertCircle, Check, Globe } from "lucide-react";
import { APP_CONFIG, getWithdrawalWindowStatus } from "@/lib/constants";

interface TransactionalViewProps {
  user: any;
  mode: "transfer" | "swipe" | "withdraw" | "withdraw-report";
  onRefresh: () => void;
}

export function TransactionalView({ user, mode, onRefresh }: TransactionalViewProps) {
  // P2P State
  const [p2pTarget, setP2pTarget] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [p2pPin, setP2pPin] = useState("");

  // Swipe State
  const [swipeAmount, setSwipeAmount] = useState("");
  const [swipePin, setSwipePin] = useState("");

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(user.usdtAddress || "");

  // Timezone selector state (Default: ALL multi-timezone cards with GST Primary)
  const [selectedTz, setSelectedTz] = useState<"ALL" | "GST" | "IST" | "UTC">("ALL");

  const [txOtpSending, setTxOtpSending] = useState(false);
  const [txOtpSent, setTxOtpSent] = useState(false);

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
      setMessage({ text: `Security OTP sent to ${user.email}. Check your inbox/spam.`, error: false });
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setTxOtpSending(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false);

  const fundBal = Number(user.fundBalance || 0);
  const incomeBal = Number(user.incomeBalance || 0);
  const cfg = user?.systemConfig || {};

  const [windowStatus, setWindowStatus] = useState(() => getWithdrawalWindowStatus(cfg));

  React.useEffect(() => {
    setWindowStatus(getWithdrawalWindowStatus(cfg));
    const interval = setInterval(() => {
      setWindowStatus(getWithdrawalWindowStatus(cfg));
    }, 5000);
    return () => clearInterval(interval);
  }, [cfg]);

  const minWithdraw = cfg.MIN_WITHDRAWAL_USDT !== undefined ? Number(cfg.MIN_WITHDRAWAL_USDT) : APP_CONFIG.minWithdrawalUsdt;
  const maxWithdraw = cfg.MAX_WITHDRAWAL_USDT !== undefined ? Number(cfg.MAX_WITHDRAWAL_USDT) : APP_CONFIG.maxWithdrawalUsdt;
  const adminFeePercent = cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT ? Number(cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT) : APP_CONFIG.withdrawalAdminFeePercent;

  const handleP2pTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/wallet/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientCustomId: p2pTarget.trim(),
          amountInUsdt: Number(p2pAmount),
          amount: Number(p2pAmount),
          transactionPin: p2pPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "P2P transfer failed");
      setMessage({ text: data.message || "P2P transfer successful!" });
      setP2pTarget("");
      setP2pAmount("");
      setP2pPin("");
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/wallet/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: Number(swipeAmount),
          amount: Number(swipeAmount),
          transactionPin: swipePin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Swipe failed");
      setMessage({ text: data.message || "Swipe to Fund Wallet successful with 0% fee!" });
      setSwipeAmount("");
      setSwipePin("");
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: Number(withdrawAmount),
          amount: Number(withdrawAmount),
          toAddress: withdrawAddress.trim(),
          transactionPin: withdrawPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");
      setShowWithdrawSuccessModal(true);
      setMessage(null);
      setWithdrawAmount("");
      setWithdrawPin("");
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawals = user.withdrawals || [];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          {mode === "transfer" && "Fund Transfer (P2P)"}
          {mode === "swipe" && "Swipe (Income ➔ Fund)"}
          {mode === "withdraw" && "Withdrawal Request"}
          {mode === "withdraw-report" && "Withdrawal History"}
        </h1>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Transactional</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold capitalize">{mode}</span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold ${
          message.error ? "bg-rose-950/60 text-rose-300 border border-rose-500/40" : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
        }`}>
          {message.text}
        </div>
      )}

      {/* Mode 1: P2P Fund Transfer */}
      {mode === "transfer" && (
        <div className="max-w-xl bg-[#091124] border border-[#17274a] rounded-3xl p-6 sm:p-8 shadow-xl">
          <p className="text-xs text-slate-400 mb-4">
            Transfer funds from your Fund Wallet to another member instantly with 0% fee.
          </p>
          <div className="p-3.5 rounded-2xl bg-[#070e20] border border-[#162544] text-xs flex justify-between mb-5">
            <span className="text-slate-400">Available Fund Balance:</span>
            <span className="text-emerald-400 font-bold">${fundBal.toFixed(2)} USDT</span>
          </div>

          <form onSubmit={handleP2pTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Member User ID</label>
              <input
                type="text"
                placeholder="e.g. DF478752"
                value={p2pTarget}
                onChange={(e) => setP2pTarget(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Amount (USDT)</label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 50"
                value={p2pAmount}
                onChange={(e) => setP2pAmount(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                6-Digit Transaction PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit Transaction PIN"
                value={p2pPin}
                onChange={(e) => setP2pPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#070e20] border border-[#1a2d52] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 placeholder-slate-500 focus:outline-none text-center tracking-widest font-mono font-bold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Transferring..." : "Confirm & Send Funds"}
            </button>
          </form>
        </div>
      )}

      {/* Mode 2: Swipe (Income to Fund) */}
      {mode === "swipe" && (
        <div className="max-w-xl bg-[#091124] border border-[#17274a] rounded-3xl p-6 sm:p-8 shadow-xl">
          <p className="text-xs text-slate-400 mb-4">
            Convert your earnings in Income Wallet to Fund Wallet instantly at <strong>0% fee</strong> for reinvestment or transfer.
          </p>
          <div className="p-3.5 rounded-2xl bg-[#070e20] border border-[#162544] text-xs flex justify-between mb-5">
            <span className="text-slate-400">Available Income Balance:</span>
            <span className="text-cyan-400 font-bold">${incomeBal.toFixed(2)} USDT</span>
          </div>

          <form onSubmit={handleSwipe} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Swipe Amount (USDT)</label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 10"
                value={swipeAmount}
                onChange={(e) => setSwipeAmount(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                6-Digit Transaction PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit Transaction PIN"
                value={swipePin}
                onChange={(e) => setSwipePin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#070e20] border border-[#1a2d52] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 placeholder-slate-500 focus:outline-none text-center tracking-widest font-mono font-bold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Swiping..." : "Swipe to Fund Wallet (0% Fee)"}
            </button>
          </form>
        </div>
      )}

      {/* Mode 3: Withdrawal Request */}
      {mode === "withdraw" && (
        <div className="max-w-xl bg-[#091124] border border-[#17274a] rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Timing Banner with Multi-Timezone Selector */}
          <div className={`p-4 sm:p-5 rounded-2xl text-xs font-semibold mb-5 transition-all ${
            windowStatus.isOpen
              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "bg-amber-950/60 text-amber-300 border border-amber-500/40"
          }`}>
            <div className="flex items-start gap-3">
              <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${windowStatus.isOpen ? "text-emerald-400" : "text-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">
                      Official Withdrawal Window
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      windowStatus.isOpen
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}>
                      {windowStatus.isOpen ? "OPEN NOW" : "CLOSED"}
                    </span>
                  </div>

                  {/* Timezone Selector Buttons */}
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTz("GST")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                        selectedTz === "GST"
                          ? "bg-amber-500 text-black shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Gulf Standard Time (Dubai) - Primary"
                    >
                      <span>GST (Primary)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTz("IST")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        selectedTz === "IST"
                          ? "bg-blue-500 text-white shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Indian Standard Time"
                    >
                      IST
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTz("UTC")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        selectedTz === "UTC"
                          ? "bg-cyan-500 text-black shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Coordinated Universal Time"
                    >
                      UTC
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTz("ALL")}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        selectedTz === "ALL"
                          ? "bg-purple-500 text-white shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="View all timezones side-by-side"
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Multi-Timezone Cards (Always visible with active highlighting) */}
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="text-[11px] font-bold flex items-center justify-between gap-1.5 text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>Withdrawal Window Schedule &amp; Live Clocks:</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Click a zone to focus</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {/* 1. Dubai (GST) */}
                    <div
                      onClick={() => setSelectedTz("GST")}
                      className={`p-2.5 rounded-xl bg-black/40 border cursor-pointer transition-all ${
                        selectedTz === "GST"
                          ? "border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                          : "border-amber-500/30 hover:border-amber-400/60"
                      }`}
                    >
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>🇦🇪 Dubai (GST, UTC+4)</span>
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-extrabold">PRIMARY</span>
                      </div>
                      <div className="text-xs font-black text-white mt-1">{windowStatus.gstLabel}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Live: <span className="text-amber-300 font-bold">{windowStatus.currentGstTime}</span>
                      </div>
                    </div>

                    {/* 2. India (IST) */}
                    <div
                      onClick={() => setSelectedTz("IST")}
                      className={`p-2.5 rounded-xl bg-black/40 border cursor-pointer transition-all ${
                        selectedTz === "IST"
                          ? "border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/40"
                          : "border-blue-500/30 hover:border-blue-400/60"
                      }`}
                    >
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>🇮🇳 India (IST, UTC+5:30)</span>
                        <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-bold">IST</span>
                      </div>
                      <div className="text-xs font-black text-white mt-1">{windowStatus.istLabel}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Live: <span className="text-blue-300 font-bold">{windowStatus.currentIstTime}</span>
                      </div>
                    </div>

                    {/* 3. Global (UTC) */}
                    <div
                      onClick={() => setSelectedTz("UTC")}
                      className={`p-2.5 rounded-xl bg-black/40 border cursor-pointer transition-all ${
                        selectedTz === "UTC"
                          ? "border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40"
                          : "border-cyan-500/30 hover:border-cyan-400/60"
                      }`}
                    >
                      <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>🌐 Global (UTC, UTC+0)</span>
                        <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">UTC</span>
                      </div>
                      <div className="text-xs font-black text-white mt-1">{windowStatus.utcLabel}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Live: <span className="text-cyan-300 font-bold">{windowStatus.currentUtcTime}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-80 mt-2">
                    {windowStatus.is24h
                      ? "24/7 Instant Withdrawals Active! You can submit withdrawal requests anytime without time restrictions."
                      : windowStatus.isOpen
                      ? `Window is currently OPEN! You can submit withdrawal requests before ${windowStatus.endFormattedGst} GST / ${windowStatus.endFormattedIst} IST.`
                      : `Window is currently CLOSED. Requests are accepted daily during ${windowStatus.gstLabel} (Dubai) / ${windowStatus.istLabel} (India).`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070e20] border border-[#162544] text-xs space-y-1 mb-5">
            <div className="flex justify-between">
              <span className="text-slate-400">Available Income Balance:</span>
              <span className="text-cyan-400 font-bold">${incomeBal.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deduction / Admin Charge:</span>
              <span className="text-amber-400 font-bold">{adminFeePercent}% Admin Charge</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min / Max Limit:</span>
              <span className="text-slate-200">${minWithdraw} to ${maxWithdraw.toLocaleString()} USDT</span>
            </div>
          </div>

          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">USDT BEP-20 Receiving Address</label>
              <input
                type="text"
                placeholder="0x... USDT BEP-20 Wallet Address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Withdrawal Amount (USDT) &bull; Min ${minWithdraw}, Max ${maxWithdraw.toLocaleString()}
              </label>
              <input
                type="number"
                min={minWithdraw}
                max={maxWithdraw}
                step="any"
                placeholder={`$${minWithdraw} - $${maxWithdraw.toLocaleString()} USDT`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
              {Number(withdrawAmount) > 0 && (
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Fee ({adminFeePercent}%): ${(Number(withdrawAmount) * (adminFeePercent / 100)).toFixed(2)} USDT</span>
                  <span className="text-emerald-400 font-bold">Net Payout: ${(Number(withdrawAmount) * (1 - adminFeePercent / 100)).toFixed(2)} USDT</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-amber-400">Email Verification Code (OTP)</label>
                <button
                  type="button"
                  onClick={handleSendTxOtp}
                  disabled={txOtpSending}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 underline disabled:opacity-50"
                >
                  {txOtpSending ? "Sending OTP..." : txOtpSent ? "Resend OTP" : "Get OTP on Email"}
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP code"
                value={withdrawPin}
                onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#070e20] border border-[#1a2d52] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 placeholder-slate-500 focus:outline-none text-center tracking-widest font-mono font-bold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !windowStatus.isOpen}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                windowStatus.isOpen
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
              }`}
            >
              {submitting
                ? "Submitting Request..."
                : windowStatus.isOpen
                ? "Submit Withdrawal Request"
                : `Withdrawal Closed (${
                    selectedTz === "GST"
                      ? windowStatus.gstLabel
                      : selectedTz === "IST"
                      ? windowStatus.istLabel
                      : selectedTz === "UTC"
                      ? windowStatus.utcLabel
                      : windowStatus.gstLabel
                  })`}
            </button>
          </form>
        </div>
      )}

      {/* Mode 4: Withdrawal History */}
      {mode === "withdraw-report" && (
        <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-5 bg-blue-500 rounded-sm" />
            <h2 className="text-lg font-bold text-slate-100">Withdrawal History</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#152342]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
                <tr>
                  <th className="py-3 px-4">SR</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">AMOUNT (USDT)</th>
                  <th className="py-3 px-4">ADDRESS</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132042]">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No withdrawal records found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w: any, idx: number) => (
                    <tr key={w.id || idx} className="hover:bg-[#0c1630] transition-colors">
                      <td className="py-3 px-4 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">{new Date(w.createdAt).toISOString().split("T")[0]}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400">${Number(w.amountInUsdt ?? w.amountUsdt ?? (Number(w.amountInInr || 0) > 5000 ? Number(w.amountInInr) / 110 : Number(w.amountInInr || 0))).toFixed(2)} USDT</td>
                      <td className="py-3 px-4 font-mono truncate max-w-[140px] text-slate-400">{w.toAddress || w.targetAddress}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === "COMPLETED"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                            : w.status === "PENDING"
                            ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                            : "bg-rose-950/60 text-rose-400 border border-rose-500/40"
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawal Success Popup Modal */}
      {showWithdrawSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowWithdrawSuccessModal(false)}
        >
          <div
            className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white dark:bg-[#0c162d] rounded-2xl sm:rounded-3xl p-6 pt-8 pb-3 text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green Checkmark Badge */}
            <div className="w-20 h-20 mx-auto rounded-full border-[3px] border-[#86efac] dark:border-emerald-500/50 flex items-center justify-center bg-white dark:bg-emerald-950/20 mb-5">
              <Check className="w-10 h-10 text-[#22c55e] stroke-[3]" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
              Successful
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-[280px] mx-auto leading-relaxed mb-6">
              Withdrawal amount requested and will be processed in 24 hours.
            </p>

            {/* OK Button */}
            <button
              type="button"
              onClick={() => setShowWithdrawSuccessModal(false)}
              className="px-8 py-2.5 rounded-lg bg-[#6f63f2] hover:bg-[#5e51e8] active:scale-95 text-white font-semibold text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center min-w-[90px]"
            >
              OK
            </button>

            {/* Bottom Footer Divider */}
            <div className="w-full border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-3 text-center">
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
                Powered by Dubai Finance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
