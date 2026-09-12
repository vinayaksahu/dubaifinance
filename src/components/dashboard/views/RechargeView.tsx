"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface RechargeViewProps {
  user: any;
  onRefresh: () => void;
}

export function RechargeView({ user, onRefresh }: RechargeViewProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const copyAddress = () => {
    navigator.clipboard.writeText(APP_CONFIG.depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculatedInr = usdtAmount && !isNaN(Number(usdtAmount))
    ? Number(usdtAmount) * APP_CONFIG.usdtToInrRate
    : 0;

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdtAmount || Number(usdtAmount) <= 0) {
      setMessage({ text: "Please enter a valid USDT amount.", error: true });
      return;
    }
    if (!txHash.trim()) {
      setMessage({ text: "Please enter your USDT BEP-20 transaction hash (TxHash).", error: true });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: Number(usdtAmount),
          txHash: txHash.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deposit submission failed");
      }
      setMessage({ text: data.message || "Deposit submitted successfully! Awaiting verification." });
      setUsdtAmount("");
      setTxHash("");
      onRefresh();
      setTimeout(() => {
        setShowQrModal(false);
        setMessage(null);
      }, 2500);
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const deposits = user.deposits || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          Recharge
        </h1>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Package</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Recharge</span>
        </div>
      </div>

      {/* View QR Button */}
      <div>
        <button
          onClick={() => setShowQrModal(true)}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>View QR</span>
        </button>
      </div>

      {/* Payment History Card */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-5 bg-blue-500 rounded-sm" />
          <h2 className="text-lg font-bold text-slate-100">
            Payment History
          </h2>
        </div>

        {/* Action Controls: 25 entries per page & Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <select className="bg-[#070e20] border border-[#1a2d52] rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["Copy", "Excel", "PDF", "Print"].map((btn) => (
              <button
                key={btn}
                onClick={() => alert(`${btn} export feature triggered.`)}
                className="px-3 py-1 rounded-lg bg-[#0d1a36] border border-[#1d335e] text-slate-300 text-xs font-medium hover:bg-[#13244a] hover:text-white transition-colors"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">ADDRESS</th>
                <th className="py-3 px-4">HASH</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042]">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                deposits.map((dep: any, index: number) => (
                  <tr key={dep.id || index} className="hover:bg-[#0c1630] transition-colors">
                    <td className="py-3 px-4 font-mono">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(dep.createdAt).toISOString().split("T")[0]}</td>
                    <td className="py-3 px-4 font-mono truncate max-w-[120px]">{dep.depositAddress || APP_CONFIG.depositAddress}</td>
                    <td className="py-3 px-4 font-mono text-blue-400 truncate max-w-[140px]">{dep.txHash}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      ${Number(dep.amountUsdt).toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dep.status === "CONFIRMED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                          : dep.status === "PENDING"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                          : "bg-rose-950/60 text-rose-400 border border-rose-500/40"
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-xs text-slate-400">
          <p>Showing {deposits.length > 0 ? 1 : 0} to {deposits.length} of {deposits.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>
              «
            </button>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>
              ‹
            </button>
            <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</span>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>
              ›
            </button>
            <button className="p-1 rounded bg-[#0b1429] border border-[#17274a] text-slate-400 hover:text-white disabled:opacity-40" disabled>
              »
            </button>
          </div>
        </div>
      </div>

      {/* View QR Deposit Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#091124] border border-[#1f3563] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#132042]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-1">
              Deposit USDT (BEP-20)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Send USDT BEP-20 only. Funds credited directly to Fund Wallet upon confirmation.
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center bg-[#070e20] border border-[#182a50] rounded-2xl p-4 mb-5">
              <div className="w-44 h-44 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${APP_CONFIG.depositAddress}`}
                  alt="USDT Deposit QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-3 break-all text-center px-2">
                {APP_CONFIG.depositAddress}
              </p>
              <button
                onClick={copyAddress}
                className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Address"}</span>
              </button>
            </div>

            {/* Deposit Form */}
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  USDT Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
                {Number(usdtAmount) > 0 && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    $ {Number(usdtAmount).toFixed(2)} USDT will be credited
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Hash (TxHash)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste 0x... BSC TxHash"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
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
                {submitting ? "Submitting..." : "Submit Deposit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
