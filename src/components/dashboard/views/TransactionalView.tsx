"use client";

import React, { useState } from "react";
import { Repeat, ArrowRightLeft, Send, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { APP_CONFIG, isWithdrawalWindowOpen } from "@/lib/constants";

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

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const fundBal = Number(user.fundBalance || 0);
  const incomeBal = Number(user.incomeBalance || 0);
  const windowOpen = isWithdrawalWindowOpen();

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
      setMessage({ text: data.message || "Withdrawal request submitted successfully!" });
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Transaction PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="******"
                value={p2pPin}
                onChange={(e) => setP2pPin(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center tracking-widest font-mono"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Transaction PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="******"
                value={swipePin}
                onChange={(e) => setSwipePin(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center tracking-widest font-mono"
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
          {/* Timing Banner */}
          <div className={`p-4 rounded-2xl text-xs font-semibold mb-5 flex items-center gap-3 ${
            windowOpen
              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
              : "bg-amber-950/60 text-amber-300 border border-amber-500/40"
          }`}>
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Official Withdrawal Window: 10:00 AM – 02:00 PM IST</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {windowOpen ? "Window is currently OPEN! You can submit withdrawal requests." : "Window is currently CLOSED. Requests are accepted strictly between 10:00 AM & 2:00 PM IST."}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070e20] border border-[#162544] text-xs space-y-1 mb-5">
            <div className="flex justify-between">
              <span className="text-slate-400">Available Income Balance:</span>
              <span className="text-cyan-400 font-bold">${incomeBal.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deduction / Admin Charge:</span>
              <span className="text-emerald-400 font-bold">0% (Zero Admin Charge, 0% Fee)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min / Max Limit:</span>
              <span className="text-slate-200">$2 to $5,000 USDT</span>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Withdrawal Amount (USDT)</label>
              <input
                type="number"
                min="2"
                max="5000"
                step="any"
                placeholder="$2 - $5,000 USDT"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Transaction PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="******"
                value={withdrawPin}
                onChange={(e) => setWithdrawPin(e.target.value)}
                className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center tracking-widest font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !windowOpen}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : windowOpen ? "Submit Withdrawal" : "Withdrawal Closed (10 AM - 2 PM IST)"}
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
                      <td className="py-3 px-4 font-bold text-cyan-400">${Number(w.amountInUsdt ?? w.amountUsdt ?? (w.amountInInr ? Number(w.amountInInr) / APP_CONFIG.usdtToInrRate : 0)).toFixed(2)} USDT</td>
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
    </div>
  );
}
