import { BUSINESS_CONFIG } from "@/config/business";

const DEV_FALLBACK = "INVITA2026";

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
  if (process.env.NODE_ENV === "production") {
    if (!configuredPass) {
      return { ok: false, reason: "unconfigured" };
    }
    return pass === configuredPass ? { ok: true } : { ok: false, reason: "unauthorized" };
  }

  const effective = configuredPass || DEV_FALLBACK;
  return pass === effective ? { ok: true } : { ok: false, reason: "unauthorized" };
}

export { BUSINESS_CONFIG };
