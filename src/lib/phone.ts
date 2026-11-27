import crypto from "crypto";

/**
 * Normaliza teléfonos argentinos e internacionales al formato único E.164.
 * Ejemplos equivalentes que producen "+5493885212331":
 *   - "+54 9 388 521-2331"
 *   - "3885212331"
 *   - "0388 15 5212331"
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";

  const hadPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  // Quitar prefijo internacional 00 si vino escrito así
  if (!hadPlus && digits.startsWith("00") && digits.length > 6) {
    digits = digits.slice(2);
  }

  // Caso número con código de país Argentina (54)
  if (digits.startsWith("54")) {
    let rest = digits.slice(2);
    if (rest.startsWith("9")) {
      rest = rest.slice(1);
    }
    if (rest.startsWith("0")) {
      rest = rest.slice(1);
    }
    rest = stripArgentine15(rest);
    if (rest.length === 10) {
      return `+549${rest}`;
    }
    // Si tiene otro largo válido argentino/regional con 54
    if (digits.startsWith("549")) {
      return `+${digits}`;
    }
    return `+54${rest}`;
  }

  // Si ya venía con + de otro país (no 54)
  if (hadPlus) {
    return `+${digits}`;
  }

  // Número local argentino: quitar 0 inicial (ej. 0388, 011)
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Quitar 15 intercalado tras código de área (ej. 388155212331 -> 3885212331)
  digits = stripArgentine15(digits);

  // Móvil argentino estándar de 10 dígitos (área + número)
  if (digits.length === 10) {
    return `+549${digits}`;
  }

  // Si ya incluía el 9 adelante (9 + 10 dígitos = 11 dígitos)
  if (digits.length === 11 && digits.startsWith("9")) {
    return `+54${digits}`;
  }

  // Fallback seguro E.164
  return digits.length >= 8 ? `+${digits}` : "";
}

function stripArgentine15(localDigits: string): string {
  if (localDigits.length !== 12) return localDigits;
  // AMBA: 11 + 15 + 8 dígitos
  if (localDigits.startsWith("11") && localDigits.slice(2, 4) === "15") {
    return `11${localDigits.slice(4)}`;
  }
  // Códigos de área de 3 dígitos (ej. 388, 351, 261, 341) + 15 + 7 dígitos
  if (localDigits.slice(3, 5) === "15") {
    return `${localDigits.slice(0, 3)}${localDigits.slice(5)}`;
  }
  // Códigos de área de 4 dígitos (ej. 2994, 3888) + 15 + 6 dígitos
  if (localDigits.slice(4, 6) === "15") {
    return `${localDigits.slice(0, 4)}${localDigits.slice(6)}`;
  }
  return localDigits;
}

export function hashIp(ip: string): string {
  const salt =
    process.env.IP_HASH_SALT?.trim() ||
    process.env.ADMIN_PASS?.trim() ||
    process.env.ADMIN_PASSCODE?.trim() ||
    "invita-ip-salt-v1";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip || "unknown"}`)
    .digest("hex")
    .slice(0, 32);
}
