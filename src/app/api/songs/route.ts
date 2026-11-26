import { NextResponse } from "next/server";
import { addDjSongRequest, getEventBySlug, voteDjSongRequest } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`songs-post:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas sugerencias seguidas. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const eventSlug = String(body.eventSlug || "").trim();
    const guestName = String(body.guestName || "").trim();
    const song = String(body.song || "").trim();

    if (!eventSlug || !guestName || !song) {
      return NextResponse.json(
        { error: "Ingresá tu nombre y la canción o artista que querés sumar." },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(eventSlug);
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }
    if (event.planId === "esencial") {
      return NextResponse.json(
        { error: "La playlist interactiva está disponible en Plan PRO y Llave en Mano." },
        { status: 403 }
      );
    }

    const item = await addDjSongRequest({ eventSlug, guestName, song });
    if (!item) {
      return NextResponse.json(
        { error: "No se pudo guardar la canción." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error procesando sugerencia musical" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`songs-vote:${ip}`, 40, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados votos seguidos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const eventSlug = String(body.eventSlug || "").trim();
    const songId = String(body.songId || "").trim();
    const fallbackSong = body.fallbackSong ? String(body.fallbackSong) : undefined;
    const fallbackGuest = body.fallbackGuest ? String(body.fallbackGuest) : undefined;

    if (!eventSlug || !songId) {
      return NextResponse.json({ error: "Faltan datos para votar." }, { status: 400 });
    }

    const updated = await voteDjSongRequest({
      eventSlug,
      songId,
      fallbackSong,
      fallbackGuest,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo registrar el voto." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, item: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error votando canción" }, { status: 500 });
  }
}
