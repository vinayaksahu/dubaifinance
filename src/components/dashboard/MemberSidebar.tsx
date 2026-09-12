"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gauge,
  Briefcase,
  Package,
  Users,
  Banknote,
  Repeat,
  BarChart3,
  Headphones,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface MemberSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole?: string;
}

export function MemberSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  userRole,
}: MemberSidebarProps) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    downline: true,
    income: false,
    transactional: false,
    reports: false,
    packages: true,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#050b18] border-r border-[#152238] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#152238] gap-3 bg-[#070e20]">
          <div className="w-9 h-9 rounded-full border-2 border-red-500 flex items-center justify-center p-1 bg-red-950/40 shadow-lg shadow-red-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-red-500 font-extrabold tracking-wider text-base leading-tight uppercase">
              DUBAI FINANCE
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              OFFICIAL MEMBER PORTAL
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Dashboard */}
          <button
            onClick={() => handleSelectTab("dashboard")}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "dashboard"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
            }`}
          >
            <Gauge className="w-5 h-5 text-blue-400" />
            <span>Dashboard</span>
          </button>

          {/* Recharge */}
          <button
            onClick={() => handleSelectTab("recharge")}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "recharge"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
            }`}
          >
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>Recharge</span>
          </button>

          {/* Package Activation Accordion */}
          <div>
            <button
              onClick={() => toggleMenu("packages")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("package-")
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Package className="w-5 h-5 text-amber-400" />
                <span>Package Activation</span>
              </div>
              {openMenus.packages || activeTab.startsWith("package-") ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(openMenus.packages || activeTab.startsWith("package-")) && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <button
                  onClick={() => handleSelectTab("package-base")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "package-base"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Basic Package
                </button>
                <button
                  onClick={() => handleSelectTab("package-fd")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "package-fd"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • FD Package
                </button>
              </div>
            )}
          </div>

          {/* Downline Accordion */}
          <div>
            <button
              onClick={() => toggleMenu("downline")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("downline-")
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Downline</span>
              </div>
              {openMenus.downline || activeTab.startsWith("downline-") ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(openMenus.downline || activeTab.startsWith("downline-")) && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <button
                  onClick={() => handleSelectTab("downline-direct")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "downline-direct"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Direct Team
                </button>
                <button
                  onClick={() => handleSelectTab("downline-team")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "downline-team"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Team List
                </button>
              </div>
            )}
          </div>

          {/* Income Accordion */}
          <div>
            <button
              onClick={() => toggleMenu("income")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("income-")
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span>Income</span>
              </div>
              {openMenus.income || activeTab.startsWith("income-") ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(openMenus.income || activeTab.startsWith("income-")) && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <button
                  onClick={() => handleSelectTab("income-roi")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-roi"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Daily ROI Income
                </button>
                <button
                  onClick={() => handleSelectTab("income-fd")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-fd"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • FD ROI Income
                </button>
                <button
                  onClick={() => handleSelectTab("income-referral")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-referral"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Direct Referral Income
                </button>
                <button
                  onClick={() => handleSelectTab("income-level")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-level"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Level ROI Income
                </button>
              </div>
            )}
          </div>

          {/* Transactional Accordion */}
          <div>
            <button
              onClick={() => toggleMenu("transactional")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("tx-")
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Repeat className="w-5 h-5 text-blue-400" />
                <span>Transactional</span>
              </div>
              {openMenus.transactional || activeTab.startsWith("tx-") ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(openMenus.transactional || activeTab.startsWith("tx-")) && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <button
                  onClick={() => handleSelectTab("tx-transfer")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-transfer"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Fund Transfer (P2P)
                </button>
                <button
                  onClick={() => handleSelectTab("tx-swipe")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-swipe"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Swipe (0% Fee)
                </button>
                <button
                  onClick={() => handleSelectTab("tx-withdraw")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-withdraw"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Withdrawal
                </button>
                <button
                  onClick={() => handleSelectTab("tx-withdraw-report")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-withdraw-report"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Withdrawal Report
                </button>
              </div>
            )}
          </div>

          {/* Reports Accordion */}
          <div>
            <button
              onClick={() => toggleMenu("reports")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("report-")
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Reports</span>
              </div>
              {openMenus.reports || activeTab.startsWith("report-") ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {(openMenus.reports || activeTab.startsWith("report-")) && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <button
                  onClick={() => handleSelectTab("report-statement")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "report-statement"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Account Statement
                </button>
                <button
                  onClick={() => handleSelectTab("report-packages")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "report-packages"
                      ? "text-blue-400 bg-blue-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
                  }`}
                >
                  • Package History
                </button>
              </div>
            )}
          </div>

          {/* Support Ticket */}
          <button
            onClick={() => handleSelectTab("support")}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "support"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1830]"
            }`}
          >
            <Headphones className="w-5 h-5 text-cyan-400" />
            <span>Support Ticket</span>
          </button>

          {/* Admin Panel Link */}
          {userRole === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-400 hover:bg-red-950/30 transition-all border border-red-500/20"
            >
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Logout at Bottom */}
        <div className="p-3 border-t border-[#152238] bg-[#070e20]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
