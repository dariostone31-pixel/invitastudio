import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";
import { OrganizerPanelClient } from "@/components/OrganizerPanelClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel del Organizador — Invita con Alma",
  robots: { index: false, follow: false },
};

export default async function OrganizerPanelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const event = await getEventByPanelToken(token);

  if (!event) {
    notFound();
  }

  const rsvps = await listRsvpsForSlug(event.slug);
  const mercadopagoConfigured = Boolean(process.env.MP_ACCESS_TOKEN);

  return (
    <OrganizerPanelClient
      event={event}
      initialRsvps={rsvps}
      mercadopagoConfigured={mercadopagoConfigured}
    />
  );
}
