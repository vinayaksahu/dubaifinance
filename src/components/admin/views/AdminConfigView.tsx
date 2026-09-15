"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Crown,
  ArrowLeftRight,
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Loader2,
  Sparkles,
  Users,
  Upload,
  QrCode,
  Trash2,
  Copy,
  Check
} from "lucide-react";
import { getWithdrawalWindowStatus } from "@/lib/constants";

interface ConfigItem {
  value: string;
  description: string;
  category: string;
  updatedAt?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  wallet: Wallet,
  withdrawal: Clock,
  plan: TrendingUp,
  royalty: Crown,
  transfers: ArrowLeftRight,
  company: Building2,
};

const CATEGORY_NAMES: Record<string, string> = {
  all: "All Configurations",
  wallet: "USDT Wallet Settings",
  withdrawal: "Withdrawal Window & Limits",
  plan: "Basic & FD Staking Plans",
  royalty: "Direct & 12-Level Royalty",
  transfers: "P2P, Swipe & Bonus",
  company: "Company & Headquarters",
};

const FRIENDLY_NAMES: Record<string, string> = {
  // Financial & Wallet
  COMPANY_USDT_ADDRESS: "Company USDT (BEP-20) Receiving Wallet",
  COMPANY_USDT_QR: "Company USDT (BEP-20) Receiving QR Code Image",

  // Basic Saving Plan
  BASIC_PLAN_DAILY_ROI: "Basic Saving Daily ROI (%)",
  BASIC_PLAN_TENURE_DAYS: "Basic Saving Tenure (28 Days)",
  BASIC_PLAN_MIN_USDT: "Basic Saving Minimum (USDT)",
  BASIC_PLAN_MAX_USDT: "Basic Saving Maximum (USDT)",

  // Fix Deposit (FD) Staking
  FD_PLAN_180_DAILY_ROI: "FD 180-Day Daily Yield (%)",
  FD_PLAN_180_DAYS: "FD 180-Day Duration (Days)",
  FD_PLAN_210_DAILY_ROI: "FD 210-Day Daily Yield (%)",
  FD_PLAN_210_DAYS: "FD 210-Day Duration (Days)",
  FD_MIN_USDT: "Fix Deposit Minimum (USDT)",
  FD_MAX_USDT: "Fix Deposit Maximum (USDT)",

  // Direct Referral & 12-Level Royalty
  DIRECT_REFERRAL_PERCENT: "Direct Sponsor Referral Commission (%)",
  LEVEL_1_PERCENT: "Level 1 Royalty % (Req: 1 Direct)",
  LEVEL_2_PERCENT: "Level 2 Royalty % (Req: 2 Directs)",
  LEVEL_3_PERCENT: "Level 3 Royalty % (Req: 3 Directs)",
  LEVEL_4_PERCENT: "Level 4 Royalty % (Req: 4 Directs)",
  LEVEL_5_PERCENT: "Level 5 Royalty % (Req: 5 Directs)",
  LEVEL_6_PERCENT: "Level 6 Royalty % (Req: 6 Directs)",
  LEVEL_7_PERCENT: "Level 7 Royalty % (Req: 7 Directs)",
  LEVEL_8_PERCENT: "Level 8 Royalty % (Req: 8 Directs)",
  LEVEL_9_PERCENT: "Level 9 Royalty % (Req: 9 Directs)",
  LEVEL_10_PERCENT: "Level 10 Royalty % (Req: 10 Directs)",
  LEVEL_11_PERCENT: "Level 11 Royalty % (Req: 11 Directs)",
  LEVEL_12_PERCENT: "Level 12 Royalty % (Req: 12 Directs)",

  // Withdrawal Rules & Timings
  WITHDRAWAL_24H_OPEN: "24/7 Unlimited Withdrawal Window (Always Open)",
  WITHDRAWAL_START_TIME: "Withdrawal Window Start Time (HH:MM IST)",
  WITHDRAWAL_END_TIME: "Withdrawal Window End Time (HH:MM IST)",
  WITHDRAWAL_START_HOUR: "Withdrawal Window Start Hour (Legacy 24h IST)",
  WITHDRAWAL_END_HOUR: "Withdrawal Window End Hour (Legacy 24h IST)",
  MIN_WITHDRAWAL_USDT: "Minimum Single Withdrawal (USDT)",
  MAX_WITHDRAWAL_USDT: "Maximum Single Withdrawal (USDT)",
  WITHDRAWAL_FEE_PERCENT: "Withdrawal Admin Fee (%)",

  // Transfers & Bonus
  SIGNUP_BONUS_USDT: "Welcome Signup Bonus (USDT)",
  MIN_P2P_TRANSFER_USDT: "Minimum P2P Transfer (USDT)",
  P2P_FEE_PERCENT: "P2P Transfer Fee (%)",
  SWIPE_FEE_PERCENT: "Income-to-Fund Swipe Fee (%)",

  // Corporate Information
  OFFICIAL_EMAIL: "Official Customer Support Email",
  CMD_NAME: "Platform Director / CMD Name",
  HEADQUARTERS: "Headquarters Registered Address",
};

export function AdminConfigView() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, setTimeTick] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleQrUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          handleInputChange("COMPANY_USDT_QR", dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const timer = setInterval(() => setTimeTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const previewStatus = getWithdrawalWindowStatus(formValues);
  const is24hActive = 
    formValues.WITHDRAWAL_24H_OPEN === "true" || 
    (formValues.WITHDRAWAL_START_TIME === "00:00" && (formValues.WITHDRAWAL_END_TIME === "23:59" || formValues.WITHDRAWAL_END_TIME === "24:00"));

  const currentStartTime = formValues.WITHDRAWAL_START_TIME || (formValues.WITHDRAWAL_START_HOUR !== undefined ? `${String(formValues.WITHDRAWAL_START_HOUR).padStart(2, "0")}:00` : "10:00");
  const currentEndTime = formValues.WITHDRAWAL_END_TIME || (formValues.WITHDRAWAL_END_HOUR !== undefined ? (Number(formValues.WITHDRAWAL_END_HOUR) >= 23 ? "23:59" : `${String(formValues.WITHDRAWAL_END_HOUR).padStart(2, "0")}:00`) : "14:00");

  const toggle24h = () => {
    const willBe24h = !is24hActive;
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_24H_OPEN: willBe24h ? "true" : "false",
      WITHDRAWAL_START_TIME: willBe24h ? "00:00" : "10:00",
      WITHDRAWAL_END_TIME: willBe24h ? "23:59" : "14:00",
      WITHDRAWAL_START_HOUR: willBe24h ? "0" : "10",
      WITHDRAWAL_END_HOUR: willBe24h ? "23" : "14",
    }));
  };

  const updateStartTime = (timeStr: string) => {
    const [h = 10] = timeStr.split(":").map(Number);
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_START_TIME: timeStr,
      WITHDRAWAL_START_HOUR: String(h),
      WITHDRAWAL_24H_OPEN: "false",
    }));
  };

  const updateEndTime = (timeStr: string) => {
    const [h = 14] = timeStr.split(":").map(Number);
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_END_TIME: timeStr,
      WITHDRAWAL_END_HOUR: String(h),
      WITHDRAWAL_24H_OPEN: "false",
    }));
  };

  const applyPreset = (preset: "24h" | "default" | "morning" | "afternoon" | "evening") => {
    if (preset === "24h") {
      setFormValues((prev) => ({
        ...prev,
        WITHDRAWAL_24H_OPEN: "true",
        WITHDRAWAL_START_TIME: "00:00",
        WITHDRAWAL_END_TIME: "23:59",
        WITHDRAWAL_START_HOUR: "0",
        WITHDRAWAL_END_HOUR: "23",
      }));
    } else if (preset === "default") {
      setFormValues((prev) => ({
        ...prev,
        WITHDRAWAL_24H_OPEN: "false",
        WITHDRAWAL_START_TIME: "10:00",
        WITHDRAWAL_END_TIME: "14:00",
        WITHDRAWAL_START_HOUR: "10",
        WITHDRAWAL_END_HOUR: "14",
      }));
    } else if (preset === "morning") {
      setFormValues((prev) => ({
        ...prev,
        WITHDRAWAL_24H_OPEN: "false",
        WITHDRAWAL_START_TIME: "09:00",
        WITHDRAWAL_END_TIME: "13:00",
        WITHDRAWAL_START_HOUR: "9",
        WITHDRAWAL_END_HOUR: "13",
      }));
    } else if (preset === "afternoon") {
      setFormValues((prev) => ({
        ...prev,
        WITHDRAWAL_24H_OPEN: "false",
        WITHDRAWAL_START_TIME: "12:00",
        WITHDRAWAL_END_TIME: "18:00",
        WITHDRAWAL_START_HOUR: "12",
        WITHDRAWAL_END_HOUR: "18",
      }));
    } else if (preset === "evening") {
      setFormValues((prev) => ({
        ...prev,
        WITHDRAWAL_24H_OPEN: "false",
        WITHDRAWAL_START_TIME: "16:00",
        WITHDRAWAL_END_TIME: "22:00",
        WITHDRAWAL_START_HOUR: "16",
        WITHDRAWAL_END_HOUR: "22",
      }));
    }
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load configurations");

      setConfigs(data.configs || {});
      const initialForm: Record<string, string> = {};
      for (const [key, item] of Object.entries(data.configs || {})) {
        initialForm[key] = (item as ConfigItem).value;
      }
      setFormValues(initialForm);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to fetch configurations" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "WITHDRAWAL_START_TIME") {
        const [h = 10] = value.split(":").map(Number);
        next.WITHDRAWAL_START_HOUR = String(h);
      } else if (key === "WITHDRAWAL_START_HOUR") {
        const h = Number(value);
        next.WITHDRAWAL_START_TIME = `${String(isNaN(h) ? 10 : h).padStart(2, "0")}:00`;
      } else if (key === "WITHDRAWAL_END_TIME") {
        const [h = 14] = value.split(":").map(Number);
        next.WITHDRAWAL_END_HOUR = String(h);
      } else if (key === "WITHDRAWAL_END_HOUR") {
        const h = Number(value);
        next.WITHDRAWAL_END_TIME = h >= 23 ? "23:59" : `${String(isNaN(h) ? 14 : h).padStart(2, "0")}:00`;
      } else if (key === "WITHDRAWAL_24H_OPEN") {
        if (value === "true") {
          next.WITHDRAWAL_START_TIME = "00:00";
          next.WITHDRAWAL_END_TIME = "23:59";
          next.WITHDRAWAL_START_HOUR = "0";
          next.WITHDRAWAL_END_HOUR = "23";
        }
      }
      return next;
    });
  };

  const handleReset = () => {
    const initialForm: Record<string, string> = {};
    for (const [key, item] of Object.entries(configs)) {
      initialForm[key] = item.value;
    }
    setFormValues(initialForm);
    setStatusMessage({ type: "success", text: "Changes reset to saved values." });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: formValues }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration");

      setStatusMessage({ type: "success", text: data.message || "Configurations saved successfully and applied across all user portals!" });
      await fetchConfigs();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Error saving configurations" });
    } finally {
      setSaving(false);
    }
  };

  // Filter keys by category and search query
  const filteredKeys = Object.keys(configs).filter((key) => {
    if (key === "COMPANY_USDT_QR") return false;
    const item = configs[key];
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      query === "" || 
      key.toLowerCase().includes(query) || 
      (FRIENDLY_NAMES[key] || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const hasUnsavedChanges = Object.keys(formValues).some(
    (key) => configs[key] && configs[key].value !== formValues[key]
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>Real-Time System Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              System Configuration
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Edit global financial parameters according to the Dubai Finance plan. Changes instantly apply to User Dashboards, Package calculations, Referral rewards, 12-Level royalties, and Withdrawal limits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving || !hasUnsavedChanges}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || !hasUnsavedChanges}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div
            className={`mt-5 p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {hasUnsavedChanges && !statusMessage && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>You have unsaved modifications. Click &quot;Save Changes&quot; to apply immediately.</span>
          </div>
        )}
      </div>

      {/* Filter and Category Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#070e20] border border-[#152238] overflow-x-auto max-w-full">
          {["all", "wallet", "withdrawal", "plan", "royalty", "transfers", "company"].map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Settings;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{CATEGORY_NAMES[cat] || cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search configuration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070e20] border border-[#152238] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Dedicated Withdrawal Window & 24/7 Hours Controller */}
      {(activeCategory === "withdrawal" || activeCategory === "all") && !searchQuery && (
        <div className="bg-gradient-to-br from-[#091326] via-[#0d1633] to-[#141030] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-7 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Withdrawal Timing &amp; Schedule Controller</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>Withdrawal Window &amp; 24/7 Hours</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${
                  previewStatus.isOpen
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {previewStatus.isOpen ? "● Live: Open Now" : "● Live: Closed"}
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Set custom daily withdrawal hours (HH:MM IST) or toggle 24/7 withdrawals. Changes apply instantly to Member Dashboards, withdrawal modals, and backend validation.
              </p>
            </div>

            {/* 24/7 Mode Switch */}
            <div className="flex items-center gap-4 bg-[#060c1d] border border-purple-500/40 p-4 rounded-2xl shadow-lg">
              <div className="text-left sm:text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 sm:justify-end">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>24/7 Mode (Always Open)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {is24hActive ? "Members can withdraw anytime 24 hours" : "Strict HH:MM window active"}
                </div>
              </div>
              <button
                type="button"
                onClick={toggle24h}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  is24hActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-700"
                }`}
                title="Toggle 24/7 withdrawals"
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-black tracking-tighter ${
                    is24hActive ? "translate-x-9 text-emerald-600" : "translate-x-0 text-slate-700"
                  }`}
                >
                  {is24hActive ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Timing Pickers & Live Preview */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Start Time Picker */}
            <div className="bg-[#050b18] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Daily Window Start Time (HH:MM IST)
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  Time when withdrawal button becomes active and open
                </p>
              </div>
              <input
                type="time"
                value={currentStartTime}
                disabled={is24hActive}
                onChange={(e) => updateStartTime(e.target.value)}
                className="w-full bg-[#081023] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* End Time Picker */}
            <div className="bg-[#050b18] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Daily Window End Time (HH:MM IST)
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  Time when withdrawal button automatically closes
                </p>
              </div>
              <input
                type="time"
                value={currentEndTime}
                disabled={is24hActive}
                onChange={(e) => updateEndTime(e.target.value)}
                className="w-full bg-[#081023] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Live Member Portal Preview */}
            <div className="bg-[#050b18] border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300">Live Member Portal View</span>
                  <span className="text-[10px] font-mono text-slate-400">Current IST: {previewStatus.currentIstTime}</span>
                </div>
                <div className="text-sm font-black text-white mt-1">
                  {previewStatus.label}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">User Button Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                  previewStatus.isOpen
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-950 text-rose-300 border border-rose-500/40"
                }`}>
                  {previewStatus.isOpen ? "Enabled (Open Now)" : "Disabled (Closed)"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Timing Presets */}
          <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">Quick Timing Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset("24h")}
              className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
            >
              ⚡ 24 Hours Always Open (00:00 - 23:59)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("default")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              🕒 Default (10:00 AM - 02:00 PM)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("morning")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              🌅 Morning (09:00 AM - 01:00 PM)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("afternoon")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              🌇 Afternoon (12:00 PM - 06:00 PM)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("evening")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              🌙 Evening (04:00 PM - 10:00 PM)
            </button>
          </div>
        </div>
      )}

      {/* Configuration Form Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/40">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading system configurations...</p>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/40 text-slate-400 text-sm">
          No configurations match your search or filter.
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredKeys.map((key) => {
            const item = configs[key];

            // Custom unified card for COMPANY_USDT_ADDRESS with Address + QR Code Upload
            if (key === "COMPANY_USDT_ADDRESS") {
              const currentAddress = formValues["COMPANY_USDT_ADDRESS"] ?? item.value;
              const customQr = formValues["COMPANY_USDT_QR"] ?? configs["COMPANY_USDT_QR"]?.value ?? "";
              const activeQrUrl = customQr || (currentAddress ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentAddress)}` : "");
              const isQrModified = formValues["COMPANY_USDT_QR"] !== undefined && formValues["COMPANY_USDT_QR"] !== (configs["COMPANY_USDT_QR"]?.value ?? "");
              const isAddressModified = formValues["COMPANY_USDT_ADDRESS"] !== item.value;

              return (
                <div
                  key={key}
                  className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-slate-900/90 via-[#0a1228] to-purple-950/30 backdrop-blur border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                  {/* Header Row */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">
                        <Wallet className="w-4 h-4 text-purple-400" />
                        <span>Official Platform Deposit Vault</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Company USDT (BEP-20) Receiving Wallet &amp; QR Code
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                        This receiving address and official QR code will be displayed to all users when depositing funds via Binance Smart Chain (BEP-20 USDT). You can keep the auto-generated QR code or upload a custom branded payment QR.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {(isAddressModified || isQrModified) && (
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                          Unsaved Edits
                        </span>
                      )}
                      <span className="font-mono text-xs px-3 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        BEP-20 Network
                      </span>
                    </div>
                  </div>

                  {/* Two-Column Grid: Left Address & Controls, Right QR Code & Upload */}
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
                    {/* Left: Address Input & Specs */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <div className="text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                          <span>Deposit Wallet Address (BSC BEP-20)</span>
                          {currentAddress && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(currentAddress);
                                setCopiedAddress(true);
                                setTimeout(() => setCopiedAddress(false), 2000);
                              }}
                              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                            >
                              {copiedAddress ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Address</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={currentAddress}
                            onChange={(e) => handleInputChange("COMPANY_USDT_ADDRESS", e.target.value.trim())}
                            className={`w-full bg-[#050b18] border rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none transition-all ${
                              isAddressModified
                                ? "border-amber-400 focus:border-amber-300 bg-amber-950/10"
                                : "border-slate-800 focus:border-purple-500"
                            }`}
                            placeholder="e.g. 0x1234567890abcdef..."
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          Make sure this is a valid Binance Smart Chain (BEP-20) USDT address. Incorrect addresses will cause deposit loss.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="bg-[#060c1c] border border-slate-800/80 rounded-2xl p-3.5">
                          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                            Accepted Token
                          </div>
                          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                            <span>USDT (Tether USD)</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Pegged on Binance Smart Chain</div>
                        </div>
                        <div className="bg-[#060c1c] border border-slate-800/80 rounded-2xl p-3.5">
                          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                            Deposit Confirmation
                          </div>
                          <div className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                            <span>Admin Approved</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Users submit TxHash + Screenshot</div>
                        </div>
                      </div>

                      {/* QR Upload Action Buttons */}
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-200 mb-2">
                          Manage Deposit QR Code
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Upload Custom QR Image</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleQrUpload(file);
                              }}
                              className="hidden"
                            />
                          </label>

                          {customQr ? (
                            <button
                              type="button"
                              onClick={() => handleInputChange("COMPANY_USDT_QR", "")}
                              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reset to Auto Dynamic QR</span>
                            </button>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Supported formats: PNG, JPG, WEBP. The image is automatically optimized for fast loading on all user devices.
                        </p>
                      </div>
                    </div>

                    {/* Right: Live QR Preview Card */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#060c1d] border border-slate-800/80 rounded-2xl p-6 text-center">
                      <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-purple-400" />
                        <span>Live Deposit QR Preview</span>
                      </div>

                      {/* QR Box with white background padding for scan clarity */}
                      <div className="relative group p-3 bg-white rounded-2xl shadow-xl shadow-purple-950/50 border border-slate-200">
                        {activeQrUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activeQrUrl}
                            alt="Deposit QR Code"
                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                            <QrCode className="w-10 h-10 mb-2 opacity-40 text-slate-600" />
                            <span>No address or QR</span>
                          </div>
                        )}
                      </div>

                      {/* QR Status Pill */}
                      <div className="mt-4 flex items-center gap-2">
                        {customQr ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Custom Uploaded QR Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-950 border border-purple-500/40 text-purple-300">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Auto-Generated From Wallet Address</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 max-w-xs">
                        This exact QR code is rendered in the Recharge modal when members deposit USDT.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const isAddress = key.includes("ADDRESS");
            const isRoyaltyLevel = key.startsWith("LEVEL_") && key.endsWith("_PERCENT");
            const levelNum = isRoyaltyLevel ? key.split("_")[1] : null;

            const is24hToggle = key === "WITHDRAWAL_24H_OPEN";
            const isTimePicker = key === "WITHDRAWAL_START_TIME" || key === "WITHDRAWAL_END_TIME";
            const isNumber = 
              !isTimePicker &&
              !is24hToggle &&
              (key.includes("RATE") || 
              key.includes("PERCENT") || 
              key.includes("HOUR") || 
              key.includes("MIN") || 
              key.includes("MAX") || 
              key.includes("BONUS") ||
              key.includes("DAYS"));

            return (
              <div
                key={key}
                className={`bg-slate-900/50 backdrop-blur border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-md ${
                  isRoyaltyLevel
                    ? "border-amber-500/30 bg-gradient-to-br from-slate-900/60 to-amber-950/20"
                    : is24hToggle || isTimePicker
                    ? "border-purple-500/40 bg-gradient-to-br from-slate-900/70 to-purple-950/20"
                    : "border-slate-800/60 hover:border-purple-500/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <label className="text-sm font-bold text-slate-100 tracking-tight block">
                      {FRIENDLY_NAMES[key] || key}
                    </label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30 shrink-0">
                      {key}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {isRoyaltyLevel && (
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2.5 py-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Unlock Condition: Requires {levelNum} Active Direct Referral{Number(levelNum) > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="relative">
                    {is24hToggle ? (
                      <select
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`w-full bg-[#050b18] border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-all font-semibold ${
                          formValues[key] !== item.value
                            ? "border-amber-400 focus:border-amber-300 bg-amber-950/10"
                            : "border-slate-800 focus:border-purple-500"
                        }`}
                      >
                        <option value="false">Scheduled Window (IST Hours)</option>
                        <option value="true">24/7 Open (Always Accessible)</option>
                      </select>
                    ) : isTimePicker ? (
                      <input
                        type="time"
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`w-full bg-[#050b18] border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-all font-mono font-semibold ${
                          formValues[key] !== item.value
                            ? "border-amber-400 focus:border-amber-300 bg-amber-950/10"
                            : "border-slate-800 focus:border-purple-500"
                        }`}
                        required
                      />
                    ) : (
                      <input
                        type={isNumber ? "number" : "text"}
                        step={key.includes("PERCENT") || key.includes("RATE") ? "any" : "1"}
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`w-full bg-[#050b18] border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-all ${
                          formValues[key] !== item.value
                            ? "border-amber-400 focus:border-amber-300 bg-amber-950/10"
                            : "border-slate-800 focus:border-purple-500"
                        } ${isAddress ? "font-mono text-xs" : "font-semibold"}`}
                        placeholder={`Enter ${FRIENDLY_NAMES[key] || key}`}
                        required
                      />
                    )}

                    {formValues[key] !== item.value && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none">
                        Modified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </form>
      )}

      {/* Floating Save Footer Bar when changes exist */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 sm:right-10 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-[#0b1429] border-2 border-purple-500/60 rounded-2xl px-5 py-3 shadow-2xl shadow-purple-600/40 flex items-center gap-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved changes detected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
