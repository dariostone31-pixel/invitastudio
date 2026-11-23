import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, listRsvpsForSlug } from "@/lib/db";
import { getSkinById } from "@/templates/catalog";
import { InvitationRenderer } from "@/components/invitation-engine/InvitationRenderer";

interface PublicInvitationProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    nombre?: string;
    pases?: string;
    mesa?: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: PublicInvitationProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: "Invitación Digital — Invita con Alma", robots: { index: false, follow: false } };
  }

  const skin = getSkinById(event.skinId);
  const coverImage = event.heroImageUrl || skin.heroImage;
  const guestSuffix = sp.nombre ? ` · Pase especial para ${sp.nombre}` : "";

  return {
    title: `${event.eventTitle}${guestSuffix}`,
    description: `${event.dateDisplay} · ${event.timeDisplay} en ${event.venue}. Abrí tu invitación digital interactiva.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${event.eventTitle}${guestSuffix}`,
      description: `${event.dateDisplay} · ${event.venue}. Tocá para abrir el sobre y confirmar asistencia.`,
      images: [{ url: coverImage, alt: event.eventTitle }],
      locale: "es_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.eventTitle,
      description: `${event.dateDisplay} · ${event.venue}`,
      images: [coverImage],
    },
  };
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: PublicInvitationProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const skin = getSkinById(event.skinId);
  const passes = sp.pases ? Math.max(1, Math.min(12, Number(sp.pases) || 1)) : undefined;
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
    <InvitationRenderer
      skin={skin}
      eventSlug={event.slug}
      guestName={sp.nombre || undefined}
      passes={passes}
      table={sp.mesa || undefined}
      customTitle={event.eventTitle}
      customDateDisplay={event.dateDisplay}
      customTimeDisplay={event.timeDisplay}
      customDateISO={event.dateISO}
      customVenue={event.venue}
      customAddress={event.address}
      customAlias={event.alias || undefined}
      customGiftBank={event.giftBank || undefined}
      customGiftHolder={event.giftHolder || undefined}
      customDressCode={event.dressCode || undefined}
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
      customAudioUrl={allowDjSongs ? event.audioOverride || undefined : undefined}
      memoryMode={Boolean(event.memoryMode)}
      planId={event.planId}
      wishesList={wishes}
      allowDjSongs={allowDjSongs}
      initialDjPlaylist={allowDjSongs ? combinedDjPlaylist : []}
      triviaTitle={event.triviaTitle}
      triviaQuestions={allowDjSongs ? event.triviaQuestions || [] : []}
      initialTriviaScores={allowDjSongs ? event.triviaScores || [] : []}
      albumUrl={allowDjSongs ? event.albumUrl : undefined}
      instagramHandle={allowDjSongs ? event.instagramHandle : undefined}
      eventHashtag={allowDjSongs ? event.eventHashtag : undefined}
      guestList={allowDjSongs ? event.guestList || [] : []}
      enabledSections={event.enabledSections || undefined}
      isDraftPreview={event.paymentStatus !== "pagado" || event.status !== "publicada"}
      panelUrl={`/panel/${event.panelToken}`}
      showPreviewChrome={false}
    />
  );
}
