import { BUSINESS_CONFIG, PRICING_PLANS } from "@/config/business";

export const LEGAL_VERSION = "2026-11-22-v1";
export const LEGAL_UPDATED_AT = "22 de noviembre de 2026";

export const LEGAL_STATUS = {
  isDraftPendingReview: true,
  missingProviderFields: [
    !BUSINESS_CONFIG.legalHolderName && "Razón social o nombre completo del responsable",
    !BUSINESS_CONFIG.taxId && "CUIT / identificación fiscal",
    !BUSINESS_CONFIG.supportEmail && "Correo electrónico oficial de soporte y reclamos",
    !BUSINESS_CONFIG.whatsappConfigured && "Número real de WhatsApp comercial",
    !BUSINESS_CONFIG.supportHours && "Horarios confirmados de atención",
    !BUSINESS_CONFIG.bankAliasConfigured && "Alias / CBU bancario definitivo del titular",
  ].filter(Boolean) as string[],
};

export interface ProviderDocItem {
  name: string;
  role: string;
  dataShared: string;
  policyUrl: string;
  transferNote: string;
}

export const ACTIVE_PROVIDERS: ProviderDocItem[] = [
  {
    name: "Vercel Inc.",
    role: "Alojamiento web y ejecución de la aplicación (si el despliegue corre en Vercel).",
    dataShared: "Solicitudes HTTP, encabezados técnicos de red y registros operativos del servidor.",
    policyUrl: "https://vercel.com/legal/privacy-policy",
    transferNote: "Infraestructura global con posible procesamiento fuera de Argentina según región configurada.",
  },
  {
    name: "PostgreSQL / Supabase (cuando DATABASE_URL / SUPABASE_URL están activos)",
    role: "Base de datos relacional del evento/confirmaciones y almacenamiento de fotografías.",
    dataShared: "Datos del pedido, configuración de la invitación, confirmaciones RSVP y fotos cargadas.",
    policyUrl: "https://supabase.com/privacy",
    transferNote: "Ubicación dependiente de la región elegida al crear el proyecto (p. ej. sa-east-1 o us-east-1).",
  },
  {
    name: "Mercado Pago (cuando el comprador elige pagar online con Checkout Pro)",
    role: "Procesamiento de pagos con tarjeta, débito o saldo en cuenta.",
    dataShared: "Importe del plan, código de pedido, nombre y correo electrónico del comprador. Invita con el Alma no recibe ni almacena números de tarjeta.",
    policyUrl: "https://www.mercadopago.com.ar/privacidad",
    transferNote: "Sujeto a las condiciones y tratamiento propio de MercadoLibre S.R.L. / Mercado Pago Argentina.",
  },
  {
    name: "Google Fonts (Next Font Optimization)",
    role: "Provisión tipográfica de fuentes web utilizadas en las invitaciones.",
    dataShared: "Descarga técnica de fuentes optimizadas durante la compilación o entrega web.",
    policyUrl: "https://policies.google.com/privacy",
    transferNote: "Sin fines publicitarios dentro del sitio.",
  },
];

export const PLAN_SCOPE_SUMMARY = PRICING_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  transferPrice: p.transferPrice,
  listPrice: p.listPrice,
  summary: p.shortDesc,
}));
