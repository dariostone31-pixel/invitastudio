/**
 * Comprime/redimensiona imágenes en el navegador antes de subirlas a /api/upload
 * para evitar rechazos por tamaño excesivo en fotos modernas de celular (> 4 MB).
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const MAX_TARGET_BYTES = 1.4 * 1024 * 1024; // 1.4 MB objetivo seguro para serverless
  const MAX_DIMENSION = 1600;

  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name)) {
    throw new Error(`El archivo "${file.name}" no parece una imagen válida (usá JPG, PNG o WebP).`);
  }

  // Si ya es pequeña y es JPEG/PNG/WebP/AVIF estándar, subir directo sin pérdida extra
  const standardMime = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.type.toLowerCase()
  );
  if (standardMime && file.size <= MAX_TARGET_BYTES) {
    return file;
  }

  // Intentar decodificar en canvas para redimensionar y exportar como JPEG liviano
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.84)
    );
    if (!blob) return file;

    const cleanBase = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${cleanBase}.jpg`, { type: "image/jpeg" });
  } catch {
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(
        `La foto "${file.name}" pesa más de 4 MB y el navegador no pudo comprimirla. Probá guardarla como JPG o elegir otra más liviana.`
      );
    }
    return file;
  }
}
