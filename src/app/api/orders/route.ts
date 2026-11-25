import { NextResponse } from "next/server";
import { createOrderEvent, getDbMode, listEvents, listRsvpsForSlug } from "@/lib/db";
import { verifyAdminPass } from "@/lib/adminAuth";
import { LEGAL_VERSION } from "@/config/legal";
import { CURATED_AUDIO_URLS } from "@/config/musicCatalog";

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
    if (process.env.VERCEL === "1" && getDbMode() !== "postgres") {
      return NextResponse.json(
        {
          error:
            "Este entorno en Vercel todavía no tiene configurada la base de datos PostgreSQL (DATABASE_URL). Cargá DATABASE_URL en Environment Variables y hacé Redeploy para guardar invitaciones sin errores 404.",
        },
        { status: 503 }
      );
    }

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
      giftBank,
      giftHolder,
      dressCode,
      rsvpDeadline,
      adultsOnly,
      tarjetaPricing,
      tarjetaNote,
      quote,
      parentsOrHosts,
      storyTitle,
      storyText,
      schedule,
      heroImageUrl,
      heroOverlayOverride,
      galleryImages,
      fontOverride,
      accentOverride,
      audioOverride,
      songRequest,
      albumUrl,
      instagramHandle,
      eventHashtag,
      triviaQuestions,
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
    const cleanAudio =
      allowFullCustom && typeof audioOverride === "string" && CURATED_AUDIO_URLS.has(audioOverride)
        ? audioOverride
        : undefined;
    const cleanSongRequest =
      validPlan === "asistido" && typeof songRequest === "string" && songRequest.trim()
        ? songRequest.trim().slice(0, 220)
        : undefined;

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

    const cleanTrivia =
      allowFullCustom && Array.isArray(triviaQuestions)
        ? triviaQuestions
            .slice(0, 6)
            .filter(
              (q) =>
                q &&
                typeof q.question === "string" &&
                q.question.trim().length > 0 &&
                Array.isArray(q.options) &&
                q.options.length >= 2
            )
            .map((q, idx) => {
              const opts = q.options
                .slice(0, 4)
                .map((o: unknown) => String(o || "").trim())
                .filter(Boolean);
              const ci = Number(q.correctIndex);
              return {
                id: String(q.id || `q-${idx + 1}`).slice(0, 40),
                question: String(q.question).trim().slice(0, 160),
                options: opts,
                correctIndex: Number.isFinite(ci)
                  ? Math.max(0, Math.min(opts.length - 1, ci))
                  : 0,
              };
            })
            .filter((q) => q.options.length >= 2)
        : undefined;

    const cleanTarjetaPricing =
      allowFullCustom && Array.isArray(tarjetaPricing)
        ? tarjetaPricing
            .slice(0, 6)
            .map((t: { label?: unknown; price?: unknown }) => ({
              label: String(t?.label || "").trim().slice(0, 60),
              price: String(t?.price || "").trim().slice(0, 40),
            }))
            .filter((t) => t.label.length > 0 && t.price.length > 0)
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
      giftBank: giftBank ? String(giftBank).trim().slice(0, 80) : undefined,
      giftHolder: giftHolder ? String(giftHolder).trim().slice(0, 120) : undefined,
      dressCode: String(dressCode || "").trim(),
      rsvpDeadline:
        allowFullCustom && typeof rsvpDeadline === "string" && rsvpDeadline.trim()
          ? rsvpDeadline.trim().slice(0, 80)
          : undefined,
      adultsOnly: allowFullCustom ? Boolean(adultsOnly) : false,
      tarjetaPricing:
        cleanTarjetaPricing && cleanTarjetaPricing.length > 0 ? cleanTarjetaPricing : undefined,
      tarjetaNote:
        allowFullCustom && typeof tarjetaNote === "string" && tarjetaNote.trim()
          ? tarjetaNote.trim().slice(0, 180)
          : undefined,
      quote: quote && String(quote).trim() ? String(quote).trim() : undefined,
      parentsOrHosts: cleanParents,
      storyTitle: allowFullCustom && storyTitle ? String(storyTitle) : undefined,
      storyText: allowFullCustom && storyText ? String(storyText) : undefined,
      schedule: cleanSchedule,
      heroImageUrl: allowFullCustom && heroImageUrl ? String(heroImageUrl) : undefined,
      heroOverlayOverride:
        allowFullCustom && heroOverlayOverride ? heroOverlayOverride : undefined,
      galleryImages:
        allowFullCustom && Array.isArray(galleryImages)
          ? galleryImages.map(String).slice(0, 8)
          : undefined,
      fontOverride: allowFullCustom && fontOverride ? fontOverride : undefined,
      accentOverride: allowFullCustom && accentOverride ? String(accentOverride) : undefined,
      audioOverride: cleanAudio,
      songRequest: cleanSongRequest,
      albumUrl: allowFullCustom && albumUrl ? String(albumUrl).trim() : undefined,
      instagramHandle:
        allowFullCustom && instagramHandle ? String(instagramHandle).trim() : undefined,
      eventHashtag: allowFullCustom && eventHashtag ? String(eventHashtag).trim() : undefined,
      triviaQuestions: cleanTrivia,
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
