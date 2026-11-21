import React from "react";
import { notFound } from "next/navigation";
import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";
import { OrganizerPanelClient } from "@/components/OrganizerPanelClient";

export const dynamic = "force-dynamic";

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

  return <OrganizerPanelClient event={event} initialRsvps={rsvps} />;
}
