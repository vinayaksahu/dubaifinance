"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Ban, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatUsdt } from '@/lib/utils';


interface AdminUsersViewProps {
  onRefresh: () => void;
}

interface User {
  id: string;
  customId: string;
  fullName: string;
  email: string;
  phone: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 15;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        alert(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      alert('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: 'BLOCK' | 'UNBLOCK') => {
    try {
      setProcessingId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch (error) {
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      (user.customId && user.customId.toLowerCase().includes(q)) ||
      (user.fullName && user.fullName.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'INACTIVE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'BLOCKED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
            placeholder="Search by ID, Name or Email..."
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
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152238]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading users...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-[#152238]/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{user.fullName}</span>
                        <span className="text-xs text-purple-400">{user.customId}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-gray-500">Fund:</span>
                          <span className="text-emerald-400 font-medium">{formatUsdt(user.fundBalance)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-gray-500">Income:</span>
                          <span className="text-emerald-400 font-medium">{formatUsdt(user.incomeBalance)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-medium">
                      {formatUsdt(user.directBusiness)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'BLOCKED' ? (
                        <button
                          onClick={() => handleAction(user.id, 'UNBLOCK')}
                          disabled={processingId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 text-xs font-medium"
                        >
                          {processingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, 'BLOCK')}
                          disabled={processingId === user.id || user.role === 'SUPER_ADMIN'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-xs font-medium"
                        >
                          {processingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
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
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#152238]/50 text-gray-300 hover:bg-[#152238] disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#152238]/50 text-gray-300 hover:bg-[#152238] disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
