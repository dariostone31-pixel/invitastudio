const DEFAULT_WHATSAPP = "5493885212331";
const DEFAULT_BANK_ALIAS = "kitdigitales1";

const envWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").trim();
const isPlaceholderEnvWa =
  !envWhatsapp ||
  envWhatsapp === "5493884000000" ||
  envWhatsapp === "5491100000000" ||
  envWhatsapp === "5493885750235";
const rawWhatsapp = isPlaceholderEnvWa ? DEFAULT_WHATSAPP : envWhatsapp;

export function formatWhatsAppDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (clean === "5493885212331") {
    return "+54 9 388 521-2331";
  }
  const arMatch = clean.match(/^549(\d{3})(\d{3})(\d{4})$/);
  if (arMatch) {
    return `+54 9 ${arMatch[1]} ${arMatch[2]}-${arMatch[3]}`;
  }
  return clean ? `+${clean}` : "";
}

const rawSupportEmail = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim();
const rawLegalHolder = (process.env.NEXT_PUBLIC_LEGAL_HOLDER || "").trim();
const rawLegalAddress = (process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "").trim();
const rawTaxId = (process.env.NEXT_PUBLIC_TAX_ID || "").trim();
const rawSupportHours = (process.env.NEXT_PUBLIC_SUPPORT_HOURS || "").trim();
const rawAaipRegistry = (process.env.NEXT_PUBLIC_AAIP_REGISTRY || "").trim();
const envBankAlias = (process.env.NEXT_PUBLIC_BANK_ALIAS || "").trim();
const rawBankAlias =
  envBankAlias && envBankAlias !== "INVITA.STUDIO.AR"
    ? envBankAlias
    : DEFAULT_BANK_ALIAS;

/*
 * NOTA COMERCIAL (Bloque F3):
 * Cualquier cifra o referencia numérica sobre el valor de un "cubierto" de salón
 * vive EXCLUSIVAMENTE fuera de la aplicación web (comunicación directa por WhatsApp
 * o creativos publicitarios con fecha visible). Nunca hardcodear valores de cubierto
 * en src/ para evitar desactualización por inflación y publicidad comparativa riesgosa.
 */

export const BUSINESS_CONFIG = {
  brandName: "Invita con el Alma",
  brandShortFirst: "Invita",
  brandShortSecond: "con el Alma",
  tagline: "Invitaciones digitales de studio con alma",
  whatsappNumber: rawWhatsapp,
  whatsappDisplay: formatWhatsAppDisplay(rawWhatsapp),
  whatsappConfigured: Boolean(rawWhatsapp),
  supportEmail: rawSupportEmail,
  legalHolderName: rawLegalHolder || "Invita con el Alma",
  legalAddress: rawLegalAddress,
  taxId: rawTaxId,
  supportHours: rawSupportHours,
  aaipRegistryStatus:
    rawAaipRegistry ||
    "Inscripción en trámite ante el Registro Nacional de Bases de Datos Personales de la AAIP (Ley 25.326).",
  bankAlias: rawBankAlias,
  bankAliasConfigured: Boolean(rawBankAlias),
  bankHolder: rawLegalHolder || "Invita con el Alma",
  bankName: "Mercado Pago / Transferencia Bancaria",
  hasVerifiedProviderData: Boolean(rawWhatsapp && rawBankAlias),
};

export function getWhatsAppHref(message: string): string | null {
  if (!BUSINESS_CONFIG.whatsappConfigured || !BUSINESS_CONFIG.whatsappNumber) {
    return null;
  }
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export interface PlanPricing {
  id: "esencial" | "pro" | "asistido";
  name: string;
  badge: string;
  listPriceNum: number;
  transferPriceNum: number;
  listPrice: string;
  transferPrice: string;
  shortDesc: string;
  includesPersonalizer: boolean;
  includesFamilyLinks: boolean;
  includesAssistedLoad: boolean;
  features: string[];
  highlight?: boolean;
}

export const TRANSFER_BONUS_HEADLINE =
  "Bonus si transferís: PDF imprimible A4 con 4 carteles QR para mesas + activación prioritaria";

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: "esencial",
    name: "Plan Esencial",
    badge: "Simple y rápido · 1 link único",
    listPriceNum: 24999,
    transferPriceNum: 24999,
    listPrice: "$24.999",
    transferPrice: "$24.999",
    shortDesc:
      "Un link único con diseño elegido, música predeterminada, mapa, CBU y confirmaciones.",
    includesPersonalizer: false,
    includesFamilyLinks: false,
    includesAssistedLoad: false,
    features: [
      "1 link web único para compartir por WhatsApp",
      "Diseño y música predeterminada del modelo elegido",
      "Datos básicos del evento (título, fecha, lugar, dress code)",
      "Cuenta regresiva + 1 Ubicación Google Maps + Calendario",
      "Botón para copiar Alias / CBU en 1 toque",
      "Confirmación de asistencia (RSVP) en el panel",
      "PDF imprimible A4 con 4 carteles QR (bonus si transferís)",
    ],
  },
  {
    id: "pro",
    name: "Plan PRO",
    badge: "Personalización completa + Pases",
    listPriceNum: 29999,
    transferPriceNum: 29999,
    listPrice: "$29.999",
    transferPrice: "$29.999",
    shortDesc:
      "Personalización visual desde el inicio, hasta 2 ubicaciones, catálogo de música, Playlist DJ, links por familia y Excel.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: false,
    highlight: true,
    features: [
      "Todo lo del Plan Esencial incluido",
      "Personalización visual completa desde el inicio + Estudio en vivo",
      "Hasta 2 ubicaciones independientes (Ceremonia y Fiesta / Salón)",
      "Fotos propias, acabados translúcidos, letras, colores e itinerario",
      "Selección de pista musical del catálogo curado",
      "Solapa Playlist para que tus invitados sugieran canciones al DJ",
      "Links nominales por familia con lugares y mesa asignados",
      "Muro de Buenos Deseos + Excel (.xlsx) + PDF A4 con 4 carteles QR",
    ],
  },
  {
    id: "asistido",
    name: "Llave en Mano",
    badge: "Música a elección + Trivia + Asistido",
    listPriceNum: 34999,
    transferPriceNum: 34999,
    listPrice: "$34.999",
    transferPrice: "$34.999",
    shortDesc:
      "Todo PRO + Juego Interactivo (Trivia), canción de fondo a tu elección preparada por nuestro equipo y carga completa.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: true,
    features: [
      "Todo lo del Plan PRO incluido (2 ubicaciones + Playlist DJ + Estudio)",
      "Juego Interactivo (Trivia personalizada con podio Top 5)",
      "Canción de fondo a tu elección preparada y activada por el equipo",
      "Carga asistida de tus fotos, textos, padres e itinerario",
      "Armado de pases personalizados por familia/invitado",
      "Cambios asistidos previos al evento por canal de soporte",
      "Plantilla de recordatorio lista para enviar por WhatsApp",
      "PDF A4 con 4 carteles QR + prioridad de publicación < 24 hs hábiles",
    ],
  },
];
