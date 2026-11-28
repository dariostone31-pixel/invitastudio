import crypto from "node:crypto";

export interface MpSignatureVerifyResult {
  ok: boolean;
  manifest?: string;
  reason?: string;
}

export function cleanMpSecret(rawSecret?: string | null): string {
  return String(rawSecret || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

/**
 * Valida la firma HMAC-SHA256 del header `x-signature` de Mercado Pago.
 * Resuelve los 4 errores habituales:
 * - Pozo 1: manifest oficial terminado en `;` (`id:...;request-id:...;ts:...;`) + variantes A-F
 * - Pozo 2: `ts` en segundos vs milisegundos
 * - Pozo 3: `data.id` normalizado en minúsculas
 * - Pozo 6: limpieza de comillas y espacios en `MP_WEBHOOK_SECRET`
 */
export function verifyMpSignature(params: {
  signature?: string | null;
  requestId?: string | null;
  dataId?: string | null;
  secret?: string | null;
}): MpSignatureVerifyResult {
  const limpio = cleanMpSecret(params.secret);
  if (!limpio) {
    return { ok: false, reason: "MP_WEBHOOK_SECRET no configurado" };
  }
  if (!params.signature) {
    return { ok: false, reason: "Falta x-signature" };
  }
  if (!params.dataId) {
    return { ok: false, reason: "Falta data.id" };
  }

  const partes = String(params.signature)
    .split(",")
    .reduce<Record<string, string>>((acc, trozo) => {
      const eqIdx = trozo.indexOf("=");
      if (eqIdx === -1) return acc;
      const k = trozo.slice(0, eqIdx).trim();
      const v = trozo.slice(eqIdx + 1).trim();
      if (k) acc[k] = v;
      return acc;
    }, {});

  const { ts, v1 } = partes;
  if (!ts || !v1) {
    return { ok: false, reason: "x-signature incompleta" };
  }

  // Pozo 2: MP manda segundos; toleramos segundos o milisegundos dentro de ±5 min
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) {
    return { ok: false, reason: "ts inválido" };
  }
  const tsMs = tsNum < 1e12 ? tsNum * 1000 : tsNum;
  if (Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
    return { ok: false, reason: "ts fuera de rango" };
  }

  // Pozo 3: el data.id va en minúsculas en el manifest
  const id = String(params.dataId).trim().toLowerCase();
  const reqId = String(params.requestId || "").trim();

  // Pozo 1: manifest oficial lleva `;` final; se prueban las 6 variantes conocidas
  const manifiestos: Array<[string, string]> = [
    ["D", `id:${id};request-id:${reqId};ts:${ts};`],
    ["E", `id:${id};request-id:;ts:${ts};`],
    ["F", `id:${id};ts:${ts};`],
    ["A", `id:${id};request-id:${reqId};ts:${ts}`],
    ["B", `id:${id};request-id:;ts:${ts}`],
    ["C", `id:${id};ts:${ts}`],
  ];

  for (const [nombre, texto] of manifiestos) {
    const esperado = crypto
      .createHmac("sha256", limpio)
      .update(texto)
      .digest("hex");
    const a = Buffer.from(v1.toLowerCase(), "utf8");
    const b = Buffer.from(esperado, "utf8");
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return { ok: true, manifest: nombre };
    }
  }

  return { ok: false, reason: "firma no coincide (probado A-F)" };
}
