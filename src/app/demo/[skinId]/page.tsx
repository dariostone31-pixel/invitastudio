import React from "react";
import type { Metadata } from "next";
import { getSkinById } from "@/templates/catalog";
import { listRsvpsForSlug } from "@/lib/db";
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
    title: `${title} — Demo ${skin.name} | InvitaStudio`,
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

  return (
    <InvitationRenderer
      skin={skin}
      eventSlug={demoSlug}
      guestName={sp.nombre || "Familia García López"}
      passes={passes ?? 4}
      table={sp.mesa || "7"}
      customTitle={sp.evento || undefined}
      customDateDisplay={sp.fecha || undefined}
      wishesList={wishes}
      showPreviewChrome={true}
    />
  );
}
