"use client";

import React, { useState } from "react";
import { APP_CONFIG, isWithdrawalWindowOpen, getWithdrawalWindowStatus } from "@/lib/constants";
import { formatInr, formatUsdt } from "@/lib/utils";
import {
  Wallet,
  Coins,
  Send,
  ArrowRightLeft,
  ArrowDownToLine,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";

export function ActionModals({ user, onRefresh }: { user: any; onRefresh: () => void }) {
  const [activeModal, setActiveModal] = useState<
    "deposit" | "basic" | "fd" | "p2p" | "swipe" | "withdraw" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [depositAmount, setDepositAmount] = useState("");
  const [depositHash, setDepositHash] = useState("");

  const [basicAmount, setBasicAmount] = useState("50");
  const [targetId, setTargetId] = useState(user.customId);
  const [pin, setPin] = useState("");

  const [fdTier, setFdTier] = useState("50");
  const [fdDays, setFdDays] = useState<180 | 210>(180);

  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");

  const [swipeAmount, setSwipeAmount] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [withdrawAddress, setWithdrawAddress] = useState(user.usdtAddress || "");

  const closeModal = () => {
    setActiveModal(null);
    setMsg(null);
    setPin("");
  };

  // Deposit handler
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInUsdt: depositAmount, txHash: depositHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit failed");
      setMsg({ type: "success", text: data.message });
      setDepositAmount("");
      setDepositHash("");
      onRefresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Package activate handler
  const handleActivate = async (type: "BASIC_SAVING" | "FIX_DEPOSIT") => {
    setLoading(true);
    setMsg(null);
    try {
      const amount = type === "BASIC_SAVING" ? basicAmount : fdTier;
      const res = await fetch("/api/packages/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: type,
          amountInUsdt: amount,
          amount: amount,
          targetCustomId: targetId,
          transactionPin: pin,
          fdTenureDays: fdDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Activation failed");
      setMsg({ type: "success", text: data.message });
      setPin("");
      onRefresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // P2P handler
  const handleP2P = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientCustomId: p2pRecipient,
          amountInUsdt: p2pAmount,
          amount: p2pAmount,
          transactionPin: pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      setMsg({ type: "success", text: data.message });
      setP2pAmount("");
      setPin("");
      onRefresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Swipe handler
  const handleSwipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: swipeAmount,
          amount: swipeAmount,
          transactionPin: pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Swipe failed");
      setMsg({ type: "success", text: data.message });
      setSwipeAmount("");
      setPin("");
      onRefresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Withdraw handler
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: withdrawAmount,
          amount: withdrawAmount,
          toAddress: withdrawAddress,
          transactionPin: pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");
      setMsg({ type: "success", text: data.message });
      setPin("");
      onRefresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const cfg = user?.systemConfig || {};
  const [windowStatus, setWindowStatus] = useState(() => getWithdrawalWindowStatus(cfg));

  React.useEffect(() => {
    setWindowStatus(getWithdrawalWindowStatus(cfg));
    const interval = setInterval(() => {
      setWindowStatus(getWithdrawalWindowStatus(cfg));
    }, 5000);
    return () => clearInterval(interval);
  }, [cfg]);

  const minWithdrawUsdt = cfg.MIN_WITHDRAWAL_USDT !== undefined ? Number(cfg.MIN_WITHDRAWAL_USDT) : APP_CONFIG.minWithdrawalUsdt;
  const maxWithdrawUsdt = cfg.MAX_WITHDRAWAL_USDT !== undefined ? Number(cfg.MAX_WITHDRAWAL_USDT) : APP_CONFIG.maxWithdrawalUsdt;
  const adminFeePercent = cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT ? Number(cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT) : APP_CONFIG.withdrawalAdminFeePercent;
  const windowOpen = windowStatus.isOpen;

  return (
    <div>
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <button
          onClick={() => setActiveModal("deposit")}
          className="p-4 rounded-2xl glass-card-gold flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-amber-300">Recharge / Deposit</span>
          <span className="text-[10px] text-slate-400">USDT BEP-20</span>
        </button>

        <button
          onClick={() => setActiveModal("basic")}
          className="p-4 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-emerald-300">Activate Basic</span>
          <span className="text-[10px] text-slate-400">5% Daily &bull; 28 Days</span>
        </button>

        <button
          onClick={() => setActiveModal("fd")}
          className="p-4 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            ⚜️
          </div>
          <span className="text-xs font-black text-cyan-300">Activate FD</span>
          <span className="text-[10px] text-slate-400">10% - 15% Daily</span>
        </button>

        <button
          onClick={() => setActiveModal("p2p")}
          className="p-4 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-purple-300">P2P Transfer</span>
          <span className="text-[10px] text-slate-400">$0 Fee Member Transfer</span>
        </button>

        <button
          onClick={() => setActiveModal("swipe")}
          className="p-4 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-blue-300">Income to Fund</span>
          <span className="text-[10px] text-slate-400">0% Deduction Swipe</span>
        </button>

        <button
          onClick={() => setActiveModal("withdraw")}
          className="p-4 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-red-300">Withdrawal</span>
          <span className="text-[10px] text-slate-400">{windowStatus.is24h ? "24/7 Open" : windowStatus.label}</span>
        </button>
      </div>

      {/* POPUP MODAL WRAPPER */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg glass-card-gold p-6 rounded-3xl shadow-2xl border border-amber-500/40">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {msg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                  msg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {msg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {msg.text}
              </div>
            )}

            {/* MODAL 1: RECHARGE / DEPOSIT */}
            {activeModal === "deposit" && (
              <form onSubmit={handleDeposit}>
                <h3 className="text-lg font-black text-white mb-1">Recharge Fund Wallet</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Send USDT (BEP-20) to the official Dubai Finance address below:
                </p>

                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 mb-4 text-center">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                    Official USDT BEP-20 Address
                  </span>
                  <span className="font-mono text-xs text-white break-all select-all">
                    {APP_CONFIG.depositAddress}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Amount in USDT
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                    {depositAmount && (
                      <span className="text-[11px] text-amber-300 mt-1 block">
                        Deposit: ${Number(depositAmount).toFixed(2)} USDT
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Blockchain Transaction Hash (TxID)
                    </label>
                    <input
                      type="text"
                      required
                      value={depositHash}
                      onChange={(e) => setDepositHash(e.target.value)}
                      placeholder="e.g. 0x..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4"
                  >
                    {loading ? "Submitting..." : "Submit Deposit for Approval"}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL 2: ACTIVATE BASIC PACKAGE */}
            {activeModal === "basic" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleActivate("BASIC_SAVING");
                }}
              >
                <h3 className="text-lg font-black text-white mb-1">Activate Basic Saving Package</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Daily 5% ROI for 28 Days (Gross 140% Total Return, 40% Net Profit).
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Amount in USDT ($5 to $5,000)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="5000"
                      required
                      value={basicAmount}
                      onChange={(e) => setBasicAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                    <span className="text-[11px] text-emerald-400 mt-1 block">
                      Daily 5% ROI: ${(Number(basicAmount) * 0.05).toFixed(2)} USDT &bull; Total 140% Return: ${(Number(basicAmount) * 1.40).toFixed(2)} USDT
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Beneficiary User ID (Self or Downline)
                    </label>
                    <input
                      type="text"
                      required
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      6-Digit Transaction PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4"
                  >
                    {loading ? "Activating..." : "Confirm & Activate Package"}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL 3: ACTIVATE FIX DEPOSIT (FD) */}
            {activeModal === "fd" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleActivate("FIX_DEPOSIT");
                }}
              >
                <h3 className="text-lg font-black text-white mb-1">Activate Fix Deposit (FD)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  10% To 15% Daily Yield &bull; Full capital + returns released on maturity.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Select FD Tier
                    </label>
                    <select
                      value={fdTier}
                      onChange={(e) => setFdTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    >
                      <option value="50">Package 1 - $50 USDT</option>
                      <option value="100">Package 2 - $100 USDT</option>
                      <option value="200">Package 3 - $200 USDT</option>
                      <option value="500">Package 4 - $500 USDT</option>
                      <option value="1000">Package 5 (Popular) - $1,000 USDT</option>
                      <option value="2000">Package 6 - $2,000 USDT</option>
                      <option value="5000">Package 7 (VIP) - $5,000 USDT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Select Contract Tenure
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFdDays(180)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          fdDays === 180
                            ? "bg-amber-400 text-black border-amber-400"
                            : "bg-slate-900 text-slate-300 border-slate-700"
                        }`}
                      >
                        180 Days (10% Daily)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFdDays(210)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          fdDays === 210
                            ? "bg-emerald-400 text-black border-emerald-400"
                            : "bg-slate-900 text-slate-300 border-slate-700"
                        }`}
                      >
                        210 Days (15% Daily)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Beneficiary User ID
                    </label>
                    <input
                      type="text"
                      required
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      6-Digit Transaction PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4"
                  >
                    {loading ? "Activating..." : "Confirm & Stake FD Package"}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL 4: P2P TRANSFER */}
            {activeModal === "p2p" && (
              <form onSubmit={handleP2P}>
                <h3 className="text-lg font-black text-white mb-1">P2P Member Transfer</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Send funds instantly from your Fund Wallet with $0 network fee.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Recipient User ID
                    </label>
                    <input
                      type="text"
                      required
                      value={p2pRecipient}
                      onChange={(e) => setP2pRecipient(e.target.value)}
                      placeholder="e.g. DF836419"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Amount in USDT (Min $1)
                    </label>
                    <input
                      type="number"
                      required
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      6-Digit Transaction PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4"
                  >
                    {loading ? "Sending..." : "Confirm P2P Transfer"}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL 5: SWIPE (INCOME TO FUND) */}
            {activeModal === "swipe" && (
              <form onSubmit={handleSwipe}>
                <h3 className="text-lg font-black text-white mb-1">Income to Fund Wallet (Swipe)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Convert earned Income balance to Fund Wallet with <strong>0% deduction</strong> to activate packages or do P2P.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Amount in USDT to Swipe
                    </label>
                    <input
                      type="number"
                      required
                      value={swipeAmount}
                      onChange={(e) => setSwipeAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      6-Digit Transaction PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4"
                  >
                    {loading ? "Converting..." : "Confirm 0% Swipe"}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL 6: WITHDRAWAL */}
            {activeModal === "withdraw" && (
              <form onSubmit={handleWithdraw}>
                <h3 className="text-lg font-black text-white mb-1">Withdraw to USDT (BEP-20)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Flat {adminFeePercent}% Admin Charge. Net payout credited directly to your BEP-20 address.
                </p>

                {!windowStatus.isOpen && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    Notice: Withdrawal window is open daily during {windowStatus.label}. (Current IST Time: {windowStatus.currentIstTime})
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Amount in USDT (Min ${minWithdrawUsdt}, Max ${maxWithdrawUsdt.toLocaleString()} USDT)
                    </label>
                    <input
                      type="number"
                      min={minWithdrawUsdt}
                      max={maxWithdrawUsdt}
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm outline-none"
                    />
                    <span className="text-[11px] text-emerald-400 mt-1 block">
                      Admin Fee ({adminFeePercent}%): ${(Number(withdrawAmount) * (adminFeePercent / 100)).toFixed(2)} USDT &bull; Net Payout: ${(Number(withdrawAmount) * (1 - adminFeePercent / 100)).toFixed(2)} USDT
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Destination USDT BEP-20 Address
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      6-Digit Transaction PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-amber-300 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !windowStatus.isOpen}
                    className="w-full py-3 rounded-xl gold-btn text-xs font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Processing..."
                      : windowStatus.isOpen
                      ? "Submit Withdrawal Request"
                      : `Withdrawal Closed (${windowStatus.label})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}