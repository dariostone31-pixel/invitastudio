import type { CustomEventLocation } from "@/lib/db";

export function sanitizeMapsUrl(raw?: string | null): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim().slice(0, 400);
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return undefined;
}

export function buildMapsSearchUrl(venue: string, address?: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue} ${address || ""}`.trim()
  )}`;
}

export function sanitizeEventLocations(
  raw: unknown,
  maxCount: number
): CustomEventLocation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const cleaned: CustomEventLocation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const venue = String(obj.venue || "").trim().slice(0, 140);
    if (!venue) continue;
    const label =
      String(obj.label || (cleaned.length === 0 ? "Ceremonia" : "Fiesta"))
        .trim()
        .slice(0, 60) || (cleaned.length === 0 ? "Ceremonia" : "Fiesta");
    const address = String(obj.address || "").trim().slice(0, 200);
    const time = String(obj.time || "").trim().slice(0, 40);
    const mapsUrl = sanitizeMapsUrl(
      typeof obj.mapsUrl === "string" ? obj.mapsUrl : undefined
    );
    cleaned.push({
      label,
      venue,
      address,
      time,
      ...(mapsUrl ? { mapsUrl } : {}),
    });
    if (cleaned.length >= maxCount) break;
  }
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Derives refined monogram initials from a custom event title (e.g. "Gabriela y Darío" -> "G & D").
 */
export function deriveInitialsMonogram(
  title: string | undefined,
  fallback: string
): string {
  const raw = (title || "").trim();
  if (!raw) return fallback;

  // Two-person celebrations: "Gabriela y Darío", "Sofía & Lucas", "Ana + Juan"
  const pairMatch = raw.split(/\s+(?:y|&|\+|e)\s+|(?:\s*\/\s*)|(?:\s+-\s+)/i);
  if (pairMatch.length >= 2) {
    const cleanWord = (segment: string) => {
      const stripped = segment
        .replace(/^(?:boda\s+de|casamiento\s+de|compromiso\s+de|nuestra\s+boda)\s+/i, "")
        .trim();
      const firstAlpha = stripped.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/);
      return firstAlpha ? firstAlpha[0].toUpperCase() : "";
    };
    const a = cleanWord(pairMatch[0]);
    const b = cleanWord(pairMatch[1]);
    if (a && b) return `${a} & ${b}`;
  }

  // Single-celebration title (XV, Cumpleaños, Bautismo): strip common prefixes
  const cleaned = raw
    .replace(
      /^(?:mis\s*xv|mis\s*15|xv\s*(?:años)?|15\s*años|bautismo\s*(?:de)?|mi\s+bautismo|cumple\s*(?:de)?|cumpleaños\s*(?:de)?|los\s*\d+\s*de|fiesta\s*(?:de)?)\s*/i,
      ""
    )
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  const firstLetter =
    words[0]?.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/)?.[0]?.toUpperCase() ||
    raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/)?.[0]?.toUpperCase();

  if (!firstLetter) return fallback;

  if (/\b(?:xv|15)\b/i.test(raw)) {
    return `${firstLetter} · XV`;
  }
  const ageMatch = raw.match(/\b(\d{1,2})\b/);
  if (ageMatch && !/\b(?:20\d{2})\b/.test(ageMatch[1])) {
    return `${firstLetter} · ${ageMatch[1]}`;
  }
  return firstLetter;
}
