"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Sparkles,
  Info,
  X,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { TreeNodeData } from "@/app/api/member/genealogy/route";

interface GenealogyTreeViewProps {
  user: any;
  onNavigateTab?: (tab: string) => void;
}

// Default sample data matching the exact screenshot when user preview is requested
const SAMPLE_TREE_DATA: TreeNodeData = {
  id: "root-1",
  customId: "DF000001",
  name: "Adam Smith (You)",
  username: "@adam",
  status: "ACTIVE",
  activeInvestment: 57.0,
  directTeamCount: 5,
  totalTeamCount: 6,
  level: 0,
  isYou: true,
  joinDate: "2026-07-01",
  doa: "2026-07-01",
  children: [
    {
      id: "child-1",
      customId: "DF100001",
      name: "Bob Johnson",
      username: "@bob",
      status: "ACTIVE",
      activeInvestment: 50.0,
      directTeamCount: 1,
      totalTeamCount: 1,
      level: 1,
      isYou: false,
      joinDate: "2026-07-10",
      doa: "2026-07-10",
      sponsorCustomId: "DF000001",
      children: [
        {
          id: "subchild-1",
          customId: "DF200001",
          name: "David Lee",
          username: "@david",
          status: "INACTIVE",
          activeInvestment: 0.0,
          directTeamCount: 0,
          totalTeamCount: 0,
          level: 2,
          isYou: false,
          joinDate: "2026-08-01",
          doa: "-",
          sponsorCustomId: "DF100001",
          children: [],
        },
      ],
    },
    {
      id: "child-2",
      customId: "DF100002",
      name: "Charles Brown",
      username: "@charles",
      status: "INACTIVE",
      activeInvestment: 0.0,
      directTeamCount: 0,
      totalTeamCount: 0,
      level: 1,
      isYou: false,
      joinDate: "2026-07-15",
      doa: "-",
      sponsorCustomId: "DF000001",
      children: [],
    },
    {
      id: "child-3",
      customId: "DF100003",
      name: "Eve Wilson",
      username: "@eve",
      status: "ACTIVE",
      activeInvestment: 50.0,
      directTeamCount: 0,
      totalTeamCount: 0,
      level: 1,
      isYou: false,
      joinDate: "2026-07-20",
      doa: "2026-07-20",
      sponsorCustomId: "DF000001",
      children: [],
    },
    {
      id: "child-4",
      customId: "DF100004",
      name: "Kamlesh kumar...",
      username: "@kam7398",
      status: "ACTIVE",
      activeInvestment: 5.0,
      directTeamCount: 0,
      totalTeamCount: 0,
      level: 1,
      isYou: false,
      joinDate: "2026-08-02",
      doa: "2026-08-02",
      sponsorCustomId: "DF000001",
      children: [],
    },
  ],
};

export function GenealogyTreeView({ user, onNavigateTab }: GenealogyTreeViewProps) {
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useSampleData, setUseSampleData] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [rootFocusId, setRootFocusId] = useState<string | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real downline tree from backend API
  const fetchTree = async (rootId?: string) => {
    try {
      setLoading(true);
      const url = rootId ? `/api/member/genealogy?rootId=${rootId}` : `/api/member/genealogy`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tree");
      const data = await res.json();

      if (data.root) {
        setTreeData(data.root);
        setStats(data.stats);

        // Auto-switch to sample preview if the user has 0 direct members
        if (data.root.children.length === 0) {
          setUseSampleData(true);
        } else {
          setUseSampleData(false);
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback to sample data for smooth experience
      setTreeData(SAMPLE_TREE_DATA);
      setUseSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree(rootFocusId || undefined);
  }, [rootFocusId]);

  // Active data being viewed
  const activeTree: TreeNodeData = useSampleData ? SAMPLE_TREE_DATA : (treeData || SAMPLE_TREE_DATA);

  // Toggle Collapse / Expand
  const toggleCollapse = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    setCollapsedNodes({});
  };

  const handleCollapseAll = () => {
    const coll: Record<string, boolean> = {};
    const traverse = (node: TreeNodeData) => {
      if (node.children && node.children.length > 0) {
        coll[node.id] = true;
        node.children.forEach(traverse);
      }
    };
    if (activeTree) traverse(activeTree);
    setCollapsedNodes(coll);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.55));
  const handleResetZoom = () => setZoomLevel(1);

  // Focus on node (drill-down)
  const handleFocusNode = (node: TreeNodeData) => {
    if (node.id === activeTree.id) return;
    setFocusHistory((prev) => [...prev, activeTree.id]);
    setRootFocusId(node.id);
    setSelectedNode(null);
  };

  const handleBackToRoot = () => {
    setRootFocusId(null);
    setFocusHistory([]);
    setSelectedNode(null);
  };

  // Copy referral link
  const copyReferral = () => {
    const origin =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? window.location.origin
        : "https://dubaifinance.online";
    const refUrl = `${origin}/register?r=${user?.customId || "DF000001"}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Search filter helper
  const isNodeMatching = (node: TreeNodeData): boolean => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      node.name.toLowerCase().includes(term) ||
      node.username.toLowerCase().includes(term) ||
      node.customId.toLowerCase().includes(term)
    );
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNodeData, isRoot = false) => {
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const hasChildren = node.children && node.children.length > 0;
    const isMatched = isNodeMatching(node);

    // Apply status filter to children if needed
    const visibleChildren = node.children.filter((child) => {
      if (statusFilter === "ALL") return true;
      return child.status === statusFilter;
    });

    return (
      <div key={node.id} className="flex flex-col items-center select-none">
        {/* The Node Card */}
        {isRoot ? (
          /* ROOT NODE (You) */
          <div
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer transition-all duration-200 relative group w-64 rounded-2xl p-4 sm:p-5 bg-[#0b1325] border-2 ${
              isMatched
                ? "border-amber-400 ring-4 ring-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.35)]"
                : "border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.28)]"
            } hover:scale-[1.02]`}
          >
            {/* Header: Name + Badge */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-slate-100 font-bold text-sm sm:text-[15px] truncate">
                {node.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  node.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {node.status}
              </span>
            </div>

            {/* Username / Handle */}
            <p className="text-slate-400 text-xs font-mono mb-3">
              {node.username}
            </p>

            {/* Separator */}
            <div className="border-t border-[#1a2d52] my-2" />

            {/* Stats */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Investment:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  ${node.activeInvestment.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Team:</span>
                <span className="text-indigo-300 font-semibold">
                  {node.directTeamCount} Members
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* CHILD NODE */
          <div
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer transition-all duration-200 relative group w-56 rounded-xl p-3.5 sm:p-4 bg-[#0c1527] border ${
              isMatched
                ? "border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                : "border-slate-800 hover:border-indigo-500/60 shadow-lg"
            } hover:scale-[1.02]`}
          >
            {/* Header: Name + Badge */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-slate-100 font-bold text-xs sm:text-sm truncate">
                {node.name}
              </h4>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                  node.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {node.status}
              </span>
            </div>

            {/* Username */}
            <p className="text-slate-400 text-[11px] font-mono mb-2">
              {node.username}
            </p>

            {/* Separator */}
            <div className="border-t border-slate-800/80 my-2" />

            {/* Investment Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Investment:</span>
              <span
                className={`font-bold font-mono ${
                  node.activeInvestment > 0 ? "text-emerald-400" : "text-emerald-400"
                }`}
              >
                ${node.activeInvestment.toFixed(2)}
              </span>
            </div>

            {/* Expand / Collapse Button (Only shown if member has children) */}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleCollapse(node.id, e)}
                className="w-full mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isCollapsed ? (
                  <>
                    <span>▼ Expand ({node.children.length})</span>
                  </>
                ) : (
                  <>
                    <span>▲ Collapse ({node.children.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Connector Line Below Node if it has children and is expanded */}
        {hasChildren && !isCollapsed && visibleChildren.length > 0 && (
          <>
            {/* Vertical trunk line going down from current node */}
            <div className="w-[1.5px] h-7 bg-indigo-500/60" />

            {/* Children container with horizontal branch line */}
            <div className="relative flex justify-center">
              {/* Horizontal line across children */}
              {visibleChildren.length > 1 && (
                <div
                  className="absolute top-0 h-[1.5px] bg-indigo-500/60"
                  style={{
                    left: `${100 / (visibleChildren.length * 2)}%`,
                    right: `${100 / (visibleChildren.length * 2)}%`,
                  }}
                />
              )}

              {/* Children Nodes Columns */}
              <div className="flex gap-5 sm:gap-7 items-start">
                {visibleChildren.map((child, index) => (
                  <div key={child.id} className="flex flex-col items-center">
                    {/* Vertical drop line down into child card */}
                    <div className="w-[1.5px] h-7 bg-indigo-500/60" />
                    {renderTreeNode(child, false)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" />
            <span>Genealogy Tree</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual downline network & referral team hierarchy
          </p>
        </div>

        {/* Breadcrumb / Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#091124] border border-[#17274a] p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-direct")}
            className="px-3 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            Direct Team
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-team")}
            className="px-3 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            Team List
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Network</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            {useSampleData ? 6 : stats?.totalMembers ?? 1}
          </p>
        </div>

        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Members
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {useSampleData ? 4 : stats?.activeMembers ?? (activeTree.status === "ACTIVE" ? 1 : 0)}
          </p>
        </div>

        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Inactive Members
            </span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {useSampleData ? 2 : stats?.inactiveMembers ?? 0}
          </p>
        </div>

        <div className="bg-[#091124] border border-[#17274a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 font-medium">Direct Team</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {useSampleData ? 5 : activeTree.directTeamCount}
          </p>
        </div>
      </div>

      {/* Main Interactive Tree Container */}
      <div className="bg-[#080d1a] border border-[#17274a] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[580px]">
        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#142344] shrink-0">
          {/* Left: Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <input
                type="text"
                placeholder="Search member (@name or ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d172e] border border-[#1d3159] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-[#0d172e] border border-[#1d3159] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "ALL"
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-rose-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-rose-300"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Right: Actions, Expand/Collapse, Zoom & Sample Toggle */}
          <div className="flex items-center gap-2">
            {/* Back to Root button when focused */}
            {rootFocusId && (
              <button
                type="button"
                onClick={handleBackToRoot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Reset to You</span>
              </button>
            )}

            {/* Expand / Collapse All */}
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand All Nodes"
              className="p-1.5 rounded-xl bg-[#0d172e] border border-[#1d3159] text-slate-300 hover:text-white hover:bg-[#132244] text-xs font-medium flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              title="Collapse All Nodes"
              className="p-1.5 rounded-xl bg-[#0d172e] border border-[#1d3159] text-slate-300 hover:text-white hover:bg-[#132244] text-xs font-medium flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Collapse All</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-[#0d172e] border border-[#1d3159] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#15254b] transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-300 font-semibold select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#15254b] transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-[#15254b] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sample / Live Tree Toggle */}
            <button
              type="button"
              onClick={() => setUseSampleData(!useSampleData)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                useSampleData
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-[#0d172e] text-slate-300 border border-[#1d3159] hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{useSampleData ? "Demo Preview (On)" : "Show Demo Preview"}</span>
            </button>
          </div>
        </div>

        {/* Tree Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-auto p-6 sm:p-8 flex justify-center items-start scrollbar-thin scrollbar-thumb-[#1d3159]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-72 gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Loading Tree Hierarchy...
              </p>
            </div>
          ) : (
            <div
              className="transition-transform duration-200 origin-top flex justify-center py-2"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              {renderTreeNode(activeTree, true)}
            </div>
          )}
        </div>

        {/* Bottom Legend & Quick Tip */}
        <div className="mt-4 pt-3 border-t border-[#142344] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300" />
              <span className="text-slate-300 font-medium">Active Member</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400" />
              <span className="text-slate-300 font-medium">Inactive Member</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-400" />
              <span className="text-slate-300 font-medium">Root Node (You)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Click on any member card to view detailed performance profile.</span>
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1429] border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
                {selectedNode.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">
                    {selectedNode.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedNode.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>
                <p className="text-xs text-indigo-400 font-mono">
                  {selectedNode.username} • ID: {selectedNode.customId}
                </p>
              </div>
            </div>

            {/* Detail Rows */}
            <div className="bg-[#070e20] border border-[#1a2d52] rounded-2xl p-4 space-y-2.5 text-xs mb-6">
              <div className="flex items-center justify-between py-1 border-b border-[#142344]">
                <span className="text-slate-400">Custom User ID</span>
                <span className="font-mono font-bold text-slate-200">{selectedNode.customId}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#142344]">
                <span className="text-slate-400">Active Investment</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${selectedNode.activeInvestment.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#142344]">
                <span className="text-slate-400">Direct Team</span>
                <span className="font-bold text-indigo-300">
                  {selectedNode.directTeamCount} Members
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#142344]">
                <span className="text-slate-400">Total Downline</span>
                <span className="font-bold text-slate-200">
                  {selectedNode.totalTeamCount} Members
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#142344]">
                <span className="text-slate-400">Join Date</span>
                <span className="text-slate-300">{selectedNode.joinDate || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Sponsor ID</span>
                <span className="font-mono text-slate-300">{selectedNode.sponsorCustomId || "-"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!selectedNode.isYou && (
                <button
                  type="button"
                  onClick={() => handleFocusNode(selectedNode)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Focus Tree View</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0d1a36] border border-[#1d335e] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
