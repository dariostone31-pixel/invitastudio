import * as XLSX from "xlsx";
import { getEventByPanelToken, listRsvpsForSlug } from "@/lib/db";

function safeCell(val: string | number | boolean): string | number {
  if (typeof val === "number") return val;
  let raw = String(val ?? "");
  if (/^[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  return raw;
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

  const guestsSheetData: (string | number)[][] = [
    [
      "Invitado / Familia",
      "Asistencia",
      "Lugares Confirmados",
      "Acompañantes",
      "Menú Especial / Alergias",
      "Canción Sugerida",
      "Mensaje / Buenos Deseos",
      "Fecha de Respuesta",
    ],
    ...rsvps.map((r) => [
      safeCell(r.guestName),
      r.attending ? "Sí, asiste" : "No asiste",
      r.attending ? r.passesUsed : 0,
      safeCell(r.companions),
      safeCell(r.dietary.join(", ")),
      safeCell(r.song),
      safeCell(r.message),
      new Date(r.createdAt).toLocaleString("es-AR"),
    ]),
  ];

  const playlistIds = new Set((event.djPlaylist || []).map((item) => item.id));
  const rsvpSongs = rsvps
    .filter((r) => r.song.trim().length > 0 && !playlistIds.has(`rsvp-song-${r.id}`))
    .map((r) => ({
      song: r.song,
      guestName: r.guestName,
      votes: 1,
      source: "RSVP",
      createdAt: r.createdAt,
    }));
  const extraSongs = (event.djPlaylist || []).map((item) => ({
    song: item.song,
    guestName: item.guestName,
    votes: item.votes ?? 1,
    source: "Playlist",
    createdAt: item.createdAt,
  }));
  const allSongs = [...extraSongs, ...rsvpSongs].sort((a, b) => b.votes - a.votes);

  const djSheetData: (string | number)[][] = [
    ["Canción / Artista", "Votos", "Sugerida por", "Origen", "Fecha"],
    ...allSongs.map((s) => [
      safeCell(s.song),
      s.votes,
      safeCell(s.guestName),
      s.source,
      new Date(s.createdAt).toLocaleString("es-AR"),
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const wsGuests = XLSX.utils.aoa_to_sheet(guestsSheetData);
  wsGuests["!cols"] = [
    { wch: 26 },
    { wch: 14 },
    { wch: 18 },
    { wch: 28 },
    { wch: 24 },
    { wch: 26 },
    { wch: 34 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuests, "Invitados");

  const wsDj = XLSX.utils.aoa_to_sheet(djSheetData);
  wsDj["!cols"] = [
    { wch: 34 },
    { wch: 10 },
    { wch: 24 },
    { wch: 12 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDj, "Playlist DJ");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="invitados-${event.slug}.xlsx"`,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
