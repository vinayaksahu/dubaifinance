"use client";

import React from "react";
import { LogOut, Crown, ArrowRight, PanelLeftClose, PanelLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
}

export function AdminTopNavbar({ user, onToggleSidebar, isCollapsed = false }: AdminTopNavbarProps) {
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[var(--bg-main)]/95 backdrop-blur-xl px-4 sm:px-6 border-b border-amber-500/20 shadow-lg shadow-black/10 transition-colors duration-200">
      {/* Left: Sidebar Toggle & Console Badge */}
      <div className="flex items-center gap-3">
        {/* Toggle button visible on BOTH desktop (collapses/expands) and mobile (slides drawer) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-amber-500/30 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 transition-colors shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Side Panel"
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          )}
        </button>

        {/* Executive Admin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-xl">
          <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase whitespace-nowrap">
            CMD Console
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-bold border-l border-amber-500/20 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            BEP-20 LIVE
          </span>
        </div>
      </div>

      {/* Right: Controls, Member View, User, Theme & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle variant="compact" dropdownAlign="right" />

        {/* Member View Quick Link */}
        <Link 
          href="/member"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-400/20 rounded-xl transition-colors border border-amber-500/30 whitespace-nowrap"
        >
          Member View
          <ArrowRight className="h-3 w-3" />
        </Link>
        
        {/* Super Admin Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-xl border border-amber-500/20">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Crown className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline truncate max-w-[140px]">
            {user?.fullName || user?.name || "Super Admin"}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black border border-amber-500/30 uppercase">
            CMD
          </span>
        </div>

        {/* Logout Button */}
        <button 
          type="button"
          onClick={handleLogout}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/30 transition-colors"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
