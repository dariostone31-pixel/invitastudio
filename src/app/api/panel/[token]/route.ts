import { NextResponse } from "next/server";
import { getEventByPanelToken, updateEventByPanelToken } from "@/lib/db";
import { CURATED_AUDIO_URLS } from "@/config/musicCatalog";
import { sanitizeEventLocations } from "@/lib/locationUtils";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, sanitizeSafeUrl } from "@/lib/security";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`panel-get:${ip}`, 60, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas consultas seguidas." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const { token } = await context.params;
  const event = await getEventByPanelToken(token);
  if (!event) {
    return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ event }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`panel-patch:${ip}`, 45, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas actualizaciones seguidas. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const { token } = await context.params;
  try {
    const existing = await getEventByPanelToken(token);
    if (!existing) {
      return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const isEssential = existing.planId === "esencial";
    const isAsistido = existing.planId === "asistido";
    const CURATED_AUDIO = new Set(["", ...CURATED_AUDIO_URLS]);
    const requestedAudio =
      body.audioOverride === null || body.audioOverride === "null"
        ? "none"
        : typeof body.audioOverride === "string"
        ? body.audioOverride
        : undefined;
    // PRO solo puede elegir del catálogo curado o mantener el actual; Llave en Mano mantiene el audio personalizado subido por admin si elige conservarlo
    const safeAudio =
      requestedAudio === undefined
        ? undefined
        : CURATED_AUDIO.has(requestedAudio) || (isAsistido && requestedAudio === existing.audioOverride)
        ? requestedAudio
        : existing.audioOverride;

    const cleanSubtitle =
      typeof body.subtitleOverride === "string"
        ? body.subtitleOverride.trim().slice(0, 70)
        : typeof body.enabledSections?.subtitle === "string"
        ? String(body.enabledSections.subtitle).trim().slice(0, 70)
        : undefined;

    const maxLocs = isEssential ? 1 : 2;
    const rawLocations = body.enabledSections?.locations;
    const cleanLocations =
      rawLocations !== undefined ? sanitizeEventLocations(rawLocations, maxLocs) : undefined;

    const sanitizedEnabledSections =
      body.enabledSections && typeof body.enabledSections === "object"
        ? {
            ...body.enabledSections,
            trivia: isAsistido ? Boolean(body.enabledSections.trivia) : false,
            ...(rawLocations !== undefined ? { locations: cleanLocations } : {}),
            ...(cleanSubtitle !== undefined ? { subtitle: cleanSubtitle || undefined } : {}),
          }
        : cleanSubtitle !== undefined
        ? {
            ...(existing.enabledSections || {
              countdown: true,
              story: true,
              schedule: true,
              gallery: true,
              dressCode: true,
              gifts: true,
              rsvp: true,
            }),
            subtitle: cleanSubtitle || undefined,
          }
        : undefined;

    const essentialSectionsPatch =
      rawLocations !== undefined || cleanSubtitle !== undefined
        ? {
            ...(existing.enabledSections || {
              countdown: true,
              story: false,
              schedule: false,
              gallery: false,
              dressCode: true,
              gifts: true,
              rsvp: true,
            }),
            trivia: false,
            ...(rawLocations !== undefined ? { locations: cleanLocations } : {}),
            ...(cleanSubtitle !== undefined ? { subtitle: cleanSubtitle || undefined } : {}),
          }
        : undefined;

    const patch = isEssential
      ? {
          eventTitle: body.eventTitle,
          dateDisplay: body.dateDisplay,
          timeDisplay: body.timeDisplay,
          venue: body.venue,
          address: body.address,
          alias: body.alias,
          giftBank: typeof body.giftBank === "string" ? body.giftBank.trim().slice(0, 80) : undefined,
          giftHolder: typeof body.giftHolder === "string" ? body.giftHolder.trim().slice(0, 120) : undefined,
          dressCode: body.dressCode,
          quote: typeof body.quote === "string" ? body.quote.trim() : undefined,
          audioOverride:
            requestedAudio === "none"
              ? "none"
              : requestedAudio === ""
              ? ""
              : undefined,
          albumUrl:
            typeof body.albumUrl === "string"
              ? sanitizeSafeUrl(body.albumUrl, { allowRelative: false, maxLength: 500 }) ?? ""
              : undefined,
          eventHashtag:
            typeof body.eventHashtag === "string" ? body.eventHashtag.trim().slice(0, 80) : undefined,
          ...(essentialSectionsPatch ? { enabledSections: essentialSectionsPatch } : {}),
        }
      : {
          skinId: body.skinId,
          eventTitle: body.eventTitle,
          dateDisplay: body.dateDisplay,
          timeDisplay: body.timeDisplay,
          venue: body.venue,
          address: body.address,
          alias: body.alias,
          giftBank: typeof body.giftBank === "string" ? body.giftBank.trim().slice(0, 80) : undefined,
          giftHolder: typeof body.giftHolder === "string" ? body.giftHolder.trim().slice(0, 120) : undefined,
          dressCode: body.dressCode,
          rsvpDeadline:
            typeof body.rsvpDeadline === "string"
              ? body.rsvpDeadline.trim().slice(0, 80)
              : undefined,
          adultsOnly:
            typeof body.adultsOnly === "boolean" ? body.adultsOnly : undefined,
          tarjetaPricing: Array.isArray(body.tarjetaPricing)
            ? body.tarjetaPricing
                .slice(0, 6)
                .map((t: { label?: unknown; price?: unknown }) => ({
                  label: String(t?.label || "").trim().slice(0, 60),
                  price: String(t?.price || "").trim().slice(0, 40),
                }))
                .filter((t: { label: string; price: string }) => t.label && t.price)
            : undefined,
          tarjetaNote:
            typeof body.tarjetaNote === "string"
              ? body.tarjetaNote.trim().slice(0, 180)
              : undefined,
          quote: typeof body.quote === "string" ? body.quote.trim().slice(0, 500) : undefined,
          parentsOrHosts: body.parentsOrHosts,
          storyTitle: typeof body.storyTitle === "string" ? body.storyTitle.trim().slice(0, 120) : undefined,
          storyText: typeof body.storyText === "string" ? body.storyText.trim().slice(0, 2000) : undefined,
          schedule: body.schedule,
          heroImageUrl:
            typeof body.heroImageUrl === "string"
              ? sanitizeSafeUrl(body.heroImageUrl, { allowRelative: true })
              : undefined,
          heroOverlayOverride: body.heroOverlayOverride,
          galleryImages: Array.isArray(body.galleryImages)
            ? body.galleryImages
                .slice(0, 8)
                .map((u: unknown) => sanitizeSafeUrl(u, { allowRelative: true }))
                .filter((u: string | undefined): u is string => Boolean(u))
            : undefined,
          fontOverride: body.fontOverride,
          accentOverride:
            typeof body.accentOverride === "string"
              ? body.accentOverride.trim().slice(0, 24)
              : undefined,
          audioOverride: safeAudio,
          ...(isAsistido && typeof body.songRequest === "string"
            ? { songRequest: body.songRequest.trim().slice(0, 220) }
            : {}),
          ...(isAsistido
            ? {
                triviaTitle: typeof body.triviaTitle === "string" ? body.triviaTitle.trim().slice(0, 120) : undefined,
                triviaQuestions: Array.isArray(body.triviaQuestions)
                  ? body.triviaQuestions
                  : undefined,
              }
            : {}),
          albumUrl:
            typeof body.albumUrl === "string"
              ? sanitizeSafeUrl(body.albumUrl, { allowRelative: false, maxLength: 500 }) ?? ""
              : undefined,
          instagramHandle:
            typeof body.instagramHandle === "string"
              ? body.instagramHandle.trim().slice(0, 80)
              : undefined,
          eventHashtag:
            typeof body.eventHashtag === "string"
              ? body.eventHashtag.trim().slice(0, 80)
              : undefined,
          guestList: Array.isArray(body.guestList)
            ? body.guestList
                .slice(0, 500)
                .map((g: Record<string, unknown>, idx: number) => {
                  const name = String(g?.name || "").trim().slice(0, 120);
                  const num = Number(g?.maxPasses);
                  const maxPasses =
                    Number.isFinite(num) && num >= 1 ? Math.min(20, Math.round(num)) : 2;
                  const rawPase = String(g?.pase || "todo");
                  const pase: "todo" | "ceremonia" | "fiesta" =
                    rawPase === "ceremonia" || rawPase === "fiesta" ? rawPase : "todo";
                  const table =
                    typeof g?.table === "string" && g.table.trim()
                      ? g.table.trim().slice(0, 40)
                      : undefined;
                  const whatsapp =
                    typeof g?.whatsapp === "string" && g.whatsapp.trim()
                      ? g.whatsapp.trim().slice(0, 30)
                      : undefined;
                  const id =
                    typeof g?.id === "string" && g.id.trim()
                      ? g.id.trim().slice(0, 40)
                      : `inv-${idx + 1}`;
                  return {
                    id,
                    name,
                    maxPasses,
                    ...(table ? { table } : {}),
                    pase,
                    ...(whatsapp ? { whatsapp } : {}),
                    ...(typeof g?.sent === "boolean" ? { sent: g.sent } : {}),
                  };
                })
                .filter((g: { name: string }) => g.name.length > 0)
            : undefined,
          memoryMode: body.memoryMode,
          enabledSections: sanitizedEnabledSections,
        };

    const updated = await updateEventByPanelToken(token, patch);
    if (!updated) {
      return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
    }
    return NextResponse.json(
      { ok: true, event: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Error guardando personalización" }, { status: 500 });
  }
}
