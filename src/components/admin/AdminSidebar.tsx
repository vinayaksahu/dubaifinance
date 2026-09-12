"use client";

import React from 'react';
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
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: AdminSidebarProps) {
  const router = useRouter();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deposits', label: 'Deposit Management', icon: Wallet },
    { id: 'withdrawals', label: 'Withdrawal Management', icon: Banknote },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roi-engine', label: 'ROI Engine', icon: Zap },
    { id: 'tickets', label: 'Support Tickets', icon: Headphones },
    { id: 'config', label: 'System Config', icon: Settings },
  ];

  const handleLogout = () => {
    // Basic logout handling
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-[#050b18] border-r border-[#152238] flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-20 bg-[#070e20] border-b border-[#152238] flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#050b18] border border-[#152238] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(168,85,247,0.1)] relative">
              <div className="absolute inset-0 rounded-lg border border-purple-500/20"></div>
              👑
            </div>
            <div>
              <div className="font-bold text-lg tracking-wider text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                DUBAI FINANCE
              </div>
              <div className="text-[10px] font-medium tracking-[0.2em] text-gray-400">
                ADMIN CONSOLE
              </div>
            </div>
          </div>

          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white relative z-10"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-[#152238] scrollbar-track-transparent">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#0c162c] border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                  )}
                  
                  <item.icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'
                  }`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="my-6 border-t border-[#152238]"></div>

          <div className="space-y-2">
            <Link
              href="/member"
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-[#0c162c] border border-transparent transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-gray-500" />
                Member View
              </div>
            </Link>
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 bg-[#070e20] border-t border-[#152238] shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
