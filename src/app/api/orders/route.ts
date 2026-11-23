import { NextResponse } from "next/server";
import { createOrderEvent, listEvents, listRsvpsForSlug } from "@/lib/db";
import { verifyAdminPass } from "@/lib/adminAuth";
import { LEGAL_VERSION } from "@/config/legal";

export async function GET(req: Request) {
  const pass = req.headers.get("x-admin-pass") || new URL(req.url).searchParams.get("pass");
  const auth = verifyAdminPass(pass);
  if (!auth.ok) {
    return NextResponse.json(
      {
        error:
          auth.reason === "unconfigured"
            ? "Panel de administración no configurado en este entorno."
            : "No autorizado",
      },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
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
      quote,
      parentsOrHosts,
      storyTitle,
      storyText,
      schedule,
      heroImageUrl,
      galleryImages,
      fontOverride,
      accentOverride,
      audioOverride,
      enabledSections,
      termsAccepted,
      contactName,
      whatsapp,
      email,
      notes,
    } = body;

    if (termsAccepted !== true) {
      return NextResponse.json(
        {
          error:
            "Debés aceptar explícitamente las Condiciones del Servicio antes de registrar tu pedido.",
        },
        { status: 400 }
      );
    }

    const missing: string[] = [];
    if (!String(eventTitle || "").trim()) missing.push("Título del evento");
    if (!String(eventDate || "").trim()) missing.push("Fecha");
    if (!String(eventTime || "").trim()) missing.push("Horario");
    if (!String(venue || "").trim()) missing.push("Lugar / Salón");
    if (!String(contactName || "").trim()) missing.push("Tu nombre");
    if (!String(whatsapp || "").trim()) missing.push("WhatsApp");
    if (!String(email || "").trim() || !String(email).includes("@")) {
      missing.push("Email válido");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Falta completar: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    const validPlan =
      planId === "esencial" || planId === "pro" || planId === "asistido" ? planId : "pro";
    const allowFullCustom = validPlan === "pro" || validPlan === "asistido";

    const cleanParents =
      allowFullCustom && Array.isArray(parentsOrHosts)
        ? parentsOrHosts
            .filter((g) => g && typeof g.label === "string" && Array.isArray(g.names))
            .map((g) => ({
              label: String(g.label).trim(),
              names: g.names.map((n: unknown) => String(n).trim()).filter(Boolean),
            }))
            .filter((g) => g.label && g.names.length > 0)
        : undefined;

    const cleanSchedule =
      allowFullCustom && Array.isArray(schedule)
        ? schedule
            .filter((s) => s && (s.time || s.title))
            .map((s) => ({
              time: String(s.time || "").trim(),
              title: String(s.title || "").trim(),
              detail: String(s.detail || "").trim(),
            }))
            .filter((s) => s.title.length > 0)
        : undefined;

    const created = await createOrderEvent({
      skinId: String(skinId || "boda-sobre-marfil"),
      planId: validPlan,
      eventTitle: String(eventTitle).trim(),
      eventDate: String(eventDate || "").trim(),
      eventTime: String(eventTime || "").trim(),
      venue: String(venue || "Salón a confirmar").trim(),
      address: String(address || "").trim(),
      alias: String(alias || "").trim(),
      dressCode: String(dressCode || "").trim(),
      quote: allowFullCustom && quote ? String(quote) : undefined,
      parentsOrHosts: cleanParents,
      storyTitle: allowFullCustom && storyTitle ? String(storyTitle) : undefined,
      storyText: allowFullCustom && storyText ? String(storyText) : undefined,
      schedule: cleanSchedule,
      heroImageUrl: allowFullCustom && heroImageUrl ? String(heroImageUrl) : undefined,
      galleryImages:
        allowFullCustom && Array.isArray(galleryImages)
          ? galleryImages.map(String).slice(0, 8)
          : undefined,
      fontOverride: allowFullCustom && fontOverride ? fontOverride : undefined,
      accentOverride: allowFullCustom && accentOverride ? String(accentOverride) : undefined,
      audioOverride: allowFullCustom && audioOverride ? String(audioOverride) : undefined,
      enabledSections: allowFullCustom && enabledSections ? enabledSections : undefined,
      termsAccepted: true,
      termsVersion: LEGAL_VERSION,
      termsAcceptedAtUtc: new Date().toISOString(),
      contactName: String(contactName).trim(),
      whatsapp: String(whatsapp).trim(),
      email: String(email).trim(),
      notes: String(notes || "").trim(),
    });

    return NextResponse.json({ ok: true, order: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { error: "No se pudo registrar tu pedido en el servidor. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
