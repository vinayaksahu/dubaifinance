import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseExcelBackup, restoreDatabaseData, DatabaseBackupPayload } from "@/lib/backupService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json(
        { error: "Access denied. Admin authorization required to restore database backups." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) || "merge";
    const isPreview = formData.get("preview") === "true";

    if (!file) {
      return NextResponse.json({ error: "No backup file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedData: DatabaseBackupPayload["data"];

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      extractedData = parseExcelBackup(buffer);
    } else if (fileName.endsWith(".json")) {
      const text = buffer.toString("utf-8");
      const parsed = JSON.parse(text);
      if (parsed.data && typeof parsed.data === "object") {
        extractedData = parsed.data;
      } else {
        extractedData = parsed;
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a .json or .xlsx backup file." },
        { status: 400 }
      );
    }

    // Calculate preview counts
    const previewCounts = {
      users: extractedData.users?.length || 0,
      systemConfigs: extractedData.systemConfigs?.length || 0,
      investmentContracts: extractedData.investmentContracts?.length || 0,
      ledgerEntries: extractedData.ledgerEntries?.length || 0,
      depositRequests: extractedData.depositRequests?.length || 0,
      withdrawalRequests: extractedData.withdrawalRequests?.length || 0,
      supportTickets: extractedData.supportTickets?.length || 0,
      queuePositions: extractedData.queuePositions?.length || 0,
    };

    const totalRecords = Object.values(previewCounts).reduce((a, b) => a + b, 0);

    if (totalRecords === 0) {
      return NextResponse.json(
        { error: "The uploaded file does not contain recognized Dubai Finance database tables." },
        { status: 400 }
      );
    }

    // If only preview was requested
    if (isPreview) {
      return NextResponse.json({
        success: true,
        fileName: file.name,
        totalRecords,
        counts: previewCounts,
      });
    }

    // Execute actual restore
    const restoreResult = await restoreDatabaseData(
      extractedData,
      mode === "replace" ? "replace" : "merge"
    );

    return NextResponse.json({
      ...restoreResult,
      fileName: file.name,
      mode,
    });
  } catch (error: any) {
    console.error("[Backup Restore Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process database restore" },
      { status: 500 }
    );
  }
}
