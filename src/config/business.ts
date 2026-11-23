const rawWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").trim();
const isPlaceholderWhatsapp =
  !rawWhatsapp || rawWhatsapp === "5493884000000" || rawWhatsapp === "5491100000000";

const rawSupportEmail = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim();
const rawLegalHolder = (process.env.NEXT_PUBLIC_LEGAL_HOLDER || "").trim();
const rawTaxId = (process.env.NEXT_PUBLIC_TAX_ID || "").trim();
const rawSupportHours = (process.env.NEXT_PUBLIC_SUPPORT_HOURS || "").trim();
const rawBankAlias = (process.env.NEXT_PUBLIC_BANK_ALIAS || "").trim();

export const BUSINESS_CONFIG = {
  brandName: "Invita con Alma",
  brandShortFirst: "Invita",
  brandShortSecond: "con Alma",
  tagline: "Invitaciones digitales interactivas con alma",
  whatsappNumber: isPlaceholderWhatsapp ? "" : rawWhatsapp,
  whatsappConfigured: !isPlaceholderWhatsapp,
  supportEmail: rawSupportEmail,
  legalHolderName: rawLegalHolder,
  taxId: rawTaxId,
  supportHours: rawSupportHours,
  bankAlias: rawBankAlias,
  bankAliasConfigured: Boolean(rawBankAlias && rawBankAlias !== "INVITA.STUDIO.AR"),
  bankHolder: rawLegalHolder || "Titular pendiente de confirmación",
  bankName: "Mercado Pago / Transferencia Bancaria",
  hasVerifiedProviderData: Boolean(
    rawLegalHolder && (rawSupportEmail || !isPlaceholderWhatsapp)
  ),
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
      "Un link único con diseño elegido, música predeterminada, mapa, CBU y confirmaciones.",
    includesPersonalizer: false,
    includesFamilyLinks: false,
    includesAssistedLoad: false,
    features: [
      "1 link web único para compartir por WhatsApp",
      "Diseño y música predeterminada del modelo elegido",
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
      "Habilita el Estudio de Personalización en vivo, fotos propias, historia/itinerario, links por familia y Excel.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: false,
    highlight: true,
    features: [
      "Todo lo del Plan Esencial incluido",
      "Estudio de Personalización en vivo (fotos, colores y letras)",
      "Edición de frase, padres/anfitriones, historia e itinerario",
      "Links personalizados por familia con lugares y mesa",
      "Menús especiales (Sin TACC / Vegano) + canciones DJ",
      "Muro de Buenos Deseos con mensajes de invitados",
      "Descarga de planilla Excel (.csv) lista para el salón",
    ],
  },
  {
    id: "asistido",
    name: "Llave en Mano",
    badge: "Lo cargamos por vos + Cambios asistidos",
    listPriceNum: 46665,
    transferPriceNum: 34999,
    listPrice: "$46.665",
    transferPrice: "$34.999",
    shortDesc:
      "Todo PRO + nuestro equipo carga tus fotos, textos e itinerario, más recordatorio listo para enviar por WhatsApp.",
    includesPersonalizer: true,
    includesFamilyLinks: true,
    includesAssistedLoad: true,
    features: [
      "Todo lo del Plan PRO incluido (y acceso al Estudio)",
      "Carga asistida de tus fotos, textos, padres e itinerario",
      "Armado de pases personalizados por familia/invitado",
      "Cambios asistidos previos al evento por canal de soporte",
      "Plantilla de recordatorio lista para enviar por WhatsApp",
      "Prioridad de revisión y publicación < 24 hs hábiles",
    ],
  },
];
