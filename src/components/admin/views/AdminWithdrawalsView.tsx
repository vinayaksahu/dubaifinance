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
  user?: {
    name?: string;
    fullName?: string;
    customId?: string;
    email?: string;
  };
  amountInr?: number;
  amountUsdt?: number;
  amountInUsdt?: number;
  grossAmount?: number;
  amountGross?: number;
  feePercent?: number;
  feeAmount?: number;
  netAmount?: number;
  netPayout?: number;
  payoutAddress?: string;
  toAddress?: string;
  status: WithdrawalStatus;
  createdAt: string;
  txHash?: string;
  adminNote?: string;
}

export default function AdminWithdrawalsView({ onRefresh }: AdminWithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [summary, setSummary] = useState<any>({
    totalProcessedGross: 0,
    totalProcessedFee: 0,
    totalProcessedNet: 0,
    pendingGross: 0,
    pendingFee: 0,
    pendingNet: 0,
  });
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
      const list = Array.isArray(data) ? data : (data?.withdrawals || []);
      setWithdrawals(list);
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("fetchWithdrawals error:", error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDispatch = async (w: Withdrawal) => {
    const gross = w.grossAmount ?? w.amountGross ?? w.amountInUsdt ?? w.amountUsdt ?? 0;
    const fee = w.feeAmount ?? (gross * 0.1);
    const net = w.netPayout ?? w.netAmount ?? (gross - fee);
    const address = w.payoutAddress || w.toAddress || "";

    const txHash = prompt(
      `DISPATCH PAYOUT CONFIRMATION:\n\n` +
      `• Member: ${w.user?.fullName || "Member"} (${w.user?.customId || "N/A"})\n` +
      `• Gross Requested: $${gross.toFixed(2)} USDT\n` +
      `• 10% Admin Fee Deducted: -$${fee.toFixed(2)} USDT\n` +
      `• NET AMOUNT TO SEND: $${net.toFixed(2)} USDT\n` +
      `• Destination Address: ${address}\n\n` +
      `Please transfer $${net.toFixed(2)} USDT and enter the Transaction Hash (TxHash):`
    );
    if (txHash === null) return; // Cancelled
    if (!txHash.trim()) {
      alert('TxHash is required to dispatch payout');
      return;
    }

    const adminNote = prompt('Enter optional admin note:');
    if (adminNote === null) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: w.id, action: 'APPROVE', txHash, adminNote }),
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
    if (!Array.isArray(withdrawals)) return [];
    return withdrawals.filter(w => {
      if (!w) return false;
      const matchesFilter = filter === 'ALL' || w.status === filter;
      const searchLower = search.toLowerCase();
      const userName = (w.user?.fullName || w.user?.name || '').toLowerCase();
      const customId = (w.user?.customId || '').toLowerCase();
      const address = (w.payoutAddress || w.toAddress || '').toLowerCase();
      const matchesSearch = search === '' || 
        userName.includes(searchLower) || 
        customId.includes(searchLower) ||
        address.includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [withdrawals, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));
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
    <div className="space-y-6">
      {/* Top Withdrawal & Fee Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Total Net Dispatched (90%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300">
            {formatUsdt(summary.totalProcessedNet || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Actual USDT sent to members ($450 base)
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            Admin Fee Income (10%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {formatUsdt(summary.totalProcessedFee || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            10% platform profit retained from withdrawals
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
            Pending Net to Dispatch
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300">
            {formatUsdt(summary.pendingNet || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Queue waiting for TxHash confirmation
          </p>
        </div>
      </div>

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
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-3">
                  <th className="pb-3 font-semibold">SR</th>
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Gross Request</th>
                  <th className="pb-3 font-semibold text-amber-400">Fee (10%)</th>
                  <th className="pb-3 font-semibold text-emerald-400">Net Payout (To Dispatch)</th>
                  <th className="pb-3 font-semibold">Payout Address</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedWithdrawals.map((withdrawal, index) => {
                  const gross = withdrawal.grossAmount ?? withdrawal.amountGross ?? withdrawal.amountInUsdt ?? withdrawal.amountUsdt ?? 0;
                  const fee = withdrawal.feeAmount ?? (gross * 0.1);
                  const net = withdrawal.netPayout ?? withdrawal.netAmount ?? (gross - fee);
                  const address = withdrawal.payoutAddress || withdrawal.toAddress || '';

                  return (
                    <tr key={withdrawal.id} className="text-sm hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 text-slate-400">
                        {(page - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-semibold">{withdrawal.user?.fullName || withdrawal.user?.name || "Member"}</span>
                          <span className="text-xs text-slate-500 font-mono">{withdrawal.user?.customId || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-300 font-medium">
                        {formatUsdt(gross)}
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                          -{formatUsdt(fee)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-black text-sm text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl shadow-sm inline-block">
                          {formatUsdt(net)}
                        </span>
                      </td>
                      <td className="py-4">
                        {address ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-xs">
                              {address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(address)}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                              title="Copy address"
                            >
                              {copiedAddress === address ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 text-xs">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          {withdrawal.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleDispatch(withdrawal)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 flex items-center gap-1 text-xs font-bold"
                                title={`Dispatch Net Payout of ${formatUsdt(net)}`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Dispatch {formatUsdt(net)}</span>
                              </button>
                              <button
                                onClick={() => handleReject(withdrawal.id)}
                                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                                title="Reject & Refund"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}
