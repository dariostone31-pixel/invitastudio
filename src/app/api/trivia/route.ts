import { NextResponse } from "next/server";
import { addTriviaScore, getEventBySlug } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventSlug = String(body.eventSlug || "").trim();
    const guestName = String(body.guestName || "").trim();
    const score = Number(body.score);
    const total = Number(body.total);

    if (!eventSlug || !guestName || Number.isNaN(score) || Number.isNaN(total)) {
      return NextResponse.json(
        { error: "Ingresá tu nombre para guardar tu puntaje en el podio." },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(eventSlug);
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }
    if (event.planId !== "asistido") {
      return NextResponse.json(
        { error: "La Mini-Trivia está disponible exclusivamente en Plan Llave en Mano." },
        { status: 403 }
      );
    }

    const item = await addTriviaScore({ eventSlug, guestName, score, total });
    if (!item) {
      return NextResponse.json({ error: "No se pudo guardar el puntaje." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error guardando puntaje" }, { status: 500 });
  }
}
