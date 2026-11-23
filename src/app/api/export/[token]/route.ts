import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";

function csvCell(val: string | number | boolean): string {
  let raw = String(val ?? "");
  // Protege contra CSV/Spreadsheet Formula Injection si empieza con =, +, -, @, tab o CR
  if (/^[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  const s = raw.replace(/"/g, '""');
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

  const extraDjRows = [...(event.djPlaylist || [])]
    .sort((a, b) => (b.votes ?? 1) - (a.votes ?? 1))
    .map((item) =>
    [
      item.guestName,
      `Playlist DJ (${item.votes ?? 1} voto/s 🔥)`,
      "-",
      "",
      "",
      item.song,
      "",
      new Date(item.createdAt).toLocaleString("es-AR"),
    ]
      .map(csvCell)
      .join(",")
  );

  // UTF-8 BOM for Microsoft Excel compatibility with Spanish accents
  const csvContent = "\uFEFF" + [header, ...rows, ...extraDjRows].join("\r\n");

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados-${event.slug}.csv"`,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
