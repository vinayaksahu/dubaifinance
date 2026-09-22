"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Check, QrCode, X, RefreshCw, ExternalLink, ShieldAlert, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface RechargeViewProps {
  user: any;
  onRefresh: () => void;
}

export function RechargeView({ user, onRefresh }: RechargeViewProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Crypto deposit dynamic state
  const [cryptoData, setCryptoData] = useState<{
    address: string;
    network: string;
    asset: string;
    qrUrl: string;
    mode: "AUTOMATIC" | "MANUAL";
    requiredConfirmations: number;
    deposits: any[];
  } | null>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(true);

  const fetchCryptoDetails = useCallback(async () => {
    try {
      const res = await fetch("/api/member/crypto-deposit");
      if (res.ok) {
        const data = await res.json();
        setCryptoData(data);
      }
    } catch (err) {
      console.error("Error fetching deposit details:", err);
    } finally {
      setLoadingCrypto(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoDetails();
    // Poll for live confirmation updates every 12 seconds
    const interval = setInterval(fetchCryptoDetails, 12000);
    return () => clearInterval(interval);
  }, [fetchCryptoDetails]);

  const depositAddress = cryptoData?.address || user?.usdtAddress || APP_CONFIG.depositAddress;
  const qrImage = cryptoData?.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${depositAddress}`;
  const isAutomatic = cryptoData?.mode === "AUTOMATIC";

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      setMessage({ text: "Please enter your USDT BEP-20 transaction hash (TxHash).", error: true });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/member/crypto-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deposit verification failed");
      }
      setMessage({ text: data.message || "Deposit submitted and verified on blockchain!" });
      setTxHash("");
      fetchCryptoDetails();
      onRefresh();
      setTimeout(() => {
        setShowQrModal(false);
        setMessage(null);
      }, 3500);
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const deposits = cryptoData?.deposits && cryptoData.deposits.length > 0
    ? cryptoData.deposits
    : (user.deposits || []);

  const latestPending = deposits.find(
    (d: any) => d.status === "PENDING" || d.status === "CONFIRMING" || d.status === "PENDING_REVIEW"
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Recharge USDT</span>
            {isAutomatic && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Instant Automatic Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deposit USDT on BNB Smart Chain (BEP-20) to credit your wallet.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <span>🏠 Package</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Recharge</span>
        </div>
      </div>

      {/* Safety Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-bold block mb-0.5">Network Safety Notice:</strong>
          Send only <span className="font-semibold text-white">USDT</span> on the <span className="font-semibold text-white">BNB Smart Chain (BEP-20)</span> network to this address. Sending assets through another network or sending any other token may result in permanent loss.
        </div>
      </div>

      {/* Main Address Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#091124] border border-[#17274a] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAutomatic ? "Your Dedicated Deposit Address" : "Official Deposit Address"}
              </span>
              <button
                onClick={fetchCryptoDetails}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#050b18] border border-[#1a2d52] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="text-[11px] text-slate-500 block font-semibold mb-1">BEP-20 (BNB Smart Chain)</span>
                <p className="font-mono text-sm sm:text-base font-bold text-slate-100 break-all select-all">
                  {depositAddress}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyAddress}
                  className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mode Explainer Footer */}
          <div className="mt-6 pt-4 border-t border-[#152342] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {isAutomatic
                  ? "Automatic Monitoring Active: 3 Block Confirmations Required"
                  : "USDT BEP-20 Network: 3 Block Confirmations Required"}
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Submit TxHash</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Live Deposit Status Tracker Card */}
        <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Live Deposit Tracker</span>
            </h3>

            {latestPending ? (
              <div className="bg-[#050b18] border border-[#1b315b] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    {latestPending.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Amount:</span>
                  <span className="font-bold text-emerald-400">
                    ${Number(latestPending.amountInUsdt).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Confirmations:</span>
                  <span className="font-mono text-slate-200">
                    {latestPending.confirmations || 0} / {cryptoData?.requiredConfirmations || 3}
                  </span>
                </div>
                {latestPending.txHash && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">TxHash:</span>
                    <a
                      href={`https://bscscan.com/tx/${latestPending.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>{latestPending.txHash.slice(0, 6)}...{latestPending.txHash.slice(-4)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                <p className="mb-2">No pending deposits detected.</p>
                <p className="text-[11px] text-slate-500">
                  Send USDT BEP-20 to your address above. Incoming transfers will automatically appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#152342] text-center">
            <span className="text-[10px] text-slate-500">
              Blockchain: BNB Smart Chain (Chain ID: 56)
            </span>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="bg-[#091124] border border-[#17274a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-blue-500 rounded-sm" />
            <h2 className="text-lg font-bold text-slate-100">
              Deposit History
            </h2>
          </div>
          <button
            onClick={fetchCryptoDetails}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#152342]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070e20] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#152342]">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">TX HASH</th>
                <th className="py-3 px-4">CONFIRMATIONS</th>
                <th className="py-3 px-4">MODE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042]">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No deposits recorded yet.
                  </td>
                </tr>
              ) : (
                deposits.map((dep: any, index: number) => (
                  <tr key={dep.id || index} className="hover:bg-[#0c1630] transition-colors">
                    <td className="py-3 px-4 font-mono">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(dep.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-100 text-emerald-400">
                      ${Number(dep.amountInUsdt ?? dep.amountUsdt ?? 0).toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {dep.txHash ? (
                        <a
                          href={`https://bscscan.com/tx/${dep.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>{dep.txHash.slice(0, 6)}...{dep.txHash.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {dep.confirmations || 0} / {cryptoData?.requiredConfirmations || 3}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {dep.processingMode || "MANUAL"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        dep.status === "CONFIRMED" || dep.status === "CREDITED" || dep.status === "APPROVED"
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : dep.status === "PENDING" || dep.status === "CONFIRMING" || dep.status === "PENDING_REVIEW"
                          ? "bg-amber-950/60 text-amber-400 border-amber-500/40"
                          : "bg-rose-950/60 text-rose-400 border-rose-500/40"
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
      </div>

      {/* QR & TxHash Submission Modal */}
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
            <p className="text-xs text-slate-400 mb-4">
              Send USDT BEP-20 directly to the deposit address shown below.
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center bg-[#070e20] border border-[#182a50] rounded-2xl p-4 mb-5">
              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-700">
                <img
                  src={qrImage}
                  alt="USDT Deposit QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <span>BEP-20 Network Only</span>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-3 break-all text-center px-2 select-all">
                {depositAddress}
              </p>
              <button
                onClick={copyAddress}
                className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Address"}</span>
              </button>
            </div>

            {/* Manual TXID Submission Form */}
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Already Sent? Enter BSC Transaction Hash (TxHash)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste 0x... BSC TxHash"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Our backend independently verifies the transaction on the BSC blockchain.
                </span>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  message.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? "Verifying on Blockchain..." : "Submit Transaction for Verification"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
