// Edge-safe & Node-safe HMAC-SHA256 signed admin session cookie helpers (Web Crypto API)

export const ADMIN_SESSION_COOKIE = "invita_admin_session";
export const ADMIN_SESSION_TTL_SEC = 12 * 60 * 60; // 12 horas

function getConfiguredAdminPass(): string {
  const env = process.env as Record<string, string | undefined>;
  const p = env["ADMIN_PASS"]?.trim() || env["ADMIN_PASSCODE"]?.trim();
  if (p) return p;
  if (env["NODE_ENV"] !== "production") {
    return "INVITA2026";
  }
  return "";
}

export function isAdminSecretConfigured(): boolean {
  return getConfiguredAdminPass().length > 0;
}

async function getHmacKey(): Promise<CryptoKey | null> {
  const env = process.env as Record<string, string | undefined>;
  const pass = getConfiguredAdminPass();
  if (!pass) return null;
  const rawSecret =
    env["ADMIN_SESSION_SECRET"]?.trim() || `${pass}::invita-admin-cookie-v1`;
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(rawSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export interface AdminSessionPayload {
  sub: "admin";
  iat: number;
  exp: number;
}

export async function createAdminSessionToken(): Promise<string | null> {
  const key = await getHmacKey();
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: "admin",
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SEC,
  };
  const enc = new TextEncoder();
  const payloadB64 = toBase64Url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

export function verifyAdminTokenStructure(
  token: string | undefined | null
): AdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!payloadB64 || sigB64.length < 20) return null;

  try {
    const jsonStr = new TextDecoder().decode(fromBase64Url(payloadB64));
    const parsed = JSON.parse(jsonStr) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.sub !== "admin" || typeof parsed.exp !== "number" || parsed.exp <= now) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!payloadB64 || !sigB64) return null;

  const key = await getHmacKey();
  if (!key) return null;

  try {
    const enc = new TextEncoder();
    const sigBytes = fromBase64Url(sigB64);
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigCopy.buffer,
      enc.encode(payloadB64)
    );
    if (!valid) return null;

    const jsonStr = new TextDecoder().decode(fromBase64Url(payloadB64));
    const parsed = JSON.parse(jsonStr) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.sub !== "admin" || typeof parsed.exp !== "number" || parsed.exp <= now) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function extractCookieFromHeader(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
