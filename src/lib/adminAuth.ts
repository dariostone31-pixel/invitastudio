import crypto from "crypto";
import { BUSINESS_CONFIG } from "@/config/business";
import {
  ADMIN_SESSION_COOKIE,
  extractCookieFromHeader,
  isAdminSecretConfigured,
  verifyAdminSessionToken,
} from "@/lib/adminSession";

const DEV_FALLBACK = "INVITA2026";

function safeEqualString(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a).digest();
  const digestB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function isAdminConfigured(): boolean {
  return isAdminSecretConfigured();
}

export function verifyAdminPass(pass: string | null | undefined): {
  ok: boolean;
  reason?: "unconfigured" | "unauthorized";
} {
  const env = process.env as Record<string, string | undefined>;
  const configuredPass =
    env["ADMIN_PASS"]?.trim() || env["ADMIN_PASSCODE"]?.trim();
  const candidate = typeof pass === "string" ? pass : "";

  if (env["NODE_ENV"] === "production") {
    if (!configuredPass) {
      return { ok: false, reason: "unconfigured" };
    }
    return candidate && safeEqualString(candidate, configuredPass)
      ? { ok: true }
      : { ok: false, reason: "unauthorized" };
  }

  const effective = configuredPass || DEV_FALLBACK;
  return candidate && safeEqualString(candidate, effective)
    ? { ok: true }
    : { ok: false, reason: "unauthorized" };
}

export async function verifyAdminRequest(req: Request): Promise<{
  ok: boolean;
  reason?: "unconfigured" | "unauthorized";
}> {
  if (!isAdminConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  const cookieHeader = req.headers.get("cookie");
  const token = extractCookieFromHeader(cookieHeader, ADMIN_SESSION_COOKIE);
  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return { ok: false, reason: "unauthorized" };
  }
  return { ok: true };
}

export { BUSINESS_CONFIG };
