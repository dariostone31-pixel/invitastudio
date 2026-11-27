"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Camera,
  Check,
  Download,
  FileText,
  Hash,
  Link2,
  Lock,
  QrCode,
  Save,
  Sparkles,
} from "lucide-react";
import type { EventRecord } from "@/lib/db";
import { getSkinById, type InvitationSkin } from "@/templates/catalog";
import { deriveInitialsMonogram } from "@/lib/locationUtils";
import { buildA4FourUpQrPdf } from "@/lib/pdfA4";

interface QrTableCardGeneratorProps {
  event: EventRecord;
  isPaid: boolean;
}

type CardThemeKind =
  | "marfil"
  | "botanico"
  | "prensa"
  | "gala"
  | "pastel-xv"
  | "lounge"
  | "infantil";

function resolveCardThemeKind(skin: InvitationSkin): CardThemeKind {
  if (skin.id === "boda-sobre-marfil") return "marfil";
  if (
    skin.id === "boda-botanica-eucalipto" ||
    skin.id === "boda-jardin-botanico" ||
    skin.id === "boda-boho-pampas" ||
    skin.id === "comunion-oliva-hero"
  ) {
    return "botanico";
  }
  if (skin.layoutId === "diario-editorial" && skin.id !== "xv-editorial-vogue") {
    return skin.id === "hombre-caballero-diario" ? "lounge" : "prensa";
  }
  if (
    skin.id === "boda-noche-gala" ||
    skin.layoutId === "neon-dark" ||
    skin.id === "xv-festival-pass" ||
    skin.id === "xv-festival-vip" ||
    skin.id === "hombre-18-rooftop" ||
    skin.palette.isDark
  ) {
    return skin.category === "hombre" ? "lounge" : "gala";
  }
  if (skin.category === "xv") return "pastel-xv";
  if (skin.category === "hombre") return "lounge";
  if (
    skin.category === "nino" ||
    skin.category === "nina" ||
    skin.category === "bautismo"
  ) {
    return "infantil";
  }
  return "marfil";
}

function sanitizeHashtag(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function normalizeAlbumTarget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function QrTableCardGenerator({
  event,
  isPaid,
}: QrTableCardGeneratorProps) {
  const skin = useMemo(() => getSkinById(event.skinId), [event.skinId]);
  const themeKind = useMemo(() => resolveCardThemeKind(skin), [skin]);
  const fontKey = event.fontOverride || skin.fontDisplay;
  const accentColor = event.accentOverride || skin.palette.accent;
  const isDarkTheme = skin.palette.isDark;

  const [albumUrl, setAlbumUrl] = useState(event.albumUrl || "");
  const [hashtagInput, setHashtagInput] = useState(
    event.eventHashtag ||
      `#${event.eventTitle.replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/g, "").slice(0, 22) || "NuestraFiesta"}`
  );
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const displayFontProbeRef = useRef<HTMLSpanElement | null>(null);
  const uiFontProbeRef = useRef<HTMLSpanElement | null>(null);

  const resolvedTargetUrl = useMemo(() => normalizeAlbumTarget(albumUrl), [albumUrl]);
  const formattedHashtag = useMemo(() => sanitizeHashtag(hashtagInput), [hashtagInput]);
  const monogram = useMemo(
    () => deriveInitialsMonogram(event.eventTitle, skin.sample.monogram),
    [event.eventTitle, skin.sample.monogram]
  );

  // Palette refined per card theme
  const cardColors = useMemo(() => {
    switch (themeKind) {
      case "marfil":
        return {
          bg: "#FAF7F2",
          surface: "#FFFDFA",
          border: "#B78A4E",
          text: "#35261B",
          muted: "#755F4B",
          accent: accentColor || "#6B1E30",
          qrDark: "#2A1F18",
        };
      case "botanico":
        return {
          bg: skin.id === "boda-boho-pampas" ? "#F8F1EA" : "#F5F7F1",
          surface: "#FFFDF9",
          border: skin.id === "boda-boho-pampas" ? "#B86B4B" : "#5F7D5B",
          text: "#2A3329",
          muted: "#5C685A",
          accent: accentColor || "#5F7D5B",
          qrDark: "#233022",
        };
      case "prensa":
        return {
          bg: "#F3EFE6",
          surface: "#FAF7EE",
          border: "#1C1B19",
          text: "#1C1B19",
          muted: "#4A463F",
          accent: "#1C1B19",
          qrDark: "#1C1B19",
        };
      case "gala":
        return {
          bg: skin.palette.bg,
          surface: skin.palette.surface,
          border: accentColor || "#D4AF37",
          text: skin.palette.text,
          muted: skin.palette.textMuted,
          accent: accentColor || "#D4AF37",
          qrDark: "#111318",
        };
      case "lounge":
        return {
          bg: skin.palette.bg,
          surface: skin.palette.surface,
          border: accentColor || "#C88A4B",
          text: skin.palette.text,
          muted: skin.palette.textMuted,
          accent: accentColor || "#C88A4B",
          qrDark: "#16110E",
        };
      case "pastel-xv":
        return {
          bg: skin.palette.bg,
          surface: skin.palette.surface,
          border: accentColor || "#C69B57",
          text: skin.palette.text,
          muted: skin.palette.textMuted,
          accent: accentColor || "#C69B57",
          qrDark: "#2E2226",
        };
      case "infantil":
      default:
        return {
          bg: skin.palette.bg,
          surface: skin.palette.surface,
          border: accentColor || skin.palette.border,
          text: skin.palette.text,
          muted: skin.palette.textMuted,
          accent: accentColor || skin.palette.accent,
          qrDark: "#1F2937",
        };
    }
  }, [themeKind, skin, accentColor]);

  useEffect(() => {
    let active = true;
    if (!resolvedTargetUrl) {
      setQrPreviewUrl("");
      return;
    }
    QRCode.toDataURL(resolvedTargetUrl, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: cardColors.qrDark,
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) setQrPreviewUrl(url);
      })
      .catch(() => {
        if (active) setQrPreviewUrl("");
      });
    return () => {
      active = false;
    };
  }, [resolvedTargetUrl, cardColors.qrDark]);

  const handleSaveAlbumSettings = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    setSavedOk(false);
    try {
      const res = await fetch(`/api/panel/${event.panelToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumUrl: resolvedTargetUrl,
          eventHashtag: formattedHashtag,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No pudimos guardar el enlace del álbum.");
      }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2600);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Error al guardar el álbum."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderCardCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!isPaid || !resolvedTargetUrl) return null;
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 3x print resolution for 4:5 (10x15 cm @ 300 DPI -> 1200 x 1500 px)
    const W = 1200;
    const H = 1500;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");

      const displayFamily =
        (displayFontProbeRef.current &&
          getComputedStyle(displayFontProbeRef.current).fontFamily) ||
        "Georgia, serif";
      const uiFamily =
        (uiFontProbeRef.current &&
          getComputedStyle(uiFontProbeRef.current).fontFamily) ||
        "system-ui, sans-serif";

      // 1. Background fill & subtle atmospheric paper gradient
      ctx.fillStyle = cardColors.bg;
      ctx.fillRect(0, 0, W, H);

      const radial = ctx.createRadialGradient(W * 0.25, H * 0.15, 40, W * 0.5, H * 0.5, W * 0.9);
      radial.addColorStop(0, isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)");
      radial.addColorStop(1, "rgba(0,0,0,0.03)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);

      // Subtle artisanal paper grain dots
      ctx.fillStyle = isDarkTheme ? "rgba(255,255,255,0.02)" : "rgba(70,50,30,0.022)";
      for (let i = 0; i < 1600; i++) {
        const gx = ((i * 7919) % W);
        const gy = ((i * 6271) % H);
        ctx.fillRect(gx, gy, 2, 2);
      }

      // 2. Editorial double frame
      const isSharp = themeKind === "prensa" || themeKind === "lounge" || themeKind === "gala";
      const outerRadius = isSharp ? 0 : 44;
      const innerRadius = isSharp ? 0 : 32;

      ctx.strokeStyle = cardColors.border;
      ctx.lineWidth = themeKind === "prensa" ? 6 : 3;
      drawRoundedRect(ctx, 42, 42, W - 84, H - 84, outerRadius);
      ctx.stroke();

      ctx.globalAlpha = 0.52;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 62, 62, W - 124, H - 124, innerRadius);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Corner ornaments per theme
      if (themeKind === "botanico") {
        ctx.save();
        ctx.strokeStyle = cardColors.border;
        ctx.fillStyle = cardColors.border;
        ctx.globalAlpha = 0.25;
        const drawLeaf = (lx: number, ly: number, rot: number) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };
        drawLeaf(125, 110, -0.5);
        drawLeaf(165, 130, 0.25);
        drawLeaf(W - 125, 110, 0.5);
        drawLeaf(W - 165, 130, -0.25);
        drawLeaf(125, H - 110, 0.5);
        drawLeaf(W - 125, H - 110, -0.5);
        ctx.restore();
      } else if (themeKind === "gala" || themeKind === "marfil" || themeKind === "pastel-xv") {
        ctx.save();
        ctx.strokeStyle = cardColors.border;
        ctx.lineWidth = 3;
        const c = 38;
        const m = 80;
        // Top-left L
        ctx.beginPath();
        ctx.moveTo(m, m + c);
        ctx.lineTo(m, m);
        ctx.lineTo(m + c, m);
        // Top-right L
        ctx.moveTo(W - m - c, m);
        ctx.lineTo(W - m, m);
        ctx.lineTo(W - m, m + c);
        // Bottom-left L
        ctx.moveTo(m, H - m - c);
        ctx.lineTo(m, H - m);
        ctx.lineTo(m + c, H - m);
        // Bottom-right L
        ctx.moveTo(W - m - c, H - m);
        ctx.lineTo(W - m, H - m);
        ctx.lineTo(W - m, H - m - c);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Top eyebrow + Upper title ('¡Compartí tus fotos con nosotros!')
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = cardColors.accent;
      ctx.font = `600 22px ${uiFamily}`;
      ctx.fillText(
        "Á L B U M   C O L A B O R A T I V O",
        W / 2,
        142
      );

      ctx.fillStyle = cardColors.muted;
      ctx.font = `600 34px ${uiFamily}`;
      ctx.fillText("¡Compartí tus fotos con nosotros!", W / 2, 206);

      // 4. Honored names (hero local font)
      ctx.fillStyle = cardColors.text;
      const isScript = fontKey === "script" || fontKey === "pinyon";
      const baseTitleSize = isScript ? 104 : 84;
      ctx.font = `600 ${baseTitleSize}px ${displayFamily}`;
      const titleLines = wrapTextLines(ctx, event.eventTitle, W - 220).slice(0, 2);
      const lineGap = isScript ? 96 : 86;
      const titleStartY = titleLines.length > 1 ? 295 : 322;
      titleLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, titleStartY + i * lineGap);
      });

      // Decorative rule under names
      const ruleY = titleStartY + (titleLines.length > 1 ? 142 : 76);
      ctx.strokeStyle = cardColors.border;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 110, ruleY);
      ctx.lineTo(W / 2 + 110, ruleY);
      ctx.stroke();

      // 5. High-contrast white QR frame in the center
      const qrSize = 530;
      const pad = 42;
      const boxW = qrSize + pad * 2;
      const boxH = qrSize + pad * 2;
      const boxX = (W - boxW) / 2;
      const boxY = Math.max(ruleY + 54, 495);

      ctx.save();
      ctx.shadowColor = isDarkTheme ? "rgba(0,0,0,0.45)" : "rgba(40,30,20,0.12)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, isSharp ? 6 : 34);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = cardColors.border;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, isSharp ? 6 : 34);
      ctx.stroke();

      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, resolvedTargetUrl, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: cardColors.qrDark,
          light: "#FFFFFF",
        },
      });
      ctx.drawImage(qrCanvas, boxX + pad, boxY + pad, qrSize, qrSize);

      // 6. Hashtag (or monogram fallback) below QR
      const tagY = boxY + boxH + 74;
      if (formattedHashtag) {
        ctx.fillStyle = cardColors.accent;
        ctx.font = `700 42px ${uiFamily}`;
        ctx.fillText(formattedHashtag, W / 2, tagY);
      } else {
        ctx.fillStyle = cardColors.accent;
        ctx.font = `600 38px ${displayFamily}`;
        ctx.fillText(monogram, W / 2, tagY);
      }

      // 7. Bottom instruction ('Escaneá el código con la cámara de tu celular y subí tus recuerdos al álbum')
      ctx.fillStyle = cardColors.muted;
      ctx.font = `500 28px ${uiFamily}`;
      const instrLines = wrapTextLines(
        ctx,
        "Escaneá el código con la cámara de tu celular y subí tus recuerdos al álbum",
        W - 230
      );
      const instrStartY = Math.min(H - 125, tagY + 66);
      instrLines.forEach((line, idx) => {
        ctx.fillText(line, W / 2, instrStartY + idx * 38);
      });

      return canvas;
  };

  const handleDownloadPng = async () => {
    if (!isPaid || !resolvedTargetUrl || downloading) return;
    setDownloading(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) return;
      const pngUrl = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `cartel-qr-${event.slug}-10x15.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdfA4 = async () => {
    if (!isPaid || !resolvedTargetUrl || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) return;
      const jpegBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.94)
      );
      if (!jpegBlob) return;
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const pdfBlob = buildA4FourUpQrPdf(jpegBytes, canvas.width, canvas.height);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `carteles-qr-A4-x4-${event.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(pdfUrl);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isSharpPreview =
    themeKind === "prensa" || themeKind === "lounge" || themeKind === "gala";

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm print:hidden">
      {/* Hidden font probes so native <canvas> resolves the exact Next.js localFont families */}
      <span
        ref={displayFontProbeRef}
        aria-hidden="true"
        className={`pointer-events-none fixed -left-[9999px] opacity-0 font-display-${fontKey}`}
      >
        Abc
      </span>
      <span
        ref={uiFontProbeRef}
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] opacity-0 font-ui-jost"
      >
        Abc
      </span>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
            <QrCode className="h-3.5 w-3.5" />
            Álbum Colaborativo &amp; Mesas
          </span>
          <h2 className="mt-1 font-cormorant text-2xl font-semibold text-stone-900">
            Generador de Cartel QR de Mesa Personalizado
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Formato imprimible <strong>10×15 cm (4:5 · 1200×1500 px)</strong> con la paleta y tipografía de tu modelo{" "}
            <strong className="text-stone-700">{skin.name}</strong>.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
            isPaid
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          {isPaid ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Listo para imprimir en 300 DPI
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Vista previa (Pendiente de pago)
            </>
          )}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Controles */}
        <div className="space-y-4 lg:col-span-6">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Link2 className="h-3.5 w-3.5 text-amber-700" />
              URL de tu Álbum Colaborativo (Google Fotos, Drive, etc.)
            </label>
            <input
              type="url"
              value={albumUrl}
              onChange={(e) => setAlbumUrl(e.target.value)}
              placeholder="https://photos.app.goo.gl/... o https://drive.google.com/..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Creá una carpeta o álbum compartido con permiso de subida para invitados y pegá el link acá.
            </p>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Hash className="h-3.5 w-3.5 text-amber-700" />
              Hashtag del evento (opcional)
            </label>
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#NuestraFiesta"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSaveAlbumSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 disabled:opacity-60"
            >
              {savedOk ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  Guardado en la invitación
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Guardando..." : "Guardar enlace y hashtag"}
                </>
              )}
            </button>

            {isPaid ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdfA4}
                  disabled={!resolvedTargetUrl || downloadingPdf}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6B1E30] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#4A1420] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  {downloadingPdf
                    ? "Generando PDF A4..."
                    : "Descargar PDF imprimible A4 (4 carteles)"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!resolvedTargetUrl || downloading}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "Generando PNG..." : "PNG individual (10×15)"}
                </button>
              </div>
            ) : (
              <a
                href="#pago-transferencia"
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-200"
              >
                <Lock className="h-3.5 w-3.5" />
                Activar invitación para descargar PNG
              </a>
            )}
          </div>

          {saveError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {saveError}
            </p>
          )}

          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 text-xs text-stone-600 space-y-1.5">
            <p className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-700" />
              Ideas para usar tu cartel el día del evento:
            </p>
            <p>• Imprimilo en papel ilustración o opalina 250g tamaño <strong>10×15 cm</strong> para cada mesa.</p>
            <p>• También podés proyectarlo en las pantallas del salón durante el cóctel y la fiesta.</p>
          </div>
        </div>

        {/* Vista previa 4:5 (10x15 cm) */}
        <div className="flex flex-col items-center lg:col-span-6">
          <div
            aria-label="Vista previa del cartel QR de mesa"
            onContextMenu={(e) => {
              if (!isPaid) e.preventDefault();
            }}
            className={`relative aspect-[4/5] w-full max-w-[340px] select-none overflow-hidden p-5 shadow-xl ${
              isSharpPreview ? "rounded-none" : "rounded-[24px]"
            }`}
            style={{
              backgroundColor: cardColors.bg,
              color: cardColors.text,
            }}
          >
            {/* Textura heredada de la plantilla */}
            {themeKind === "marfil" && (
              <div className="cotton-paper-marfil absolute inset-0" />
            )}
            {themeKind === "botanico" && (
              <div
                className={`${
                  skin.id === "boda-boho-pampas"
                    ? "linen-sand-pampas"
                    : "laid-paper-botanical"
                } absolute inset-0`}
              />
            )}
            {themeKind === "prensa" && (
              <div className="newsprint-vintage absolute inset-0" />
            )}
            {themeKind === "gala" && (
              <div className="velvet-midnight-gala absolute inset-0 opacity-90" />
            )}
            {themeKind === "lounge" && (
              <div className="club-lounge-walnut absolute inset-0 opacity-90" />
            )}

            {/* Doble filete de marco */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-2.5 border ${
                isSharpPreview ? "rounded-none" : "rounded-[18px]"
              }`}
              style={{
                borderColor: cardColors.border,
                borderWidth: themeKind === "prensa" ? "2px" : "1.5px",
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-3.5 border opacity-55 ${
                isSharpPreview ? "rounded-none" : "rounded-[14px]"
              }`}
              style={{ borderColor: cardColors.border }}
            />

            {/* Contenido interno del cartel 4:5 */}
            <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 py-5 text-center">
              <div className="space-y-1">
                <p
                  className="font-ui-jost text-[8px] font-bold uppercase tracking-[0.26em]"
                  style={{ color: cardColors.accent }}
                >
                  Álbum Colaborativo
                </p>
                <p
                  className="font-ui-jost text-[11px] font-semibold"
                  style={{ color: cardColors.muted }}
                >
                  ¡Compartí tus fotos con nosotros!
                </p>
                <h3
                  className={`font-display-${fontKey} pt-0.5 break-words text-[26px] font-semibold leading-[1.12]`}
                  style={{ color: cardColors.text }}
                >
                  {event.eventTitle}
                </h3>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-1.5 block h-[1px] w-14 opacity-70"
                  style={{ backgroundColor: cardColors.border }}
                />
              </div>

              {/* Bloque QR central */}
              <div
                className={`my-2 flex h-40 w-40 items-center justify-center border bg-white p-2.5 shadow-md ${
                  isSharpPreview ? "rounded-sm" : "rounded-2xl"
                }`}
                style={{ borderColor: cardColors.border }}
              >
                {qrPreviewUrl ? (
                  <img
                    src={qrPreviewUrl}
                    alt="Código QR del álbum colaborativo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center text-stone-400">
                    <QrCode className="h-10 w-10 opacity-45" />
                    <span className="text-[10px] leading-tight">
                      Pegá el link de tu álbum para generar el QR
                    </span>
                  </div>
                )}
              </div>

              {/* Hashtag + Instrucción inferior */}
              <div className="space-y-1.5">
                <p
                  className={`text-sm font-bold tracking-wide ${
                    formattedHashtag ? "font-ui-jost" : `font-display-${fontKey}`
                  }`}
                  style={{ color: cardColors.accent }}
                >
                  {formattedHashtag || monogram}
                </p>
                <p
                  className="font-ui-jost mx-auto max-w-[230px] text-[10px] font-medium leading-snug"
                  style={{ color: cardColors.muted }}
                >
                  Escaneá el código con la cámara de tu celular y subí tus recuerdos al álbum
                </p>
              </div>
            </div>

            {/* Marca de agua cuando está pendiente de pago */}
            {!isPaid && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[0.5px]"
              >
                <div className="-rotate-12 rounded-full border border-amber-700/45 bg-amber-50/90 px-4 py-1.5 text-center shadow-sm">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-amber-950">
                    Vista Previa · Pendiente de pago
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
