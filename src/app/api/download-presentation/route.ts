import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const themeParam = searchParams.get("theme");
  const isLight = themeParam?.toLowerCase() === "light";
  const theme = isLight ? "Light" : "Dark";
  const fileName = `Dubai_Finance_Presentation_${theme}.pdf`;
  const filePath = path.join(process.cwd(), "public", fileName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Presentation file not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
