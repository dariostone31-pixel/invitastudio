import type { EventCategory } from "@/templates/catalog";

export interface SubtitlePresetGroup {
  label: string;
  options: string[];
}

export const SUBTITLE_PRESETS_BY_CATEGORY: Record<EventCategory, string[]> = {
  boda: [
    "¡Nos Casamos!",
    "Somos más que novios",
    "Nuestro Gran Día",
    "Unimos nuestras vidas",
    "¡Celebramos el Amor!",
    "El comienzo de nuestro para siempre",
    "¡Nos Casamos por Civil!",
    "¡Llega nuestro Sí, quiero!",
    "Renovamos nuestros votos",
    "¡Te invitamos a celebrar!",
  ],
  xv: [
    "Mis XV Años",
    "Mi Noche Soñada",
    "Una Noche Inolvidable",
    "¡Festejamos mis 15!",
    "¡Celebramos la Vida!",
  ],
  hombre: [
    "¡Celebramos la Vida!",
    "¡Cumplo 18!",
    "Una Noche Especial",
    "¡Brindemos Juntos!",
    "Edición Especial",
    "¡Te invito a festejar!",
  ],
  nino: [
    "¡Te invito a mi Cumple!",
    "¡Se viene una Gran Aventura!",
    "¡Festejamos Juntos!",
    "¡Cumpleaños Feliz!",
  ],
  nina: [
    "¡Te invito a mi Cumple!",
    "Un Día Mágico",
    "¡Festejamos Juntos!",
    "¡Celebramos mi Cumple!",
  ],
  bautismo: [
    "Mi Bautismo",
    "¡Bienvenidos a mi Bautismo!",
    "Mi Primer Añito",
    "Con mucho amor",
    "¡Te esperamos para bendecir este día!",
  ],
};

/**
 * Detecta si en una plantilla de boda se ingresó un único nombre (sin conectores de pareja).
 */
export function isSinglePersonWeddingTitle(title?: string): boolean {
  const raw = (title || "").trim();
  if (!raw) return false;
  if (/(?:\s+(?:y|&|\+|e)\s+)|(?:\s*\/\s*)|(?:\s+-\s+)|,/i.test(raw)) {
    return false;
  }
  const clean = raw
    .replace(/^(?:boda\s+de|casamiento\s+de|nuestra\s+boda)\s+/i, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return words.length <= 2;
}

/**
 * Resuelve el subtítulo final de portada con fallback inteligente cuando en Bodas hay un solo nombre.
 */
export function resolveEventSubtitle(params: {
  category: EventCategory;
  eventTitle?: string;
  customSubtitle?: string | null;
  defaultEyebrow: string;
}): string {
  const explicit = (params.customSubtitle || "").trim();
  if (explicit) return explicit;

  if (params.category === "boda" && isSinglePersonWeddingTitle(params.eventTitle)) {
    return "¡Celebramos el Amor!";
  }
  return params.defaultEyebrow;
}
