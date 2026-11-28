import { NextResponse } from "next/server";
import { getDbMode } from "@/lib/db";
import { cleanMpSecret } from "@/lib/mpSignature";

export async function GET() {
  const storageConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
  const cleanedSecret = cleanMpSecret(process.env.MP_WEBHOOK_SECRET);

  return NextResponse.json({
    ok: true,
    dbMode: getDbMode(),
    storageMode: storageConfigured ? "supabase" : "local",
    mercadopagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN?.trim()),
    webhookSecretConfigured: cleanedSecret.length > 0,
    webhookSecretLength: cleanedSecret.length,
    timestamp: new Date().toISOString(),
  });
}
