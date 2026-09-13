"use client";

import React, { useState } from "react";
import { Menu, Moon, Sun, ChevronDown, User, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MemberTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
}

export function MemberTopNavbar({ user, onToggleSidebar }: MemberTopNavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <header className="h-16 bg-[#070e20] border-b border-[#152238] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Hamburger & Mode Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#132042] transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <ThemeToggle variant="compact" />
      </div>

      {/* Right: User Profile Dropdown Pill */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#0d1933] border border-[#1d3058] hover:border-blue-500/50 transition-all text-left"
        >
          {/* Circular Red Avatar Emblem */}
          <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-[#160608] flex items-center justify-center p-0.5 shadow-md shadow-red-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user.fullName || "Member"}
            </span>
            <span className="text-[10px] text-slate-400 leading-none">
              ID: {user.customId}
            </span>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-56 bg-[#0a1226] border border-[#1e335e] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            onClick={() => setDropdownOpen(false)}
          >
            <div className="px-4 py-2 border-b border-[#152342]">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-bold text-slate-100 truncate">{user.fullName}</p>
              <p className="text-xs text-blue-400 font-mono mt-0.5">{user.customId}</p>
            </div>

            <div className="py-1">
              <div className="px-4 py-2 text-xs text-slate-400 flex justify-between">
                <span>Status:</span>
                <span className={user.status === "ACTIVE" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {user.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className="px-4 py-1 text-xs text-slate-400 flex justify-between">
                <span>Fund Wallet:</span>
                <span className="text-emerald-400 font-medium">${Number(user.fundBalance || 0).toFixed(2)} USDT</span>
              </div>
              <div className="px-4 py-1 text-xs text-slate-400 flex justify-between">
                <span>Income Wallet:</span>
                <span className="text-cyan-400 font-medium">${Number(user.incomeBalance || 0).toFixed(2)} USDT</span>
              </div>
            </div>

            <div className="border-t border-[#152342] pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
