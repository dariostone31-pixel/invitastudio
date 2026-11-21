import React from "react";
import { notFound } from "next/navigation";
import { getEventByPanelToken } from "@/lib/db";
import { PersonalizerStudioClient } from "@/components/PersonalizerStudioClient";

export const dynamic = "force-dynamic";

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

  return <PersonalizerStudioClient event={event} />;
}
