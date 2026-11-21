import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "events");
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
    }

    const supa = getSupabaseStorageConfig();
    const savedUrls: string[] = [];

    for (const file of files.slice(0, 6)) {
      if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            error: `Formato no compatible (${file.name}). Usá JPG, PNG, WebP o AVIF.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `La imagen ${file.name} supera los 4 MB permitidos` },
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
              "Content-Type": file.type,
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
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        fs.writeFileSync(path.join(UPLOAD_DIR, safeName), buffer);
        savedUrls.push(`/uploads/events/${safeName}`);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        storageMode: supa ? "supabase" : "local",
        urls: savedUrls,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Error subiendo imágenes" }, { status: 500 });
  }
}
