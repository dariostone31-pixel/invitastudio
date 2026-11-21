import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";

function csvCell(val: string | number | boolean): string {
  const s = String(val ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const event = await getEventByPanelToken(token);
  if (!event) {
    return new Response("Panel no encontrado", { status: 404 });
  }

  const rsvps = await listRsvpsForSlug(event.slug);
  const header = [
    "Invitado / Familia",
    "Asiste",
    "Lugares Confirmados",
    "Acompañantes",
    "Menú Especial / Alergias",
    "Canción Sugerida",
    "Mensaje",
    "Fecha de Respuesta",
  ]
    .map(csvCell)
    .join(",");

  const rows = rsvps.map((r) =>
    [
      r.guestName,
      r.attending ? "Sí, asiste" : "No asiste",
      r.passesUsed,
      r.companions,
      r.dietary.join(" | "),
      r.song,
      r.message,
      new Date(r.createdAt).toLocaleString("es-AR"),
    ]
      .map(csvCell)
      .join(",")
  );

  // UTF-8 BOM for Microsoft Excel compatibility with Spanish accents
  const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados-${event.slug}.csv"`,
    },
  });
}
