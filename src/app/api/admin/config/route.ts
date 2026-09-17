import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_SYSTEM_CONFIGS, invalidateConfigCache } from "@/lib/configService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch existing configs from DB
    const dbConfigs = await db.systemConfig.findMany();
    const configMap: Record<string, { value: string; description: string; category: string; updatedAt?: Date }> = {};

    // Prune deprecated keys from database automatically
    const deprecatedKeys = dbConfigs.filter((item) => !DEFAULT_SYSTEM_CONFIGS[item.key]).map((item) => item.key);
    if (deprecatedKeys.length > 0) {
      await db.systemConfig.deleteMany({ where: { key: { in: deprecatedKeys } } }).catch(() => {});
    }

    // Populate with defaults
    for (const [key, item] of Object.entries(DEFAULT_SYSTEM_CONFIGS)) {
      configMap[key] = { ...item };
    }

    // Override with DB values for defined keys only
    for (const item of dbConfigs) {
      const def = DEFAULT_SYSTEM_CONFIGS[item.key];
      if (!def) continue; // Skip deprecated configs like USDT_TO_INR_RATE
      configMap[item.key] = {
        value: item.value,
        description: item.description || def?.description || "",
        category: def?.category || "general",
        updatedAt: item.updatedAt,
      };
    }

    return NextResponse.json({ configs: configMap });
  } catch (error: any) {
    console.error("GET /api/admin/config error:", error);
    return NextResponse.json({ error: error.message || "Failed to load configurations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json(
        { error: "Access Denied. Only Super Administrator or Super Root Administrator can modify system configurations." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { configs } = body;

    if (!configs || typeof configs !== "object") {
      return NextResponse.json({ error: "Invalid configs payload" }, { status: 400 });
    }

    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(configs)) {
      const def = DEFAULT_SYSTEM_CONFIGS[key];
      const stringVal = String(value).trim();

      updates.push(
        db.systemConfig.upsert({
          where: { key },
          update: { value: stringVal },
          create: {
            key,
            value: stringVal,
            description: def?.description || "",
          },
        })
      );
    }

    await Promise.all(updates);
    invalidateConfigCache();

    return NextResponse.json({
      success: true,
      message: "System configurations successfully updated and applied in real-time.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/config error:", error);
    return NextResponse.json({ error: error.message || "Failed to save configurations" }, { status: 500 });
  }
}
