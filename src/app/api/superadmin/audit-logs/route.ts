import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Super Administrator access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const action = searchParams.get("action");
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.trim() || "";
    const timeframe = searchParams.get("timeframe") || "all";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit") || 50)));
    const skip = (page - 1) * limit;

    // Date range filter
    let dateFilter: any = undefined;
    const now = new Date();
    if (timeframe === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      dateFilter = { gte: startOfDay };
    } else if (timeframe === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: sevenDaysAgo };
    } else if (timeframe === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: thirtyDaysAgo };
    }

    // Build User Filter
    const userWhere: any = {};
    if (adminId && adminId !== "all") {
      // Targets the admin AND all of that admin's team members
      userWhere.OR = [
        { id: adminId },
        { adminId: adminId },
      ];
    } else if (userId) {
      userWhere.id = userId;
    }

    if (role && role !== "all") {
      userWhere.role = role;
    }

    // Filter by search query on User
    const userSelect = {
      id: true,
      customId: true,
      fullName: true,
      email: true,
      role: true,
      teamPrefix: true,
      adminId: true,
      assignedAdmin: {
        select: {
          customId: true,
          fullName: true,
          teamPrefix: true,
        },
      },
    };

    // 1. Fetch Login Sessions
    const sessionWhere: any = {};
    if (Object.keys(userWhere).length > 0) {
      sessionWhere.user = userWhere;
    }
    if (dateFilter) {
      sessionWhere.createdAt = dateFilter;
    }
    if (search) {
      sessionWhere.OR = [
        { ipAddress: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { browser: { contains: search, mode: "insensitive" } },
        { os: { contains: search, mode: "insensitive" } },
        { user: { customId: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // 2. Fetch Activity Logs
    const activityWhere: any = {};
    if (Object.keys(userWhere).length > 0) {
      activityWhere.user = userWhere;
    }
    if (dateFilter) {
      activityWhere.createdAt = dateFilter;
    }
    if (category && category !== "all") {
      activityWhere.category = category;
    }
    if (action && action !== "all") {
      activityWhere.action = action;
    }
    if (search) {
      activityWhere.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { user: { customId: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [
      sessions,
      totalSessions,
      activities,
      totalActivities,
      adminsList,
      desktopCount,
      mobileCount,
      tabletCount,
    ] = await Promise.all([
      db.loginSession.findMany({
        where: sessionWhere,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.loginSession.count({ where: sessionWhere }),
      db.activityLog.findMany({
        where: activityWhere,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.activityLog.count({ where: activityWhere }),
      db.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          role: true,
          teamPrefix: true,
          _count: { select: { teamMembers: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.loginSession.count({ where: { device: "Desktop" } }),
      db.loginSession.count({ where: { device: "Mobile" } }),
      db.loginSession.count({ where: { device: "Tablet" } }),
    ]);

    return NextResponse.json({
      sessions,
      totalSessions,
      activities,
      totalActivities,
      adminsList,
      currentSessionId: session.sessionId || null,
      stats: {
        totalSessions,
        totalActivities,
        desktopCount,
        mobileCount,
        tabletCount,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(Math.max(totalSessions, totalActivities) / limit),
      },
    });
  } catch (error: any) {
    console.error("[SuperAdmin Audit Logs API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Super Administrator access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, sessionId, userId } = body;

    if (action === "TERMINATE_SESSION") {
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
      }

      await db.loginSession.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Device session terminated successfully.",
      });
    }

    if (action === "TERMINATE_ALL_OTHER_SESSIONS") {
      const targetUserId = userId || session.userId;
      const condition: any = {
        userId: targetUserId,
        isActive: true,
      };

      if (session.sessionId && targetUserId === session.userId) {
        condition.id = { not: session.sessionId };
      }

      const res = await db.loginSession.updateMany({
        where: condition,
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Terminated ${res.count} active session(s).`,
        count: res.count,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[SuperAdmin Terminate Session Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to terminate session" },
      { status: 500 }
    );
  }
}
