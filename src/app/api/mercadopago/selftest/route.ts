import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cleanMpSecret, verifyMpSignature } from "@/lib/mpSignature";

export async function GET() {
  const secreto = cleanMpSecret(process.env.MP_WEBHOOK_SECRET);
  if (!secreto) {
    return NextResponse.json({
      ok: true,
      secretoCargado: false,
      secretoLength: 0,
      firmaValida: false,
    });
  }

  const ts = Math.floor(Date.now() / 1000).toString();
  const dataId = "123456789";
  const requestId = "selftest-req-1";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac("sha256", secreto).update(manifest).digest("hex");

  const check = verifyMpSignature({
    signature: `ts=${ts},v1=${v1}`,
    requestId,
    dataId,
    secret: secreto,
  });

  return NextResponse.json({
    ok: true,
    secretoCargado: true,
    secretoLength: secreto.length,
    firmaValida: check.ok,
    manifestUsed: check.manifest || null,
  });
}
