import type { EventRecord } from "@/lib/db";

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

export function sanitizeSafeUrl(
  raw: unknown,
  opts: { allowRelative?: boolean; maxLength?: number } = {}
): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const maxLen = opts.maxLength ?? 600;
  const sliced = trimmed.slice(0, maxLen);

  // Allow safe internal paths like /images/..., /audio/..., /api/uploads/...
  if (opts.allowRelative && /^\/(?!\/)[a-zA-Z0-9._~!$&'()*+,;=:@%/?-]+$/.test(sliced)) {
    return sliced;
  }

  try {
    const parsed = new URL(sliced);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function hasValidImageMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return true;
  }

  // GIF: GIF87a / GIF89a
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return true;
  }

  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }

  // ISO BMFF (AVIF / HEIC / HEIF): ....ftyp
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii");
    if (
      ["avif", "avis", "heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(
        brand
      )
    ) {
      return true;
    }
  }

  return false;
}

export function hasValidAudioMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false;

  // MP3 ID3 tag
  if (buf.subarray(0, 3).toString("ascii") === "ID3") return true;
  // MP3 frame sync (0xFF 0xFB / 0xF3 / 0xF2 / 0xFA / 0xE3)
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true;
  // WAV: RIFF....WAVE
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    return true;
  }
  // OGG: OggS
  if (buf.subarray(0, 4).toString("ascii") === "OggS") return true;
  // M4A/MP4: ....ftyp
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") return true;
  // AAC ADTS: FF F1 / FF F9
  if (buf[0] === 0xff && (buf[1] === 0xf1 || buf[1] === 0xf9)) return true;

  return false;
}

const VALID_STATUSES = new Set(["pendiente", "en_edicion", "publicada"]);
const VALID_PAY_STATUSES = new Set(["pendiente", "pagado", "rechazado"]);
const VALID_PAY_METHODS = new Set(["transferencia", "mercadopago", "manual"]);

export function pickAllowedAdminPatch(
  raw: Record<string, unknown>
): Partial<EventRecord> {
  const patch: Partial<EventRecord> = {};

  if (typeof raw.status === "string" && VALID_STATUSES.has(raw.status)) {
    patch.status = raw.status as EventRecord["status"];
  }
  if (
    typeof raw.paymentStatus === "string" &&
    VALID_PAY_STATUSES.has(raw.paymentStatus)
  ) {
    patch.paymentStatus = raw.paymentStatus as EventRecord["paymentStatus"];
  }
  if (
    typeof raw.paymentMethod === "string" &&
    VALID_PAY_METHODS.has(raw.paymentMethod)
  ) {
    patch.paymentMethod = raw.paymentMethod as EventRecord["paymentMethod"];
  }
  if (typeof raw.paidAmount === "number" && Number.isFinite(raw.paidAmount) && raw.paidAmount >= 0) {
    patch.paidAmount = Math.round(raw.paidAmount);
  }
  if (typeof raw.skinId === "string" && raw.skinId.trim()) {
    patch.skinId = raw.skinId.trim().slice(0, 80);
  }
  if (typeof raw.eventTitle === "string") {
    patch.eventTitle = raw.eventTitle.trim().slice(0, 120);
  }
  if (typeof raw.dateDisplay === "string") {
    patch.dateDisplay = raw.dateDisplay.trim().slice(0, 120);
  }
  if (typeof raw.timeDisplay === "string") {
    patch.timeDisplay = raw.timeDisplay.trim().slice(0, 60);
  }
  if (typeof raw.dateISO === "string") {
    patch.dateISO = raw.dateISO.trim().slice(0, 60);
  }
  if (typeof raw.venue === "string") {
    patch.venue = raw.venue.trim().slice(0, 140);
  }
  if (typeof raw.address === "string") {
    patch.address = raw.address.trim().slice(0, 200);
  }
  if (typeof raw.alias === "string") {
    patch.alias = raw.alias.trim().slice(0, 120);
  }
  if (typeof raw.dressCode === "string") {
    patch.dressCode = raw.dressCode.trim().slice(0, 120);
  }
  if (typeof raw.quote === "string") {
    patch.quote = raw.quote.trim().slice(0, 500);
  }
  if (typeof raw.audioOverride === "string") {
    const cleanAudio =
      raw.audioOverride === "none" || raw.audioOverride === ""
        ? raw.audioOverride
        : sanitizeSafeUrl(raw.audioOverride, { allowRelative: true });
    if (cleanAudio !== undefined) {
      patch.audioOverride = cleanAudio;
    }
  } else if (raw.audioOverride === null) {
    patch.audioOverride = "none";
  }
  if (typeof raw.heroImageUrl === "string") {
    const cleanHero = sanitizeSafeUrl(raw.heroImageUrl, { allowRelative: true });
    if (cleanHero !== undefined) patch.heroImageUrl = cleanHero;
  }
  if (typeof raw.albumUrl === "string") {
    const cleanAlbum = sanitizeSafeUrl(raw.albumUrl, { allowRelative: false });
    if (cleanAlbum !== undefined) patch.albumUrl = cleanAlbum;
  }
  if (typeof raw.notes === "string") {
    patch.notes = raw.notes.trim().slice(0, 1000);
  }

  return patch;
}
