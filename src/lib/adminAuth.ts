import crypto from "crypto";
import { BUSINESS_CONFIG } from "@/config/business";

const DEV_FALLBACK = "INVITA2026";

function safeEqualString(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a).digest();
  const digestB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function isAdminConfigured(): boolean {
  if (process.env.NODE_ENV === "production") {
    return Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
  }
  return true;
}

export function verifyAdminPass(pass: string | null | undefined): {
  ok: boolean;
  reason?: "unconfigured" | "unauthorized";
} {
  const configuredPass = process.env.ADMIN_PASSCODE?.trim();
  const candidate = typeof pass === "string" ? pass : "";

  if (process.env.NODE_ENV === "production") {
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

export { BUSINESS_CONFIG };
