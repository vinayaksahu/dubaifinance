"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Copy, Check, ChevronLeft, ChevronRight, Loader2, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { formatUsdt } from '@/lib/utils';

interface AdminDepositsViewProps {
  onRefresh: () => void;
}

interface Deposit {
  id: string;
  userId: string;
  user?: {
    name?: string;
    fullName?: string;
    customId?: string;
    email?: string;
  };
  amountUsdt?: number;
  amountInUsdt?: number;
  amountInr?: number;
  txHash?: string;
  verifiedTxHash?: string;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: string | null;
  confirmations?: number;
  processingMode?: string;
  status: string;
  createdAt: string;
  adminNote?: string;
}

export default function AdminDepositsView({ onRefresh }: AdminDepositsViewProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [permissions, setPermissions] = useState({
    canApprove: false,
    canReject: false,
    canReconcile: false,
  });
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PENDING_REVIEW' | 'CREDITED' | 'MANUAL_REVIEW' | 'REJECTED'>('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'AUTOMATIC' | 'MANUAL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/crypto-deposits');
      if (!res.ok) throw new Error('Failed to fetch deposits');
      const data = await res.json();
      setDeposits(data?.deposits || []);
      if (data?.permissions) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error("fetchDeposits error:", error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, action: 'APPROVE' | 'REJECT') => {
    const notes = prompt(`Enter optional note for ${action.toLowerCase()}:`);
    if (notes === null) return; // Cancelled

    try {
      const res = await fetch('/api/admin/crypto-deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process deposit');
      }
      
      alert(data.message || `Deposit ${action.toLowerCase()}ed successfully.`);
      await fetchDeposits();
      onRefresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error processing deposit');
    }
  };

  const handleReconcile = async () => {
    if (!confirm("Run BSC blockchain reconciliation scan to detect any missed blocks?")) return;
    try {
      setReconciling(true);
      const res = await fetch('/api/admin/crypto-deposits/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reconciliation failed');
      alert(`Reconciliation complete! Detected: ${data.result.detectedCount} | Credited: ${data.result.creditedCount}`);
      await fetchDeposits();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to run reconciliation.");
    } finally {
      setReconciling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredDeposits = useMemo(() => {
    if (!Array.isArray(deposits)) return [];
    return deposits.filter(d => {
      if (!d) return false;
      const matchesFilter = filter === 'ALL' || 
        d.status === filter ||
        (filter === 'PENDING' && (d.status === 'PENDING' || d.status === 'CONFIRMING')) ||
        (filter === 'CREDITED' && (d.status === 'CREDITED' || d.status === 'APPROVED'));

      const matchesMode = modeFilter === 'ALL' || (d.processingMode || 'MANUAL') === modeFilter;

      const searchLower = search.toLowerCase();
      const userName = (d.user?.fullName || d.user?.name || '').toLowerCase();
      const customId = (d.user?.customId || '').toLowerCase();
      const txHash = (d.txHash || '').toLowerCase();
      const toAddr = (d.toAddress || '').toLowerCase();

      const matchesSearch = search === '' || 
        userName.includes(searchLower) || 
        customId.includes(searchLower) ||
        txHash.includes(searchLower) ||
        toAddr.includes(searchLower);

      return matchesFilter && matchesMode && matchesSearch;
    });
  }, [deposits, filter, modeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / itemsPerPage));
  const paginatedDeposits = filteredDeposits.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CREDITED':
      case 'APPROVED':
      case 'CONFIRMED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'PENDING_REVIEW':
      case 'PENDING':
      case 'CONFIRMING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MANUAL_REVIEW':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-3xl p-6">
      {/* Header controls & filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 bg-[#050b18] p-1 rounded-xl border border-[#152238]">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_REVIEW', label: 'Pending Approval' },
            { id: 'CREDITED', label: 'Credited' },
            { id: 'MANUAL_REVIEW', label: 'Manual Review' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id as any); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f.id 
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {permissions.canReconcile && (
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="px-3 py-2 rounded-xl bg-[#0d1a36] border border-[#1d335e] text-blue-400 hover:bg-[#13244a] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              <span>{reconciling ? "Scanning..." : "Reconcile"}</span>
            </button>
          )}

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, address, TxHash..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#050b18] border border-[#152238] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-400 text-xs">Loading USDT deposits...</p>
          </div>
        ) : paginatedDeposits.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No deposits found matching your filter criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">SR</th>
                <th className="pb-3 px-2">User</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">TxHash</th>
                <th className="pb-3 px-2">Confirmations</th>
                <th className="pb-3 px-2">Mode</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedDeposits.map((deposit, index) => {
                const amount = deposit.amountInUsdt ?? deposit.amountUsdt ?? 0;
                const tx = deposit.txHash || '';
                const canApproveThis = permissions.canApprove && (deposit.status === 'PENDING' || deposit.status === 'PENDING_REVIEW' || deposit.status === 'MANUAL_REVIEW');
                const canRejectThis = permissions.canReject && (deposit.status === 'PENDING' || deposit.status === 'PENDING_REVIEW' || deposit.status === 'MANUAL_REVIEW');

                return (
                  <tr key={deposit.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-2 text-slate-400 font-mono">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-semibold">{deposit.user?.fullName || deposit.user?.name || "Member"}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{deposit.user?.customId || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-emerald-400 font-bold">
                      {formatUsdt(amount)}
                    </td>
                    <td className="py-3.5 px-2 font-mono">
                      {tx ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://bscscan.com/tx/${tx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                            title="View on BscScan"
                          >
                            <span>{tx.length > 10 ? `${tx.slice(0, 6)}...${tx.slice(-4)}` : tx}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button 
                            onClick={() => copyToClipboard(tx)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedHash === tx ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">Direct</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 font-mono text-slate-300">
                      {deposit.confirmations || 0} / 3
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {deposit.processingMode || 'MANUAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(deposit.status)}`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-400">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex justify-end gap-1.5">
                        {canApproveThis && (
                          <button
                            onClick={() => handleAction(deposit.id, 'APPROVE')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                            title="Approve & Credit Fund Wallet"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {canRejectThis && (
                          <button
                            onClick={() => handleAction(deposit.id, 'REJECT')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {!canApproveThis && !canRejectThis && (
                          <span className="text-slate-600 text-[10px] italic">No Action</span>
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
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <p>
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
