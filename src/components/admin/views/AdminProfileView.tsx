"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Tag, 
  Calendar, 
  Lock,
  Send,
  Loader2,
  ShieldAlert
} from "lucide-react";

interface AdminProfileViewProps {
  user: any;
  onRefresh?: () => void;
}

export function AdminProfileView({ user, onRefresh }: AdminProfileViewProps) {
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpMsg, setOtpMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Handle countdown for OTP resend cooldown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    if (otpCooldown > 0 || otpSending) return;
    setOtpSending(true);
    setOtpMsg(null);

    try {
      const res = await fetch("/api/admin/profile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setOtpMsg({ type: "success", text: data.message || "OTP code sent to your registered email!" });
      setOtpCooldown(60);
    } catch (err: any) {
      setOtpMsg({ type: "error", text: err.message });
    } finally {
      setOtpSending(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!otp.trim()) {
      setProfileMsg({
        type: "error",
        text: "Security verification required. Please click 'Send OTP' and enter the 6-digit code received on your email.",
      });
      return;
    }

    setProfileLoading(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfileMsg({ type: "success", text: data.message || "Profile updated successfully with OTP verification!" });
      setOtp("");
      setOtpMsg(null);
      onRefresh?.();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New password and confirmation password do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPwdLoading(true);
    setPwdMsg(null);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPwdMsg({ type: "success", text: data.message || "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Admin Profile Settings
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 uppercase font-mono">
            {user?.role || "ADMIN"}
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your executive admin credentials, contact details, and account security.
        </p>
      </div>

      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0a1428] to-slate-900 border border-amber-500/30 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-wide text-white">{user?.fullName || "Admin"}</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  {user?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-mono mt-0.5">Admin ID: {user?.customId}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono flex-wrap">
                {user?.teamPrefix && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Tag className="w-3 h-3" /> Branch: DF{user.teamPrefix}xxxxx
                  </span>
                )}
                {user?.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Profile Info with OTP & Password Change) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal / Contact Details + OTP Verification */}
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-amber-500/20 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-amber-500/15 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Details</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Update name, email and phone with OTP verification</p>
              </div>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="font-semibold">{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Admin Custom ID
                </label>
                <input
                  type="text"
                  value={user?.customId || ""}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono opacity-80 cursor-not-allowed text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Email Address <span className="text-amber-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dubaifinance.online"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Contact / Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567 or +91..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              {/* Security OTP Verification Section */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-amber-300 uppercase tracking-wider font-mono text-[11px]">
                      Security OTP Verification
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Required for Profile Changes
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Verification code will be sent to your registered admin email:{" "}
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">{user?.email}</strong>
                </p>

                {otpMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                      otpMsg.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {otpMsg.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{otpMsg.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-amber-500/40 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono font-bold tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || otpCooldown > 0}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : otpCooldown > 0 ? (
                      <span>Resend ({otpCooldown}s)</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {profileLoading ? "Verifying & Saving..." : "Verify OTP & Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Security & Change Password */}
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-amber-500/20 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-amber-500/15 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Update your console login password</p>
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  pwdMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                {pwdMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="font-semibold">{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Current Password <span className="text-amber-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  New Password <span className="text-amber-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-mono uppercase">
                  Confirm New Password <span className="text-amber-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {pwdLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
