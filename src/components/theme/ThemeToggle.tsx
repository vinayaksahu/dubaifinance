"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, ThemeMode } from "./ThemeProvider";

interface ThemeToggleProps {
  variant?: "segmented" | "dropdown" | "compact";
  className?: string;
}

export function ThemeToggle({ variant = "segmented", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-slate-900/80 dark:bg-slate-900/90 light:bg-slate-200/80 border border-amber-500/30 dark:border-amber-500/30 light:border-amber-600/30 shadow-inner backdrop-blur-md ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Light Mode"
          aria-label="Light Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "light"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Dark Mode"
          aria-label="Dark Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "dark"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          title="System Default Mode"
          aria-label="System Default Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "system"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">System</span>
        </button>
      </div>
    );
  }

  // Compact icon button with dropdown
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-amber-500/30 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/80 hover:border-amber-400 text-amber-300 transition shadow-sm"
        aria-label="Toggle theme menu"
        title={`Current: ${theme.toUpperCase()} (${resolvedTheme} active)`}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-amber-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-xl border border-amber-500/30 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white text-slate-100 light:text-slate-900 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-400/10 transition ${
              theme === "light" ? "text-amber-400 font-bold" : "text-slate-300 light:text-slate-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
            </span>
            {theme === "light" && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-400/10 transition ${
              theme === "dark" ? "text-amber-400 font-bold" : "text-slate-300 light:text-slate-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-amber-400" /> Dark
            </span>
            {theme === "dark" && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-400/10 transition ${
              theme === "system" ? "text-amber-400 font-bold" : "text-slate-300 light:text-slate-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-amber-400" /> System
            </span>
            {theme === "system" && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
