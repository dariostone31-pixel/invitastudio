export const BUSINESS_CONFIG = {
  brandName: "InvitaStudio",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493884000000",
  bankAlias: process.env.NEXT_PUBLIC_BANK_ALIAS || "INVITA.STUDIO.AR",
  bankHolder: "InvitaStudio Argentina",
  bankName: "Mercado Pago / Transferencia Bancaria",
  adminPasscode: process.env.ADMIN_PASSCODE || "INVITA2026",
};

export interface PlanPricing {
  id: "esencial" | "pro" | "asistido";
  name: string;
  badge: string;
  listPriceNum: number;
  transferPriceNum: number;
  listPrice: string;
  transferPrice: string;
  shortDesc: string;
  features: string[];
  highlight?: boolean;
}

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: "esencial",
    name: "Plan Esencial",
    badge: "Ideal cumpleaños & bautismos",
    listPriceNum: 29900,
    transferPriceNum: 22400,
    listPrice: "$29.900",
    transferPrice: "$22.400",
    shortDesc:
      "Link único para compartir, sobre animado, música, mapa, CBU y confirmaciones.",
    features: [
      "Link web único para enviar por WhatsApp",
      "Sobre o apertura animada + música integrada",
      "Cuenta regresiva en tiempo real",
      "Mapa Google Maps + Agendar en Calendario",
      "Botón copiar Alias / CBU en 1 toque",
      "Confirmación de asistencia (RSVP) ilimitada",
      "Lista en menos de 24 horas hábiles",
    ],
  },
  {
    id: "pro",
    name: "Plan PRO",
    badge: "Más elegido para Bodas y XV",
    listPriceNum: 44900,
    transferPriceNum: 33600,
    listPrice: "$44.900",
    transferPrice: "$33.600",
    shortDesc:
      "Suma enlaces personalizados por familia con pases, menús Sin TACC y Excel.",
    highlight: true,
    features: [
      "Todo lo del Plan Esencial incluido",
      "Links personalizados con nombre de cada familia",
      "Control de pases asignados (ej. 2 o 4 lugares)",
      "Menús especiales (Sin TACC / Vegano / Infantil)",
      "Sugerencia de canciones para el DJ",
      "Galería interactiva con fotos en alta calidad",
      "Planilla Excel / CSV lista para el salón",
    ],
  },
  {
    id: "asistido",
    name: "Llave en Mano",
    badge: "Nos encargamos de absolutamente todo",
    listPriceNum: 64900,
    transferPriceNum: 48600,
    listPrice: "$64.900",
    transferPrice: "$48.600",
    shortDesc:
      "Todo PRO + nosotros cargamos tus fotos, textos y lista. Lista en <24 hs.",
    features: [
      "Todo lo del Plan PRO incluido",
      "Carga integral de tus textos, fotos e itinerario",
      "Generamos todos tus links personalizados por invitado",
      "Cambios ilimitados hasta el día del evento",
      "Asistencia prioritaria por WhatsApp",
      "Recordatorio a invitados 7 días antes",
    ],
  },
];
