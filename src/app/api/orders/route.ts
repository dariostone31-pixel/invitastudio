import { NextResponse } from "next/server";
import { createOrderEvent, listEvents, listRsvpsForSlug } from "@/lib/db";
import { BUSINESS_CONFIG } from "@/config/business";

export async function GET(req: Request) {
  const pass = req.headers.get("x-admin-pass") || new URL(req.url).searchParams.get("pass");
  if (pass !== BUSINESS_CONFIG.adminPasscode) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rawEvents = await listEvents();
  const events = await Promise.all(
    rawEvents.map(async (ev) => ({
      ...ev,
      rsvpCount: (await listRsvpsForSlug(ev.slug)).length,
    }))
  );

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      skinId,
      planId,
      eventTitle,
      eventDate,
      eventTime,
      venue,
      address,
      alias,
      dressCode,
      heroImageUrl,
      galleryImages,
      contactName,
      whatsapp,
      email,
      notes,
    } = body;

    if (!eventTitle || !contactName || !whatsapp || !email) {
      return NextResponse.json(
        { error: "Completá los campos obligatorios del evento y contacto" },
        { status: 400 }
      );
    }

    const validPlan = planId === "esencial" || planId === "pro" || planId === "asistido" ? planId : "pro";

    const created = await createOrderEvent({
      skinId: String(skinId || "boda-sobre-marfil"),
      planId: validPlan,
      eventTitle: String(eventTitle),
      eventDate: String(eventDate || ""),
      eventTime: String(eventTime || ""),
      venue: String(venue || "Salón a confirmar"),
      address: String(address || ""),
      alias: String(alias || ""),
      dressCode: String(dressCode || ""),
      heroImageUrl: heroImageUrl ? String(heroImageUrl) : undefined,
      galleryImages: Array.isArray(galleryImages) ? galleryImages.map(String) : undefined,
      contactName: String(contactName),
      whatsapp: String(whatsapp),
      email: String(email),
      notes: String(notes || ""),
    });

    return NextResponse.json({ ok: true, order: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 });
  }
}
