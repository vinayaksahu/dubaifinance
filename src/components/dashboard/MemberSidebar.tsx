"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronLeft,
  X,
  ShieldAlert,
} from "lucide-react";

interface MemberSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  userRole?: string;
}

export function MemberSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed = false,
  setIsCollapsed,
  userRole,
}: MemberSidebarProps) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    downline: false,
    income: false,
    transactional: false,
    reports: false,
    packages: false,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    // Close all dropdowns when a submenu item is clicked
    setOpenMenus({ downline: false, income: false, transactional: false, reports: false, packages: false });
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
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[var(--bg-secondary)] border-r border-amber-500/20 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } shadow-2xl`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-amber-500/20 bg-[var(--bg-main)] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/dubaiLogo.png"
                  alt="Dubai Finance Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className={`flex flex-col ${isCollapsed ? "lg:hidden" : "block"}`}>
              <span className="text-amber-600 dark:text-amber-400 font-display font-black tracking-wider text-sm uppercase leading-tight whitespace-nowrap">
                DUBAI FINANCE
              </span>
              <span className="text-[9px] text-amber-600/80 dark:text-amber-500/70 font-semibold tracking-wide uppercase whitespace-nowrap">
                MEMBER PORTAL
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg border border-amber-500/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/10"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-amber-500/20">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            title={isCollapsed ? "Dashboard" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
            }`}
          >
            <Gauge className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Dashboard</span>
          </button>

          {/* Recharge */}
          <button
            type="button"
            onClick={() => handleSelectTab("recharge")}
            title={isCollapsed ? "Recharge" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "recharge"
                ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
            }`}
          >
            <Briefcase className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Recharge</span>
          </button>

          {/* Package Activation Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("packages")}
              title={isCollapsed ? "Package Activation" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("package-")
                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Package className="w-5 h-5 text-amber-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Package Activation</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.packages || activeTab.startsWith("package-") ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            </button>
            {(openMenus.packages || activeTab.startsWith("package-")) && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-11 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("package-base")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "package-base"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Basic Package
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("package-fd")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "package-fd"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
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
              type="button"
              onClick={() => toggleMenu("downline")}
              title={isCollapsed ? "Downline" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("downline-")
                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Downline</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.downline || activeTab.startsWith("downline-") ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            </button>
            {(openMenus.downline || activeTab.startsWith("downline-")) && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-11 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-direct")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "downline-direct"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Direct Team
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-team")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "downline-team"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Team List
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-tree")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "downline-tree"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Tree View
                </button>
              </div>
            )}
          </div>

          {/* Income Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("income")}
              title={isCollapsed ? "Income" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("income-")
                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Income</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.income || activeTab.startsWith("income-") ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            </button>
            {(openMenus.income || activeTab.startsWith("income-")) && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-11 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-roi")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-roi"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Daily ROI Income
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-fd")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-fd"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • FD ROI Income
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-referral")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-referral"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Direct Referral Income
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-level")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "income-level"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
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
              type="button"
              onClick={() => toggleMenu("transactional")}
              title={isCollapsed ? "Transactional" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("tx-")
                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Repeat className="w-5 h-5 text-amber-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Transactional</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.transactional || activeTab.startsWith("tx-") ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            </button>
            {(openMenus.transactional || activeTab.startsWith("tx-")) && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-11 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("tx-transfer")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-transfer"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Fund Transfer (P2P)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("tx-swipe")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-swipe"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Swipe (0% Fee)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("tx-withdraw")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-withdraw"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Withdrawal
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("tx-withdraw-report")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "tx-withdraw-report"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
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
              type="button"
              onClick={() => toggleMenu("reports")}
              title={isCollapsed ? "Reports" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab.startsWith("report-")
                  ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className="w-5 h-5 text-amber-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Reports</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.reports || activeTab.startsWith("report-") ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            </button>
            {(openMenus.reports || activeTab.startsWith("report-")) && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-11 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-statement")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "report-statement"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Account Statement
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-packages")}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "report-packages"
                      ? "text-amber-300 bg-amber-500/15 font-bold border-l-2 border-amber-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
                  }`}
                >
                  • Package History
                </button>
              </div>
            )}
          </div>

          {/* Support Ticket */}
          <button
            type="button"
            onClick={() => handleSelectTab("support")}
            title={isCollapsed ? "Support Ticket" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === "support"
                ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10"
            }`}
          >
            <Headphones className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Support Ticket</span>
          </button>

          {/* Admin Panel Link */}
          {userRole === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              title={isCollapsed ? "Admin Console" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
              } py-2.5 rounded-xl font-bold text-xs text-amber-400 hover:bg-amber-400/10 transition-all border border-amber-500/30`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : "inline"}>Admin Console</span>
            </Link>
          )}
        </div>

        {/* Logout at Bottom */}
        <div className="p-3 border-t border-amber-500/20 bg-[var(--bg-main)] shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "justify-center gap-2 px-3"
            } py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
