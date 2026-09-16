"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Users, 
  Wallet, 
  Banknote, 
  TrendingUp, 
  UserPlus, 
  KeyRound, 
  Lock, 
  Unlock, 
  LogOut, 
  Search, 
  RefreshCw,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Tag,
  Settings,
  Zap,
  DollarSign,
  Send,
  Eye,
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminItem {
  id: string;
  customId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  teamPrefix: string | null;
  createdAt: string;
  totalMembers: number;
  activeMembers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeContractsCount: number;
  totalDepositsUsdt: number;
  totalWithdrawalsUsdt: number;
  totalAdminFeeUsdt: number;
}

interface GlobalStats {
  totalAdmins: number;
  totalUsers: number;
  activeUsers: number;
  totalContracts: number;
  activeContracts: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalApprovedDepositsUsdt: number;
  totalProcessedWithdrawalsUsdt: number;
  totalAdminFeeUsdt: number;
}

interface InspectData {
  admin: AdminItem;
  members: any[];
  deposits: any[];
  withdrawals: any[];
  activeContracts: any[];
}

export default function SuperRootAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admins" | "inspect" | "config" | "wallet">("admins");
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ROI Cron trigger states
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  // Inspector states
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<InspectData | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // System Config states
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  // Wallet adjustment states
  const [adjustTargetId, setAdjustTargetId] = useState("");
  const [adjustAction, setAdjustAction] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustWallet, setAdjustWallet] = useState<"FUND" | "INCOME">("FUND");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustResult, setAdjustResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Create Admin Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    customId: "",
    teamPrefix: "",
    email: "",
    phone: "",
    password: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Password Modal
  const [passwordModalAdmin, setPasswordModalAdmin] = useState<AdminItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  // Prefix Modal
  const [prefixModalAdmin, setPrefixModalAdmin] = useState<AdminItem | null>(null);
  const [newPrefix, setNewPrefix] = useState("");
  const [prefixLoading, setPrefixLoading] = useState(false);
  const [prefixMsg, setPrefixMsg] = useState("");

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, adminsRes] = await Promise.all([
        fetch("/api/superadmin/stats"),
        fetch("/api/superadmin/admins"),
      ]);

      if (statsRes.status === 403 || adminsRes.status === 403) {
        router.push("/superrootadminlogin");
        return;
      }

      if (statsRes.ok && adminsRes.ok) {
        const statsData = await statsRes.json();
        const adminsData = await adminsRes.json();
        setStats(statsData.stats);
        setAdmins(adminsData.admins || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadConfigs = async () => {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (res.ok && data.configs) {
        setConfigs(data.configs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfigLoading(false);
    }
  };

  const loadInspectData = async (adminId: string) => {
    setSelectedAdminId(adminId);
    setInspectLoading(true);
    setActiveTab("inspect");
    try {
      const res = await fetch(`/api/superadmin/team-inspect?adminId=${adminId}`);
      const data = await res.json();
      if (res.ok) {
        setInspectData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInspectLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/superrootadminlogin");
    }
  };

  const triggerDailyRoi = async () => {
    setCronLoading(true);
    setCronMessage(null);
    try {
      const res = await fetch("/api/cron/daily-roi");
      const data = await res.json();
      if (data.summary?.processedCount === 0) {
        setCronMessage("Closing is already complete for today! All contracts up to date.");
      } else {
        setCronMessage(`ROI Cycle executed! Distributed $${data.summary?.totalDistributedUsdt || 0} USDT across ${data.summary?.processedCount || 0} contracts.`);
      }
      loadAllData();
    } catch (err: any) {
      setCronMessage("Cron trigger failed: " + err.message);
    } finally {
      setCronLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      setShowCreateModal(false);
      setCreateForm({ fullName: "", customId: "", teamPrefix: "", email: "", phone: "", password: "" });
      loadAllData();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (admin: AdminItem) => {
    if (!confirm(`Are you sure you want to ${admin.status === "ACTIVE" ? "BLOCK" : "UNBLOCK"} Admin ${admin.customId}?`)) return;

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin.id, action: "TOGGLE_STATUS" }),
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalAdmin) return;
    setPasswordLoading(true);
    setPasswordMsg("");

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: passwordModalAdmin.id,
          action: "RESET_PASSWORD",
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setPasswordMsg("Password updated successfully!");
      setTimeout(() => {
        setPasswordModalAdmin(null);
        setNewPassword("");
        setPasswordMsg("");
      }, 1200);
    } catch (err: any) {
      setPasswordMsg(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdatePrefix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixModalAdmin) return;
    setPrefixLoading(true);
    setPrefixMsg("");

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: prefixModalAdmin.id,
          action: "UPDATE_PREFIX",
          teamPrefix: newPrefix,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update prefix");

      setPrefixMsg("Team prefix updated successfully!");
      loadAllData();
      setTimeout(() => {
        setPrefixModalAdmin(null);
        setNewPrefix("");
        setPrefixMsg("");
      }, 1200);
    } catch (err: any) {
      setPrefixMsg(err.message);
    } finally {
      setPrefixLoading(false);
    }
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(configs)) {
        payload[k] = v.value;
      }
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: payload }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMsg("All system configurations saved and updated live successfully!");
      } else {
        setConfigMsg(data.error || "Failed to save configs");
      }
    } catch (err: any) {
      setConfigMsg(err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustLoading(true);
    setAdjustResult(null);
    try {
      // Find user by customId
      const targetCustomId = adjustTargetId.trim().toUpperCase();
      let targetUser = null;

      // First search inside existing inspect members if loaded, or look up via users API
      const searchRes = await fetch(`/api/admin/users`);
      // Fallback: send customId directly to API
      const res = await fetch("/api/superadmin/wallet-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetCustomId, // backend accepts ID or customId
          action: adjustAction,
          wallet: adjustWallet,
          amount: adjustAmount,
          note: adjustNote,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdjustResult({ success: true, message: data.message });
        setAdjustAmount("");
        setAdjustNote("");
        loadAllData();
      } else {
        setAdjustResult({ success: false, message: data.error || "Adjustment failed" });
      }
    } catch (err: any) {
      setAdjustResult({ success: false, message: err.message });
    } finally {
      setAdjustLoading(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.customId.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.teamPrefix && a.teamPrefix.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs tracking-widest uppercase font-bold">Accessing Master Root Command...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Root Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-rose-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wide">
                Dubai Finance <span className="text-rose-400 font-mono">SUPER ROOT</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MASTER COMMANDER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Signed in as: <span className="text-amber-400 font-bold">superrootadmin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Trigger Daily Closing Button */}
          <button
            onClick={triggerDailyRoi}
            disabled={cronLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition shadow-sm"
            title="Execute midnight daily ROI cycle across all contracts"
          >
            <Zap className={`w-3.5 h-3.5 ${cronLoading ? "animate-spin text-amber-400" : "text-amber-400"}`} />
            <span className="hidden md:inline">{cronLoading ? "Executing..." : "Execute Global ROI Closing"}</span>
          </button>

          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-400" : ""}`} />
            Refresh
          </button>
          <ThemeToggle variant="compact" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Notification Banner for ROI closing */}
      {cronMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              {cronMessage}
            </span>
            <button onClick={() => setCronMessage(null)} className="text-amber-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Global Financial KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>SUB-ADMIN BRANCHES</span>
              <Layers className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalAdmins || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Isolated Parallel Networks</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>TOTAL MEMBERS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">{stats?.activeUsers || 0} Active Investors</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>PLATFORM DEPOSITS</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${(stats?.totalApprovedDepositsUsdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">USDT Total Inflow</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>10% COMPANY FEE PROFIT</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ${(stats?.totalAdminFeeUsdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">From Processed Withdrawals</p>
          </div>
        </section>

        {/* Feature Navigation Tabs */}
        <section className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "admins"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            Sub-Admin Branches ({admins.length})
          </button>

          <button
            onClick={() => {
              if (!selectedAdminId && admins.length > 0) {
                loadInspectData(admins[0].id);
              } else {
                setActiveTab("inspect");
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "inspect"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            Branch Inspector {inspectData ? `(${inspectData.admin.customId})` : ""}
          </button>

          <button
            onClick={() => {
              setActiveTab("config");
              loadConfigs();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "config"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            Master System Settings
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "wallet"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Manual Fund Credit / Debit
          </button>
        </section>

        {/* TAB 1: SUB-ADMINS MANAGEMENT */}
        {activeTab === "admins" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  Sub-Admin Branches Management <span className="text-xs font-mono text-rose-400 font-normal">({admins.length} Active Teams)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Each admin is 100% isolated and cannot see cross-admins or other parallel teams.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search admin, prefix..."
                    className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition w-56 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    const nextDigit = (admins.length + 1).toString();
                    setCreateForm({
                      fullName: "",
                      customId: `DF${String(admins.length + 1).padStart(6, "0")}`,
                      teamPrefix: nextDigit,
                      email: "",
                      phone: "",
                      password: "",
                    });
                    setCreateError("");
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Create New Admin
                </button>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Admin Name &amp; ID</th>
                      <th className="py-3.5 px-4">Team Prefix</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Team Size</th>
                      <th className="py-3.5 px-4">Branch Volume</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 font-mono">
                          No sub-admins found. Click &quot;Create New Admin&quot; to initialize a new branch.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 font-mono text-xs">
                                {adm.customId.slice(-2)}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{adm.fullName}</p>
                                <p className="text-slate-400 font-mono text-[11px]">{adm.customId}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-400" />
                                DF{adm.teamPrefix || "1"}xxxxx
                              </span>
                              <button
                                onClick={() => {
                                  setPrefixModalAdmin(adm);
                                  setNewPrefix(adm.teamPrefix || "");
                                  setPrefixMsg("");
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-300 underline ml-1"
                                title="Change Prefix Digit"
                              >
                                Edit
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-300">{adm.email}</p>
                            <p className="text-slate-500 font-mono text-[11px]">{adm.phone || "No phone"}</p>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <p className="text-white font-bold">{adm.totalMembers} Members</p>
                            <p className="text-emerald-400 text-[11px]">{adm.activeMembers} Active</p>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <p className="text-emerald-400 font-bold">${adm.totalDepositsUsdt.toFixed(2)}</p>
                            <p className="text-slate-400 text-[11px]">Payouts: ${adm.totalWithdrawalsUsdt.toFixed(2)}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                adm.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {adm.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {adm.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Branch Button */}
                              <button
                                onClick={() => loadInspectData(adm.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs transition border border-cyan-500/30"
                                title="Inspect this admin's full team and transactions"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect Team
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setPasswordModalAdmin(adm);
                                  setNewPassword("");
                                  setPasswordMsg("");
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Reset Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Block / Unblock */}
                              <button
                                onClick={() => handleToggleStatus(adm)}
                                className={`p-1.5 rounded-lg transition ${
                                  adm.status === "ACTIVE"
                                    ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400"
                                    : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                }`}
                                title={adm.status === "ACTIVE" ? "Block Admin" : "Unblock Admin"}
                              >
                                {adm.status === "ACTIVE" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: BRANCH INSPECTOR */}
        {activeTab === "inspect" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setActiveTab("admins")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to All Admins
                </button>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  Branch Team Inspector: <span className="text-amber-400 font-mono">{inspectData?.admin.customId}</span>
                  <span className="text-xs font-normal text-slate-400">({inspectData?.admin.fullName})</span>
                </h2>
              </div>

              {/* Branch Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Switch Branch:</span>
                <select
                  value={selectedAdminId || ""}
                  onChange={(e) => loadInspectData(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                >
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.customId} - {a.fullName} (Prefix: {a.teamPrefix || "1"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {inspectLoading ? (
              <div className="text-center py-16 text-cyan-400 font-mono text-xs">
                Loading branch records...
              </div>
            ) : inspectData ? (
              <div className="space-y-6">
                {/* Branch KPI summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                    <p className="text-[11px] text-slate-400">MEMBERS IN BRANCH</p>
                    <p className="text-2xl font-black text-white mt-1">{inspectData.members.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                    <p className="text-[11px] text-slate-400">ACTIVE CONTRACTS</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{inspectData.activeContracts.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                    <p className="text-[11px] text-slate-400">DEPOSITS HISTORY</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{inspectData.deposits.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                    <p className="text-[11px] text-slate-400">WITHDRAWAL PAYOUTS</p>
                    <p className="text-2xl font-black text-rose-400 mt-1">{inspectData.withdrawals.length}</p>
                  </div>
                </div>

                {/* Branch Members Table */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Team Members Under {inspectData.admin.customId} ({inspectData.members.length} Total)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Member ID &amp; Name</th>
                          <th className="py-3 px-4">Sponsor</th>
                          <th className="py-3 px-4">Fund Wallet</th>
                          <th className="py-3 px-4">Income Wallet</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {inspectData.members.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-500 font-mono">
                              No members registered under this branch yet.
                            </td>
                          </tr>
                        ) : (
                          inspectData.members.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-800/30">
                              <td className="py-3 px-4">
                                <p className="font-bold text-white font-mono">{m.customId}</p>
                                <p className="text-slate-400">{m.fullName}</p>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">
                                {m.sponsor ? `${m.sponsor.customId} (${m.sponsor.fullName})` : "Direct/Root"}
                              </td>
                              <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                                ${Number(m.fundBalance).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                                ${Number(m.incomeBalance).toFixed(2)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  m.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono">
                                {new Date(m.createdAt).toISOString().split("T")[0]}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* TAB 3: MASTER SYSTEM CONFIGURATIONS */}
        {activeTab === "config" && (
          <section className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-400" />
                Master Global System Configurations
              </h2>
              <p className="text-xs text-slate-400">
                Only Master Super Root Admin can modify these parameters. Regular sub-admins cannot see or change them.
              </p>
            </div>

            {configMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono flex items-center justify-between">
                <span>{configMsg}</span>
                <button onClick={() => setConfigMsg(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {configLoading ? (
              <div className="text-center py-16 text-rose-400 font-mono text-xs">
                Loading configurations...
              </div>
            ) : (
              <form onSubmit={handleSaveConfigs} className="space-y-4 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(configs).map(([key, item]: [string, any]) => (
                    <div key={key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <label className="block text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                        {key.replace(/_/g, " ")}
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">{item.description}</p>
                      <input
                        type="text"
                        value={item.value || ""}
                        onChange={(e) => {
                          const updated = { ...configs, [key]: { ...item, value: e.target.value } };
                          setConfigs(updated);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={configSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs font-mono shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
                  >
                    {configSaving ? "Saving Live Changes..." : "Save Global Configurations"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* TAB 4: MANUAL WALLET CREDIT / DEBIT */}
        {activeTab === "wallet" && (
          <section className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Master Wallet Balance Adjustment
              </h2>
              <p className="text-xs text-slate-400">
                Directly credit or debit USDT to any member or admin account with automatic ledger bookkeeping.
              </p>
            </div>

            {adjustResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                adjustResult.success
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-300"
              }`}>
                <span>{adjustResult.message}</span>
                <button onClick={() => setAdjustResult(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleWalletAdjustment} className="space-y-4 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase font-mono mb-1.5">
                  Target User ID or Custom ID
                </label>
                <input
                  type="text"
                  required
                  value={adjustTargetId}
                  onChange={(e) => setAdjustTargetId(e.target.value)}
                  placeholder="e.g. DF836419 or DF000001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase font-mono mb-1.5">Action</label>
                  <select
                    value={adjustAction}
                    onChange={(e: any) => setAdjustAction(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none font-mono"
                  >
                    <option value="CREDIT">CREDIT (+)</option>
                    <option value="DEBIT">DEBIT (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase font-mono mb-1.5">Wallet Type</label>
                  <select
                    value={adjustWallet}
                    onChange={(e: any) => setAdjustWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none font-mono"
                  >
                    <option value="FUND">Fund Wallet</option>
                    <option value="INCOME">Income Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase font-mono mb-1.5">Amount in USDT</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase font-mono mb-1.5">Adjustment Note / Reason</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. VIP Promotional Bonus / Manual Balance Correction"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={adjustLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs font-mono transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-4"
              >
                {adjustLoading ? "Processing Adjustment..." : "Execute Master Wallet Adjustment"}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* Modal: Create New Admin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Parallel Branch Admin</h3>
                <p className="text-xs text-slate-400">Initialize a new isolated admin with dedicated team prefix</p>
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 font-mono">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. Admin Team B"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Admin ID</label>
                  <input
                    type="text"
                    required
                    value={createForm.customId}
                    onChange={(e) => setCreateForm({ ...createForm, customId: e.target.value })}
                    placeholder="e.g. DF000002"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                    Team Digit Prefix <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.teamPrefix}
                    onChange={(e) => setCreateForm({ ...createForm, teamPrefix: e.target.value })}
                    placeholder="e.g. 2 for DF2xxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Members get IDs like: DF{createForm.teamPrefix || "X"}12345
                  </p>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="admin2@dubaifinance.online"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Login Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Set initial password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-50"
                >
                  {createLoading ? "Creating Admin..." : "Confirm & Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {passwordModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPasswordModalAdmin(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">Admin: {passwordModalAdmin.customId} ({passwordModalAdmin.fullName})</p>

            {passwordMsg && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs mb-3 text-white">
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Save New Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Team Prefix */}
      {prefixModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPrefixModalAdmin(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Edit Team Digit Prefix</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">Admin: {prefixModalAdmin.customId} ({prefixModalAdmin.fullName})</p>

            {prefixMsg && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs mb-3 text-white font-mono">
                {prefixMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePrefix} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Team Prefix (e.g. 1, 2, 3)</label>
                <input
                  type="text"
                  required
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  placeholder="e.g. 1, 2, 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Future members get IDs: DF{newPrefix || "X"}xxxxx
                </p>
              </div>

              <button
                type="submit"
                disabled={prefixLoading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition disabled:opacity-50"
              >
                {prefixLoading ? "Updating..." : "Save Team Prefix"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
