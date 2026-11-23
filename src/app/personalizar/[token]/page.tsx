import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventByPanelToken } from "@/lib/db";
import { PersonalizerStudioClient } from "@/components/PersonalizerStudioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estudio de Personalización — Invita con Alma",
  robots: { index: false, follow: false },
};

export default async function PersonalizePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const event = await getEventByPanelToken(token);

  if (!event) {
    notFound();
  }

  const mercadopagoConfigured = Boolean(process.env.MP_ACCESS_TOKEN);

  return (
    <PersonalizerStudioClient
      event={event}
      mercadopagoConfigured={mercadopagoConfigured}
    />
  );
}
