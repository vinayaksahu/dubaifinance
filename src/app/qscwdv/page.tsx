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
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  FileText,
  Edit,
  Activity,
  Globe,
  Laptop,
  Smartphone,
  Tablet as TabletIcon,
  MapPin,
  Filter,
  Monitor,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import SuperRootCryptoDepositsView from "@/components/admin/views/SuperRootCryptoDepositsView";

interface AdminItem {
  id: string;
  customId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  teamPrefix: string | null;
  usdtAddress?: string | null;
  depositAddress?: string | null;
  depositQr?: string | null;
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
  loginSessions?: any[];
  activityLogs?: any[];
}

export default function SuperRootAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admins" | "inspect" | "config" | "wallet" | "audit" | "crypto_deposits">("admins");
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
  const [inspectSubTab, setInspectSubTab] = useState<"members" | "deposits" | "withdrawals" | "contracts" | "sessions" | "logs">("members");

  // Audit Intelligence Hub states
  const [auditSubTab, setAuditSubTab] = useState<"sessions" | "activities">("sessions");
  const [auditAdminFilter, setAuditAdminFilter] = useState<string>("all");
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>("all");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>("all");
  const [auditTimeframe, setAuditTimeframe] = useState<string>("all");
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditData, setAuditData] = useState<{
    sessions: any[];
    totalSessions: number;
    activities: any[];
    totalActivities: number;
    adminsList: any[];
    currentSessionId?: string | null;
    stats: {
      totalSessions: number;
      totalActivities: number;
      desktopCount: number;
      mobileCount: number;
      tabletCount: number;
    };
  } | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);

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
    role: "SUPER_ADMIN",
    usdtAddress: "",
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

  // Edit Admin Details Modal (Name, Email, Phone, Team Prefix, Password, USDT Deposit Address)
  const [editModalAdmin, setEditModalAdmin] = useState<AdminItem | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    teamPrefix: string;
    role: "ADMIN" | "SUPER_ADMIN";
    password: string;
    usdtAddress: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    teamPrefix: "",
    role: "ADMIN",
    password: "",
    usdtAddress: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Authentication State for /qscwdv
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, adminsRes] = await Promise.all([
        fetch("/api/superadmin/stats"),
        fetch("/api/superadmin/admins"),
      ]);

      if (statsRes.status === 403 || statsRes.status === 401 || adminsRes.status === 403 || adminsRes.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (statsRes.ok && adminsRes.ok) {
        const statsData = await statsRes.json();
        const adminsData = await adminsRes.json();
        setStats(statsData.stats);
        setAdmins(adminsData.admins || []);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
      setIsAuthenticated(false);
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

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditAdminFilter !== "all") params.set("adminId", auditAdminFilter);
      if (auditRoleFilter !== "all") params.set("role", auditRoleFilter);
      if (auditCategoryFilter !== "all") params.set("category", auditCategoryFilter);
      if (auditTimeframe !== "all") params.set("timeframe", auditTimeframe);
      if (auditSearch.trim()) params.set("search", auditSearch.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/superadmin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAuditData(data);
      }
    } catch (e) {
      console.error("Audit log load error:", e);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to terminate this device session? That device will be immediately logged out.")) {
      return;
    }
    setTerminatingSessionId(sessionId);
    try {
      const res = await fetch("/api/superadmin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TERMINATE_SESSION", sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        loadAuditLogs();
      } else {
        alert(data.error || "Failed to terminate session");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    if (!confirm("Are you sure you want to log out from all other active devices? Only your current device will remain logged in.")) {
      return;
    }
    setTerminatingSessionId("all_others");
    try {
      const res = await fetch("/api/superadmin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TERMINATE_ALL_OTHER_SESSIONS" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "All other sessions have been terminated.");
        loadAuditLogs();
      } else {
        alert(data.error || "Failed to terminate sessions");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setTerminatingSessionId(null);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLogs();
    }
  }, [activeTab, auditAdminFilter, auditRoleFilter, auditCategoryFilter, auditTimeframe]);

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRootLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword, portal: "super_root" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Super Root Administrator authentication failed.");
      }

      setIsAuthenticated(true);
      setLoading(true);
      await loadAllData();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
      setLoginPassword("");
    }
  };

  const [portalEnteringId, setPortalEnteringId] = useState<string | null>(null);

  const handleEnterPortal = async (targetUserId: string, targetName: string, targetRole: "ADMIN" | "USER") => {
    try {
      setPortalEnteringId(targetUserId);
      const res = await fetch("/api/superadmin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || "Failed to enter portal.");
        setPortalEnteringId(null);
      }
    } catch (err: any) {
      alert("Error entering portal: " + err.message);
      setPortalEnteringId(null);
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
      setCreateForm({ fullName: "", customId: "", teamPrefix: "", email: "", phone: "", password: "", role: "SUPER_ADMIN", usdtAddress: "" });
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      loadAllData();
    } catch (err: any) {
      alert(err.message);
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

      setPasswordMsg("Password reset successfully!");
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

  const handleOpenEditModal = (adm: AdminItem) => {
    setEditModalAdmin(adm);
    setEditForm({
      fullName: adm.fullName || "",
      email: adm.email || "",
      phone: adm.phone || "",
      teamPrefix: adm.teamPrefix || "",
      role: (adm.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"),
      password: "",
      usdtAddress: adm.depositAddress || adm.usdtAddress || "",
    });
    setEditMsg(null);
  };

  const handleUpdateAdminDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalAdmin) return;
    setEditLoading(true);
    setEditMsg(null);

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: editModalAdmin.id,
          action: "UPDATE_DETAILS",
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          teamPrefix: editForm.teamPrefix,
          role: editForm.role,
          password: editForm.password,
          usdtAddress: editForm.usdtAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update admin details");

      setEditMsg({ type: "success", text: data.message || "Admin updated successfully!" });
      loadAllData();
      setTimeout(() => {
        setEditModalAdmin(null);
        setEditMsg(null);
      }, 1200);
    } catch (err: any) {
      setEditMsg({ type: "error", text: err.message });
    } finally {
      setEditLoading(false);
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

  if (loading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs tracking-widest uppercase font-bold">Verifying Root Security Layer...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white font-sans">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            Dubai Finance Security
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-400 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> ROOT ACCESS
            </span>
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 p-8 rounded-3xl relative z-10 shadow-2xl backdrop-blur-2xl mt-12 sm:mt-0">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-slate-900 to-amber-500/20 border border-rose-500/40 p-1 mb-4 shadow-xl shadow-rose-500/10">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-rose-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              Dubai Finance <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">Root</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">
              Master Super Root Administrative Terminal
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold mb-6 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleRootLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Super Root Identifier
              </label>
              <div className="relative">
                <Users className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Root Identifier (e.g. qscwdv)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white text-sm outline-none transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Root Master Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={loginShowPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter root master password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white text-sm outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 mt-6 transition disabled:opacity-50 tracking-wide"
            >
              {loginLoading ? "Authenticating Root..." : "Authenticate Root Access"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              CONFIDENTIAL &bull; AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
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
              Signed in as: <span className="text-amber-400 font-bold">qscwdv</span>
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
              setActiveTab("audit");
              loadAuditLogs();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "audit"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Security &amp; Audit Intelligence
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

          <button
            onClick={() => setActiveTab("crypto_deposits")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
              activeTab === "crypto_deposits"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            Crypto Deposits &amp; BSC Monitor
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
                      role: "SUPER_ADMIN",
                      usdtAddress: "",
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
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-slate-400 font-mono text-[11px]">{adm.customId}</span>
                                  <button
                                    onClick={() => handleEnterPortal(adm.id, adm.fullName, "ADMIN")}
                                    disabled={portalEnteringId === adm.id}
                                    className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono flex items-center gap-1 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
                                    title={`Enter ${adm.fullName}'s Admin Portal`}
                                  >
                                    {portalEnteringId === adm.id ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                                    ) : (
                                      <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                                    )}
                                    Portal
                                  </button>
                                </div>
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
                            <div className="mt-1">
                              {adm.depositAddress ? (
                                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20" title={adm.depositAddress}>
                                  Vault: {adm.depositAddress.slice(0, 6)}...{adm.depositAddress.slice(-4)}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">Vault: Global Default</span>
                              )}
                            </div>
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

                              {/* Edit Admin Details (Name, Email, Phone, Password, Prefix) */}
                              <button
                                onClick={() => handleOpenEditModal(adm)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs transition border border-amber-500/30"
                                title="Edit Admin Details (Name, Email, Contact Info, Password, Prefix)"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
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

                {/* Branch Inspector Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setInspectSubTab("members")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "members"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Team Members ({inspectData.members.length})
                  </button>

                  <button
                    onClick={() => setInspectSubTab("sessions")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "sessions"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Login Sessions &amp; Devices ({inspectData.loginSessions?.length || 0})
                  </button>

                  <button
                    onClick={() => setInspectSubTab("logs")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "logs"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Function Logs ({inspectData.activityLogs?.length || 0})
                  </button>

                  <button
                    onClick={() => setInspectSubTab("deposits")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "deposits"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Deposits ({inspectData.deposits.length})
                  </button>

                  <button
                    onClick={() => setInspectSubTab("withdrawals")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "withdrawals"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Withdrawals ({inspectData.withdrawals.length})
                  </button>

                  <button
                    onClick={() => setInspectSubTab("contracts")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                      inspectSubTab === "contracts"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Contracts ({inspectData.activeContracts.length})
                  </button>
                </div>

                {/* Sub-Tab 1: Members Table */}
                {inspectSubTab === "members" && (
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
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="font-bold text-white font-mono">{m.customId}</p>
                                      <p className="text-slate-400">{m.fullName}</p>
                                    </div>
                                    <button
                                      onClick={() => handleEnterPortal(m.id, m.fullName, "USER")}
                                      disabled={portalEnteringId === m.id}
                                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono flex items-center gap-1 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
                                      title={`Enter ${m.fullName}'s Member Portal`}
                                    >
                                      {portalEnteringId === m.id ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400" />
                                      ) : (
                                        <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                                      )}
                                      Portal
                                    </button>
                                  </div>
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
                )}

                {/* Sub-Tab 2: Login Sessions & Devices */}
                {inspectSubTab === "sessions" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        Login Sessions &amp; Device Telemetry ({inspectData.loginSessions?.length || 0} Recent Sessions)
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Includes Admin {inspectData.admin.customId} &amp; their downline members
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Portal &amp; Status</th>
                            <th className="py-3 px-4">IP Address &amp; Location</th>
                            <th className="py-3 px-4">Device &amp; Browser</th>
                            <th className="py-3 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {(!inspectData.loginSessions || inspectData.loginSessions.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="text-center py-10 text-slate-500 font-mono">
                                No login sessions recorded for this branch yet.
                              </td>
                            </tr>
                          ) : (
                            inspectData.loginSessions.map((s: any) => (
                              <tr key={s.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <p className="font-bold text-white font-mono">{s.user?.customId || "Unknown"}</p>
                                      <p className="text-slate-400 text-[11px]">{s.user?.fullName}</p>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                      s.user?.role === "ADMIN" || s.user?.role === "SUPER_ADMIN"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    }`}>
                                      {s.user?.role || "USER"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                                      {s.portal}
                                    </span>
                                    {s.status === "SUCCESS" ? (
                                      <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[10px]">
                                        <CheckCircle className="w-3 h-3 text-emerald-400" /> SUCCESS
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-rose-400 font-bold font-mono text-[10px]" title={s.failureReason || "Failed"}>
                                        <XCircle className="w-3 h-3 text-rose-400" /> FAILED
                                      </span>
                                    )}
                                  </div>
                                  {s.failureReason && (
                                    <p className="text-[10px] text-rose-400/80 font-mono mt-0.5">{s.failureReason}</p>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-mono text-white font-bold">{s.ipAddress}</p>
                                  <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                    {s.city}, {s.country}
                                  </p>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    {s.device === "Mobile" ? (
                                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                    ) : s.device === "Tablet" ? (
                                      <TabletIcon className="w-3.5 h-3.5 text-purple-400" />
                                    ) : (
                                      <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                                    )}
                                    <span className="font-bold text-slate-200">{s.device}</span>
                                    <span className="text-slate-500">·</span>
                                    <span className="text-slate-400">{s.os}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{s.browser}</p>
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {new Date(s.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Function Logs */}
                {inspectSubTab === "logs" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400" />
                        Function Usage &amp; Action Logs ({inspectData.activityLogs?.length || 0} Records)
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Audited function calls by {inspectData.admin.customId} &amp; team
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Function / Action</th>
                            <th className="py-3 px-4">Details &amp; Description</th>
                            <th className="py-3 px-4">Client Telemetry</th>
                            <th className="py-3 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {(!inspectData.activityLogs || inspectData.activityLogs.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="text-center py-10 text-slate-500 font-mono">
                                No activity logs recorded for this branch yet.
                              </td>
                            </tr>
                          ) : (
                            inspectData.activityLogs.map((l: any) => (
                              <tr key={l.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <p className="font-bold text-white font-mono">{l.user?.customId || "Unknown"}</p>
                                      <p className="text-slate-400 text-[11px]">{l.user?.fullName}</p>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                      l.user?.role === "ADMIN" || l.user?.role === "SUPER_ADMIN"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    }`}>
                                      {l.user?.role || "USER"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    l.category === "FINANCIAL"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : l.category === "SECURITY"
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : l.category === "ADMIN"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : l.category === "PROFILE"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  }`}>
                                    {l.action}
                                  </span>
                                  <p className="text-[10px] text-slate-500 font-mono mt-1">{l.category}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-white font-medium text-xs max-w-md">{l.description}</p>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px]">
                                  <p className="text-slate-300">{l.ipAddress}</p>
                                  <p className="text-slate-500">{l.device} · {l.city}, {l.country}</p>
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {new Date(l.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Deposits */}
                {inspectSubTab === "deposits" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        Deposit Records ({inspectData.deposits.length} Total)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Member</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">TxHash / Proof</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {inspectData.deposits.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-10 text-slate-500 font-mono">
                                No deposits found for this branch.
                              </td>
                            </tr>
                          ) : (
                            inspectData.deposits.map((d: any) => (
                              <tr key={d.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-white font-mono">{d.user?.customId}</p>
                                  <p className="text-slate-400">{d.user?.fullName}</p>
                                </td>
                                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                                  ${Number(d.amountInUsdt).toFixed(2)} USDT
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                                  {d.txHash ? `${d.txHash.slice(0, 14)}...` : "Manual"}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    d.status === "APPROVED"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : d.status === "PENDING"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-rose-500/15 text-rose-400"
                                  }`}>
                                    {d.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono">
                                  {new Date(d.createdAt).toISOString().split("T")[0]}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 5: Withdrawals */}
                {inspectSubTab === "withdrawals" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-purple-400" />
                        Withdrawal Requests &amp; Payouts ({inspectData.withdrawals.length} Total)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Member</th>
                            <th className="py-3 px-4">Gross Amount</th>
                            <th className="py-3 px-4">Admin Fee</th>
                            <th className="py-3 px-4">Net Payout</th>
                            <th className="py-3 px-4">Destination</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {inspectData.withdrawals.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-slate-500 font-mono">
                                No withdrawal requests found for this branch.
                              </td>
                            </tr>
                          ) : (
                            inspectData.withdrawals.map((w: any) => (
                              <tr key={w.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-white font-mono">{w.user?.customId}</p>
                                  <p className="text-slate-400">{w.user?.fullName}</p>
                                </td>
                                <td className="py-3 px-4 font-mono text-white font-bold">
                                  ${Number(w.amountInUsdt).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                                  ${Number(w.feeAmount || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                                  ${Number(w.netAmount || w.amountInUsdt).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                                  {w.toAddress ? `${w.toAddress.slice(0, 10)}...` : "—"}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    w.status === "PROCESSED"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : w.status === "PENDING"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-rose-500/15 text-rose-400"
                                  }`}>
                                    {w.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono">
                                  {new Date(w.createdAt).toISOString().split("T")[0]}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 6: Contracts */}
                {inspectSubTab === "contracts" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        Active Investment Contracts ({inspectData.activeContracts.length} Total)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Member</th>
                            <th className="py-3 px-4">Package</th>
                            <th className="py-3 px-4">Invested Amount</th>
                            <th className="py-3 px-4">Daily ROI</th>
                            <th className="py-3 px-4">Days Paid / Tenure</th>
                            <th className="py-3 px-4">Maturity Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {inspectData.activeContracts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-slate-500 font-mono">
                                No active investment contracts for this branch.
                              </td>
                            </tr>
                          ) : (
                            inspectData.activeContracts.map((c: any) => (
                              <tr key={c.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-white font-mono">{c.user?.customId}</p>
                                  <p className="text-slate-400">{c.user?.fullName}</p>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-amber-300">
                                  {c.packageType === "BASIC_SAVING" ? "Basic Saving" : "Fix Deposit"}
                                </td>
                                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                                  ${Number(c.amountInUsdt).toFixed(2)} USDT
                                </td>
                                <td className="py-3 px-4 font-mono text-cyan-400">
                                  {Number(c.dailyRoiRate)}% / day
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-300">
                                  {c.daysPaid} / {c.tenureDays} Days
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono">
                                  {c.maturityDate ? new Date(c.maturityDate).toISOString().split("T")[0] : "—"}
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
            ) : null}
          </section>
        )}

        {/* TAB: SECURITY & AUDIT INTELLIGENCE HUB */}
        {activeTab === "audit" && (
          <section className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                  Security &amp; Audit Intelligence Hub
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live forensics &amp; telemetry monitoring across all Admins and assigned team members.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAuditLogs}
                  disabled={auditLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-600 text-xs font-semibold text-white transition font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin text-rose-400" : ""}`} />
                  Refresh Telemetry
                </button>
              </div>
            </div>

            {/* Telemetry KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>SESSIONS LOGGED</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">{auditData?.totalSessions ?? "..."}</p>
                <p className="text-[11px] text-emerald-400 mt-1">Monitored In Real-Time</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>FUNCTION LOGS</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400">{auditData?.totalActivities ?? "..."}</p>
                <p className="text-[11px] text-slate-400 mt-1">Actions &amp; Calls Audited</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>DESKTOP SESSIONS</span>
                  <Laptop className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-black text-cyan-400">{auditData?.stats.desktopCount ?? 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">Workstation Terminals</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>MOBILE &amp; TABLET</span>
                  <Smartphone className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-purple-400">
                  {(auditData?.stats.mobileCount || 0) + (auditData?.stats.tabletCount || 0)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Mobile Handhelds</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Admin Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Branch:</span>
                  <select
                    value={auditAdminFilter}
                    onChange={(e) => setAuditAdminFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-rose-500"
                  >
                    <option value="all">All Admins &amp; Teams</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.customId} - {a.fullName} (Prefix: {a.teamPrefix || "1"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Role:</span>
                  <select
                    value={auditRoleFilter}
                    onChange={(e) => setAuditRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-rose-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admins Only</option>
                    <option value="USER">Members Only</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Category:</span>
                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-rose-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="AUTH">AUTH</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="FINANCIAL">FINANCIAL</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="PROFILE">PROFILE</option>
                  </select>
                </div>

                {/* Timeframe Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Time:</span>
                  <select
                    value={auditTimeframe}
                    onChange={(e) => setAuditTimeframe(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-rose-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Search box */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadAuditLogs();
                    }}
                    placeholder="Search ID, Name, IP, Location, Device..."
                    className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-rose-500 transition"
                  />
                </div>

                <button
                  onClick={loadAuditLogs}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition shadow"
                >
                  Apply
                </button>
              </div>

              {/* View Switcher: Sessions vs Function Logs */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setAuditSubTab("sessions")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                    auditSubTab === "sessions"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Login Sessions &amp; Devices ({auditData?.totalSessions || 0})
                </button>

                <button
                  onClick={() => setAuditSubTab("activities")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                    auditSubTab === "activities"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Function &amp; Action Usage Logs ({auditData?.totalActivities || 0})
                </button>
              </div>
            </div>

            {/* Audit Logs Content */}
            {auditLoading ? (
              <div className="text-center py-16 text-rose-400 font-mono text-xs">
                Analyzing and fetching audit logs...
              </div>
            ) : auditSubTab === "sessions" ? (
              /* Global Login Sessions Table */
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Active Devices &amp; Authentication Telemetry ({auditData?.sessions.length || 0} Listed)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Live active sessions can be remotely terminated at any time to secure accounts.
                    </p>
                  </div>
                  <button
                    onClick={handleTerminateAllOtherSessions}
                    disabled={terminatingSessionId === "all_others"}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono transition shadow-sm disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {terminatingSessionId === "all_others" ? "Terminating..." : "Logout All Other Devices"}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Account / User</th>
                        <th className="py-3 px-4">Assigned Admin Branch</th>
                        <th className="py-3 px-4">Portal &amp; Status</th>
                        <th className="py-3 px-4">IP Address &amp; Location</th>
                        <th className="py-3 px-4">Device &amp; Browser</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4 text-right">Device Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(!auditData?.sessions || auditData.sessions.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-500 font-mono">
                            No login session records found matching the current filters.
                          </td>
                        </tr>
                      ) : (
                        auditData.sessions.map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-bold text-white font-mono">{s.user?.customId || "Unknown"}</p>
                                  <p className="text-slate-400 text-[11px]">{s.user?.fullName}</p>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                  s.user?.role === "SUPER_ROOT_ADMIN"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : s.user?.role === "ADMIN" || s.user?.role === "SUPER_ADMIN"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                }`}>
                                  {s.user?.role || "USER"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              {s.user?.role === "SUPER_ROOT_ADMIN" ? (
                                <span className="text-purple-400 font-bold">Direct Super Root</span>
                              ) : s.user?.role === "ADMIN" || s.user?.role === "SUPER_ADMIN" ? (
                                <span className="text-rose-400 font-bold">Self Admin Branch</span>
                              ) : s.user?.assignedAdmin ? (
                                <span className="text-amber-300 font-bold">
                                  {s.user.assignedAdmin.customId} ({s.user.assignedAdmin.fullName})
                                </span>
                              ) : (
                                <span className="text-slate-500">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                                  {s.portal}
                                </span>
                                {s.status === "SUCCESS" ? (
                                  <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[10px]">
                                    <CheckCircle className="w-3 h-3 text-emerald-400" /> SUCCESS
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-rose-400 font-bold font-mono text-[10px]" title={s.failureReason || "Failed"}>
                                    <XCircle className="w-3 h-3 text-rose-400" /> FAILED
                                  </span>
                                )}
                              </div>
                              {s.failureReason && (
                                <p className="text-[10px] text-rose-400/80 font-mono mt-0.5">{s.failureReason}</p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono text-white font-bold">{s.ipAddress}</p>
                              <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                {s.city}, {s.country}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {s.device === "Mobile" ? (
                                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                ) : s.device === "Tablet" ? (
                                  <TabletIcon className="w-3.5 h-3.5 text-purple-400" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                <span className="font-bold text-slate-200">{s.device}</span>
                                <span className="text-slate-500">·</span>
                                <span className="text-slate-400">{s.os}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{s.browser}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(s.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {s.isActive ? (
                                <div className="flex items-center justify-end gap-2">
                                  {s.id === auditData?.currentSessionId ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      This Device
                                    </span>
                                  ) : (
                                    <>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        Active
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleTerminateSession(s.id)}
                                        disabled={terminatingSessionId === s.id}
                                        className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
                                        title="Terminate session and disconnect this device"
                                      >
                                        {terminatingSessionId === s.id ? "..." : "Terminate"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-800 text-slate-500 border border-slate-700/40">
                                  Terminated
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Global Function & Action Usage Logs Table */
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Function Usage &amp; Operational Audit Trail ({auditData?.activities.length || 0} Listed)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-3 px-4">User / Actor</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Function / Action</th>
                        <th className="py-3 px-4">Operation Details</th>
                        <th className="py-3 px-4">Client Telemetry</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(!auditData?.activities || auditData.activities.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">
                            No function activity records found matching the current filters.
                          </td>
                        </tr>
                      ) : (
                        auditData.activities.map((l: any) => (
                          <tr key={l.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-bold text-white font-mono">{l.user?.customId || "Unknown"}</p>
                                  <p className="text-slate-400 text-[11px]">{l.user?.fullName}</p>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                  l.user?.role === "SUPER_ROOT_ADMIN"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : l.user?.role === "ADMIN" || l.user?.role === "SUPER_ADMIN"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                }`}>
                                  {l.user?.role || "USER"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              {l.user?.role === "SUPER_ROOT_ADMIN" ? (
                                <span className="text-purple-400 font-bold">Direct Super Root</span>
                              ) : l.user?.role === "ADMIN" || l.user?.role === "SUPER_ADMIN" ? (
                                <span className="text-rose-400 font-bold">Admin Self</span>
                              ) : l.user?.assignedAdmin ? (
                                <span className="text-amber-300 font-bold">
                                  {l.user.assignedAdmin.customId}
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                l.category === "FINANCIAL"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : l.category === "SECURITY"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : l.category === "ADMIN"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : l.category === "PROFILE"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}>
                                {l.action}
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">{l.category}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white font-medium text-xs max-w-md">{l.description}</p>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              <p className="text-slate-300">{l.ipAddress}</p>
                              <p className="text-slate-500">{l.device} · {l.city}, {l.country}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(l.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

        {/* TAB 6: CRYPTO DEPOSITS & BSC MONITOR */}
        {activeTab === "crypto_deposits" && (
          <section className="space-y-4">
            <SuperRootCryptoDepositsView />
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
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">Admin Authority Level</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold outline-none focus:border-rose-500 font-mono text-xs"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority &amp; System Settings)</option>
                  <option value="ADMIN">ADMIN (Branch Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono flex items-center justify-between">
                  <span>Branch USDT Receiving Address (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-normal lowercase">(BEP20 BSC)</span>
                </label>
                <input
                  type="text"
                  value={createForm.usdtAddress}
                  onChange={(e) => setCreateForm({ ...createForm, usdtAddress: e.target.value.trim() })}
                  placeholder="0x... (Can be configured later in System Config)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 outline-none focus:border-rose-500 font-mono text-xs"
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

      {/* Modal: Edit Admin Details (Name, Email, Phone, Prefix, Password) */}
      {editModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEditModalAdmin(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Edit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Edit Admin Account</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Branch ID: <span className="text-amber-400 font-bold">{editModalAdmin.customId}</span> &bull; Current Role: <span className="text-slate-300">{editModalAdmin.role}</span>
                </p>
              </div>
            </div>

            {editMsg && (
              <div
                className={`p-3 rounded-xl text-xs my-3.5 flex items-center gap-2 ${
                  editMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}
              >
                {editMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span className="font-medium">{editMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminDetails} className="space-y-4 text-xs mt-4">
              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Dubai Finance CMD"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 text-xs font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="admin@dubaifinance.online"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              {/* Phone & Prefix Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                    Contact / Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+971... or +91..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                    Team Prefix Digit
                  </label>
                  <input
                    type="text"
                    value={editForm.teamPrefix}
                    onChange={(e) => setEditForm({ ...editForm, teamPrefix: e.target.value })}
                    placeholder="e.g. 1, 2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase font-mono">
                  Admin Authority / Role Level
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold outline-none focus:border-amber-400 text-xs font-mono"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority &amp; System Settings)</option>
                  <option value="ADMIN">ADMIN (Branch Administrator)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  SUPER_ADMIN grants full access to System Config and Database Backup in admin console.
                </p>
              </div>

              {/* Branch Dedicated USDT Deposit Address */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold mb-1 uppercase font-mono flex items-center justify-between">
                  <span className="text-amber-400">Branch USDT Deposit Address (BEP20)</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(isolated to this branch)</span>
                </label>
                <input
                  type="text"
                  value={editForm.usdtAddress}
                  onChange={(e) => setEditForm({ ...editForm, usdtAddress: e.target.value.trim() })}
                  placeholder="0x... (Dedicated receiving wallet for this admin's branch)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 outline-none focus:border-amber-400 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Members under this admin branch will deposit into and verify against this dedicated address.
                </p>
              </div>

              {/* New Password */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold mb-1 uppercase font-mono flex items-center justify-between">
                  <span>Change Password</span>
                  <span className="text-[10px] text-slate-500 font-normal lowercase">(leave blank to keep current)</span>
                </label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Only fill this field if you want to overwrite this admin&apos;s login password.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition disabled:opacity-50 text-xs shadow-lg shadow-amber-500/20"
                >
                  {editLoading ? "Saving Changes..." : "Save Admin Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
