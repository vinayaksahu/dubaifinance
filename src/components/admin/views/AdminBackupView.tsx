"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  Check,
  Info,
} from "lucide-react";

interface TableCounts {
  users: number;
  systemConfigs: number;
  investmentContracts: number;
  ledgerEntries: number;
  depositRequests: number;
  withdrawalRequests: number;
  supportTickets: number;
  queuePositions?: number;
}

interface BackupMetadata {
  platform: string;
  version: string;
  exportedAt: string;
  totalRecords: number;
  schema: string;
  tableCounts: TableCounts;
}

export function AdminBackupView() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [metadata, setMetadata] = useState<BackupMetadata | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<"json" | "excel" | null>(null);

  // Restore State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    fileName: string;
    totalRecords: number;
    counts: TableCounts;
  } | null>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [confirmReplaceText, setConfirmReplaceText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    summary?: any;
    errors?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/backup/export?info=true");
      if (res.ok) {
        const data = await res.json();
        setMetadata(data.metadata);
      }
    } catch (err) {
      console.error("Failed to load backup stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleDownload = async (format: "json" | "excel") => {
    setDownloadingFormat(format);
    try {
      const res = await fetch(`/api/admin/backup/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `dubaifinance_backup_${timestamp}.${format === "excel" ? "xlsx" : "json"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRestoreResult(null);
    setPreviewLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("preview", "true");

      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to inspect file.");
        setSelectedFile(null);
        setPreviewData(null);
      } else {
        setPreviewData(data);
      }
    } catch (err: any) {
      alert("Error inspecting backup file: " + err.message);
      setSelectedFile(null);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) return;
    if (restoreMode === "replace" && confirmReplaceText.trim() !== "RESTORE") {
      alert("Please type 'RESTORE' to confirm clean replacement.");
      return;
    }

    setShowConfirmModal(false);
    setRestoring(true);
    setRestoreResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", restoreMode);

      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setRestoreResult(data);

      if (res.ok && data.success) {
        loadStats(); // refresh counts
      }
    } catch (err: any) {
      setRestoreResult({
        success: false,
        message: err.message || "Failed to restore backup",
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-amber-500 text-xs font-black uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-amber-500" />
            <span>Database Administration &amp; Disaster Recovery</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
            Database Backup &amp; Restore
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Download full system data in JSON or multi-sheet Excel format, or restore onto a new database.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loadingStats}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
          <span>Refresh Database Stats</span>
        </button>
      </div>

      {/* Database Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#060c1d]/60">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Users
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {loadingStats ? "..." : metadata?.tableCounts?.users?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Registered Profiles</div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#060c1d]/60">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Contracts
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
            {loadingStats ? "..." : metadata?.tableCounts?.investmentContracts?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Basic &amp; FD Packages</div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#060c1d]/60">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ledger Entries
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {loadingStats ? "..." : metadata?.tableCounts?.ledgerEntries?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Financial Transactions</div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#060c1d]/60">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Records
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-purple-400 mt-1">
            {loadingStats ? "..." : metadata?.totalRecords?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Schema: {metadata?.schema || "dubaifinance"}</div>
        </div>
      </div>

      {/* Export Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-[#081023]/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Export &amp; Download Local Backup
            </h2>
            <p className="text-xs text-slate-400">
              Generate an instant, complete offline snapshot of all system tables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* JSON Export Card */}
          <div className="p-5 rounded-2xl bg-[#060c1d] border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  <span>JSON Format (.json)</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
                  Direct DB Migration
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full relational dump preserving all primary keys, referral parent-child trees, decimal values, timestamps, and database metadata. Best for moving data to a new database instance.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadingFormat !== null}
                className="gold-btn w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                {downloadingFormat === "json" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating JSON Backup...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Excel Export Card */}
          <div className="p-5 rounded-2xl bg-[#060c1d] border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Excel Workbook (.xlsx)</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                  Multi-Sheet Spreadsheet
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive spreadsheet with individual dedicated sheets for <strong>Users, Contracts, Ledger, Deposits, Withdrawals, Configs, and Tickets</strong>. Human-readable and editable in Microsoft Excel or Google Sheets.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => handleDownload("excel")}
                disabled={downloadingFormat !== null}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                {downloadingFormat === "excel" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Excel Workbook...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel (.xlsx) Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restore / Import Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/20 bg-[#081023]/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Restore / Import Database from Backup
            </h2>
            <p className="text-xs text-slate-400">
              Upload an existing JSON or Excel backup file to restore records onto a new or current database.
            </p>
          </div>
        </div>

        {/* File Dropzone */}
        <div className="mt-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.xlsx,.xls"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-[#050b18]/80 rounded-2xl p-8 text-center cursor-pointer transition group"
            >
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 mx-auto mb-3 transition" />
              <div className="text-sm font-bold text-white">
                Click or Drag &amp; Drop Backup File Here
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Supports <strong>.json</strong> (JSON Backup) or <strong>.xlsx</strong> (Multi-Sheet Excel Workbook)
              </div>
              <div className="inline-block mt-4 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-bold border border-cyan-500/20">
                Select File
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#060c1d] border border-cyan-500/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white truncate max-w-sm">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull;{" "}
                      {previewLoading ? (
                        <span className="text-cyan-400">Analyzing file...</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          {previewData?.totalRecords || 0} records detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData(null);
                      setRestoreResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Preview Stats Breakdown */}
              {previewData && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Detected Tables &amp; Rows
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Users</span>
                      <strong className="text-amber-400">{previewData.counts.users}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Contracts</span>
                      <strong className="text-cyan-400">{previewData.counts.investmentContracts}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Ledgers</span>
                      <strong className="text-emerald-400">{previewData.counts.ledgerEntries}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Configs</span>
                      <strong className="text-purple-400">{previewData.counts.systemConfigs}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Select Restoration Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                      restoreMode === "merge"
                        ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === "merge"}
                      onChange={() => setRestoreMode("merge")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold block text-cyan-300">
                        Safe Upsert / Merge (Recommended)
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Updates existing user accounts and inserts missing records without deleting current data.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                      restoreMode === "replace"
                        ? "bg-rose-500/10 border-rose-500/50 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === "replace"}
                      onChange={() => setRestoreMode("replace")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold block text-rose-400">
                        Clean / Fresh Database Restore
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Wipes existing records first to cleanly import backup. Use when setting up a fresh database.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={restoring || previewLoading}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    restoreMode === "replace"
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20"
                  }`}
                >
                  {restoring ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Restoring Database...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Proceed to Restore ({restoreMode === "replace" ? "Clean Overwrite" : "Merge"})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Restore Result Alert */}
        {restoreResult && (
          <div
            className={`mt-6 p-5 rounded-2xl border ${
              restoreResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-sm mb-2">
              {restoreResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
              <span>{restoreResult.message}</span>
            </div>

            {restoreResult.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3">
                <div className="p-2 rounded bg-black/40">
                  Users Restored: <strong>{restoreResult.summary.users}</strong>
                </div>
                <div className="p-2 rounded bg-black/40">
                  Contracts Restored: <strong>{restoreResult.summary.contracts}</strong>
                </div>
                <div className="p-2 rounded bg-black/40">
                  Ledgers Restored: <strong>{restoreResult.summary.ledgers}</strong>
                </div>
                <div className="p-2 rounded bg-black/40">
                  Configs Restored: <strong>{restoreResult.summary.systemConfigs}</strong>
                </div>
              </div>
            )}

            {restoreResult.errors && restoreResult.errors.length > 0 && (
              <div className="mt-3 p-3 rounded bg-black/50 text-[11px] font-mono text-rose-300">
                <div className="font-bold mb-1">Encountered Errors:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {restoreResult.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <ShieldAlert className="w-7 h-7 text-amber-400 shrink-0" />
              <h3 className="font-display text-lg font-black text-white">
                Confirm Database Restoration
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You are about to restore <strong>{previewData?.totalRecords || 0} records</strong> from{" "}
              <code className="text-cyan-400 bg-black/40 px-1 py-0.5 rounded">{selectedFile?.name}</code>.
            </p>

            {restoreMode === "replace" ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 mb-4 space-y-2">
                <strong className="block text-rose-400 font-black">
                  WARNING: Clean Overwrite Mode Active
                </strong>
                <span>
                  This will completely remove existing database records before importing. To confirm this critical action, please type <strong>RESTORE</strong> below:
                </span>
                <input
                  type="text"
                  value={confirmReplaceText}
                  onChange={(e) => setConfirmReplaceText(e.target.value)}
                  placeholder="Type RESTORE"
                  className="w-full bg-[#050b18] border border-rose-500/40 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-400 mt-1"
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 mb-4">
                <strong>Safe Upsert Mode:</strong> Existing records will be updated and missing records will be inserted. No tables will be deleted.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={restoreMode === "replace" && confirmReplaceText.trim() !== "RESTORE"}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition ${
                  restoreMode === "replace"
                    ? "bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
                    : "bg-cyan-600 hover:bg-cyan-500"
                }`}
              >
                Confirm &amp; Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
