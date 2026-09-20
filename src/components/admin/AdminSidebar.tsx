"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Wallet, 
  Banknote, 
  Users, 
  Zap, 
  Headphones, 
  Settings,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Landmark,
  Database,
  UserCog
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingDepositsCount?: number;
  pendingWithdrawalsCount?: number;
  userRole?: string;
}

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  pendingDepositsCount = 0,
  pendingWithdrawalsCount = 0,
  userRole,
}: AdminSidebarProps) {
  const isSuper = userRole === "SUPER_ADMIN" || userRole === "SUPER_ROOT_ADMIN";
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "deposits", label: "Deposit Management", icon: Wallet, badge: pendingDepositsCount > 0 ? pendingDepositsCount : null, badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" },
    { id: "withdrawals", label: "Withdrawal Management", icon: Banknote, badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null, badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
    { id: "admin-income", label: "Admin Fee Income", icon: Landmark, badge: "10%", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    { id: "users", label: "User Management", icon: Users },
    { id: "roi-engine", label: "ROI Engine", icon: Zap },
    { id: "tickets", label: "Support Tickets", icon: Headphones },
    { id: "profile", label: "Admin Profile", icon: UserCog },
    ...(isSuper ? [
      { id: "config", label: "System Config", icon: Settings },
      { id: "backup", label: "Database Backup", icon: Database },
    ] : []),
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      window.location.href = "/adminlogin";
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
        {/* Brand Header */}
        <div className="h-20 bg-[var(--bg-main)] border-b border-amber-500/20 flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
          {/* Subtle gold gradient glow in header */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />

          {/* Logo & Brand title */}
          <div className="flex items-center gap-3 relative z-10 overflow-hidden">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/30 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/dubaiLogo.png"
                  alt="Dubai Finance Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Brand Text (Hidden when collapsed on desktop) */}
            <div className={`flex flex-col transition-opacity duration-200 ${
              isCollapsed ? "lg:hidden" : "block"
            }`}>
              <div className="font-display font-black text-base tracking-wider text-amber-600 dark:text-amber-400 uppercase whitespace-nowrap leading-none">
                DUBAI FINANCE
              </div>
              <div className="text-[9px] font-bold tracking-[0.2em] text-amber-600/80 dark:text-amber-500/70 uppercase mt-1 whitespace-nowrap flex items-center gap-1 leading-none">
                <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                ADMIN CONSOLE
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            type="button"
            className="lg:hidden p-2 rounded-lg border border-amber-500/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 relative z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close Mobile Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
                } py-3 rounded-xl font-semibold text-xs transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200 hover:bg-amber-500/10 border border-transparent"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
                )}
                
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-amber-500 dark:text-amber-400" : "text-slate-500 dark:text-slate-400 group-hover:text-amber-500"
                  }`} />
                  
                  {/* Label (Hidden when collapsed on desktop) */}
                  <span className={`truncate text-left ${isCollapsed ? "lg:hidden" : "block"}`}>
                    {item.label}
                  </span>
                </div>

                {/* Badge (Pending counts) */}
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${item.badgeColor} ${
                    isCollapsed ? "lg:hidden" : "inline-block"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-amber-500/15" />

          {/* Member View Link */}
          <Link
            href="/member"
            title={isCollapsed ? "Member View" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "px-3.5"
            } py-3 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all duration-200 group`}
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span className={isCollapsed ? "lg:hidden" : "block"}>
                Member View
              </span>
            </div>
          </Link>
        </div>

        {/* Footer / Quick Collapse Indicator & Logout */}
        <div className="p-3 bg-[var(--bg-main)] border-t border-amber-500/20 shrink-0 space-y-2">
          {/* Collapse status hint (desktop only) */}
          <div className={`hidden lg:flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 font-medium ${
            isCollapsed ? "lg:hidden" : "flex"
          }`}>
            <span>Console Status</span>
            <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <button 
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "justify-center gap-2 px-3"
            } py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
