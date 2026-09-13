"use client";

import React from "react";
import { Menu, LogOut, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
}

export function AdminTopNavbar({ user, onToggleSidebar }: AdminTopNavbarProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#070e20] px-4 border-b border-[#152238]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-purple-400">Admin Console</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle variant="compact" />

        <Link 
          href="/member"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
        >
          Member View
          <ArrowRight className="h-3 w-3" />
        </Link>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050b18] rounded-full border border-[#152238]">
          <span className="text-sm text-slate-300">
            {user?.fullName || user?.name || 'Administrator'}
          </span>
          <Crown className="h-4 w-4 text-amber-400" />
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
