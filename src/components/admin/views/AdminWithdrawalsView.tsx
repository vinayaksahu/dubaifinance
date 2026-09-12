"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Send, XCircle, Copy, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatUsdt, formatInr } from '@/lib/utils';

interface AdminWithdrawalsViewProps {
  onRefresh: () => void;
}

type WithdrawalStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

interface Withdrawal {
  id: string;
  userId: string;
  user: {
    name: string;
    customId: string;
  };
  amountInr: number;
  amountUsdt: number;
  payoutAddress: string;
  status: WithdrawalStatus;
  createdAt: string;
  adminNote?: string;
  txHash?: string;
}

export default function AdminWithdrawalsView({ onRefresh }: AdminWithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PROCESSED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const data = await res.json();
      setWithdrawals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDispatch = async (withdrawalId: string) => {
    const txHash = prompt('Enter the transaction hash (TxHash) for this payout:');
    if (txHash === null) return; // Cancelled
    if (!txHash.trim()) {
      alert('Transaction hash is required to dispatch payout.');
      return;
    }

    const adminNote = prompt('Enter optional admin note:');
    if (adminNote === null) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action: 'APPROVE', txHash, adminNote }),
      });

      if (!res.ok) throw new Error('Failed to process withdrawal');
      
      await fetchWithdrawals();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error processing withdrawal');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const adminNote = prompt('Enter reason for rejection (Admin Note):');
    if (adminNote === null) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action: 'REJECT', adminNote }),
      });

      if (!res.ok) throw new Error('Failed to reject withdrawal');
      
      await fetchWithdrawals();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error rejecting withdrawal');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const matchesFilter = filter === 'ALL' || w.status === filter;
      const searchLower = search.toLowerCase();
      const matchesSearch = search === '' || 
        w.user.name.toLowerCase().includes(searchLower) || 
        w.user.customId.toLowerCase().includes(searchLower) ||
        w.payoutAddress.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [withdrawals, filter, search]);

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'PROCESSED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-3xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2 bg-[#050b18] p-1 rounded-xl border border-[#152238]">
          {['ALL', 'PENDING', 'PROCESSED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f as any); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search user or address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#050b18] border border-[#152238] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading withdrawals...</p>
          </div>
        ) : paginatedWithdrawals.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No withdrawals found matching your criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-800">
                <th className="pb-3 font-medium">SR</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Amount (USDT)</th>
                <th className="pb-3 font-medium">Payout Address</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedWithdrawals.map((withdrawal, index) => (
                <tr key={withdrawal.id} className="text-sm">
                  <td className="py-4 text-slate-400">
                    {(page - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200">{withdrawal.user.name}</span>
                      <span className="text-xs text-slate-500">{withdrawal.user.customId}</span>
                    </div>
                  </td>
                  <td className="py-4 text-amber-400 font-medium">
                    {formatUsdt(withdrawal.amountUsdt)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs">
                        {withdrawal.payoutAddress.slice(0, 8)}...{withdrawal.payoutAddress.slice(-6)}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(withdrawal.payoutAddress)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedAddress === withdrawal.payoutAddress ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      {withdrawal.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleDispatch(withdrawal.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                            title="Dispatch Payout"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                            title="Reject & Refund"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-[#050b18] border border-[#152238] text-slate-400 hover:text-slate-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-[#050b18] border border-[#152238] text-slate-400 hover:text-slate-200 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
