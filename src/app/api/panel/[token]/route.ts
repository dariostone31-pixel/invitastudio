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
    const body = await req.json();
    const updated = await updateEventByPanelToken(token, {
      skinId: body.skinId,
      eventTitle: body.eventTitle,
      dateDisplay: body.dateDisplay,
      timeDisplay: body.timeDisplay,
      venue: body.venue,
      address: body.address,
      alias: body.alias,
      dressCode: body.dressCode,
      quote: body.quote,
      heroImageUrl: body.heroImageUrl,
      galleryImages: body.galleryImages,
      fontOverride: body.fontOverride,
      accentOverride: body.accentOverride,
      audioOverride: body.audioOverride,
      memoryMode: body.memoryMode,
      enabledSections: body.enabledSections,
    });
    if (!updated) {
      return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, event: updated });
  } catch {
    return NextResponse.json({ error: "Error guardando personalización" }, { status: 500 });
  }
}
