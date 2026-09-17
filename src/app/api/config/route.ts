import { NextResponse } from "next/server";
import { getAllSystemConfigs } from "@/lib/configService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await getAllSystemConfigs();

    // Return public configurations (exclude nothing sensitive since these are public platform rules)
    return NextResponse.json({
      configs: all,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
