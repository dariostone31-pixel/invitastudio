"use client";

import React, { useEffect, useState } from "react";
import { Camera, ExternalLink, Hash, QrCode } from "lucide-react";
import QRCode from "qrcode";
import type { SkinPalette } from "@/templates/catalog";
import { getAccessibleButtonBg } from "@/lib/contrast";

interface CollaborativeAlbumSectionProps {
  albumUrl?: string;
  instagramHandle?: string;
  eventHashtag?: string;
  palette: SkinPalette;
  cardRadius: string;
  innerRadius: string;
  cardShadow: string;
  sectionHeadingFont: string;
  textAccentOnSurface: string;
  isNewspaper?: boolean;
}

export function CollaborativeAlbumSection({
  albumUrl,
  instagramHandle,
  eventHashtag,
  palette,
  cardRadius,
  innerRadius,
  cardShadow,
  sectionHeadingFont,
  textAccentOnSurface,
  isNewspaper = false,
}: CollaborativeAlbumSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [demoNotice, setDemoNotice] = useState(false);

  const isDemoAlbum = (albumUrl || "").trim() === "#demo-album";
  const cleanHandle = (instagramHandle || "").trim().replace(/^@/, "");
  const cleanHashtag = (eventHashtag || "").trim().replace(/^#/, "");
  const igUrl = cleanHandle ? `https://instagram.com/${cleanHandle}` : "";
  const qrTargetUrl = isDemoAlbum
    ? "https://photos.google.com"
    : (albumUrl || "").trim() || igUrl;
  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);

  useEffect(() => {
    let active = true;
    if (!qrTargetUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(qrTargetUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1C1917",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [qrTargetUrl]);

  if (!qrTargetUrl && !cleanHashtag) return null;

  return (
    <section
      className={`${cardRadius} border p-6 text-center ${cardShadow}`}
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
      }}
    >
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border"
        style={{
          backgroundColor: palette.surfaceAlt,
          borderColor: palette.border,
          color: textAccentOnSurface,
        }}
      >
        {qrTargetUrl ? <QrCode className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
      </div>

      <p
        className="font-ui-jost mt-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: textAccentOnSurface }}
      >
        Álbum Colaborativo
      </p>

      <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
        {cleanHashtag ? `#${cleanHashtag}` : "Compartí tus Fotos"}
      </h2>

      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: palette.textMuted }}>
        {albumUrl
          ? "Escaneá el código QR o tocá el botón para subir tus fotos y videos de la fiesta."
          : "Etiquetanos en tus historias y publicaciones para revivir cada momento juntos."}
      </p>

      {qrDataUrl && (
        <div
          className={`mx-auto mt-5 inline-flex flex-col items-center ${innerRadius} border bg-white p-3.5 shadow-sm`}
          style={{ borderColor: palette.border }}
        >
          <img
            src={qrDataUrl}
            alt="Código QR del álbum colaborativo"
            className="h-40 w-40 object-contain"
          />
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Escaneá con tu cámara
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        {albumUrl &&
          (isDemoAlbum ? (
            <button
              type="button"
              onClick={() => setDemoNotice((v) => !v)}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 ${
                isNewspaper ? "rounded-none" : "rounded-full"
              }`}
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              <Camera className="h-4 w-4" />
              Subir Fotos al Álbum
            </button>
          ) : (
            <a
              href={albumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 ${
                isNewspaper ? "rounded-none" : "rounded-full"
              }`}
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              <Camera className="h-4 w-4" />
              Subir Fotos al Álbum
            </a>
          ))}
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 border px-5 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-80 ${
              isNewspaper ? "rounded-none" : "rounded-full"
            }`}
            style={{
              backgroundColor: palette.bg,
              borderColor: palette.border,
              color: palette.text,
            }}
          >
            <ExternalLink className="h-4 w-4" style={{ color: textAccentOnSurface }} />
            @{cleanHandle}
          </a>
        )}
      </div>

      {demoNotice && (
        <p
          className="mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed"
          style={{
            backgroundColor: palette.bg,
            borderColor: palette.border,
            color: palette.textMuted,
          }}
        >
          Vista de demostración: en tu invitación real este botón abrirá directamente tu álbum de Google Fotos o Drive para que los invitados suban sus fotos.
        </p>
      )}

      {cleanHashtag && (
        <p
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: palette.textMuted }}
        >
          <Hash className="h-3.5 w-3.5" style={{ color: textAccentOnSurface }} />
          Usá nuestro hashtag <strong>#{cleanHashtag}</strong>
        </p>
      )}
    </section>
  );
}
