import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_SYSTEM_CONFIGS, invalidateConfigCache } from "@/lib/configService";
import { recordActivity } from "@/lib/auditLogger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch existing configs from DB
    const dbConfigs = await db.systemConfig.findMany();
    const configMap: Record<string, { value: string; description: string; category: string; updatedAt?: Date }> = {};

    // Populate with defaults
    for (const [key, item] of Object.entries(DEFAULT_SYSTEM_CONFIGS)) {
      configMap[key] = { ...item };
    }

    // Override with DB values
    for (const item of dbConfigs) {
      const def = DEFAULT_SYSTEM_CONFIGS[item.key];
      configMap[item.key] = {
        value: item.value,
        description: item.description || def?.description || "",
        category: def?.category || "general",
        updatedAt: item.updatedAt,
      };
    }

    // For branch admins: provide their isolated branch receiving address & QR
    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      const adminId = session.userId;
      const branchAddrItem = dbConfigs.find((item) => item.key === `ADMIN_DEPOSIT_ADDRESS_${adminId}`);
      const branchQrItem = dbConfigs.find((item) => item.key === `ADMIN_DEPOSIT_QR_${adminId}`);

      const adminUser = await db.user.findUnique({
        where: { id: adminId },
        select: { usdtAddress: true },
      });

      const effectiveAddr = branchAddrItem?.value || adminUser?.usdtAddress || configMap["COMPANY_USDT_ADDRESS"]?.value || "";
      const effectiveQr = branchQrItem?.value || configMap["COMPANY_USDT_QR"]?.value || "";

      if (configMap["COMPANY_USDT_ADDRESS"]) {
        configMap["COMPANY_USDT_ADDRESS"] = {
          ...configMap["COMPANY_USDT_ADDRESS"],
          value: effectiveAddr,
        };
      }
      if (configMap["COMPANY_USDT_QR"]) {
        configMap["COMPANY_USDT_QR"] = {
          ...configMap["COMPANY_USDT_QR"],
          value: effectiveQr,
        };
      }
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
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json(
        { error: "Access Denied. Admin authorization required to modify system configurations." },
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
      const stringVal = String(value).trim();

      // If a sub-admin is modifying the deposit wallet address or QR code,
      // save it to their isolated branch vault keys instead of overwriting the global platform vault!
      if (
        (session.role === "ADMIN" || session.role === "SUPER_ADMIN") &&
        (key === "COMPANY_USDT_ADDRESS" || key === "COMPANY_USDT_QR")
      ) {
        const branchKey = key === "COMPANY_USDT_ADDRESS"
          ? `ADMIN_DEPOSIT_ADDRESS_${session.userId}`
          : `ADMIN_DEPOSIT_QR_${session.userId}`;

        updates.push(
          db.systemConfig.upsert({
            where: { key: branchKey },
            update: { value: stringVal },
            create: {
              key: branchKey,
              value: stringVal,
              description: `Branch deposit vault for Admin ${session.userId}`,
            },
          })
        );

        if (key === "COMPANY_USDT_ADDRESS") {
          updates.push(
            db.user.update({
              where: { id: session.userId },
              data: { usdtAddress: stringVal },
            })
          );
        }
        continue;
      }

      const def = DEFAULT_SYSTEM_CONFIGS[key];
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

    await recordActivity({
      userId: session.userId,
      action: "SYSTEM_CONFIG_UPDATED",
      category: "ADMIN",
      description: `Updated system configurations: ${Object.keys(configs).join(", ")}`,
      req,
      metadata: { modifiedKeys: Object.keys(configs) },
    });

    return NextResponse.json({
      success: true,
      message: "System configurations successfully updated and applied in real-time.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/config error:", error);
    return NextResponse.json({ error: error.message || "Failed to save configurations" }, { status: 500 });
  }
}
