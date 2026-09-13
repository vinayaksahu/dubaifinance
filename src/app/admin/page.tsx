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
import { AdminConfigView } from "@/components/admin/views/AdminConfigView";
import { AdminIncomeView } from "@/components/admin/views/AdminIncomeView";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMsg, setCronMsg] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

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
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-amber-500 dark:text-amber-400 font-extrabold tracking-widest text-sm uppercase">
            Loading Admin Console...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col antialiased transition-colors duration-200">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        pendingDepositsCount={stats?.pendingDeposits || 0}
        pendingWithdrawalsCount={stats?.pendingWithdrawals || 0}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      }`}>
        {/* Top Navbar */}
        <AdminTopNavbar
          user={user}
          onToggleSidebar={handleToggleSidebar}
          isCollapsed={sidebarCollapsed}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && stats && (
            <AdminDashboardView
              stats={stats}
              onTriggerCron={triggerCron}
              cronLoading={cronLoading}
              cronMsg={cronMsg}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "deposits" && (
            <AdminDepositsView onRefresh={loadData} />
          )}

          {activeTab === "withdrawals" && (
            <AdminWithdrawalsView onRefresh={loadData} />
          )}

          {activeTab === "admin-income" && (
            <AdminIncomeView onRefresh={loadData} />
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
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "tickets" && (
            <AdminTicketsView />
          )}

          {activeTab === "config" && (
            <AdminConfigView />
          )}
        </main>
      </div>
    </div>
  );
}