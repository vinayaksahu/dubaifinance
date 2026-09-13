"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberSidebar } from "@/components/dashboard/MemberSidebar";
import { MemberTopNavbar } from "@/components/dashboard/MemberTopNavbar";
import { DashboardView } from "@/components/dashboard/views/DashboardView";
import { RechargeView } from "@/components/dashboard/views/RechargeView";
import { BasicPackageView } from "@/components/dashboard/views/BasicPackageView";
import { FdPackageView } from "@/components/dashboard/views/FdPackageView";
import { DownlineView } from "@/components/dashboard/views/DownlineView";
import { GenealogyTreeView } from "@/components/dashboard/views/GenealogyTreeView";
import { TransactionalView } from "@/components/dashboard/views/TransactionalView";
import { IncomeView } from "@/components/dashboard/views/IncomeView";
import { ReportsView } from "@/components/dashboard/views/ReportsView";
import { SupportTicketView } from "@/components/dashboard/views/SupportTicketView";

export default function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-amber-400 font-extrabold tracking-widest text-sm uppercase">
            Loading Dubai Finance Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased">
      {/* Sidebar */}
      <MemberSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        userRole={user.role}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      }`}>
        {/* Top Navbar */}
        <MemberTopNavbar
          user={user}
          onToggleSidebar={handleToggleSidebar}
          isCollapsed={sidebarCollapsed}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView user={user} setActiveTab={setActiveTab} />
          )}

          {activeTab === "recharge" && (
            <RechargeView user={user} onRefresh={fetchUser} />
          )}

          {activeTab === "package-base" && (
            <BasicPackageView user={user} onRefresh={fetchUser} />
          )}

          {activeTab === "package-fd" && (
            <FdPackageView user={user} onRefresh={fetchUser} />
          )}

          {activeTab === "downline-direct" && (
            <DownlineView user={user} mode="direct" onNavigateTab={setActiveTab} />
          )}

          {activeTab === "downline-team" && (
            <DownlineView user={user} mode="team" onNavigateTab={setActiveTab} />
          )}

          {activeTab === "downline-tree" && (
            <GenealogyTreeView user={user} onNavigateTab={setActiveTab} />
          )}

          {activeTab === "income-roi" && (
            <IncomeView user={user} incomeType="roi" />
          )}

          {activeTab === "income-fd" && (
            <IncomeView user={user} incomeType="fd" />
          )}

          {activeTab === "income-referral" && (
            <IncomeView user={user} incomeType="referral" />
          )}

          {activeTab === "income-level" && (
            <IncomeView user={user} incomeType="level" />
          )}

          {activeTab === "tx-transfer" && (
            <TransactionalView user={user} mode="transfer" onRefresh={fetchUser} />
          )}

          {activeTab === "tx-swipe" && (
            <TransactionalView user={user} mode="swipe" onRefresh={fetchUser} />
          )}

          {activeTab === "tx-withdraw" && (
            <TransactionalView user={user} mode="withdraw" onRefresh={fetchUser} />
          )}

          {activeTab === "tx-withdraw-report" && (
            <TransactionalView user={user} mode="withdraw-report" onRefresh={fetchUser} />
          )}

          {activeTab === "report-statement" && (
            <ReportsView user={user} reportType="statement" />
          )}

          {activeTab === "report-packages" && (
            <ReportsView user={user} reportType="packages" />
          )}

          {activeTab === "support" && (
            <SupportTicketView />
          )}
        </main>
      </div>
    </div>
  );
}
