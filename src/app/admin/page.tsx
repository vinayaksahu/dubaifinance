"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminTopNavbar } from "@/components/admin/AdminTopNavbar";
import { AdminDashboardView } from "@/components/admin/views/AdminDashboardView";
import AdminDepositsView from "@/components/admin/views/AdminDepositsView";
import AdminWithdrawalsView from "@/components/admin/views/AdminWithdrawalsView";
import { AdminUsersView } from "@/components/admin/views/AdminUsersView";
import { AdminTicketsView } from "@/components/admin/views/AdminTicketsView";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMsg, setCronMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [meRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/stats"),
      ]);

      if (!meRes.ok || !statsRes.ok) {
        router.push("/login");
        return;
      }

      const meData = await meRes.json();
      const statsData = await statsRes.json();

      if (meData.user.role !== "SUPER_ADMIN") {
        router.push("/member");
        return;
      }

      setUser(meData.user);
      setStats(statsData.stats);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerCron = async () => {
    setCronLoading(true);
    setCronMsg(null);
    try {
      const res = await fetch("/api/cron/daily-roi");
      const data = await res.json();
      setCronMsg(
        `ROI Cron executed! Distributed $${data.summary?.totalDistributedUsdt || 0} USDT across ${data.summary?.processedCount || 0} contracts.`
      );
      loadData();
    } catch (e: any) {
      setCronMsg("Cron trigger failed: " + e.message);
    } finally {
      setCronLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-purple-400 font-extrabold tracking-widest text-sm uppercase">
            Loading Admin Console...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col antialiased">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <AdminTopNavbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && stats && (
            <AdminDashboardView
              stats={stats}
              onTriggerCron={triggerCron}
              cronLoading={cronLoading}
              cronMsg={cronMsg}
            />
          )}

          {activeTab === "deposits" && (
            <AdminDepositsView onRefresh={loadData} />
          )}

          {activeTab === "withdrawals" && (
            <AdminWithdrawalsView onRefresh={loadData} />
          )}

          {activeTab === "users" && (
            <AdminUsersView onRefresh={loadData} />
          )}

          {activeTab === "roi-engine" && stats && (
            <AdminDashboardView
              stats={stats}
              onTriggerCron={triggerCron}
              cronLoading={cronLoading}
              cronMsg={cronMsg}
            />
          )}

          {activeTab === "tickets" && (
            <AdminTicketsView />
          )}

          {activeTab === "config" && (
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ System Configuration</h2>
              <p className="text-slate-400 text-sm">
                System configuration editor will be available in Phase 3.
                <br />
                Currently, all settings are managed via <code className="text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded">src/lib/constants.ts</code>
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Direct Referral %</span>
                  <span className="text-sm font-bold text-emerald-400">15%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Basic Plan Tenure</span>
                  <span className="text-sm font-bold text-amber-400">30 Days</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Basic Plan Daily ROI</span>
                  <span className="text-sm font-bold text-cyan-400">5%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Base Currency</span>
                  <span className="text-sm font-bold text-white">USDT (BEP-20)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Withdrawal Window</span>
                  <span className="text-sm font-bold text-amber-400">10 AM - 2 PM IST</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Min Withdrawal</span>
                  <span className="text-sm font-bold text-white">$2 USDT</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Max Withdrawal</span>
                  <span className="text-sm font-bold text-white">$5,000 USDT</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}