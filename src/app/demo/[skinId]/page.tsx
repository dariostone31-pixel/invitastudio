import React from "react";
import type { Metadata } from "next";
import { getSkinById } from "@/templates/catalog";
import { listRsvpsForSlug } from "@/lib/db";
import { getTriviaPresetForCategory } from "@/lib/categoryPresets";
import { InvitationRenderer } from "@/components/invitation-engine/InvitationRenderer";

interface DemoPageProps {
  params: Promise<{ skinId: string }>;
  searchParams: Promise<{
    nombre?: string;
    pases?: string;
    mesa?: string;
    evento?: string;
    fecha?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: DemoPageProps): Promise<Metadata> {
  const { skinId } = await params;
  const sp = await searchParams;
  const skin = getSkinById(skinId);
  const title = sp.evento || skin.sample.title;

  return {
    title: `${title} — Demo ${skin.name} | Invita con el Alma`,
    description: `${skin.sample.dateDisplay} · ${skin.subtitle}. Abrí el sobre animado y probá la confirmación de asistencia.`,
    openGraph: {
      title: `${title} · Invitación Interactiva`,
      description: `${skin.sample.dateDisplay} · ${skin.subtitle}`,
      images: [{ url: skin.heroImage, alt: title }],
      locale: "es_AR",
      type: "website",
    },
  };
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { skinId } = await params;
  const sp = await searchParams;

  const skin = getSkinById(skinId);
  const passes = sp.pases ? Math.max(1, Math.min(12, Number(sp.pases) || 1)) : undefined;
  const demoSlug = skin.category === "xv" ? "mis-xv-valen" : "sofia-y-lucas";
  const allRsvps = await listRsvpsForSlug(demoSlug);
  const wishes = allRsvps
    .filter((r) => r.message && r.message.trim().length > 0)
    .map((r) => ({
      id: r.id,
      guestName: r.guestName,
      message: r.message,
    }));
  const demoSongs = allRsvps
    .filter((r) => r.song && r.song.trim().length > 0)
    .map((r, i) => ({
      id: `demo-song-${r.id}`,
      guestName: r.guestName,
      song: r.song,
      votes: i === 0 ? 4 : 2,
      createdAt: r.createdAt,
    }));
  const demoTriviaQuestions = getTriviaPresetForCategory(
    skin.category,
    skin.sample.dressCode.label,
    skin.id
  );

  return (
    <InvitationRenderer
      skin={skin}
      eventSlug={demoSlug}
      guestName={sp.nombre || "Familia García López"}
      passes={passes ?? 4}
      table={sp.mesa || "7"}
      customTitle={sp.evento || undefined}
      customDateDisplay={sp.fecha || undefined}
      planId="asistido"
      wishesList={wishes}
      allowDjSongs={true}
      initialDjPlaylist={demoSongs}
      triviaTitle={`¿Cuánto conocés a ${sp.evento || skin.sample.title}?`}
      triviaQuestions={demoTriviaQuestions}
      initialTriviaScores={[
        {
          id: "demo-sc-1",
          guestName: "Enzo",
          score: 3,
          total: 3,
          createdAt: "2026-11-20T12:00:00.000Z",
        },
        {
          id: "demo-sc-2",
          guestName: "Camila",
          score: 2,
          total: 3,
          createdAt: "2026-11-20T13:00:00.000Z",
        },
      ]}
      albumUrl="#demo-album"
      eventHashtag={skin.category === "xv" ? "MisXVSoñados" : "NuestraFiesta"}
      enabledSections={{
        countdown: true,
        story: true,
        schedule: true,
        gallery: true,
        dressCode: true,
        gifts: true,
        wishes: true,
        djSongs: true,
        djVoting: true,
        trivia: true,
        collaborativeAlbum: true,
        rsvp: true,
      }}
      showPreviewChrome={true}
    />
  );
}
