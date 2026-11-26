import { NextResponse } from "next/server";
import { addRsvp, getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rlGet = checkRateLimit(`rsvp-get:${ip}`, 40, 5 * 60_000);
  if (!rlGet.allowed) {
    return NextResponse.json(
      { error: "Demasiadas consultas seguidas." },
      { status: 429, headers: { "Retry-After": String(rlGet.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const panelToken =
    req.headers.get("x-panel-token") || searchParams.get("panelToken");

  if (!slug) {
    return NextResponse.json({ error: "Falta el parámetro slug" }, { status: 400 });
  }
  if (!panelToken) {
    return NextResponse.json(
      { error: "Acceso privado: se requiere el token del organizador" },
      { status: 401 }
    );
  }

  const event = await getEventByPanelToken(panelToken);
  if (!event || event.slug !== slug) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rsvps = await listRsvpsForSlug(slug);
  return NextResponse.json({ rsvps }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rlPost = checkRateLimit(`rsvp-post:${ip}`, 30, 10 * 60_000);
  if (!rlPost.allowed) {
    return NextResponse.json(
      { error: "Demasiadas confirmaciones desde esta conexión. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rlPost.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const { eventSlug, guestName, attending, passesUsed, companions, dietary, song, message } = body;

    if (!eventSlug || !guestName || typeof guestName !== "string" || !guestName.trim()) {
      return NextResponse.json(
        { error: "Nombre del invitado y evento son obligatorios" },
        { status: 400 }
      );
    }

    const { rsvp, updated } = await addRsvp({
      eventSlug: String(eventSlug),
      guestName: String(guestName),
      attending: Boolean(attending),
      passesUsed: Number(passesUsed) || 1,
      companions: companions ? String(companions) : "",
      dietary: Array.isArray(dietary) ? dietary.map(String) : [],
      song: song ? String(song) : "",
      message: message ? String(message) : "",
    });

    return NextResponse.json({ ok: true, rsvp, updated }, { status: updated ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: "Error procesando confirmación" }, { status: 500 });
  }
}
