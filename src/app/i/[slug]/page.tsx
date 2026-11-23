import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
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

  return (
    <>
      {event.status !== "publicada" && (
        <div className="sticky top-0 z-40 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          <strong>Borrador ({event.orderCode}):</strong> Esta invitación está en preparación.{" "}
          <Link href={`/panel/${event.panelToken}`} className="font-semibold underline">
            Ir al Panel del Organizador
          </Link>
        </div>
      )}
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
        customDressCode={event.dressCode || undefined}
        customQuote={event.quote || undefined}
        customParentsOrHosts={event.parentsOrHosts || undefined}
        customStoryTitle={event.storyTitle || undefined}
        customStoryText={event.storyText || undefined}
        customSchedule={event.schedule || undefined}
        customHeroImage={event.heroImageUrl || undefined}
        customGallery={event.galleryImages || undefined}
        customFont={event.fontOverride || undefined}
        customAccent={event.accentOverride || undefined}
        customAudioUrl={event.audioOverride || undefined}
        memoryMode={Boolean(event.memoryMode)}
        wishesList={wishes}
        enabledSections={event.enabledSections || undefined}
        showPreviewChrome={false}
      />
    </>
  );
}
