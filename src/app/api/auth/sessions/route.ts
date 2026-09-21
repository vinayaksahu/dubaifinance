import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/auditLogger";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query active and recent sessions for this user
    const sessions = await db.loginSession.findMany({
      where: {
        userId: session.userId,
        status: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const enriched = sessions.map((s) => ({
      ...s,
      isCurrent: session.sessionId ? s.id === session.sessionId : false,
    }));

    return NextResponse.json({
      success: true,
      sessions: enriched,
      currentSessionId: session.sessionId || null,
      activeCount: enriched.filter((s) => s.isActive).length,
    });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, sessionId } = body;

    if (action === "REVOKE") {
      if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
      }

      const target = await db.loginSession.findUnique({
        where: { id: sessionId },
      });

      if (!target) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Check permission: Owner or Super Root Admin
      if (target.userId !== session.userId && session.role !== "SUPER_ROOT_ADMIN") {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 });
      }

      await db.loginSession.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "TERMINATE_SESSION",
        category: "SECURITY",
        description: `Terminated session ${sessionId} (${target.device} - ${target.browser} on ${target.os})`,
        req,
        metadata: { targetSessionId: sessionId, targetUserId: target.userId },
      });

      return NextResponse.json({
        success: true,
        message: "Session terminated successfully.",
      });
    }

    if (action === "REVOKE_ALL_OTHERS") {
      const condition: any = {
        userId: session.userId,
        isActive: true,
      };

      if (session.sessionId) {
        condition.id = { not: session.sessionId };
      }

      const result = await db.loginSession.updateMany({
        where: condition,
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "TERMINATE_ALL_OTHER_SESSIONS",
        category: "SECURITY",
        description: `Logged out of ${result.count} other active device(s).`,
        req,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully logged out from ${result.count} other active device(s).`,
        count: result.count,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error managing session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update session" },
      { status: 500 }
    );
  }
}
