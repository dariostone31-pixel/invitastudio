import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";
import { getSkinById } from "@/templates/catalog";
import { InvitationRenderer } from "@/components/invitation-engine/InvitationRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vista Previa del Organizador (Borrador) — Invita con el Alma",
  robots: { index: false, follow: false },
};

interface PanelPreviewPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    inv?: string;
    nombre?: string;
    pases?: string;
    mesa?: string;
    pase?: string;
  }>;
}

export default async function PanelPreviewPage({
  params,
  searchParams,
}: PanelPreviewPageProps) {
  const { token } = await params;
  const sp = await searchParams;
  const event = await getEventByPanelToken(token);

  if (!event) {
    notFound();
  }

  const isPaid =
    event.paymentStatus === "pagado" && event.status === "publicada";
  const allowFamilyLinks = event.planId === "asistido";

  const matchedGuest =
    allowFamilyLinks && sp.inv
      ? (event.guestList || []).find((g) => g.id === sp.inv)
      : undefined;
  const guestName = allowFamilyLinks
    ? sp.nombre || matchedGuest?.name || undefined
    : undefined;
  const table = allowFamilyLinks
    ? sp.mesa || matchedGuest?.table || undefined
    : undefined;
  const rawPasses = allowFamilyLinks
    ? sp.pases
      ? Number(sp.pases)
      : matchedGuest?.maxPasses
    : undefined;
  const passes = rawPasses
    ? Math.max(1, Math.min(12, rawPasses || 1))
    : undefined;
  const rawPase = allowFamilyLinks ? sp.pase || matchedGuest?.pase : undefined;
  const paseType: "todo" | "ceremonia" | "fiesta" =
    rawPase === "ceremonia" || rawPase === "fiesta" ? rawPase : "todo";

  const skin = getSkinById(event.skinId);
  const rsvps = await listRsvpsForSlug(event.slug);
  const wishes = rsvps
    .filter((r) => r.message && r.message.trim().length > 0)
    .map((r) => ({
      id: r.id,
      guestName: r.guestName,
      message: r.message,
    }));
  const playlistIds = new Set((event.djPlaylist || []).map((item) => item.id));
  const rsvpSongs = rsvps
    .filter((r) => r.song && r.song.trim().length > 0 && !playlistIds.has(`rsvp-song-${r.id}`))
    .map((r) => ({
      id: `rsvp-song-${r.id}`,
      guestName: r.guestName,
      song: r.song,
      votes: 1,
      createdAt: r.createdAt,
    }));
  const combinedDjPlaylist = [...(event.djPlaylist || []), ...rsvpSongs].sort(
    (a, b) => (b.votes ?? 1) - (a.votes ?? 1) || b.createdAt.localeCompare(a.createdAt)
  );
  const allowDjSongs = event.planId !== "esencial";

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Barra fija exclusiva del organizador */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-50/95 px-4 py-2 text-xs text-amber-950 backdrop-blur-md">
        <span>
          <strong>Vista previa privada del organizador</strong>
          {!isPaid
            ? " · Borrador con marca de agua (no apto para compartir sin activar el pago)."
            : " · Pedido activo."}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/panel/${event.panelToken}`}
            className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-stone-800"
          >
            Volver al Panel
          </Link>
        </div>
      </div>

      {/* Marca de agua diagonal sobre toda la vista previa mientras esté impaga */}
      {!isPaid && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 grid grid-cols-2 place-items-center gap-y-24 overflow-hidden opacity-[0.16] select-none"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="-rotate-24 whitespace-nowrap font-bold uppercase tracking-[0.26em] text-stone-900 text-xs sm:text-sm"
            >
              BORRADOR · NO COMPARTIR · PENDIENTE DE PAGO
            </span>
          ))}
        </div>
      )}

      <InvitationRenderer
        skin={skin}
        eventSlug={event.slug}
        guestName={guestName}
        passes={passes}
        table={table}
        paseType={paseType}
        customTitle={event.eventTitle}
        customSubtitle={event.enabledSections?.subtitle || undefined}
        customDateDisplay={event.dateDisplay}
        customTimeDisplay={event.timeDisplay}
        customDateISO={event.dateISO}
        customVenue={event.venue}
        customAddress={event.address}
        customAlias={event.alias || undefined}
        customGiftBank={event.giftBank || undefined}
        customGiftHolder={event.giftHolder || undefined}
        customDressCode={event.dressCode || undefined}
        customRsvpDeadline={event.rsvpDeadline || undefined}
        customAdultsOnly={Boolean(event.adultsOnly)}
        customTarjetaPricing={event.tarjetaPricing || undefined}
        customTarjetaNote={event.tarjetaNote || undefined}
        customQuote={event.quote || undefined}
        customParentsOrHosts={event.parentsOrHosts || undefined}
        customStoryTitle={event.storyTitle || undefined}
        customStoryText={event.storyText || undefined}
        customSchedule={event.schedule || undefined}
        customHeroImage={event.heroImageUrl || undefined}
        customHeroOverlay={event.heroOverlayOverride || undefined}
        customGallery={event.galleryImages || undefined}
        customFont={event.fontOverride || undefined}
        customAccent={event.accentOverride || undefined}
        customAudioUrl={
          event.audioOverride === "none" || event.audioOverride === null
            ? "none"
            : allowDjSongs
            ? event.audioOverride || undefined
            : undefined
        }
        memoryMode={Boolean(event.memoryMode)}
        planId={event.planId}
        wishesList={wishes}
        allowDjSongs={allowDjSongs}
        initialDjPlaylist={allowDjSongs ? combinedDjPlaylist : []}
        triviaTitle={event.planId === "asistido" ? event.triviaTitle : undefined}
        triviaQuestions={event.planId === "asistido" ? event.triviaQuestions || [] : []}
        initialTriviaScores={event.planId === "asistido" ? event.triviaScores || [] : []}
        albumUrl={allowDjSongs ? event.albumUrl : undefined}
        instagramHandle={allowDjSongs ? event.instagramHandle : undefined}
        eventHashtag={allowDjSongs ? event.eventHashtag : undefined}
        guestList={allowFamilyLinks ? event.guestList || [] : []}
        enabledSections={event.enabledSections || undefined}
        isDraftPreview={!isPaid}
        panelUrl={`/panel/${event.panelToken}`}
        showPreviewChrome={false}
      />
    </div>
  );
}
