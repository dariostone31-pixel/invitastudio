import { NextResponse } from "next/server";
import { addRsvp, listRsvpsForSlug } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Falta el parámetro slug" }, { status: 400 });
  }
  const rsvps = await listRsvpsForSlug(slug);
  return NextResponse.json({ rsvps });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventSlug, guestName, attending, passesUsed, companions, dietary, song, message } = body;

    if (!eventSlug || !guestName || typeof guestName !== "string") {
      return NextResponse.json(
        { error: "Nombre del invitado y evento son obligatorios" },
        { status: 400 }
      );
    }

    const record = await addRsvp({
      eventSlug: String(eventSlug),
      guestName: String(guestName),
      attending: Boolean(attending),
      passesUsed: Number(passesUsed) || 1,
      companions: companions ? String(companions) : "",
      dietary: Array.isArray(dietary) ? dietary.map(String) : [],
      song: song ? String(song) : "",
      message: message ? String(message) : "",
    });

    return NextResponse.json({ ok: true, rsvp: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error procesando confirmación" }, { status: 500 });
  }
}
