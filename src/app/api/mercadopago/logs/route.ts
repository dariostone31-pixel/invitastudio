import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { listMpWebhookLogs } from "@/lib/db";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const logs = await listMpWebhookLogs(50);
  return NextResponse.json({ ok: true, logs }, { headers: { "Cache-Control": "no-store" } });
}
