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
const rawTaxId = (process.env.NEXT_PUBLIC_TAX_ID || "").trim();
const rawSupportHours = (process.env.NEXT_PUBLIC_SUPPORT_HOURS || "").trim();
const envBankAlias = (process.env.NEXT_PUBLIC_BANK_ALIAS || "").trim();
const rawBankAlias =
  envBankAlias && envBankAlias !== "INVITA.STUDIO.AR"
    ? envBankAlias
    : DEFAULT_BANK_ALIAS;

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
  taxId: rawTaxId,
  supportHours: rawSupportHours,
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

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: "esencial",
    name: "Plan Esencial",
    badge: "Simple y rápido · 1 link único",
    listPriceNum: 33332,
    transferPriceNum: 24999,
    listPrice: "$33.332",
    transferPrice: "$24.999",
    shortDesc:
      "Un link único con diseño elegido, música genérica predeterminada, mapa, CBU y confirmaciones.",
    includesPersonalizer: false,
    includesFamilyLinks: false,
    includesAssistedLoad: false,
    features: [
      "1 link web único para compartir por WhatsApp",
      "Diseño y música genérica predeterminada del modelo elegido",
      "Datos básicos del evento (título, fecha, lugar, dress code)",
      "Cuenta regresiva + Mapa Google Maps + Calendario",
      "Botón para copiar Alias / CBU en 1 toque",
      "Confirmación de asistencia (RSVP) en el panel",
      "Borrador inmediato + activación < 24 hs hábiles",
    ],
  },
  {
    id: "pro",
    name: "Plan PRO",
    badge: "Personalización completa + Pases",
    listPriceNum: 39999,
    transferPriceNum: 29999,
    listPrice: "$39.999",
    transferPrice: "$29.999",
    shortDesc:
      "Personalización visual desde el inicio, catálogo de música, solapa Playlist DJ, links por familia y Excel.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: false,
    highlight: true,
    features: [
      "Todo lo del Plan Esencial incluido",
      "Personalización visual completa desde el inicio + Estudio en vivo",
      "Fotos propias, acabados translúcidos, letras, colores e itinerario",
      "Selección de pista musical del catálogo curado",
      "Solapa Playlist para que tus invitados sugieran canciones al DJ",
      "Links personalizados por familia con lugares y mesa",
      "Muro de Buenos Deseos + Excel (.csv) listo para el salón",
    ],
  },
  {
    id: "asistido",
    name: "Llave en Mano",
    badge: "Música a elección + Carga asistida",
    listPriceNum: 46665,
    transferPriceNum: 34999,
    listPrice: "$46.665",
    transferPrice: "$34.999",
    shortDesc:
      "Todo PRO + canción de fondo a tu elección preparada por nuestro equipo, carga completa de fotos/textos y recordatorio WhatsApp.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: true,
    features: [
      "Todo lo del Plan PRO incluido (solapa Playlist DJ + Estudio)",
      "Canción de fondo a tu elección preparada y activada por el equipo",
      "Carga asistida de tus fotos, textos, padres e itinerario",
      "Armado de pases personalizados por familia/invitado",
      "Cambios asistidos previos al evento por canal de soporte",
      "Plantilla de recordatorio lista para enviar por WhatsApp",
      "Prioridad de revisión y publicación < 24 hs hábiles",
    ],
  },
];
