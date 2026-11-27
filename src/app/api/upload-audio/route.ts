import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, hasValidAudioMagicBytes } from "@/lib/security";

const PRIMARY_UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const TMP_UPLOAD_DIR = "/tmp/invita-con-alma-uploads";
const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB

const ALLOWED_AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/aac",
]);

function getSupabaseStorageConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "event-uploads";
  if (url && serviceKey) {
    return { url, serviceKey, bucket };
  }
  return null;
}

function resolveUploadDir(): string {
  try {
    if (!fs.existsSync(PRIMARY_UPLOAD_DIR)) {
      fs.mkdirSync(PRIMARY_UPLOAD_DIR, { recursive: true });
    }
    fs.accessSync(PRIMARY_UPLOAD_DIR, fs.constants.W_OK);
    return PRIMARY_UPLOAD_DIR;
  } catch {
    if (!fs.existsSync(TMP_UPLOAD_DIR)) {
      fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
    }
    return TMP_UPLOAD_DIR;
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`upload-audio:${ip}`, 20, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      {
        error:
          auth.reason === "unconfigured"
            ? "Panel de administración no configurado en este entorno."
            : "No autorizado",
      },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo de audio" }, { status: 400 });
    }

    const mimeLower = (file.type || "").toLowerCase();
    const hasValidExt = /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name);
    if (!ALLOWED_AUDIO_MIME.has(mimeLower) && !hasValidExt) {
      return NextResponse.json(
        { error: "Formato no compatible. Subí MP3, WAV, M4A, OGG o AAC." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "El archivo de audio supera los 8 MB permitidos." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidAudioMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "El archivo no corresponde a un formato de audio válido." },
        { status: 400 }
      );
    }
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
    const safeName = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const supa = getSupabaseStorageConfig();
    if (supa) {
      const objectPath = `audio/${safeName}`;
      const uploadRes = await fetch(
        `${supa.url}/storage/v1/object/${supa.bucket}/${objectPath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supa.serviceKey}`,
            apikey: supa.serviceKey,
            "Content-Type": file.type || "audio/mpeg",
            "x-upsert": "true",
          },
          body: buffer,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Supabase Storage audio upload error:", errText);
        return NextResponse.json(
          { error: "No se pudo guardar el audio en Supabase Storage." },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          url: `${supa.url}/storage/v1/object/public/${supa.bucket}/${objectPath}`,
        },
        { status: 201 }
      );
    }

    const dir = resolveUploadDir();
    fs.writeFileSync(path.join(dir, safeName), buffer);
    return NextResponse.json(
      { ok: true, url: `/api/uploads/${safeName}` },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Error subiendo audio" }, { status: 500 });
  }
}
