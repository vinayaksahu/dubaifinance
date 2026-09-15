"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  User,
  Key,
  Wallet,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MemberTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  onRefresh?: () => void;
}

export function MemberTopNavbar({
  user,
  onToggleSidebar,
  isCollapsed = false,
  onRefresh,
}: MemberTopNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"profile" | "password" | "wallet" | null>(null);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(user.fullName || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Wallet Address Form State
  const [walletAddress, setWalletAddress] = useState(user.usdtAddress || "");
  const [walletOtp, setWalletOtp] = useState("");
  const [walletOtpSent, setWalletOtpSent] = useState(false);
  const [walletOtpSending, setWalletOtpSending] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSendWalletOtp = async () => {
    setWalletOtpSending(true);
    setWalletMsg(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, purpose: "TRANSACTION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setWalletOtpSent(true);
      setWalletMsg({ text: `Security OTP sent to ${user.email}. Check inbox/spam.` });
    } catch (err: any) {
      setWalletMsg({ text: err.message, error: true });
    } finally {
      setWalletOtpSending(false);
    }
  };

  // Update internal states when user prop changes
  useEffect(() => {
    setProfileName(user.fullName || "");
    setProfilePhone(user.phone || "");
    setWalletAddress(user.usdtAddress || "");
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-profile-menu-container")) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      window.location.href = "/login";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileMsg({ text: "Profile updated successfully!" });
      onRefresh?.();
    } catch (err: any) {
      setProfileMsg({ text: err.message, error: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: "New password and confirmation do not match", error: true });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwdMsg({ text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMsg({ text: err.message, error: true });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletLoading(true);
    setWalletMsg(null);
    try {
      const res = await fetch("/api/member/wallet-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdtAddress: walletAddress,
          otp: walletOtp.trim(),
          transactionPin: walletOtp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wallet address");
      setWalletMsg({ text: "USDT BEP-20 address updated successfully!" });
      setWalletOtp("");
      onRefresh?.();
    } catch (err: any) {
      setWalletMsg({ text: err.message, error: true });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md transition-colors duration-200">
        {/* Left: Sidebar Slide/Collapse Toggle & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-amber-500/30 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-colors shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Side Panel"
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            )}
          </button>

          <ThemeToggle variant="compact" dropdownAlign="left" />
        </div>

        {/* Right: User Profile Dropdown Pill matching India Finance UI */}
        <div className="relative" id="user-profile-menu-container">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-secondary)] border border-amber-500/25 hover:border-amber-400 transition-all text-left shadow-sm cursor-pointer"
          >
            {/* India Finance Style Circular Avatar with Red House icon */}
            <div className="w-8 h-8 rounded-full border-2 border-red-500/90 bg-red-950/40 flex items-center justify-center p-1 shadow-sm shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-red-500"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            {/* Full Name */}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {user.fullName || "Member"}
            </span>

            <ChevronDown className={`w-4 h-4 text-slate-400 ml-0.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu matching India Finance UI */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#070e1e] border border-[#17274a] text-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Header: UID & Level */}
              <div className="px-4 py-2.5 border-b border-[#142344]">
                <p className="text-sm font-extrabold text-white tracking-wide">
                  UID : {user.customId}
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {user.level || user.rank || "L1"}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1.5 space-y-0.5">
                {/* 1. Edit Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setProfileMsg(null);
                    setActiveModal("profile");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold">Edit Profile</span>
                </button>

                {/* 2. Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setPwdMsg(null);
                    setActiveModal("password");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Change Password</span>
                </button>

                {/* 3. Wallet Address */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setWalletMsg(null);
                    setActiveModal("wallet");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Wallet Address</span>
                </button>
              </div>

              {/* Sign out */}
              <div className="border-t border-[#142344] pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MODAL 1: EDIT PROFILE */}
      {activeModal === "profile" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#091124] border border-[#17274a] text-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                <p className="text-xs text-slate-400">Update your account information</p>
              </div>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  profileMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {profileMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">User ID</label>
                <input
                  type="text"
                  value={user.customId}
                  disabled
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-400 font-mono opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-slate-400 opacity-80 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD */}
      {activeModal === "password" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#091124] border border-[#17274a] text-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-xs text-slate-400">Update your account login password</p>
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  pwdMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {pwdMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {pwdLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WALLET ADDRESS */}
      {activeModal === "wallet" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#091124] border border-[#17274a] text-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Wallet Address</h3>
                <p className="text-xs text-slate-400">Set or update your USDT (BEP-20) address</p>
              </div>
            </div>

            {walletMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  walletMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {walletMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {walletMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateWallet} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#070e20] border border-[#162544] text-xs">
                <span className="text-slate-400 block mb-1">Current Receiving Address:</span>
                <span className="font-mono text-emerald-400 break-all select-all font-semibold">
                  {user.usdtAddress || "No wallet address linked yet"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  USDT BEP-20 Receiving Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x... USDT BEP-20 Wallet Address"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Withdrawals will be processed directly to this address on BNB Smart Chain.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleSendWalletOtp}
                    disabled={walletOtpSending}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline disabled:opacity-50"
                  >
                    {walletOtpSending ? "Sending OTP..." : walletOtpSent ? "Resend OTP" : "Get OTP on Email"}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={walletOtp}
                  onChange={(e) => setWalletOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP code"
                  className="w-full bg-[#070e20] border border-[#1a2d52] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-center tracking-widest font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  A 6-digit security code will be sent to {user.email}.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {walletLoading ? "Updating..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
