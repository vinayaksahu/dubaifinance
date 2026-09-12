"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, CheckCircle, XCircle, Search, Reply, ChevronDown, ChevronUp } from 'lucide-react';


interface AdminTicketsViewProps {}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    customId: string;
    fullName: string;
  };
}

export function AdminTicketsView({}: AdminTicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'ANSWERED' | 'CLOSED'>('ALL');
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        alert(data.error || 'Failed to fetch tickets');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (ticketId: string, action: 'REPLY' | 'CLOSE', reply?: string) => {
    try {
      setProcessing(true);
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, action, reply }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setReplyModalOpen(false);
        fetchTickets();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const openReplyModal = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setReplyModalOpen(true);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTickets = tickets.filter(t => activeTab === 'ALL' || t.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ANSWERED': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'CLOSED': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Tickets' },
    { id: 'OPEN', label: 'Open' },
    { id: 'ANSWERED', label: 'Answered' },
    { id: 'CLOSED', label: 'Closed' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Support Tickets</h2>
        
        <div className="flex bg-[#0a1128] p-1 rounded-xl border border-[#152238]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0a1128]/80 backdrop-blur-md rounded-2xl border border-[#152238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#070e20]/50 border-b border-[#152238]">
              <tr>
                <th className="px-6 py-4 font-medium w-12"></th>
                <th className="px-6 py-4 font-medium">SR</th>
                <th className="px-6 py-4 font-medium">Ticket ID</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152238]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading tickets...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No tickets found in this category.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-[#152238]/30 transition-colors">
                      <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleRow(ticket.id)}>
                        {expandedRows[ticket.id] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500" title={ticket.id}>
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-200">{ticket.user.fullName}</span>
                          <span className="text-xs text-purple-400">{ticket.user.customId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-[200px] truncate" title={ticket.subject}>
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ticket.status !== 'CLOSED' && (
                            <>
                              <button
                                onClick={() => openReplyModal(ticket)}
                                className="p-1.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                                title="Reply"
                              >
                                <Reply className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(ticket.id, 'CLOSE')}
                                disabled={processing}
                                className="p-1.5 rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors"
                                title="Close Ticket"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRows[ticket.id] && (
                      <tr className="bg-[#070e20]/30">
                        <td colSpan={8} className="px-6 py-4 border-t border-[#152238]/50">
                          <div className="pl-8 space-y-4">
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Message</span>
                              <p className="mt-1 text-sm text-gray-300 bg-[#0a1128] p-3 rounded-lg border border-[#152238]">
                                {ticket.message}
                              </p>
                            </div>
                            {ticket.adminReply && (
                              <div>
                                <span className="text-xs font-semibold text-purple-500 uppercase">Admin Reply</span>
                                <p className="mt-1 text-sm text-purple-200 bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                  {ticket.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {replyModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a1128] border border-[#152238] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#152238] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Reply to Ticket</h3>
              <button 
                onClick={() => setReplyModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-medium mb-1">User's Message</label>
                <div className="text-sm text-gray-300 p-3 bg-[#070e20] rounded-xl border border-[#152238]">
                  {activeTicket.message}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-purple-400 uppercase font-medium mb-1">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                  className="w-full bg-[#070e20] border border-[#152238] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#152238] flex justify-end gap-3 bg-[#070e20]/50">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(activeTicket.id, 'REPLY', replyText)}
                disabled={processing || !replyText.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
