import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PRIMARY_UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const TMP_UPLOAD_DIR = "/tmp/invita-con-alma-uploads";
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
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

function resolveUploadDir(): { dir: string; ephemeral: boolean } {
  try {
    if (!fs.existsSync(PRIMARY_UPLOAD_DIR)) {
      fs.mkdirSync(PRIMARY_UPLOAD_DIR, { recursive: true });
    }
    fs.accessSync(PRIMARY_UPLOAD_DIR, fs.constants.W_OK);
    return { dir: PRIMARY_UPLOAD_DIR, ephemeral: false };
  } catch {
    if (!fs.existsSync(TMP_UPLOAD_DIR)) {
      fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
    }
    return { dir: TMP_UPLOAD_DIR, ephemeral: true };
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
    }

    const supa = getSupabaseStorageConfig();
    const savedUrls: string[] = [];
    let usedEphemeralTmp = false;

    for (const file of files.slice(0, 8)) {
      const mimeLower = (file.type || "").toLowerCase();
      const hasValidExt = /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name);
      if (!ALLOWED_MIME_TYPES.has(mimeLower) && !hasValidExt) {
        return NextResponse.json(
          {
            error: `Formato no compatible (${file.name}). Usá JPG, PNG, WebP o AVIF.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `La imagen ${file.name} supera los 4 MB permitidos.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const safeName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      if (supa) {
        const objectPath = `events/${safeName}`;
        const uploadRes = await fetch(
          `${supa.url}/storage/v1/object/${supa.bucket}/${objectPath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supa.serviceKey}`,
              apikey: supa.serviceKey,
              "Content-Type": file.type || "image/jpeg",
              "x-upsert": "true",
            },
            body: buffer,
          }
        );

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          console.error("Supabase Storage upload error:", errText);
          return NextResponse.json(
            {
              error:
                "No se pudo guardar la foto en Supabase Storage. Verificá que el bucket público exista.",
            },
            { status: 502 }
          );
        }

        savedUrls.push(
          `${supa.url}/storage/v1/object/public/${supa.bucket}/${objectPath}`
        );
      } else {
        const target = resolveUploadDir();
        usedEphemeralTmp = target.ephemeral;
        fs.writeFileSync(path.join(target.dir, safeName), buffer);
        savedUrls.push(`/api/uploads/${safeName}`);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        storageMode: supa ? "supabase" : usedEphemeralTmp ? "tmp-ephemeral" : "local",
        urls: savedUrls,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Error subiendo imágenes" }, { status: 500 });
  }
}
