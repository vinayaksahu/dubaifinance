"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";

interface ImpersonationBannerProps {
  userCustomId?: string;
  userFullName?: string;
  userRole?: string;
}

export function ImpersonationBanner({
  userCustomId,
  userFullName,
  userRole,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatorInfo, setImpersonatorInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for df_impersonator cookie
    const cookies = document.cookie.split("; ");
    const impCookie = cookies.find((c) => c.startsWith("df_impersonator="));
    if (impCookie) {
      const val = decodeURIComponent(impCookie.split("=")[1] || "");
      setIsImpersonating(true);
      setImpersonatorInfo(val.split("|")[0] || "SUPER_ROOT");
    }
  }, []);

  const handleExit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/impersonate/exit", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = "/superrootadmin";
      }
    } catch {
      window.location.href = "/superrootadmin";
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="sticky top-0 z-[99999] w-full bg-gradient-to-r from-rose-950 via-amber-950 to-slate-950 border-b-2 border-amber-500/70 shadow-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>

        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 text-[10px] tracking-wider uppercase flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          Inspection Mode
        </span>

        <span className="text-slate-300 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          Viewing as:
          <strong className="text-white font-bold">{userFullName || "Account"}</strong>
          <span className="text-amber-400">({userCustomId || ""})</span>
        </span>

        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
          {userRole === "USER" ? "Member Portal" : "Admin Console"}
        </span>
      </div>

      <button
        onClick={handleExit}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Returning...
          </>
        ) : (
          <>
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit to Super Root Admin
          </>
        )}
      </button>
    </div>
  );
}
