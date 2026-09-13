"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, ThemeMode } from "./ThemeProvider";

interface ThemeToggleProps {
  variant?: "icons" | "segmented" | "dropdown" | "compact";
  className?: string;
  dropdownAlign?: "left" | "right";
}

export function ThemeToggle({
  variant = "icons",
  className = "",
  dropdownAlign = "right",
}: ThemeToggleProps) {
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

  // Sleek, ultra-compact icon-only segmented pill for top navigation
  if (variant === "icons") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-full bg-slate-200/80 dark:bg-slate-900/80 border border-amber-500/30 shadow-inner backdrop-blur-md shrink-0 ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Switch to Light Mode"
          aria-label="Light Mode"
          className={`p-1.5 rounded-full transition-all ${
            theme === "light"
              ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/30 scale-105"
              : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Switch to Dark Mode"
          aria-label="Dark Mode"
          className={`p-1.5 rounded-full transition-all ${
            theme === "dark"
              ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/30 scale-105"
              : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          title="Switch to System Default Mode"
          aria-label="System Mode"
          className={`p-1.5 rounded-full transition-all ${
            theme === "system"
              ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/30 scale-105"
              : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Segmented with text labels (used in mobile drawer & footer)
  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-slate-900/90 border border-amber-500/30 shadow-inner backdrop-blur-md ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Light Mode"
          aria-label="Light Mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "light"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Dark Mode"
          aria-label="Dark Mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "dark"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          title="System Default Mode"
          aria-label="System Default Mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === "system"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>System</span>
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
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-amber-500/30 bg-white/90 dark:bg-slate-900/80 hover:border-amber-400 text-amber-500 dark:text-amber-400 transition shadow-sm"
        aria-label="Toggle theme menu"
        title={`Theme: ${theme.toUpperCase()}`}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-amber-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            dropdownAlign === "left" ? "left-0" : "right-0"
          } mt-2 w-36 py-1.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#0c1322] text-slate-800 dark:text-slate-100 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-500/10 transition ${
              theme === "light"
                ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
            </span>
            {theme === "light" && <Check className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-500/10 transition ${
              theme === "dark"
                ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10"
                : "text-slate-700 dark:text-slate-300"
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
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-amber-500/10 transition ${
              theme === "system"
                ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> System
            </span>
            {theme === "system" && <Check className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
