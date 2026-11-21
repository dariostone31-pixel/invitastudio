import fs from "fs";
import path from "path";
import { Pool } from "pg";

export type OrderStatus = "pendiente" | "en_edicion" | "publicada";
export type PaymentStatus = "pendiente" | "pagado" | "rechazado";
export type PaymentMethod = "mercadopago" | "transferencia";

export interface EnabledSectionsConfig {
  countdown: boolean;
  story: boolean;
  schedule: boolean;
  gallery: boolean;
  dressCode: boolean;
  gifts: boolean;
  wishes?: boolean;
  rsvp: boolean;
}

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
  eventTitle: string;
  dateISO: string;
  dateDisplay: string;
  timeDisplay: string;
  venue: string;
  address: string;
  city: string;
  alias: string;
  dressCode: string;
  quote: string;
  heroImageUrl?: string;
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
  memoryMode?: boolean;
  enabledSections?: EnabledSectionsConfig;
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

interface DatabaseShape {
  events: EventRecord[];
  rsvps: RsvpRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

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
      paidAmount: 33600,
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
      paidAmount: 64900,
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
  return process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    ? "postgres"
    : "json-local";
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
          dress_code text not null default 'Elegante Sport',
          quote text not null default '',
          hero_image_url text,
          gallery_images jsonb,
          font_override text,
          accent_override text,
          audio_override text,
          memory_mode boolean not null default false,
          enabled_sections jsonb,
          contact_name text not null,
          whatsapp text not null,
          email text not null,
          notes text not null default '',
          created_at timestamptz not null default now()
        );
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
    eventTitle: String(row.event_title),
    dateISO: String(row.date_iso),
    dateDisplay: String(row.date_display),
    timeDisplay: String(row.time_display),
    venue: String(row.venue),
    address: String(row.address ?? ""),
    city: String(row.city ?? "Argentina"),
    alias: String(row.alias ?? ""),
    dressCode: String(row.dress_code ?? "Elegante Sport"),
    quote: String(row.quote ?? ""),
    heroImageUrl: row.hero_image_url ? String(row.hero_image_url) : undefined,
    galleryImages: Array.isArray(row.gallery_images)
      ? (row.gallery_images as string[])
      : undefined,
    fontOverride: row.font_override
      ? (String(row.font_override) as EventRecord["fontOverride"])
      : undefined,
    accentOverride: row.accent_override ? String(row.accent_override) : undefined,
    audioOverride: row.audio_override ? String(row.audio_override) : undefined,
    memoryMode: Boolean(row.memory_mode),
    enabledSections: (row.enabled_sections as EnabledSectionsConfig) || undefined,
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
      alias, dress_code, quote, hero_image_url, gallery_images,
      font_override, accent_override, audio_override, memory_mode, enabled_sections,
      contact_name, whatsapp, email, notes, created_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
      $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34
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
      ev.dressCode,
      ev.quote,
      ev.heroImageUrl ?? null,
      ev.galleryImages ? JSON.stringify(ev.galleryImages) : null,
      ev.fontOverride ?? null,
      ev.accentOverride ?? null,
      ev.audioOverride ?? null,
      Boolean(ev.memoryMode),
      ev.enabledSections ? JSON.stringify(ev.enabledSections) : null,
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
    return structuredClone(INITIAL_SEED);
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as DatabaseShape;
  } catch {
    fs.writeFileSync(STORE_PATH, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
    return structuredClone(INITIAL_SEED);
  }
}

function saveLocalStore(data: DatabaseShape) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
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
  dressCode: string;
  heroImageUrl?: string;
  galleryImages?: string[];
  contactName: string;
  whatsapp: string;
  email: string;
  notes: string;
}): Promise<EventRecord> {
  const existing = await listEvents();
  const num = 1001 + existing.length + Math.floor(Math.random() * 5);
  const orderCode = `INV-${num}`;
  const baseSlug = slugify(input.eventTitle) || "evento";
  const slug = `${baseSlug}-${num}`;
  const rand = Math.random().toString(36).slice(2, 6);
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
    dressCode: input.dressCode || "Elegante Sport",
    quote: "Te esperamos para compartir juntos un momento único e inolvidable.",
    heroImageUrl: input.heroImageUrl || undefined,
    galleryImages:
      input.galleryImages && input.galleryImages.length > 0 ? input.galleryImages : undefined,
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
    | "skinId"
    | "eventTitle"
    | "dateISO"
    | "dateDisplay"
    | "timeDisplay"
    | "venue"
    | "address"
    | "alias"
    | "dressCode"
    | "quote"
    | "heroImageUrl"
    | "galleryImages"
    | "fontOverride"
    | "accentOverride"
    | "audioOverride"
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
  skinId: { col: "skin_id" },
  eventTitle: { col: "event_title" },
  dateISO: { col: "date_iso" },
  dateDisplay: { col: "date_display" },
  timeDisplay: { col: "time_display" },
  venue: { col: "venue" },
  address: { col: "address" },
  alias: { col: "alias" },
  dressCode: { col: "dress_code" },
  quote: { col: "quote" },
  heroImageUrl: { col: "hero_image_url" },
  galleryImages: { col: "gallery_images", json: true },
  fontOverride: { col: "font_override" },
  accentOverride: { col: "accent_override" },
  audioOverride: { col: "audio_override" },
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

export async function updateEventRecord(id: string, patch: EventPatch): Promise<EventRecord | null> {
  if (getDbMode() === "postgres") {
    return patchPgWhere("id", id, patch);
  }
  const db = ensureLocalStore();
  const idx = db.events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  db.events[idx] = { ...db.events[idx], ...patch };
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
  db.events[idx] = { ...db.events[idx], ...patch };
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
}): Promise<RsvpRecord> {
  const record: RsvpRecord = {
    id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventSlug: input.eventSlug,
    guestName: input.guestName.trim(),
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
    await insertRsvpPg(pool, record);
    return record;
  }

  const db = ensureLocalStore();
  db.rsvps.push(record);
  saveLocalStore(db);
  return record;
}
