import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportDatabaseAsJson, exportDatabaseAsExcel, getFullDatabaseDump } from "@/lib/backupService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const infoOnly = searchParams.get("info") === "true";

    // If requesting summary info for dashboard preview
    if (infoOnly) {
      const dump = await getFullDatabaseDump();
      return NextResponse.json({
        metadata: dump.metadata,
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    if (format === "excel") {
      const buffer = await exportDatabaseAsExcel();
      const filename = `dubaifinance_db_backup_${timestamp}.xlsx`;

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // Default: JSON backup
    const jsonStr = await exportDatabaseAsJson();
    const filename = `dubaifinance_db_backup_${timestamp}.json`;

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[Backup Export Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate database backup" },
      { status: 500 }
    );
  }
}
