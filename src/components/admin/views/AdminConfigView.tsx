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
  Users
} from "lucide-react";

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
  WITHDRAWAL_START_HOUR: "Withdrawal Window Start Hour (24h IST)",
  WITHDRAWAL_END_HOUR: "Withdrawal Window End Hour (24h IST)",
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
    setFormValues((prev) => ({ ...prev, [key]: value }));
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
            const isAddress = key.includes("ADDRESS");
            const isRoyaltyLevel = key.startsWith("LEVEL_") && key.endsWith("_PERCENT");
            const levelNum = isRoyaltyLevel ? key.split("_")[1] : null;

            const isNumber = 
              key.includes("RATE") || 
              key.includes("PERCENT") || 
              key.includes("HOUR") || 
              key.includes("MIN") || 
              key.includes("MAX") || 
              key.includes("BONUS") ||
              key.includes("DAYS");

            return (
              <div
                key={key}
                className={`bg-slate-900/50 backdrop-blur border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-md ${
                  isRoyaltyLevel
                    ? "border-amber-500/30 bg-gradient-to-br from-slate-900/60 to-amber-950/20"
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
                    {formValues[key] !== item.value && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
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
