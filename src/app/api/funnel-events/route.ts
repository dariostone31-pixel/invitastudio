import { NextResponse } from "next/server";
import { listFunnelEvents, recordFunnelEvent, type FunnelEventRecord } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

const VALID_STEPS = new Set<FunnelEventRecord["step"]>([
  "step_1",
  "step_2",
  "step_3",
  "step_4",
  "generated",
]);

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
  }
  const events = await listFunnelEvents();
  return NextResponse.json({ events }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`funnel-post:${ip}`, 120, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = (await req.json()) as {
      sessionId?: string;
      source?: string;
      step?: string;
      category?: string;
      skinId?: string;
      utmSource?: string;
    };

    const step = String(body.step || "") as FunnelEventRecord["step"];
    if (!VALID_STEPS.has(step)) {
      return NextResponse.json({ error: "Paso inválido" }, { status: 400 });
    }
    const sessionId = String(body.sessionId || "").trim() || `anon-${Date.now()}`;
    const ev = await recordFunnelEvent({
      sessionId,
      source: String(body.source || "minitester"),
      step,
      category: typeof body.category === "string" ? body.category : undefined,
      skinId: typeof body.skinId === "string" ? body.skinId : undefined,
      utmSource: typeof body.utmSource === "string" ? body.utmSource : undefined,
    });
    return NextResponse.json({ ok: true, id: ev.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error registrando paso" }, { status: 500 });
  }
}
