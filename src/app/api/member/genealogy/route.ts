import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export interface TreeNodeData {
  id: string;
  customId: string;
  name: string;
  username: string;
  status: "ACTIVE" | "INACTIVE";
  activeInvestment: number;
  directTeamCount: number;
  totalTeamCount: number;
  level: number;
  isYou?: boolean;
  joinDate: string;
  doa: string;
  sponsorCustomId?: string;
  children: TreeNodeData[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("rootId") || session.userId;

    // 1. Fetch current logged-in user
    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        sponsor: { select: { customId: true, fullName: true } },
        contracts: {
          where: { status: "ACTIVE" },
          select: { amountInInr: true, amountInUsdt: true },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Helper to calculate active investment in USDT
    const calcInvestment = (contracts: { amountInInr?: any; amountInUsdt?: any }[]) => {
      return contracts.reduce((acc, c) => {
        const usdt = c.amountInUsdt != null
          ? Number(c.amountInUsdt.toString())
          : (Number(c.amountInInr?.toString() || 0) > 5000 ? Number(c.amountInInr) / 110 : Number(c.amountInInr?.toString() || 0));
        return acc + usdt;
      }, 0);
    };

    // Recursive function to build downline tree up to maxLevel
    async function buildTree(userId: string, level: number, maxLevel = 6): Promise<TreeNodeData[]> {
      if (level > maxLevel) return [];

      const directs = await db.user.findMany({
        where: { sponsorId: userId },
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          status: true,
          createdAt: true,
          sponsor: { select: { customId: true } },
          contracts: {
            where: { status: "ACTIVE" },
            select: { amountInInr: true, amountInUsdt: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const childrenNodes: TreeNodeData[] = [];

      for (const d of directs) {
        const inv = calcInvestment(d.contracts);
        const subChildren = await buildTree(d.id, level + 1, maxLevel);
        const joinDateStr = new Date(d.createdAt).toISOString().split("T")[0];

        // Total team count in subtree
        const countSubtree = (nodes: TreeNodeData[]): number => {
          return nodes.reduce((sum, n) => sum + 1 + countSubtree(n.children), 0);
        };

        const totalTeam = countSubtree(subChildren);

        childrenNodes.push({
          id: d.id,
          customId: d.customId,
          name: d.fullName,
          username: `@${d.email ? d.email.split("@")[0] : d.customId.toLowerCase()}`,
          status: inv > 0 || d.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
          activeInvestment: inv,
          directTeamCount: subChildren.length,
          totalTeamCount: totalTeam,
          level,
          isYou: false,
          joinDate: joinDateStr,
          doa: inv > 0 ? joinDateStr : "-",
          sponsorCustomId: d.sponsor?.customId || "-",
          children: subChildren,
        });
      }

      return childrenNodes;
    }

    // Determine root user
    let rootUser = currentUser;
    if (targetUserId !== session.userId) {
      const found = await db.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          sponsor: { select: { customId: true, fullName: true } },
          contracts: {
            where: { status: "ACTIVE" },
            select: { amountInInr: true, amountInUsdt: true },
          },
        },
      });
      if (found) rootUser = found;
    }

    const rootInv = calcInvestment(rootUser.contracts);
    const rootChildren = await buildTree(rootUser.id, 1, 6);

    const countAllNodes = (nodes: TreeNodeData[]): { total: number; active: number; inactive: number; totalInv: number } => {
      let total = 0;
      let active = 0;
      let inactive = 0;
      let totalInv = 0;

      for (const node of nodes) {
        total++;
        if (node.status === "ACTIVE") active++;
        else inactive++;
        totalInv += node.activeInvestment;

        const sub = countAllNodes(node.children);
        total += sub.total;
        active += sub.active;
        inactive += sub.inactive;
        totalInv += sub.totalInv;
      }

      return { total, active, inactive, totalInv };
    };

    const treeStats = countAllNodes(rootChildren);
    const rootJoinDate = new Date(rootUser.createdAt).toISOString().split("T")[0];

    const rootNode: TreeNodeData = {
      id: rootUser.id,
      customId: rootUser.customId,
      name: `${rootUser.fullName} (You)`,
      username: `@${rootUser.email ? rootUser.email.split("@")[0] : rootUser.customId.toLowerCase()}`,
      status: rootInv > 0 || rootUser.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      activeInvestment: rootInv,
      directTeamCount: rootChildren.length,
      totalTeamCount: treeStats.total,
      level: 0,
      isYou: true,
      joinDate: rootJoinDate,
      doa: rootInv > 0 ? rootJoinDate : "-",
      sponsorCustomId: rootUser.sponsor?.customId,
      children: rootChildren,
    };

    return NextResponse.json({
      success: true,
      root: rootNode,
      stats: {
        totalMembers: treeStats.total + 1,
        activeMembers: treeStats.active + (rootNode.status === "ACTIVE" ? 1 : 0),
        inactiveMembers: treeStats.inactive + (rootNode.status === "INACTIVE" ? 1 : 0),
        directTeamCount: rootChildren.length,
        totalNetworkInvestment: treeStats.totalInv + rootInv,
      },
    });
  } catch (error: any) {
    console.error("[Genealogy API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch genealogy tree" },
      { status: 500 }
    );
  }
}
