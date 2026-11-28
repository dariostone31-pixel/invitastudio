const DEFAULT_WHATSAPP = "5493885212331";
const DEFAULT_BANK_ALIAS = "kitdigitales1";
const DEFAULT_LEGAL_ADDRESS = "San Salvador de Jujuy, Jujuy, Argentina";
const DEFAULT_SUPPORT_HOURS =
  "Lunes a Viernes de 9:00 a 19:00 hs · Sábados de 9:00 a 13:00 hs";

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
const rawLegalAddress =
  (process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "").trim() || DEFAULT_LEGAL_ADDRESS;
const rawTaxId = (process.env.NEXT_PUBLIC_TAX_ID || "").trim();
const rawSupportHours =
  (process.env.NEXT_PUBLIC_SUPPORT_HOURS || "").trim() || DEFAULT_SUPPORT_HOURS;
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
  "Bonus si transferís: Pack Ampliado de 8 carteles en 3 tamaños (A3 para la entrada, A5 para mesas y stickers para copas) con la estética de tu modelo + activación prioritaria";

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
      "Confirmación de asistencia (RSVP) + PDF A4 con 4 carteles QR en tu panel",
      "Bonus si transferís: Pack Ampliado de 8 carteles (A3 entrada, A5 mesas, stickers copas) + prioridad",
    ],
  },
  {
    id: "pro",
    name: "Plan PRO",
    badge: "Personalización completa + Estudio",
    listPriceNum: 29999,
    transferPriceNum: 29999,
    listPrice: "$29.999",
    transferPrice: "$29.999",
    shortDesc:
      "1 link compartido con personalización visual desde el inicio, Estudio en vivo, 2 ubicaciones, música curada, Playlist DJ, Galería de Recuerdos QR y Excel.",
    includesPersonalizer: true,
    includesFamilyLinks: false,
    includesAssistedLoad: false,
    highlight: true,
    features: [
      "Todo lo del Plan Esencial incluido (1 link web único)",
      "Personalización visual completa desde el inicio + Estudio en vivo",
      "Hasta 2 ubicaciones independientes (Ceremonia y Fiesta / Salón)",
      "Fotos propias, acabados translúcidos, letras, colores e itinerario",
      "Selección de pista musical del catálogo curado",
      "Solapa Playlist para que tus invitados sugieran canciones al DJ",
      "Galería de Recuerdos QR + PDF A4 de 4 carteles + Muro de Deseos + Excel (.xlsx)",
      "Modo Recuerdo Post-Evento + Bonus si transferís: Pack Ampliado 8 carteles (A3, A5, stickers)",
    ],
  },
  {
    id: "asistido",
    name: "Llave en Mano",
    badge: "Pases por familia (Llave en Mano) + Trivia + Asistido",
    listPriceNum: 34999,
    transferPriceNum: 34999,
    listPrice: "$34.999",
    transferPrice: "$34.999",
    shortDesc:
      "Todo PRO + Invitación individual y por familia (con pases y mesa, exclusivo Llave en Mano), Trivia interactiva, canción a elección, carga asistida y Modo Recuerdo.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: true,
    features: [
      "Todo lo del Plan PRO incluido (Estudio, 2 ubicaciones y Playlist DJ)",
      "Exclusivo Llave en Mano: invitación individual y por familia (links nominales, pases y mesa)",
      "Juego Interactivo (Trivia personalizada con podio Top 5)",
      "Canción de fondo a tu elección preparada y activada por el equipo",
      "Carga asistida de tus fotos, textos, padres e itinerario",
      "Centro de Envío 1-a-1 por WhatsApp y seguimiento de invitados",
      "Modo Recuerdo Post-Evento (álbum de agradecimientos tras la fiesta)",
      "Bonus si transferís: Pack Ampliado 8 carteles (A3, A5, stickers) + activación prioritaria",
    ],
  },
];
