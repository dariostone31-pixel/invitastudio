import { NextResponse } from "next/server";
import { getDbMode } from "@/lib/db";

export async function GET() {
  const storageConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );

  return NextResponse.json({
    ok: true,
    dbMode: getDbMode(),
    storageMode: storageConfigured ? "supabase" : "local",
    mercadopagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN?.trim()),
    timestamp: new Date().toISOString(),
  });
}
