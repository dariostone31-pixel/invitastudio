import { NextResponse } from "next/server";
import { getEventByPanelToken, updateEventByPanelToken } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const event = await getEventByPanelToken(token);
  if (!event) {
    return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  try {
    const existing = await getEventByPanelToken(token);
    if (!existing) {
      return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const isEssential = existing.planId === "esencial";
    const isAsistido = existing.planId === "asistido";
    const CURATED_AUDIO = new Set([
      "",
      "/audio/romantic-piano.wav",
      "/audio/lounge-warm.wav",
      "/audio/playful-celesta.wav",
      "none",
    ]);
    const requestedAudio = typeof body.audioOverride === "string" ? body.audioOverride : undefined;
    // PRO solo puede elegir del catálogo curado o mantener el actual; Llave en Mano mantiene el audio personalizado subido por admin si elige conservarlo
    const safeAudio =
      requestedAudio === undefined
        ? undefined
        : CURATED_AUDIO.has(requestedAudio) || (isAsistido && requestedAudio === existing.audioOverride)
        ? requestedAudio
        : existing.audioOverride;

    const patch = isEssential
      ? {
          eventTitle: body.eventTitle,
          dateDisplay: body.dateDisplay,
          timeDisplay: body.timeDisplay,
          venue: body.venue,
          address: body.address,
          alias: body.alias,
          dressCode: body.dressCode,
        }
      : {
          skinId: body.skinId,
          eventTitle: body.eventTitle,
          dateDisplay: body.dateDisplay,
          timeDisplay: body.timeDisplay,
          venue: body.venue,
          address: body.address,
          alias: body.alias,
          dressCode: body.dressCode,
          quote: body.quote,
          parentsOrHosts: body.parentsOrHosts,
          storyTitle: body.storyTitle,
          storyText: body.storyText,
          schedule: body.schedule,
          heroImageUrl: body.heroImageUrl,
          heroOverlayOverride: body.heroOverlayOverride,
          galleryImages: body.galleryImages,
          fontOverride: body.fontOverride,
          accentOverride: body.accentOverride,
          audioOverride: safeAudio,
          ...(isAsistido && typeof body.songRequest === "string"
            ? { songRequest: body.songRequest.trim().slice(0, 220) }
            : {}),
          triviaTitle: typeof body.triviaTitle === "string" ? body.triviaTitle : undefined,
          triviaQuestions: Array.isArray(body.triviaQuestions)
            ? body.triviaQuestions
            : undefined,
          albumUrl: typeof body.albumUrl === "string" ? body.albumUrl.trim() : undefined,
          instagramHandle:
            typeof body.instagramHandle === "string" ? body.instagramHandle.trim() : undefined,
          eventHashtag:
            typeof body.eventHashtag === "string" ? body.eventHashtag.trim() : undefined,
          guestList: Array.isArray(body.guestList) ? body.guestList.slice(0, 500) : undefined,
          memoryMode: body.memoryMode,
          enabledSections: body.enabledSections,
        };

    const updated = await updateEventByPanelToken(token, patch);
    if (!updated) {
      return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, event: updated });
  } catch {
    return NextResponse.json({ error: "Error guardando personalización" }, { status: 500 });
  }
}
