import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { normalizePhone, hashIp } from "@/lib/phone";

export type OrderStatus = "pendiente" | "en_edicion" | "publicada";
export type PaymentStatus = "pendiente" | "pagado" | "rechazado";
export type PaymentMethod = "mercadopago" | "transferencia";

export interface CustomEventLocation {
  label: string;
  venue: string;
  address: string;
  time: string;
  mapsUrl?: string;
}

export interface EnabledSectionsConfig {
  countdown: boolean;
  story: boolean;
  schedule: boolean;
  gallery: boolean;
  dressCode: boolean;
  gifts: boolean;
  wishes?: boolean;
  djSongs?: boolean;
  djVoting?: boolean;
  trivia?: boolean;
  collaborativeAlbum?: boolean;
  rsvp: boolean;
  locations?: CustomEventLocation[];
  subtitle?: string;
}

export interface DjSongItem {
  id: string;
  guestName: string;
  song: string;
  votes?: number;
  createdAt: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TriviaScore {
  id: string;
  guestName: string;
  score: number;
  total: number;
  createdAt: string;
}

export interface PreloadedGuest {
  id: string;
  name: string;
  maxPasses: number;
  table?: string;
  pase?: "todo" | "ceremonia" | "fiesta";
  whatsapp?: string;
  sent?: boolean;
}

export interface ParentsOrHostsGroup {
  label: string;
  names: string[];
}

export interface ScheduleItem {
  time: string;
  title: string;
  detail: string;
}

export interface TarjetaTier {
  label: string;
  price: string;
}

export type HeroOverlayStyle =
  | "natural"
  | "translucido-suave"
  | "velo-editorial"
  | "cinematico"
  | "bn-editorial";

export interface EventRecord {
  id: string;
  orderCode: string;
  slug: string;
  panelToken: string;
  skinId: string;
  planId: "esencial" | "pro" | "asistido";
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  paidAmount?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  leadId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  eventTitle: string;
  dateISO: string;
  dateDisplay: string;
  timeDisplay: string;
  venue: string;
  address: string;
  city: string;
  alias: string;
  giftBank?: string;
  giftHolder?: string;
  dressCode: string;
  rsvpDeadline?: string;
  adultsOnly?: boolean;
  tarjetaPricing?: TarjetaTier[];
  tarjetaNote?: string;
  quote: string;
  parentsOrHosts?: ParentsOrHostsGroup[];
  storyTitle?: string;
  storyText?: string;
  schedule?: ScheduleItem[];
  heroImageUrl?: string;
  heroOverlayOverride?: HeroOverlayStyle;
  galleryImages?: string[];
  fontOverride?:
    | "cormorant"
    | "script"
    | "pinyon"
    | "fraunces"
    | "cinzel"
    | "oswald"
    | "fredoka"
    | "playfair";
  accentOverride?: string;
  audioOverride?: string;
  songRequest?: string;
  djPlaylist?: DjSongItem[];
  triviaTitle?: string;
  triviaQuestions?: TriviaQuestion[];
  triviaScores?: TriviaScore[];
  albumUrl?: string;
  instagramHandle?: string;
  eventHashtag?: string;
  guestList?: PreloadedGuest[];
  memoryMode?: boolean;
  enabledSections?: EnabledSectionsConfig;
  termsAccepted?: boolean;
  termsVersion?: string;
  termsAcceptedAtUtc?: string;
  contactName: string;
  whatsapp: string;
  email: string;
  notes: string;
  createdAt: string;
}

export interface RsvpRecord {
  id: string;
  eventSlug: string;
  guestName: string;
  attending: boolean;
  passesUsed: number;
  companions: string;
  dietary: string[];
  song: string;
  message: string;
  createdAt: string;
}

export type LeadStage =
  | "prueba_iniciada"
  | "prueba_capturada"
  | "encargar_borrador"
  | "pedido_creado"
  | "entregado"
  | "testimonio_pedido"
  | "testimonio_recibido"
  | "recompra_ofrecida";

export interface LeadRecord {
  id: string;
  stage: LeadStage;
  source: "minitester" | "encargar" | "demo";
  contactName: string;
  whatsapp: string;
  normalizedPhone: string;
  email?: string;
  category?: string;
  skinId?: string;
  planId?: string;
  eventTitle?: string;
  guestSample?: string;
  convertedOrderCode?: string;
  consentService: boolean;
  consentMarketing: boolean;
  consentAt?: string;
  consentTextVersion?: string;
  consentSource?: string;
  ipHash?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  testerStep?: string;
  optedOutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelEventRecord {
  id: string;
  sessionId: string;
  source: string;
  step: "step_1" | "step_2" | "step_3" | "step_4" | "generated";
  category?: string;
  skinId?: string;
  utmSource?: string;
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actor: string;
  action: string;
  rowCount: number;
  meta?: string;
  createdAt: string;
}

export interface MpWebhookLogRecord {
  id: string;
  topic: string;
  dataId: string;
  paymentId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  firmaOk: boolean;
  manifestUsed?: string;
  montoOk: boolean;
  resultado: string;
  detalle?: string;
  createdAt: string;
}

interface DatabaseShape {
  events: EventRecord[];
  rsvps: RsvpRecord[];
  leads?: LeadRecord[];
  funnelEvents?: FunnelEventRecord[];
  auditLogs?: AdminAuditLogRecord[];
  mpWebhookLogs?: MpWebhookLogRecord[];
  marketingOptOuts?: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const TMP_DATA_DIR = "/tmp/invita-con-alma-data";

function resolveWritableDataDir(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.accessSync(DATA_DIR, fs.constants.W_OK);
    return DATA_DIR;
  } catch {
    if (!fs.existsSync(TMP_DATA_DIR)) {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    }
    return TMP_DATA_DIR;
  }
}

function getStorePath(): string {
  return path.join(resolveWritableDataDir(), "store.json");
}

const INITIAL_SEED: DatabaseShape = {
  events: [
    {
      id: "evt-demo-boda",
      orderCode: "INV-1001",
      slug: "sofia-y-lucas",
      panelToken: "demo-boda",
      skinId: "boda-sobre-marfil",
      planId: "pro",
      status: "publicada",
      paymentStatus: "pagado",
      paymentMethod: "transferencia",
      paidAmount: 29999,
      eventTitle: "Sofía & Lucas",
      dateISO: "2027-04-17T19:30:00-03:00",
      dateDisplay: "Sábado 17 de Abril de 2027",
      timeDisplay: "19:30 hs",
      venue: "Finca Los Olivares",
      address: "Ruta Provincial 26 Km 4",
      city: "Luján de Cuyo, Mendoza",
      alias: "SOFIA.LUCAS.BODA",
      dressCode: "Elegante / Formal",
      quote:
        "Hay momentos en la vida que son especiales por sí solos, pero compartirlos con quienes más queremos los vuelve inolvidables.",
      contactName: "Sofía Martínez",
      whatsapp: "5492615550101",
      email: "sofia@ejemplo.com",
      notes: "Ceremonia al aire libre en el jardín principal.",
      createdAt: "2026-11-20T12:00:00.000Z",
    },
    {
      id: "evt-demo-xv",
      orderCode: "INV-1002",
      slug: "mis-xv-valen",
      panelToken: "demo-xv",
      skinId: "xv-gala-rosa",
      planId: "asistido",
      status: "publicada",
      paymentStatus: "pagado",
      paymentMethod: "mercadopago",
      paidAmount: 46665,
      eventTitle: "Mis XV Valentina",
      dateISO: "2027-05-22T21:00:00-03:00",
      dateDisplay: "Sábado 22 de Mayo de 2027",
      timeDisplay: "21:00 hs",
      venue: "Salón Palacio Duhau Eventos",
      address: "Av. Libertador 2450",
      city: "San Isidro, Buenos Aires",
      alias: "VALEN.XV.2027",
      dressCode: "Elegante Sport / Gala Juvenil",
      quote:
        "Empieza una noche soñada, rodeada de música, amigos y las personas que hacen mi vida más feliz.",
      contactName: "Carolina (mamá de Valen)",
      whatsapp: "549115550202",
      email: "caro@ejemplo.com",
      notes: "Mesa joven con menú especial sin TACC.",
      createdAt: "2026-11-20T15:30:00.000Z",
    },
  ],
  rsvps: [
    {
      id: "rsvp-1",
      eventSlug: "sofia-y-lucas",
      guestName: "Familia García López",
      attending: true,
      passesUsed: 4,
      companions: "Martín, Laura, Mateo y Juli",
      dietary: ["Sin TACC / Celíaco"],
      song: "La Vida Es Un Carnaval — Celia Cruz",
      message: "¡Qué felicidad enorme! Ahí estaremos los cuatro.",
      createdAt: "2026-11-20T18:10:00.000Z",
    },
    {
      id: "rsvp-2",
      eventSlug: "sofia-y-lucas",
      guestName: "Julieta Fernández & Franco",
      attending: true,
      passesUsed: 2,
      companions: "Franco Díaz",
      dietary: ["Vegetariano"],
      song: "Don't Stop Me Now — Queen",
      message: "¡No nos lo perdemos por nada!",
      createdAt: "2026-11-20T19:45:00.000Z",
    },
    {
      id: "rsvp-3",
      eventSlug: "sofia-y-lucas",
      guestName: "Tío Roberto Gómez",
      attending: false,
      passesUsed: 0,
      companions: "",
      dietary: [],
      song: "",
      message: "Justo estoy de viaje en Córdoba, les mando un abrazo gigante.",
      createdAt: "2026-11-21T01:15:00.000Z",
    },
    {
      id: "rsvp-4",
      eventSlug: "mis-xv-valen",
      guestName: "Camila Torres",
      attending: true,
      passesUsed: 1,
      companions: "",
      dietary: [],
      song: "Corazón Vacío — María Becerra",
      message: "¡Va a ser la mejor noche!",
      createdAt: "2026-11-21T02:00:00.000Z",
    },
  ],
};

// ================= POSTGRESQL / SUPABASE SINGLETON =================

declare global {
  var __invitaPgPool: Pool | undefined;
  var __invitaPgInit: Promise<void> | undefined;
}

export function getDbMode(): "postgres" | "json-local" {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return "postgres";
  }
  if (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_LOCAL_JSON_STORE === "1"
  ) {
    return "json-local";
  }
  throw new Error(
    "DATABASE_URL es obligatorio fuera de NODE_ENV=development. Postgres es la única fuente de verdad."
  );
}

function getPool(): Pool {
  if (!global.__invitaPgPool) {
    global.__invitaPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 10,
    });
  }
  return global.__invitaPgPool;
}

async function ensurePgReady(): Promise<Pool> {
  const pool = getPool();
  if (!global.__invitaPgInit) {
    global.__invitaPgInit = (async () => {
      await pool.query(`
        create table if not exists public.events (
          id text primary key,
          order_code text not null unique,
          slug text not null unique,
          panel_token text not null unique,
          skin_id text not null,
          plan_id text not null,
          status text not null default 'pendiente',
          payment_status text not null default 'pendiente',
          payment_method text,
          mp_preference_id text,
          mp_payment_id text,
          paid_amount integer,
          event_title text not null,
          date_iso text not null,
          date_display text not null,
          time_display text not null,
          venue text not null,
          address text not null default '',
          city text not null default 'Argentina',
          alias text not null default '',
          gift_bank text,
          gift_holder text,
          dress_code text not null default 'Elegante Sport',
          quote text not null default '',
          parents_or_hosts jsonb,
          story_title text,
          story_text text,
          schedule jsonb,
          hero_image_url text,
          gallery_images jsonb,
          font_override text,
          accent_override text,
          audio_override text,
          song_request text,
          dj_playlist jsonb not null default '[]'::jsonb,
          trivia_title text,
          trivia_questions jsonb,
          trivia_scores jsonb not null default '[]'::jsonb,
          album_url text,
          instagram_handle text,
          event_hashtag text,
          guest_list jsonb not null default '[]'::jsonb,
          memory_mode boolean not null default false,
          enabled_sections jsonb,
          terms_accepted boolean,
          terms_version text,
          terms_accepted_at_utc text,
          contact_name text not null,
          whatsapp text not null,
          email text not null,
          notes text not null default '',
          created_at timestamptz not null default now()
        );
        alter table public.events add column if not exists payment_status text not null default 'pendiente';
        alter table public.events add column if not exists alias text not null default '';
        alter table public.events add column if not exists gift_bank text;
        alter table public.events add column if not exists gift_holder text;
        alter table public.events add column if not exists rsvp_deadline text;
        alter table public.events add column if not exists adults_only boolean not null default false;
        alter table public.events add column if not exists tarjeta_pricing jsonb;
        alter table public.events add column if not exists tarjeta_note text;
        alter table public.events add column if not exists payment_method text;
        alter table public.events add column if not exists mp_preference_id text;
        alter table public.events add column if not exists mp_payment_id text;
        alter table public.events add column if not exists paid_amount integer;
        alter table public.events add column if not exists parents_or_hosts jsonb;
        alter table public.events add column if not exists story_title text;
        alter table public.events add column if not exists story_text text;
        alter table public.events add column if not exists schedule jsonb;
        alter table public.events add column if not exists hero_image_url text;
        alter table public.events add column if not exists hero_overlay_override text;
        alter table public.events add column if not exists gallery_images jsonb;
        alter table public.events add column if not exists font_override text;
        alter table public.events add column if not exists accent_override text;
        alter table public.events add column if not exists audio_override text;
        alter table public.events add column if not exists song_request text;
        alter table public.events add column if not exists dj_playlist jsonb not null default '[]'::jsonb;
        alter table public.events add column if not exists trivia_title text;
        alter table public.events add column if not exists trivia_questions jsonb;
        alter table public.events add column if not exists trivia_scores jsonb not null default '[]'::jsonb;
        alter table public.events add column if not exists album_url text;
        alter table public.events add column if not exists instagram_handle text;
        alter table public.events add column if not exists event_hashtag text;
        alter table public.events add column if not exists guest_list jsonb not null default '[]'::jsonb;
        alter table public.events add column if not exists memory_mode boolean not null default false;
        alter table public.events add column if not exists enabled_sections jsonb;
        alter table public.events add column if not exists terms_accepted boolean;
        alter table public.events add column if not exists terms_version text;
        alter table public.events add column if not exists terms_accepted_at_utc text;
        alter table public.events add column if not exists verified_by text;
        alter table public.events add column if not exists verified_at timestamptz;
        alter table public.events add column if not exists lead_id text;
        alter table public.events add column if not exists utm_source text;
        alter table public.events add column if not exists utm_medium text;
        alter table public.events add column if not exists utm_campaign text;
        alter table public.events add column if not exists utm_content text;
        create table if not exists public.rsvps (
          id text primary key,
          event_slug text not null references public.events(slug) on delete cascade,
          guest_name text not null,
          attending boolean not null default true,
          passes_used integer not null default 1,
          companions text not null default '',
          dietary jsonb not null default '[]'::jsonb,
          song text not null default '',
          message text not null default '',
          created_at timestamptz not null default now()
        );
        create table if not exists public.leads (
          id text primary key,
          stage text not null default 'prueba_capturada',
          source text not null default 'minitester',
          contact_name text not null default '',
          whatsapp text not null default '',
          normalized_phone text not null default '',
          email text,
          category text,
          skin_id text,
          plan_id text,
          event_title text,
          guest_sample text,
          converted_order_code text,
          consent_service boolean not null default true,
          consent_marketing boolean not null default false,
          consent_at timestamptz,
          consent_text_version text,
          consent_source text,
          ip_hash text,
          utm_source text,
          utm_medium text,
          utm_campaign text,
          utm_content text,
          tester_step text,
          opted_out_at timestamptz,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
        alter table public.leads add column if not exists normalized_phone text not null default '';
        alter table public.leads add column if not exists consent_service boolean not null default true;
        alter table public.leads add column if not exists consent_marketing boolean not null default false;
        alter table public.leads add column if not exists consent_at timestamptz;
        alter table public.leads add column if not exists consent_text_version text;
        alter table public.leads add column if not exists consent_source text;
        alter table public.leads add column if not exists ip_hash text;
        alter table public.leads add column if not exists utm_source text;
        alter table public.leads add column if not exists utm_medium text;
        alter table public.leads add column if not exists utm_campaign text;
        alter table public.leads add column if not exists utm_content text;
        alter table public.leads add column if not exists tester_step text;
        alter table public.leads add column if not exists opted_out_at timestamptz;
        create unique index if not exists idx_leads_normalized_phone_stage
          on public.leads (normalized_phone, stage)
          where normalized_phone is not null and normalized_phone <> '';
        create table if not exists public.marketing_opt_outs (
          normalized_phone text primary key,
          opted_out_at timestamptz not null default now(),
          source text not null default 'whatsapp_baja'
        );
        create table if not exists public.funnel_events (
          id text primary key,
          session_id text not null,
          source text not null default 'minitester',
          step text not null,
          category text,
          skin_id text,
          utm_source text,
          created_at timestamptz not null default now()
        );
        create table if not exists public.admin_audit_log (
          id text primary key,
          actor text not null default 'admin',
          action text not null,
          row_count integer not null default 0,
          meta text,
          created_at timestamptz not null default now()
        );
        create table if not exists public.mp_webhook_logs (
          id text primary key,
          topic text not null default '',
          data_id text not null default '',
          payment_id text,
          external_reference text,
          status text,
          amount integer,
          firma_ok boolean not null default false,
          manifest_used text,
          monto_ok boolean not null default false,
          resultado text not null,
          detalle text,
          created_at timestamptz not null default now()
        );
      `);

      const countRes = await pool.query("select count(*)::int as cnt from public.events");
      if (countRes.rows[0]?.cnt === 0) {
        for (const ev of INITIAL_SEED.events) {
          await insertEventPg(pool, ev);
        }
        for (const r of INITIAL_SEED.rsvps) {
          await insertRsvpPg(pool, r);
        }
      }
    })();
  }
  await global.__invitaPgInit;
  return pool;
}

function rowToEvent(row: Record<string, unknown>): EventRecord {
  return {
    id: String(row.id),
    orderCode: String(row.order_code),
    slug: String(row.slug),
    panelToken: String(row.panel_token),
    skinId: String(row.skin_id),
    planId: row.plan_id as EventRecord["planId"],
    status: row.status as OrderStatus,
    paymentStatus: (row.payment_status as PaymentStatus) || "pendiente",
    paymentMethod: (row.payment_method as PaymentMethod) || undefined,
    mpPreferenceId: row.mp_preference_id ? String(row.mp_preference_id) : undefined,
    mpPaymentId: row.mp_payment_id ? String(row.mp_payment_id) : undefined,
    paidAmount: typeof row.paid_amount === "number" ? row.paid_amount : undefined,
    verifiedBy: row.verified_by ? String(row.verified_by) : undefined,
    verifiedAt: row.verified_at ? new Date(String(row.verified_at)).toISOString() : undefined,
    leadId: row.lead_id ? String(row.lead_id) : undefined,
    utmSource: row.utm_source ? String(row.utm_source) : undefined,
    utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
    utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
    utmContent: row.utm_content ? String(row.utm_content) : undefined,
    eventTitle: String(row.event_title),
    dateISO: String(row.date_iso),
    dateDisplay: String(row.date_display),
    timeDisplay: String(row.time_display),
    venue: String(row.venue),
    address: String(row.address ?? ""),
    city: String(row.city ?? "Argentina"),
    alias: String(row.alias ?? ""),
    giftBank: row.gift_bank ? String(row.gift_bank) : undefined,
    giftHolder: row.gift_holder ? String(row.gift_holder) : undefined,
    dressCode: String(row.dress_code ?? "Elegante Sport"),
    rsvpDeadline: row.rsvp_deadline ? String(row.rsvp_deadline) : undefined,
    adultsOnly: Boolean(row.adults_only),
    tarjetaPricing: Array.isArray(row.tarjeta_pricing)
      ? (row.tarjeta_pricing as TarjetaTier[])
      : undefined,
    tarjetaNote: row.tarjeta_note ? String(row.tarjeta_note) : undefined,
    quote: String(row.quote ?? ""),
    parentsOrHosts: Array.isArray(row.parents_or_hosts)
      ? (row.parents_or_hosts as ParentsOrHostsGroup[])
      : undefined,
    storyTitle: row.story_title ? String(row.story_title) : undefined,
    storyText: row.story_text ? String(row.story_text) : undefined,
    schedule: Array.isArray(row.schedule)
      ? (row.schedule as ScheduleItem[])
      : undefined,
    heroImageUrl: row.hero_image_url ? String(row.hero_image_url) : undefined,
    heroOverlayOverride: row.hero_overlay_override
      ? (String(row.hero_overlay_override) as HeroOverlayStyle)
      : undefined,
    galleryImages: Array.isArray(row.gallery_images)
      ? (row.gallery_images as string[])
      : undefined,
    fontOverride: row.font_override
      ? (String(row.font_override) as EventRecord["fontOverride"])
      : undefined,
    accentOverride: row.accent_override ? String(row.accent_override) : undefined,
    audioOverride: row.audio_override ? String(row.audio_override) : undefined,
    songRequest: row.song_request ? String(row.song_request) : undefined,
    djPlaylist: Array.isArray(row.dj_playlist)
      ? (row.dj_playlist as DjSongItem[])
      : [],
    triviaTitle: row.trivia_title ? String(row.trivia_title) : undefined,
    triviaQuestions: Array.isArray(row.trivia_questions)
      ? (row.trivia_questions as TriviaQuestion[])
      : undefined,
    triviaScores: Array.isArray(row.trivia_scores)
      ? (row.trivia_scores as TriviaScore[])
      : [],
    albumUrl: row.album_url ? String(row.album_url) : undefined,
    instagramHandle: row.instagram_handle ? String(row.instagram_handle) : undefined,
    eventHashtag: row.event_hashtag ? String(row.event_hashtag) : undefined,
    guestList: Array.isArray(row.guest_list)
      ? (row.guest_list as PreloadedGuest[])
      : [],
    memoryMode: Boolean(row.memory_mode),
    enabledSections: (row.enabled_sections as EnabledSectionsConfig) || undefined,
    termsAccepted: typeof row.terms_accepted === "boolean" ? row.terms_accepted : undefined,
    termsVersion: row.terms_version ? String(row.terms_version) : undefined,
    termsAcceptedAtUtc: row.terms_accepted_at_utc ? String(row.terms_accepted_at_utc) : undefined,
    contactName: String(row.contact_name),
    whatsapp: String(row.whatsapp),
    email: String(row.email),
    notes: String(row.notes ?? ""),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function rowToRsvp(row: Record<string, unknown>): RsvpRecord {
  return {
    id: String(row.id),
    eventSlug: String(row.event_slug),
    guestName: String(row.guest_name),
    attending: Boolean(row.attending),
    passesUsed: Number(row.passes_used ?? 0),
    companions: String(row.companions ?? ""),
    dietary: Array.isArray(row.dietary) ? (row.dietary as string[]) : [],
    song: String(row.song ?? ""),
    message: String(row.message ?? ""),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

async function insertEventPg(pool: Pool, ev: EventRecord) {
  await pool.query(
    `insert into public.events (
      id, order_code, slug, panel_token, skin_id, plan_id, status,
      payment_status, payment_method, mp_preference_id, mp_payment_id, paid_amount,
      event_title, date_iso, date_display, time_display, venue, address, city,
      alias, gift_bank, gift_holder, dress_code, rsvp_deadline, adults_only, tarjeta_pricing, tarjeta_note, quote, parents_or_hosts, story_title, story_text, schedule,
      hero_image_url, hero_overlay_override, gallery_images,
      font_override, accent_override, audio_override, song_request, dj_playlist,
      trivia_title, trivia_questions, trivia_scores, album_url, instagram_handle, event_hashtag, guest_list,
      memory_mode, enabled_sections,
      terms_accepted, terms_version, terms_accepted_at_utc,
      verified_by, verified_at, lead_id, utm_source, utm_medium, utm_campaign, utm_content,
      contact_name, whatsapp, email, notes, created_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
      $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64
    )`,
    [
      ev.id,
      ev.orderCode,
      ev.slug,
      ev.panelToken,
      ev.skinId,
      ev.planId,
      ev.status,
      ev.paymentStatus ?? "pendiente",
      ev.paymentMethod ?? null,
      ev.mpPreferenceId ?? null,
      ev.mpPaymentId ?? null,
      ev.paidAmount ?? null,
      ev.eventTitle,
      ev.dateISO,
      ev.dateDisplay,
      ev.timeDisplay,
      ev.venue,
      ev.address,
      ev.city,
      ev.alias,
      ev.giftBank ?? null,
      ev.giftHolder ?? null,
      ev.dressCode,
      ev.rsvpDeadline ?? null,
      Boolean(ev.adultsOnly),
      ev.tarjetaPricing ? JSON.stringify(ev.tarjetaPricing) : null,
      ev.tarjetaNote ?? null,
      ev.quote,
      ev.parentsOrHosts ? JSON.stringify(ev.parentsOrHosts) : null,
      ev.storyTitle ?? null,
      ev.storyText ?? null,
      ev.schedule ? JSON.stringify(ev.schedule) : null,
      ev.heroImageUrl ?? null,
      ev.heroOverlayOverride ?? null,
      ev.galleryImages ? JSON.stringify(ev.galleryImages) : null,
      ev.fontOverride ?? null,
      ev.accentOverride ?? null,
      ev.audioOverride ?? null,
      ev.songRequest ?? null,
      JSON.stringify(ev.djPlaylist ?? []),
      ev.triviaTitle ?? null,
      ev.triviaQuestions ? JSON.stringify(ev.triviaQuestions) : null,
      JSON.stringify(ev.triviaScores ?? []),
      ev.albumUrl ?? null,
      ev.instagramHandle ?? null,
      ev.eventHashtag ?? null,
      JSON.stringify(ev.guestList ?? []),
      Boolean(ev.memoryMode),
      ev.enabledSections ? JSON.stringify(ev.enabledSections) : null,
      typeof ev.termsAccepted === "boolean" ? ev.termsAccepted : null,
      ev.termsVersion ?? null,
      ev.termsAcceptedAtUtc ?? null,
      ev.verifiedBy ?? null,
      ev.verifiedAt ?? null,
      ev.leadId ?? null,
      ev.utmSource ?? null,
      ev.utmMedium ?? null,
      ev.utmCampaign ?? null,
      ev.utmContent ?? null,
      ev.contactName,
      ev.whatsapp,
      ev.email,
      ev.notes,
      ev.createdAt,
    ]
  );
}

async function insertRsvpPg(pool: Pool, r: RsvpRecord) {
  await pool.query(
    `insert into public.rsvps (
      id, event_slug, guest_name, attending, passes_used, companions, dietary, song, message, created_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      r.id,
      r.eventSlug,
      r.guestName,
      r.attending,
      r.passesUsed,
      r.companions,
      JSON.stringify(r.dietary),
      r.song,
      r.message,
      r.createdAt,
    ]
  );
}

// ================= LOCAL JSON FALLBACK =================

function ensureLocalStore(): DatabaseShape {
  const storePath = getStorePath();
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
    return structuredClone(INITIAL_SEED);
  }
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseShape;
    if (!Array.isArray(parsed.leads)) parsed.leads = [];
    if (!Array.isArray(parsed.funnelEvents)) parsed.funnelEvents = [];
    if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
    if (!Array.isArray(parsed.marketingOptOuts)) parsed.marketingOptOuts = [];
    return parsed;
  } catch {
    fs.writeFileSync(storePath, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
    return structuredClone(INITIAL_SEED);
  }
}

function saveLocalStore(data: DatabaseShape) {
  const storePath = getStorePath();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
}

// ================= HELPERS =================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
}

export function formatSpanishDate(dateStr: string): string {
  if (!dateStr) return "Fecha a confirmar";
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ================= PUBLIC ASYNC REPOSITORY API =================

export async function listEvents(): Promise<EventRecord[]> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.events order by created_at desc");
    return res.rows.map(rowToEvent);
  }
  const db = ensureLocalStore();
  return [...db.events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEventBySlug(slug: string): Promise<EventRecord | undefined> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.events where slug = $1 limit 1", [slug]);
    return res.rows[0] ? rowToEvent(res.rows[0]) : undefined;
  }
  const db = ensureLocalStore();
  return db.events.find((e) => e.slug === slug);
}

export async function getEventByPanelToken(token: string): Promise<EventRecord | undefined> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.events where panel_token = $1 limit 1", [
      token,
    ]);
    return res.rows[0] ? rowToEvent(res.rows[0]) : undefined;
  }
  const db = ensureLocalStore();
  return db.events.find((e) => e.panelToken === token);
}

export async function getEventById(id: string): Promise<EventRecord | undefined> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.events where id = $1 limit 1", [id]);
    return res.rows[0] ? rowToEvent(res.rows[0]) : undefined;
  }
  const db = ensureLocalStore();
  return db.events.find((e) => e.id === id);
}

export async function getEventByOrderCode(orderCode: string): Promise<EventRecord | undefined> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.events where order_code = $1 limit 1", [
      orderCode,
    ]);
    return res.rows[0] ? rowToEvent(res.rows[0]) : undefined;
  }
  const db = ensureLocalStore();
  return db.events.find((e) => e.orderCode === orderCode);
}

export async function createOrderEvent(input: {
  skinId: string;
  planId: "esencial" | "pro" | "asistido";
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  alias: string;
  giftBank?: string;
  giftHolder?: string;
  dressCode: string;
  rsvpDeadline?: string;
  adultsOnly?: boolean;
  tarjetaPricing?: TarjetaTier[];
  tarjetaNote?: string;
  quote?: string;
  parentsOrHosts?: ParentsOrHostsGroup[];
  storyTitle?: string;
  storyText?: string;
  schedule?: ScheduleItem[];
  heroImageUrl?: string;
  heroOverlayOverride?: HeroOverlayStyle;
  galleryImages?: string[];
  fontOverride?: EventRecord["fontOverride"];
  accentOverride?: string;
  audioOverride?: string;
  songRequest?: string;
  albumUrl?: string;
  instagramHandle?: string;
  eventHashtag?: string;
  triviaQuestions?: TriviaQuestion[];
  enabledSections?: EnabledSectionsConfig;
  termsAccepted: boolean;
  termsVersion: string;
  termsAcceptedAtUtc: string;
  leadId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  contactName: string;
  whatsapp: string;
  email: string;
  notes: string;
}): Promise<EventRecord> {
  const existing = await listEvents();
  const existingCodes = new Set(existing.map((e) => e.orderCode.toUpperCase()));
  const maxNum = existing.reduce((max, e) => {
    const m = /^INV-(\d+)$/i.exec(e.orderCode);
    const n = m ? Number(m[1]) : 1000;
    return n > max ? n : max;
  }, 1000);
  let num = Math.max(maxNum + 1, 1001 + existing.length);
  while (existingCodes.has(`INV-${num}`)) {
    num += 1;
  }
  const orderCode = `INV-${num}`;
  const baseSlug = slugify(input.eventTitle) || "evento";
  const rand = Math.random().toString(36).slice(2, 6);
  const slug = existing.some((e) => e.slug === `${baseSlug}-${num}`)
    ? `${baseSlug}-${num}-${rand}`
    : `${baseSlug}-${num}`;
  const panelToken = `panel-${baseSlug}-${rand}`;

  const dateISO = input.eventDate
    ? `${input.eventDate}T20:00:00-03:00`
    : "2027-06-15T20:00:00-03:00";

  const record: EventRecord = {
    id: `evt-${Date.now()}-${rand}`,
    orderCode,
    slug,
    panelToken,
    skinId: input.skinId,
    planId: input.planId,
    status: "pendiente",
    paymentStatus: "pendiente",
    eventTitle: input.eventTitle,
    dateISO,
    dateDisplay: formatSpanishDate(input.eventDate),
    timeDisplay: input.eventTime || "20:00 hs",
    venue: input.venue,
    address: input.address,
    city: "Argentina",
    alias: input.alias,
    giftBank: input.giftBank?.trim() || undefined,
    giftHolder: input.giftHolder?.trim() || undefined,
    dressCode: input.dressCode || "Elegante Sport",
    rsvpDeadline: input.rsvpDeadline?.trim() || undefined,
    adultsOnly: Boolean(input.adultsOnly),
    tarjetaPricing:
      input.tarjetaPricing && input.tarjetaPricing.length > 0
        ? input.tarjetaPricing
        : undefined,
    tarjetaNote: input.tarjetaNote?.trim() || undefined,
    quote:
      input.quote && input.quote.trim()
        ? input.quote.trim()
        : "Te esperamos para compartir juntos un momento único e inolvidable.",
    parentsOrHosts:
      input.parentsOrHosts && input.parentsOrHosts.length > 0
        ? input.parentsOrHosts
        : undefined,
    storyTitle: input.storyTitle?.trim() || undefined,
    storyText: input.storyText?.trim() || undefined,
    schedule:
      input.schedule && input.schedule.length > 0 ? input.schedule : undefined,
    heroImageUrl: input.heroImageUrl || undefined,
    heroOverlayOverride: input.heroOverlayOverride || undefined,
    galleryImages:
      input.galleryImages && input.galleryImages.length > 0 ? input.galleryImages : undefined,
    fontOverride: input.fontOverride || undefined,
    accentOverride: input.accentOverride || undefined,
    audioOverride: input.audioOverride || undefined,
    songRequest: input.songRequest?.trim() || undefined,
    djPlaylist: [],
    triviaQuestions:
      input.triviaQuestions && input.triviaQuestions.length > 0
        ? input.triviaQuestions
        : undefined,
    triviaScores: [],
    albumUrl: input.albumUrl?.trim() || undefined,
    instagramHandle: input.instagramHandle?.trim() || undefined,
    eventHashtag: input.eventHashtag?.trim() || undefined,
    guestList: [],
    enabledSections: input.enabledSections || undefined,
    termsAccepted: input.termsAccepted,
    termsVersion: input.termsVersion,
    termsAcceptedAtUtc: input.termsAcceptedAtUtc,
    leadId: input.leadId?.trim() || undefined,
    utmSource: input.utmSource?.trim() || undefined,
    utmMedium: input.utmMedium?.trim() || undefined,
    utmCampaign: input.utmCampaign?.trim() || undefined,
    utmContent: input.utmContent?.trim() || undefined,
    contactName: input.contactName,
    whatsapp: input.whatsapp,
    email: input.email,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await insertEventPg(pool, record);
    return record;
  }

  const db = ensureLocalStore();
  db.events.push(record);
  saveLocalStore(db);
  return record;
}

export type EventPatch = Partial<
  Pick<
    EventRecord,
    | "status"
    | "paymentStatus"
    | "paymentMethod"
    | "mpPreferenceId"
    | "mpPaymentId"
    | "paidAmount"
    | "verifiedBy"
    | "verifiedAt"
    | "skinId"
    | "eventTitle"
    | "dateISO"
    | "dateDisplay"
    | "timeDisplay"
    | "venue"
    | "address"
    | "alias"
    | "giftBank"
    | "giftHolder"
    | "dressCode"
    | "rsvpDeadline"
    | "adultsOnly"
    | "tarjetaPricing"
    | "tarjetaNote"
    | "quote"
    | "parentsOrHosts"
    | "storyTitle"
    | "storyText"
    | "schedule"
    | "heroImageUrl"
    | "heroOverlayOverride"
    | "galleryImages"
    | "fontOverride"
    | "accentOverride"
    | "audioOverride"
    | "songRequest"
    | "djPlaylist"
    | "triviaTitle"
    | "triviaQuestions"
    | "triviaScores"
    | "albumUrl"
    | "instagramHandle"
    | "eventHashtag"
    | "guestList"
    | "memoryMode"
    | "enabledSections"
  >
>;

const COLUMN_MAP: Record<keyof EventPatch, { col: string; json?: boolean }> = {
  status: { col: "status" },
  paymentStatus: { col: "payment_status" },
  paymentMethod: { col: "payment_method" },
  mpPreferenceId: { col: "mp_preference_id" },
  mpPaymentId: { col: "mp_payment_id" },
  paidAmount: { col: "paid_amount" },
  verifiedBy: { col: "verified_by" },
  verifiedAt: { col: "verified_at" },
  skinId: { col: "skin_id" },
  eventTitle: { col: "event_title" },
  dateISO: { col: "date_iso" },
  dateDisplay: { col: "date_display" },
  timeDisplay: { col: "time_display" },
  venue: { col: "venue" },
  address: { col: "address" },
  alias: { col: "alias" },
  giftBank: { col: "gift_bank" },
  giftHolder: { col: "gift_holder" },
  dressCode: { col: "dress_code" },
  rsvpDeadline: { col: "rsvp_deadline" },
  adultsOnly: { col: "adults_only" },
  tarjetaPricing: { col: "tarjeta_pricing", json: true },
  tarjetaNote: { col: "tarjeta_note" },
  quote: { col: "quote" },
  parentsOrHosts: { col: "parents_or_hosts", json: true },
  storyTitle: { col: "story_title" },
  storyText: { col: "story_text" },
  schedule: { col: "schedule", json: true },
  heroImageUrl: { col: "hero_image_url" },
  heroOverlayOverride: { col: "hero_overlay_override" },
  galleryImages: { col: "gallery_images", json: true },
  fontOverride: { col: "font_override" },
  accentOverride: { col: "accent_override" },
  audioOverride: { col: "audio_override" },
  songRequest: { col: "song_request" },
  djPlaylist: { col: "dj_playlist", json: true },
  triviaTitle: { col: "trivia_title" },
  triviaQuestions: { col: "trivia_questions", json: true },
  triviaScores: { col: "trivia_scores", json: true },
  albumUrl: { col: "album_url" },
  instagramHandle: { col: "instagram_handle" },
  eventHashtag: { col: "event_hashtag" },
  guestList: { col: "guest_list", json: true },
  memoryMode: { col: "memory_mode" },
  enabledSections: { col: "enabled_sections", json: true },
};

async function patchPgWhere(whereCol: "id" | "panel_token", whereVal: string, patch: EventPatch) {
  const pool = await ensurePgReady();
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [k, val] of Object.entries(patch)) {
    const spec = COLUMN_MAP[k as keyof EventPatch];
    if (!spec || val === undefined) continue;
    values.push(spec.json ? JSON.stringify(val) : val);
    sets.push(`${spec.col} = $${values.length}`);
  }

  if (sets.length === 0) {
    const existing = await pool.query(`select * from public.events where ${whereCol} = $1`, [
      whereVal,
    ]);
    return existing.rows[0] ? rowToEvent(existing.rows[0]) : null;
  }

  values.push(whereVal);
  const res = await pool.query(
    `update public.events set ${sets.join(", ")} where ${whereCol} = $${values.length} returning *`,
    values
  );
  return res.rows[0] ? rowToEvent(res.rows[0]) : null;
}

function stripUndefined(patch: EventPatch): EventPatch {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) out[k] = v;
  }
  return out as EventPatch;
}

export async function updateEventRecord(id: string, patch: EventPatch): Promise<EventRecord | null> {
  if (getDbMode() === "postgres") {
    return patchPgWhere("id", id, patch);
  }
  const db = ensureLocalStore();
  const idx = db.events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  db.events[idx] = { ...db.events[idx], ...stripUndefined(patch) };
  saveLocalStore(db);
  return db.events[idx];
}

export async function updateEventByPanelToken(
  token: string,
  patch: EventPatch
): Promise<EventRecord | null> {
  if (getDbMode() === "postgres") {
    return patchPgWhere("panel_token", token, patch);
  }
  const db = ensureLocalStore();
  const idx = db.events.findIndex((e) => e.panelToken === token);
  if (idx === -1) return null;
  db.events[idx] = { ...db.events[idx], ...stripUndefined(patch) };
  saveLocalStore(db);
  return db.events[idx];
}

export async function listRsvpsForSlug(slug: string): Promise<RsvpRecord[]> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query(
      "select * from public.rsvps where event_slug = $1 order by created_at desc",
      [slug]
    );
    return res.rows.map(rowToRsvp);
  }
  const db = ensureLocalStore();
  return db.rsvps
    .filter((r) => r.eventSlug === slug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addRsvp(input: {
  eventSlug: string;
  guestName: string;
  attending: boolean;
  passesUsed: number;
  companions?: string;
  dietary?: string[];
  song?: string;
  message?: string;
}): Promise<{ rsvp: RsvpRecord; updated: boolean }> {
  const cleanName = input.guestName.trim();
  const normalizedName = cleanName.toLowerCase();
  const record: RsvpRecord = {
    id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventSlug: input.eventSlug,
    guestName: cleanName,
    attending: Boolean(input.attending),
    passesUsed: input.attending ? Math.max(1, Number(input.passesUsed) || 1) : 0,
    companions: (input.companions || "").trim(),
    dietary: Array.isArray(input.dietary) ? input.dietary : [],
    song: (input.song || "").trim(),
    message: (input.message || "").trim(),
    createdAt: new Date().toISOString(),
  };

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const existing = await pool.query(
      "select id from public.rsvps where event_slug = $1 and lower(trim(guest_name)) = $2 limit 1",
      [input.eventSlug, normalizedName]
    );
    if (existing.rows[0]) {
      const existingId = String(existing.rows[0].id);
      await pool.query(
        `update public.rsvps
         set guest_name = $2, attending = $3, passes_used = $4, companions = $5,
             dietary = $6::jsonb, song = $7, message = $8, created_at = $9
         where id = $1`,
        [
          existingId,
          record.guestName,
          record.attending,
          record.passesUsed,
          record.companions,
          JSON.stringify(record.dietary),
          record.song,
          record.message,
          record.createdAt,
        ]
      );
      return { rsvp: { ...record, id: existingId }, updated: true };
    }
    await insertRsvpPg(pool, record);
    return { rsvp: record, updated: false };
  }

  const db = ensureLocalStore();
  const existingIdx = db.rsvps.findIndex(
    (r) =>
      r.eventSlug === input.eventSlug &&
      r.guestName.trim().toLowerCase() === normalizedName
  );
  if (existingIdx !== -1) {
    const existingId = db.rsvps[existingIdx].id;
    const updatedRecord: RsvpRecord = { ...record, id: existingId };
    db.rsvps[existingIdx] = updatedRecord;
    saveLocalStore(db);
    return { rsvp: updatedRecord, updated: true };
  }

  db.rsvps.push(record);
  saveLocalStore(db);
  return { rsvp: record, updated: false };
}

export async function addDjSongRequest(input: {
  eventSlug: string;
  guestName: string;
  song: string;
}): Promise<DjSongItem | null> {
  const event = await getEventBySlug(input.eventSlug);
  if (!event || event.planId === "esencial") {
    return null;
  }

  const item: DjSongItem = {
    id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    guestName: input.guestName.trim().slice(0, 80),
    song: input.song.trim().slice(0, 140),
    votes: 1,
    createdAt: new Date().toISOString(),
  };

  const current = Array.isArray(event.djPlaylist) ? event.djPlaylist : [];
  const next = [item, ...current].slice(0, 100);

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      "update public.events set dj_playlist = $2::jsonb where slug = $1",
      [input.eventSlug, JSON.stringify(next)]
    );
    return item;
  }

  const db = ensureLocalStore();
  const idx = db.events.findIndex((e) => e.slug === input.eventSlug);
  if (idx === -1) return null;
  db.events[idx] = { ...db.events[idx], djPlaylist: next };
  saveLocalStore(db);
  return item;
}

export async function voteDjSongRequest(input: {
  eventSlug: string;
  songId: string;
  fallbackSong?: string;
  fallbackGuest?: string;
}): Promise<DjSongItem | null> {
  const event = await getEventBySlug(input.eventSlug);
  if (!event || event.planId === "esencial") return null;

  const current = Array.isArray(event.djPlaylist) ? [...event.djPlaylist] : [];
  const idx = current.findIndex((s) => s.id === input.songId);
  let updatedItem: DjSongItem;

  if (idx !== -1) {
    updatedItem = {
      ...current[idx],
      votes: (current[idx].votes ?? 1) + 1,
    };
    current[idx] = updatedItem;
  } else if (input.fallbackSong) {
    // Promueve una canción proveniente de RSVP al ranking de votos sin duplicar su id
    updatedItem = {
      id: input.songId,
      guestName: (input.fallbackGuest || "Invitado").slice(0, 80),
      song: input.fallbackSong.slice(0, 140),
      votes: 2,
      createdAt: new Date().toISOString(),
    };
    current.unshift(updatedItem);
  } else {
    return null;
  }

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      "update public.events set dj_playlist = $2::jsonb where slug = $1",
      [input.eventSlug, JSON.stringify(current)]
    );
    return updatedItem;
  }

  const db = ensureLocalStore();
  const evIdx = db.events.findIndex((e) => e.slug === input.eventSlug);
  if (evIdx === -1) return null;
  db.events[evIdx] = { ...db.events[evIdx], djPlaylist: current };
  saveLocalStore(db);
  return updatedItem;
}

export async function addTriviaScore(input: {
  eventSlug: string;
  guestName: string;
  score: number;
  total: number;
}): Promise<TriviaScore | null> {
  const event = await getEventBySlug(input.eventSlug);
  if (!event || event.planId === "esencial") return null;

  const item: TriviaScore = {
    id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    guestName: input.guestName.trim().slice(0, 60),
    score: Math.max(0, Math.min(20, Math.round(input.score))),
    total: Math.max(1, Math.min(20, Math.round(input.total))),
    createdAt: new Date().toISOString(),
  };

  const current = Array.isArray(event.triviaScores) ? [...event.triviaScores] : [];
  current.push(item);
  current.sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
  const top = current.slice(0, 30);

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      "update public.events set trivia_scores = $2::jsonb where slug = $1",
      [input.eventSlug, JSON.stringify(top)]
    );
    return item;
  }

  const db = ensureLocalStore();
  const evIdx = db.events.findIndex((e) => e.slug === input.eventSlug);
  if (evIdx === -1) return null;
  db.events[evIdx] = { ...db.events[evIdx], triviaScores: top };
  saveLocalStore(db);
  return item;
}

// ================= LEADS / CONSENT / OPT-OUT / FUNNEL / AUDIT =================

const ADVANCED_STAGES = new Set<LeadStage>([
  "pedido_creado",
  "entregado",
  "testimonio_pedido",
  "testimonio_recibido",
  "recompra_ofrecida",
]);

function rowToLead(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id),
    stage: String(row.stage || "prueba_capturada") as LeadStage,
    source: String(row.source || "minitester") as LeadRecord["source"],
    contactName: String(row.contact_name ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    normalizedPhone: String(row.normalized_phone ?? ""),
    email: row.email ? String(row.email) : undefined,
    category: row.category ? String(row.category) : undefined,
    skinId: row.skin_id ? String(row.skin_id) : undefined,
    planId: row.plan_id ? String(row.plan_id) : undefined,
    eventTitle: row.event_title ? String(row.event_title) : undefined,
    guestSample: row.guest_sample ? String(row.guest_sample) : undefined,
    convertedOrderCode: row.converted_order_code ? String(row.converted_order_code) : undefined,
    consentService: row.consent_service === undefined ? true : Boolean(row.consent_service),
    consentMarketing: Boolean(row.consent_marketing),
    consentAt: row.consent_at ? new Date(String(row.consent_at)).toISOString() : undefined,
    consentTextVersion: row.consent_text_version ? String(row.consent_text_version) : undefined,
    consentSource: row.consent_source ? String(row.consent_source) : undefined,
    ipHash: row.ip_hash ? String(row.ip_hash) : undefined,
    utmSource: row.utm_source ? String(row.utm_source) : undefined,
    utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
    utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
    utmContent: row.utm_content ? String(row.utm_content) : undefined,
    testerStep: row.tester_step ? String(row.tester_step) : undefined,
    optedOutAt: row.opted_out_at ? new Date(String(row.opted_out_at)).toISOString() : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function listLeads(): Promise<LeadRecord[]> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.leads order by updated_at desc limit 500");
    return res.rows.map(rowToLead);
  }
  const db = ensureLocalStore();
  return [...(db.leads || [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getLeadById(id: string): Promise<LeadRecord | undefined> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("select * from public.leads where id = $1 limit 1", [id]);
    return res.rows[0] ? rowToLead(res.rows[0]) : undefined;
  }
  const db = ensureLocalStore();
  return (db.leads || []).find((l) => l.id === id);
}

export async function upsertLead(input: {
  id?: string;
  stage: LeadStage;
  source: LeadRecord["source"];
  contactName: string;
  whatsapp: string;
  email?: string;
  category?: string;
  skinId?: string;
  planId?: string;
  eventTitle?: string;
  guestSample?: string;
  convertedOrderCode?: string;
  consentService?: boolean;
  consentMarketing?: boolean;
  consentTextVersion?: string;
  consentSource?: string;
  clientIp?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  testerStep?: string;
}): Promise<LeadRecord> {
  const cleanWa = input.whatsapp.trim().slice(0, 32);
  const normalizedPhone = normalizePhone(cleanWa);
  const now = new Date().toISOString();
  const ipHash = input.clientIp ? hashIp(input.clientIp) : undefined;
  const consentService = input.consentService !== false;
  const requestedMarketing = Boolean(input.consentMarketing);

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    let optedOut = false;
    if (normalizedPhone) {
      const opt = await pool.query(
        "select opted_out_at from public.marketing_opt_outs where normalized_phone = $1 limit 1",
        [normalizedPhone]
      );
      if (opt.rows[0]) optedOut = true;
    }

    const consentMarketing = optedOut ? false : requestedMarketing;

    if (input.id) {
      const existingById = await pool.query("select * from public.leads where id = $1 limit 1", [
        input.id,
      ]);
      if (existingById.rows[0]) {
        const prev = rowToLead(existingById.rows[0]);
        const nextStage: LeadStage = ADVANCED_STAGES.has(prev.stage) ? prev.stage : input.stage;
        const res = await pool.query(
          `update public.leads set
            stage = $2,
            source = $3,
            contact_name = coalesce(nullif($4, ''), contact_name),
            whatsapp = coalesce(nullif($5, ''), whatsapp),
            normalized_phone = coalesce(nullif($6, ''), normalized_phone),
            email = coalesce(nullif($7, ''), email),
            category = coalesce(nullif($8, ''), category),
            skin_id = coalesce(nullif($9, ''), skin_id),
            plan_id = coalesce(nullif($10, ''), plan_id),
            event_title = coalesce(nullif($11, ''), event_title),
            guest_sample = coalesce(nullif($12, ''), guest_sample),
            converted_order_code = coalesce(nullif($13, ''), converted_order_code),
            consent_service = $14,
            consent_marketing = case when $15 then false else (consent_marketing or $16) end,
            consent_at = coalesce(consent_at, $17),
            consent_text_version = coalesce(nullif($18, ''), consent_text_version),
            consent_source = coalesce(nullif($19, ''), consent_source),
            ip_hash = coalesce(nullif($20, ''), ip_hash),
            utm_source = coalesce(nullif($21, ''), utm_source),
            utm_medium = coalesce(nullif($22, ''), utm_medium),
            utm_campaign = coalesce(nullif($23, ''), utm_campaign),
            utm_content = coalesce(nullif($24, ''), utm_content),
            tester_step = coalesce(nullif($25, ''), tester_step),
            updated_at = $17
          where id = $1
          returning *`,
          [
            prev.id,
            nextStage,
            input.source,
            input.contactName.trim().slice(0, 100),
            cleanWa,
            normalizedPhone,
            input.email?.trim().slice(0, 140) || "",
            input.category?.trim().slice(0, 40) || "",
            input.skinId?.trim().slice(0, 80) || "",
            input.planId?.trim().slice(0, 40) || "",
            input.eventTitle?.trim().slice(0, 120) || "",
            input.guestSample?.trim().slice(0, 100) || "",
            input.convertedOrderCode?.trim().slice(0, 40) || "",
            consentService,
            optedOut,
            consentMarketing,
            now,
            input.consentTextVersion?.trim().slice(0, 40) || "",
            input.consentSource?.trim().slice(0, 40) || "",
            ipHash || "",
            input.utmSource?.trim().slice(0, 80) || "",
            input.utmMedium?.trim().slice(0, 80) || "",
            input.utmCampaign?.trim().slice(0, 120) || "",
            input.utmContent?.trim().slice(0, 120) || "",
            input.testerStep?.trim().slice(0, 40) || "",
          ]
        );
        return rowToLead(res.rows[0]);
      }
    }

    const newId =
      input.id && /^[a-zA-Z0-9_-]{4,60}$/.test(input.id)
        ? input.id
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (normalizedPhone) {
      const res = await pool.query(
        `insert into public.leads (
          id, stage, source, contact_name, whatsapp, normalized_phone, email,
          category, skin_id, plan_id, event_title, guest_sample, converted_order_code,
          consent_service, consent_marketing, consent_at, consent_text_version, consent_source, ip_hash,
          utm_source, utm_medium, utm_campaign, utm_content, tester_step, created_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$16,$16)
        on conflict (normalized_phone, stage) where normalized_phone is not null and normalized_phone <> ''
        do update set
          source = excluded.source,
          contact_name = coalesce(nullif(excluded.contact_name, ''), public.leads.contact_name),
          whatsapp = excluded.whatsapp,
          email = coalesce(excluded.email, public.leads.email),
          category = coalesce(excluded.category, public.leads.category),
          skin_id = coalesce(excluded.skin_id, public.leads.skin_id),
          plan_id = coalesce(excluded.plan_id, public.leads.plan_id),
          event_title = coalesce(excluded.event_title, public.leads.event_title),
          guest_sample = coalesce(excluded.guest_sample, public.leads.guest_sample),
          consent_service = excluded.consent_service,
          consent_marketing = case when $25 then false else (public.leads.consent_marketing or excluded.consent_marketing) end,
          consent_at = coalesce(public.leads.consent_at, excluded.consent_at),
          consent_text_version = coalesce(excluded.consent_text_version, public.leads.consent_text_version),
          consent_source = coalesce(excluded.consent_source, public.leads.consent_source),
          ip_hash = coalesce(excluded.ip_hash, public.leads.ip_hash),
          utm_source = coalesce(excluded.utm_source, public.leads.utm_source),
          utm_medium = coalesce(excluded.utm_medium, public.leads.utm_medium),
          utm_campaign = coalesce(excluded.utm_campaign, public.leads.utm_campaign),
          utm_content = coalesce(excluded.utm_content, public.leads.utm_content),
          tester_step = coalesce(excluded.tester_step, public.leads.tester_step),
          updated_at = excluded.updated_at
        returning *`,
        [
          newId,
          input.stage,
          input.source,
          input.contactName.trim().slice(0, 100),
          cleanWa,
          normalizedPhone,
          input.email?.trim().slice(0, 140) || null,
          input.category?.trim().slice(0, 40) || null,
          input.skinId?.trim().slice(0, 80) || null,
          input.planId?.trim().slice(0, 40) || null,
          input.eventTitle?.trim().slice(0, 120) || null,
          input.guestSample?.trim().slice(0, 100) || null,
          input.convertedOrderCode?.trim().slice(0, 40) || null,
          consentService,
          consentMarketing,
          now,
          input.consentTextVersion?.trim().slice(0, 40) || "v1-2026",
          input.consentSource?.trim().slice(0, 40) || input.source,
          ipHash || null,
          input.utmSource?.trim().slice(0, 80) || null,
          input.utmMedium?.trim().slice(0, 80) || null,
          input.utmCampaign?.trim().slice(0, 120) || null,
          input.utmContent?.trim().slice(0, 120) || null,
          input.testerStep?.trim().slice(0, 40) || null,
          optedOut,
        ]
      );
      return rowToLead(res.rows[0]);
    }

    const inserted = await pool.query(
      `insert into public.leads (
        id, stage, source, contact_name, whatsapp, normalized_phone, email,
        category, skin_id, plan_id, event_title, guest_sample, converted_order_code,
        consent_service, consent_marketing, consent_at, consent_text_version, consent_source, ip_hash,
        utm_source, utm_medium, utm_campaign, utm_content, tester_step, created_at, updated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$16,$16) returning *`,
      [
        newId,
        input.stage,
        input.source,
        input.contactName.trim().slice(0, 100),
        cleanWa,
        normalizedPhone,
        input.email?.trim().slice(0, 140) || null,
        input.category?.trim().slice(0, 40) || null,
        input.skinId?.trim().slice(0, 80) || null,
        input.planId?.trim().slice(0, 40) || null,
        input.eventTitle?.trim().slice(0, 120) || null,
        input.guestSample?.trim().slice(0, 100) || null,
        input.convertedOrderCode?.trim().slice(0, 40) || null,
        consentService,
        consentMarketing,
        now,
        input.consentTextVersion?.trim().slice(0, 40) || "v1-2026",
        input.consentSource?.trim().slice(0, 40) || input.source,
        ipHash || null,
        input.utmSource?.trim().slice(0, 80) || null,
        input.utmMedium?.trim().slice(0, 80) || null,
        input.utmCampaign?.trim().slice(0, 120) || null,
        input.utmContent?.trim().slice(0, 120) || null,
        input.testerStep?.trim().slice(0, 40) || null,
      ]
    );
    return rowToLead(inserted.rows[0]);
  }

  // Fallback dev local JSON (NODE_ENV=development)
  const db = ensureLocalStore();
  const leads = db.leads || [];
  const optedOut = Boolean(normalizedPhone && (db.marketingOptOuts || []).includes(normalizedPhone));
  const consentMarketing = optedOut ? false : requestedMarketing;

  const idx = leads.findIndex(
    (l) =>
      (input.id && l.id === input.id) ||
      (normalizedPhone && l.normalizedPhone === normalizedPhone && l.stage === input.stage)
  );
  if (idx !== -1) {
    const prev = leads[idx];
    const updated: LeadRecord = {
      ...prev,
      stage: ADVANCED_STAGES.has(prev.stage) ? prev.stage : input.stage,
      source: input.source,
      contactName: input.contactName.trim().slice(0, 100) || prev.contactName,
      whatsapp: cleanWa || prev.whatsapp,
      normalizedPhone: normalizedPhone || prev.normalizedPhone,
      email: input.email?.trim().slice(0, 140) || prev.email,
      category: input.category?.trim().slice(0, 40) || prev.category,
      skinId: input.skinId?.trim().slice(0, 80) || prev.skinId,
      planId: input.planId?.trim().slice(0, 40) || prev.planId,
      eventTitle: input.eventTitle?.trim().slice(0, 120) || prev.eventTitle,
      guestSample: input.guestSample?.trim().slice(0, 100) || prev.guestSample,
      convertedOrderCode: input.convertedOrderCode?.trim().slice(0, 40) || prev.convertedOrderCode,
      consentService,
      consentMarketing: optedOut ? false : prev.consentMarketing || consentMarketing,
      consentAt: prev.consentAt || now,
      consentTextVersion: prev.consentTextVersion || input.consentTextVersion || "v1-2026",
      consentSource: prev.consentSource || input.consentSource || input.source,
      ipHash: prev.ipHash || ipHash,
      utmSource: input.utmSource?.trim().slice(0, 80) || prev.utmSource,
      utmMedium: input.utmMedium?.trim().slice(0, 80) || prev.utmMedium,
      utmCampaign: input.utmCampaign?.trim().slice(0, 120) || prev.utmCampaign,
      utmContent: input.utmContent?.trim().slice(0, 120) || prev.utmContent,
      testerStep: input.testerStep?.trim().slice(0, 40) || prev.testerStep,
      updatedAt: now,
    };
    leads[idx] = updated;
    db.leads = leads;
    saveLocalStore(db);
    return updated;
  }

  const created: LeadRecord = {
    id:
      input.id && /^[a-zA-Z0-9_-]{4,60}$/.test(input.id)
        ? input.id
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stage: input.stage,
    source: input.source,
    contactName: input.contactName.trim().slice(0, 100),
    whatsapp: cleanWa,
    normalizedPhone,
    email: input.email?.trim().slice(0, 140) || undefined,
    category: input.category?.trim().slice(0, 40) || undefined,
    skinId: input.skinId?.trim().slice(0, 80) || undefined,
    planId: input.planId?.trim().slice(0, 40) || undefined,
    eventTitle: input.eventTitle?.trim().slice(0, 120) || undefined,
    guestSample: input.guestSample?.trim().slice(0, 100) || undefined,
    convertedOrderCode: input.convertedOrderCode?.trim().slice(0, 40) || undefined,
    consentService,
    consentMarketing,
    consentAt: now,
    consentTextVersion: input.consentTextVersion?.trim().slice(0, 40) || "v1-2026",
    consentSource: input.consentSource?.trim().slice(0, 40) || input.source,
    ipHash,
    utmSource: input.utmSource?.trim().slice(0, 80) || undefined,
    utmMedium: input.utmMedium?.trim().slice(0, 80) || undefined,
    utmCampaign: input.utmCampaign?.trim().slice(0, 120) || undefined,
    utmContent: input.utmContent?.trim().slice(0, 120) || undefined,
    testerStep: input.testerStep?.trim().slice(0, 40) || undefined,
    createdAt: now,
    updatedAt: now,
  };
  db.leads = [created, ...leads].slice(0, 500);
  saveLocalStore(db);
  return created;
}

export async function updateLeadStage(
  id: string,
  stage: LeadStage
): Promise<LeadRecord | null> {
  const now = new Date().toISOString();
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query(
      "update public.leads set stage = $2, updated_at = $3 where id = $1 returning *",
      [id, stage, now]
    );
    return res.rows[0] ? rowToLead(res.rows[0]) : null;
  }
  const db = ensureLocalStore();
  const idx = (db.leads || []).findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const updated: LeadRecord = { ...db.leads![idx], stage, updatedAt: now };
  db.leads![idx] = updated;
  saveLocalStore(db);
  return updated;
}

export async function deleteLeadById(id: string): Promise<boolean> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query("delete from public.leads where id = $1 returning id", [id]);
    return (res.rowCount ?? 0) > 0;
  }
  const db = ensureLocalStore();
  const before = (db.leads || []).length;
  db.leads = (db.leads || []).filter((l) => l.id !== id);
  if (db.leads.length === before) return false;
  saveLocalStore(db);
  return true;
}

export async function optOutMarketingByPhone(
  phone: string,
  source = "whatsapp_baja"
): Promise<{
  normalizedPhone: string;
  affectedLeads: number;
  alreadyOptedOut: boolean;
}> {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return { normalizedPhone: "", affectedLeads: 0, alreadyOptedOut: false };
  }
  const now = new Date().toISOString();

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const existingOpt = await pool.query(
      "select normalized_phone from public.marketing_opt_outs where normalized_phone = $1",
      [normalizedPhone]
    );
    const alreadyOptedOut = (existingOpt.rowCount ?? 0) > 0;
    await pool.query(
      `insert into public.marketing_opt_outs (normalized_phone, opted_out_at, source)
       values ($1, $2, $3)
       on conflict (normalized_phone) do nothing`,
      [normalizedPhone, now, source]
    );
    const res = await pool.query(
      `update public.leads
       set consent_marketing = false,
           opted_out_at = coalesce(opted_out_at, $2),
           updated_at = case when consent_marketing = true or opted_out_at is null then $2 else updated_at end
       where normalized_phone = $1 and (consent_marketing = true or opted_out_at is null)
       returning id`,
      [normalizedPhone, now]
    );
    return { normalizedPhone, affectedLeads: res.rowCount ?? 0, alreadyOptedOut };
  }

  const db = ensureLocalStore();
  const optOuts = new Set(db.marketingOptOuts || []);
  const alreadyOptedOut = optOuts.has(normalizedPhone);
  optOuts.add(normalizedPhone);
  db.marketingOptOuts = Array.from(optOuts);
  let affectedLeads = 0;
  db.leads = (db.leads || []).map((l) => {
    if (l.normalizedPhone === normalizedPhone || normalizePhone(l.whatsapp) === normalizedPhone) {
      if (l.consentMarketing || !l.optedOutAt) {
        affectedLeads += 1;
        return {
          ...l,
          consentMarketing: false,
          optedOutAt: l.optedOutAt || now,
          updatedAt: now,
        };
      }
    }
    return l;
  });
  saveLocalStore(db);
  return { normalizedPhone, affectedLeads, alreadyOptedOut };
}

export async function markLeadConverted(input: {
  leadId?: string;
  whatsapp: string;
  orderCode: string;
}): Promise<void> {
  const normalized = normalizePhone(input.whatsapp);
  const now = new Date().toISOString();

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    if (input.leadId) {
      const r = await pool.query(
        "update public.leads set stage = 'pedido_creado', converted_order_code = $2, updated_at = $3 where id = $1 returning id",
        [input.leadId, input.orderCode, now]
      );
      if ((r.rowCount ?? 0) > 0) return;
    }
    if (normalized) {
      await pool.query(
        "update public.leads set stage = 'pedido_creado', converted_order_code = $2, updated_at = $3 where normalized_phone = $1 and stage not in ('pedido_creado','entregado','testimonio_pedido','testimonio_recibido','recompra_ofrecida')",
        [normalized, input.orderCode, now]
      );
    }
    return;
  }

  const db = ensureLocalStore();
  let changed = false;
  db.leads = (db.leads || []).map((l) => {
    const matchById = Boolean(input.leadId && l.id === input.leadId);
    const matchByPhone = Boolean(
      normalized && (l.normalizedPhone === normalized || normalizePhone(l.whatsapp) === normalized)
    );
    if ((matchById || matchByPhone) && !ADVANCED_STAGES.has(l.stage)) {
      changed = true;
      return {
        ...l,
        stage: "pedido_creado",
        convertedOrderCode: input.orderCode,
        updatedAt: now,
      };
    }
    return l;
  });
  if (changed) saveLocalStore(db);
}

export async function markLeadConvertedByWhatsapp(
  whatsapp: string,
  orderCode: string
): Promise<void> {
  return markLeadConverted({ whatsapp, orderCode });
}

export async function recordFunnelEvent(input: {
  sessionId: string;
  source: string;
  step: FunnelEventRecord["step"];
  category?: string;
  skinId?: string;
  utmSource?: string;
}): Promise<FunnelEventRecord> {
  const record: FunnelEventRecord = {
    id: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sessionId: input.sessionId.slice(0, 64),
    source: input.source.slice(0, 32),
    step: input.step,
    category: input.category?.slice(0, 40),
    skinId: input.skinId?.slice(0, 80),
    utmSource: input.utmSource?.slice(0, 80),
    createdAt: new Date().toISOString(),
  };

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      `insert into public.funnel_events (id, session_id, source, step, category, skin_id, utm_source, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        record.id,
        record.sessionId,
        record.source,
        record.step,
        record.category ?? null,
        record.skinId ?? null,
        record.utmSource ?? null,
        record.createdAt,
      ]
    );
    return record;
  }

  const db = ensureLocalStore();
  const list = db.funnelEvents || [];
  db.funnelEvents = [record, ...list].slice(0, 1000);
  saveLocalStore(db);
  return record;
}

export async function listFunnelEvents(): Promise<FunnelEventRecord[]> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query(
      "select * from public.funnel_events order by created_at desc limit 1000"
    );
    return res.rows.map((r) => ({
      id: String(r.id),
      sessionId: String(r.session_id),
      source: String(r.source),
      step: String(r.step) as FunnelEventRecord["step"],
      category: r.category ? String(r.category) : undefined,
      skinId: r.skin_id ? String(r.skin_id) : undefined,
      utmSource: r.utm_source ? String(r.utm_source) : undefined,
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
  const db = ensureLocalStore();
  return [...(db.funnelEvents || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function recordAdminAuditLog(input: {
  actor?: string;
  action: string;
  rowCount?: number;
  meta?: string;
}): Promise<void> {
  const record: AdminAuditLogRecord = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor: (input.actor || "admin").slice(0, 60),
    action: input.action.slice(0, 80),
    rowCount: Math.max(0, Math.round(input.rowCount ?? 0)),
    meta: input.meta?.slice(0, 300),
    createdAt: new Date().toISOString(),
  };

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      `insert into public.admin_audit_log (id, actor, action, row_count, meta, created_at)
       values ($1,$2,$3,$4,$5,$6)`,
      [record.id, record.actor, record.action, record.rowCount, record.meta ?? null, record.createdAt]
    );
    return;
  }

  const db = ensureLocalStore();
  db.auditLogs = [record, ...(db.auditLogs || [])].slice(0, 500);
  saveLocalStore(db);
}

export async function listAdminAuditLogs(): Promise<AdminAuditLogRecord[]> {
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query(
      "select * from public.admin_audit_log order by created_at desc limit 100"
    );
    return res.rows.map((r) => ({
      id: String(r.id),
      actor: String(r.actor),
      action: String(r.action),
      rowCount: Number(r.row_count ?? 0),
      meta: r.meta ? String(r.meta) : undefined,
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
  const db = ensureLocalStore();
  return [...(db.auditLogs || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function isVerifiedPaidOrder(ev: EventRecord): boolean {
  if (ev.paymentStatus !== "pagado") return false;
  if (ev.paymentMethod === "mercadopago") {
    return Boolean(ev.mpPaymentId || (ev.verifiedBy && ev.verifiedAt));
  }
  return Boolean(ev.verifiedBy && ev.verifiedAt);
}

export async function recordMpWebhookLog(input: {
  topic: string;
  dataId: string;
  paymentId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  firmaOk: boolean;
  manifestUsed?: string;
  montoOk: boolean;
  resultado: string;
  detalle?: string;
}): Promise<void> {
  const record: MpWebhookLogRecord = {
    id: `mpw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: input.topic.slice(0, 40),
    dataId: input.dataId.slice(0, 80),
    paymentId: input.paymentId?.slice(0, 80),
    externalReference: input.externalReference?.slice(0, 120),
    status: input.status?.slice(0, 40),
    amount: typeof input.amount === "number" ? Math.round(input.amount) : undefined,
    firmaOk: Boolean(input.firmaOk),
    manifestUsed: input.manifestUsed?.slice(0, 12),
    montoOk: Boolean(input.montoOk),
    resultado: input.resultado.slice(0, 60),
    detalle: input.detalle?.slice(0, 280),
    createdAt: new Date().toISOString(),
  };

  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    await pool.query(
      `insert into public.mp_webhook_logs (
         id, topic, data_id, payment_id, external_reference, status, amount,
         firma_ok, manifest_used, monto_ok, resultado, detalle, created_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        record.id,
        record.topic,
        record.dataId,
        record.paymentId ?? null,
        record.externalReference ?? null,
        record.status ?? null,
        record.amount ?? null,
        record.firmaOk,
        record.manifestUsed ?? null,
        record.montoOk,
        record.resultado,
        record.detalle ?? null,
        record.createdAt,
      ]
    );
    return;
  }

  const db = ensureLocalStore();
  db.mpWebhookLogs = [record, ...(db.mpWebhookLogs || [])].slice(0, 150);
  saveLocalStore(db);
}

export async function listMpWebhookLogs(limit = 50): Promise<MpWebhookLogRecord[]> {
  const safeLimit = Math.max(1, Math.min(200, limit));
  if (getDbMode() === "postgres") {
    const pool = await ensurePgReady();
    const res = await pool.query(
      "select * from public.mp_webhook_logs order by created_at desc limit $1",
      [safeLimit]
    );
    return res.rows.map((r) => ({
      id: String(r.id),
      topic: String(r.topic || ""),
      dataId: String(r.data_id || ""),
      paymentId: r.payment_id ? String(r.payment_id) : undefined,
      externalReference: r.external_reference ? String(r.external_reference) : undefined,
      status: r.status ? String(r.status) : undefined,
      amount: r.amount !== null && r.amount !== undefined ? Number(r.amount) : undefined,
      firmaOk: Boolean(r.firma_ok),
      manifestUsed: r.manifest_used ? String(r.manifest_used) : undefined,
      montoOk: Boolean(r.monto_ok),
      resultado: String(r.resultado || ""),
      detalle: r.detalle ? String(r.detalle) : undefined,
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
  const db = ensureLocalStore();
  return [...(db.mpWebhookLogs || [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, safeLimit);
}
