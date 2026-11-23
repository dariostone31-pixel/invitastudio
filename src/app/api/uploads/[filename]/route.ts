import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const TMP_UPLOAD_DIR = "/tmp/invita-con-alma-uploads";
const LEGACY_PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "events");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  aac: "audio/aac",
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  // Prevent path traversal; only allow safe generated filenames
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }

  const primaryPath = path.join(UPLOAD_DIR, filename);
  const tmpPath = path.join(TMP_UPLOAD_DIR, filename);
  const legacyPath = path.join(LEGACY_PUBLIC_DIR, filename);
  const targetPath = fs.existsSync(primaryPath)
    ? primaryPath
    : fs.existsSync(tmpPath)
    ? tmpPath
    : fs.existsSync(legacyPath)
    ? legacyPath
    : null;

  if (!targetPath) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(targetPath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
