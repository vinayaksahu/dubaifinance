"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, LogOut, PanelLeftClose, PanelLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MemberTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
}

export function MemberTopNavbar({ user, onToggleSidebar, isCollapsed = false }: MemberTopNavbarProps) {
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
    <header className="h-16 bg-[#080c14]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md transition-colors duration-200">
      {/* Left: Sidebar Slide/Collapse Toggle & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Side Panel"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-amber-400" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-amber-400" />
          )}
        </button>

        <ThemeToggle variant="compact" />
      </div>

      {/* Right: User Profile Dropdown Pill */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0c1322] border border-amber-500/25 hover:border-amber-400 transition-all text-left shadow-sm"
        >
          {/* Dubai Finance Gold Emblem */}
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-sm shadow-amber-500/20 shrink-0">
            <div className="w-full h-full rounded-[6px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src="/dubaiLogo.png"
                alt="Dubai Finance Logo"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
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
