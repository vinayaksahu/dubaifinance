"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Check,
  Mail,
  Phone,
  Wallet,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { formatUsdt } from "@/lib/utils";

interface AdminUsersViewProps {
  onRefresh: () => void;
}

interface User {
  id: string;
  customId: string;
  fullName: string;
  email: string;
  phone: string | null;
  usdtAddress?: string | null;
  role: string;
  status: string;
  fundBalance: number;
  incomeBalance: number;
  fdLockedBalance: number;
  totalWithdrawn: number;
  directBusiness: number;
  sponsorId: string | null;
  createdAt: string;
  _count: {
    directs: number;
    contracts: number;
  };
}

export function AdminUsersView({ onRefresh }: AdminUsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUsdtAddress, setEditUsdtAddress] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 15;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        alert(data.error || "Failed to fetch users");
      }
    } catch {
      alert("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: "BLOCK" | "UNBLOCK") => {
    try {
      setProcessingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchUsers();
        onRefresh();
      } else {
        alert(data.error || `Failed to ${action.toLowerCase()} user`);
      }
    } catch {
      alert("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditUsdtAddress(user.usdtAddress || "");
    setEditError(null);
    setEditSuccess(null);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editEmail.trim()) {
      setEditError("Email address is required.");
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);
      setEditSuccess(null);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          action: "UPDATE",
          fullName: editFullName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          usdtAddress: editUsdtAddress.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditSuccess(data.message || "User updated successfully!");
        // Update user locally
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  fullName: editFullName.trim(),
                  email: editEmail.trim(),
                  phone: editPhone.trim() || null,
                  usdtAddress: editUsdtAddress.trim() || null,
                }
              : u
          )
        );

        onRefresh();

        // Close modal after brief feedback
        setTimeout(() => {
          handleCloseEdit();
        }, 1200);
      } else {
        setEditError(data.error || "Failed to update user.");
      }
    } catch {
      setEditError("An unexpected error occurred while updating user.");
    } finally {
      setEditSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      (user.customId && user.customId.toLowerCase().includes(q)) ||
      (user.fullName && user.fullName.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone && user.phone.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "INACTIVE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "BLOCKED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">User Management</h2>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, Name, Email or Phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0a1128] border border-[#152238] rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      <div className="bg-[#0a1128]/80 backdrop-blur-md rounded-2xl border border-[#152238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#070e20]/50 border-b border-[#152238]">
              <tr>
                <th className="px-6 py-4 font-medium">SR</th>
                <th className="px-6 py-4 font-medium">User Info</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Balances</th>
                <th className="px-6 py-4 font-medium text-right">Direct Biz</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
                <th className="px-4 py-4 font-medium text-center">Edit</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152238]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading users...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#152238]/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-200">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-purple-400 font-mono font-bold">
                          {user.customId}
                        </span>
                        <span className="text-xs text-gray-400 truncate max-w-[220px]">
                          {user.email}
                        </span>
                        {user.phone ? (
                          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                            <span className="text-amber-400">📞</span> {user.phone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">
                            No phone set
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-gray-500">Fund:</span>
                          <span className="text-emerald-400 font-medium">
                            {formatUsdt(user.fundBalance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-gray-500">Income:</span>
                          <span className="text-emerald-400 font-medium">
                            {formatUsdt(user.incomeBalance)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-medium">
                      {formatUsdt(user.directBusiness)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Edit Column (Placed right before Actions) */}
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-xs font-semibold shadow-sm shadow-amber-500/10"
                        title="Edit Email, Phone & Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      {user.status === "BLOCKED" ? (
                        <button
                          onClick={() => handleAction(user.id, "UNBLOCK")}
                          disabled={processingId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 text-xs font-medium"
                        >
                          {processingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, "BLOCK")}
                          disabled={
                            processingId === user.id ||
                            user.role === "SUPER_ADMIN" ||
                            user.role === "ADMIN"
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-xs font-medium"
                        >
                          {processingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-[#152238] flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#152238]/50 text-gray-300 hover:bg-[#152238] disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#152238]/50 text-gray-300 hover:bg-[#152238] disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#091124] border border-[#1d2d50] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#152342] bg-[#070e20]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Edit User Profile
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-purple-400 font-mono font-bold">
                      {editingUser.customId}
                    </span>
                    <span className="text-slate-600 text-xs">&bull;</span>
                    <span className="text-xs text-slate-400">
                      Member since {new Date(editingUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* Member ID (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Member ID (System Fixed)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-purple-400 font-bold">
                  {editingUser.customId}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Member full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Used for member login and system notifications.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Contact phone for WhatsApp/support updates.
                </p>
              </div>

              {/* USDT BEP-20 Wallet Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  USDT Payout Address (BEP-20)
                </label>
                <div className="relative">
                  <Wallet className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editUsdtAddress}
                    onChange={(e) => setEditUsdtAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={handleCloseEdit}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
