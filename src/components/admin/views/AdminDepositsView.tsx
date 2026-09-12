"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Copy, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatUsdt, formatInr } from '@/lib/utils';

interface AdminDepositsViewProps {
  onRefresh: () => void;
}

type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Deposit {
  id: string;
  userId: string;
  user: {
    name: string;
    customId: string;
  };
  amountUsdt: number;
  amountInr: number;
  txHash: string;
  status: DepositStatus;
  createdAt: string;
  adminNote?: string;
}

export default function AdminDepositsView({ onRefresh }: AdminDepositsViewProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/deposits');
      if (!res.ok) throw new Error('Failed to fetch deposits');
      const data = await res.json();
      setDeposits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, action: 'APPROVE' | 'REJECT') => {
    const adminNote = prompt(`Enter optional admin note for ${action.toLowerCase()}:`);
    if (adminNote === null) return; // Cancelled

    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action, adminNote }),
      });

      if (!res.ok) throw new Error('Failed to process deposit');
      
      await fetchDeposits();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error processing deposit');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredDeposits = useMemo(() => {
    return deposits.filter(d => {
      const matchesFilter = filter === 'ALL' || d.status === filter;
      const searchLower = search.toLowerCase();
      const matchesSearch = search === '' || 
        d.user.name.toLowerCase().includes(searchLower) || 
        d.user.customId.toLowerCase().includes(searchLower) ||
        d.txHash.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [deposits, filter, search]);

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const paginatedDeposits = filteredDeposits.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusColor = (status: DepositStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-3xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2 bg-[#050b18] p-1 rounded-xl border border-[#152238]">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
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
            placeholder="Search user or TxHash..."
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
            <p className="text-slate-400">Loading deposits...</p>
          </div>
        ) : paginatedDeposits.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No deposits found matching your criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-800">
                <th className="pb-3 font-medium">SR</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Amount (USDT)</th>
                <th className="pb-3 font-medium">TxHash</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedDeposits.map((deposit, index) => (
                <tr key={deposit.id} className="text-sm">
                  <td className="py-4 text-slate-400">
                    {(page - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200">{deposit.user.name}</span>
                      <span className="text-xs text-slate-500">{deposit.user.customId}</span>
                    </div>
                  </td>
                  <td className="py-4 text-emerald-400 font-medium">
                    {formatUsdt(deposit.amountUsdt)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs">
                        {deposit.txHash.slice(0, 6)}...{deposit.txHash.slice(-4)}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(deposit.txHash)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedHash === deposit.txHash ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      {deposit.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(deposit.id, 'APPROVE')}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(deposit.id, 'REJECT')}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                            title="Reject"
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
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredDeposits.length)} of {filteredDeposits.length} entries
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
