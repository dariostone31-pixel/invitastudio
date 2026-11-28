import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getEventBySlug, listRsvpsForSlug } from "@/lib/db";
import { getSkinById } from "@/templates/catalog";
import { InvitationRenderer } from "@/components/invitation-engine/InvitationRenderer";

interface PublicInvitationProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    inv?: string;
    nombre?: string;
    pases?: string;
    mesa?: string;
    pase?: string;
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
    return { title: "Invitación Digital — Invita con el Alma", robots: { index: false, follow: false } };
  }

  const isActivated =
    event.paymentStatus === "pagado" && event.status === "publicada";
  if (!isActivated) {
    return {
      title: "Invitación en preparación — Invita con el Alma",
      description: "Esta invitación digital se encuentra en preparación a la espera de activación.",
      robots: { index: false, follow: false },
    };
  }

  const allowFamilyLinks = event.planId === "asistido";
  const matchedGuest =
    allowFamilyLinks && sp.inv
      ? (event.guestList || []).find((g) => g.id === sp.inv)
      : undefined;
  const resolvedName = allowFamilyLinks
    ? sp.nombre || matchedGuest?.name
    : undefined;
  const skin = getSkinById(event.skinId);
  const coverImage = event.heroImageUrl || skin.heroImage;
  const guestSuffix = resolvedName ? ` · Pase especial para ${resolvedName}` : "";

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

  const isActivated =
    event.paymentStatus === "pagado" && event.status === "publicada";
  if (!isActivated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-12 text-[#2A121B]">
        <div className="w-full max-w-md space-y-5 rounded-3xl border border-amber-300 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
              Invitación en preparación
            </span>
            <h1 className="font-display-cormorant text-3xl font-semibold text-[#2A121B]">
              Link público pendiente de activación
            </h1>
            <p className="text-xs leading-relaxed text-[#7A5A62]">
              Esta invitación todavía se encuentra en modo borrador a la espera de confirmar el pago.
              Si sos el organizador, podés ver la vista previa y activar tu pedido desde tu Panel Privado.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            <Link
              href="/mi-panel"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#6B1E30] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#4A1420]"
            >
              Ir a Mi Panel ({event.orderCode})
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#7A5A62] hover:text-[#2A121B] hover:underline"
            >
              Volver a Invita con el Alma
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Modo individual y en grupo (pases nominales) exclusivo de Plan Llave en Mano
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
  const skin = getSkinById(event.skinId);
  const rawPasses = allowFamilyLinks
    ? sp.pases
      ? Number(sp.pases)
      : matchedGuest?.maxPasses
    : undefined;
  const passes = rawPasses ? Math.max(1, Math.min(12, rawPasses || 1)) : undefined;
  const rawPase = allowFamilyLinks ? sp.pase || matchedGuest?.pase : undefined;
  const paseType: "todo" | "ceremonia" | "fiesta" =
    rawPase === "ceremonia" || rawPase === "fiesta" ? rawPase : "todo";
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
      isDraftPreview={false}
      panelUrl={`/panel/${event.panelToken}`}
      showPreviewChrome={false}
    />
  );
}
