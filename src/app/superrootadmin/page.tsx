"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Tag
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

export default function SuperRootAdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
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

  const [passwordModalAdmin, setPasswordModalAdmin] = useState<AdminItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

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
          <p className="font-mono text-xs tracking-widest uppercase font-bold">Accessing Root Control Hub...</p>
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
                MASTER TIER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Signed in as: <span className="text-amber-400 font-bold">superrootadmin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Global Performance Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>ACTIVE SUB-ADMINS</span>
              <Layers className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalAdmins || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Parallel Team Branches</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>TOTAL NETWORK USERS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">{stats?.activeUsers || 0} active investors</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>TOTAL DEPOSITS</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${(stats?.totalApprovedDepositsUsdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">USDT BEP-20 Platform Inflow</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2 font-mono">
              <span>10% COMPANY FEE INCOME</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ${(stats?.totalAdminFeeUsdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">From Processed Withdrawals</p>
          </div>
        </section>

        {/* Sub-Admins Management Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Sub-Admin Management <span className="text-xs font-mono text-rose-400 font-normal">({admins.length} Total Branches)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Create and manage isolated administrative teams with custom ID digit prefixes (e.g. DF1xxxxx, DF2xxxxx).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search admin, ID, prefix..."
                  className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition w-56 font-mono"
                />
              </div>

              <button
                onClick={() => {
                  // Suggest next available prefix digit
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
                    <th className="py-3.5 px-4 text-right">Actions</th>
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
                          <div className="flex items-center justify-end gap-2">
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
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4">
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
