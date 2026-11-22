"use client";

import React, { useEffect, useState } from "react";
import { InvitationSkin } from "@/templates/catalog";
import { Sparkles, Ticket, Newspaper, LockOpen, Star } from "lucide-react";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

interface EnvelopeGateProps {
  skin: InvitationSkin;
  guestName?: string;
  passes?: number;
  table?: string;
  customTitle?: string;
  fontDisplayClass: string;
  onOpen: () => void;
}

export function EnvelopeGate({
  skin,
  guestName,
  passes,
  table,
  customTitle,
  fontDisplayClass,
  onOpen,
}: EnvelopeGateProps) {
  const [opening, setOpening] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [gone, setGone] = useState(false);
  const { palette, layoutId, sample, heroImage } = skin;
  const title = customTitle || sample.title;
  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccentOnSurface = ensureContrast(palette.accent, palette.surface, 4.6);

  useEffect(() => {
    if (!gone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  const handleTap = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
    setTimeout(() => {
      setFadingOut(true);
    }, 450);
    setTimeout(() => {
      setGone(true);
    }, 850);
  };

  if (gone) return null;

  const showGateSparkles =
    layoutId === "neon-dark" ||
    skin.category === "nina" ||
    skin.id === "xv-mariposas-lila";

  const guestPill = guestName ? (
    <div
      className="mt-3.5 inline-flex flex-col items-center rounded-2xl border px-5 py-2.5 text-center shadow-sm"
      style={{
        backgroundColor: palette.isDark
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.96)",
        borderColor: palette.accent,
      }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: palette.isDark ? palette.accent : textAccentOnSurface }}
      >
        Invitación Especial
      </span>
      <span className="mt-0.5 break-words text-base font-semibold" style={{ color: palette.text }}>
        {`¡Hola, ${guestName}!`}
      </span>
      {(passes || table) && (
        <div
          className="mt-1 flex items-center gap-2 text-xs font-medium"
          style={{ color: palette.textMuted }}
        >
          {passes ? (
            <span>
              {passes} {passes === 1 ? "lugar reservado" : "lugares reservados"}
            </span>
          ) : null}
          {passes && table ? <span>·</span> : null}
          {table ? <span>Mesa {table}</span> : null}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      className={`envelope-gate fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center p-4 transition-all duration-500 ${
        fadingOut ? "pointer-events-none scale-105 opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: palette.bg, touchAction: "manipulation" }}
    >
      {/* Subtle atmospheric backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-md"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Ambient floating sparkles only for night / magic / girls themes */}
      {showGateSparkles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Sparkles
            className="animate-particle-float absolute left-[12%] top-[18%] h-4 w-4 opacity-50"
            style={{ color: palette.accent }}
          />
          <Sparkles
            className="animate-particle-float absolute right-[15%] top-[24%] h-5 w-5 opacity-45"
            style={{ color: palette.accent, animationDelay: "1.2s" }}
          />
          <Star
            className="animate-particle-float absolute bottom-[20%] left-[18%] h-3.5 w-3.5 opacity-40"
            style={{ color: palette.accent, animationDelay: "2.1s" }}
          />
        </div>
      )}

      {/* 1. EDITORIAL SOBRE 3D CON SELLO DE LACRE */}
      {layoutId === "editorial-sobre" && (
        <div className="perspective-1000 relative w-full max-w-[400px]">
          <div
            className={`relative overflow-hidden rounded-3xl border shadow-[0_26px_54px_-18px_rgba(42,36,32,0.22)] transition-transform duration-700 ${
              opening ? "-translate-y-4 scale-[1.02]" : ""
            }`}
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div className="paper-texture absolute inset-0 z-10 opacity-70" />
            {/* Top 3D Envelope Flap */}
            <div className="perspective-1000 relative h-44 w-full overflow-hidden">
              {/* Inner letter peeking up when opening */}
              <div
                className={`absolute inset-x-6 bottom-2 top-5 overflow-hidden rounded-t-2xl border shadow-inner transition-transform duration-700 ${
                  opening ? "-translate-y-6 opacity-100" : "translate-y-3 opacity-95"
                }`}
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                }}
              >
                <img
                  src={heroImage}
                  alt={title}
                  className={`h-full w-full object-cover opacity-55 ${
                    skin.imageFilter ?? ""
                  }`}
                />
              </div>

              {/* Animated 3D Triangular Flap */}
              <div
                className={`envelope-flap absolute inset-0 z-10 overflow-hidden ${
                  opening ? "envelope-flap-open" : ""
                }`}
                style={{
                  backgroundColor: palette.surfaceAlt,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(circle at 50% 85%, ${palette.accent}22, transparent 70%)`,
                  }}
                />
                <svg
                  viewBox="0 0 400 176"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <polygon
                    points="0,0 400,0 200,132"
                    fill={palette.surfaceAlt}
                    stroke={palette.border}
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="0,176 200,98 400,176"
                    fill={palette.surface}
                    stroke={palette.border}
                    strokeWidth="1"
                  />
                </svg>
              </div>
              {/* Clean bottom mask so no sliver of inner image leaks under the flap */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3"
                style={{ backgroundColor: palette.surface }}
              />
            </div>

            {/* Wax Seal Button overlapping flap */}
            <div className="relative z-20 -mt-12 flex justify-center">
              <button
                type="button"
                onClick={handleTap}
                aria-label={`Abrir invitación${guestName ? ` para ${guestName}` : ""}`}
                className={`envelope-seal flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 shadow-2xl transition-all duration-500 ${
                  opening
                    ? "scale-125 rotate-12 opacity-0"
                    : "animate-seal-pulse hover:scale-105 active:scale-95"
                }`}
                style={{
                  backgroundColor: buttonBg,
                  borderColor: palette.surface,
                  color: palette.accentText,
                }}
              >
                <span className={`text-xl font-semibold leading-none ${fontDisplayClass}`}>
                  {sample.monogram}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-95">
                  Abrir
                </span>
              </button>
            </div>

            <div className="relative z-20 px-6 pb-8 pt-3 text-center">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: palette.textMuted }}
              >
                {sample.eyebrow}
              </p>
              <h1
                className={`mt-2 py-1 text-5xl font-semibold leading-[1.2] ${fontDisplayClass}`}
                style={{ color: palette.text }}
              >
                {title}
              </h1>
              <p className="mt-1.5 text-[13px] tracking-wide" style={{ color: palette.textMuted }}>
                {sample.dateDisplay}
              </p>
              {guestPill}
              <button
                type="button"
                onClick={handleTap}
                className="mt-6 min-h-[44px] w-full rounded-full px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] shadow-md transition-all hover:opacity-95 active:scale-[0.98]"
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Tocar el sello para abrir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FULLSCREEN HERO / TELÓN CINEMATOGRÁFICO */}
      {layoutId === "fullscreen-hero" && (
        <div className="relative flex h-[86vh] max-h-[680px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-[32px] border border-white/25 shadow-2xl">
          <img
            src={heroImage}
            alt={title}
            className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/45" />

          {/* Curtain panels parting smoothly on open */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-black/50 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "-translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-black/50 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />

          <div className="relative z-10 m-4 flex flex-1 flex-col items-center justify-between rounded-[24px] border border-white/25 p-6 text-center text-white">
            <div className="pt-2">
              <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] backdrop-blur-md">
                {sample.eyebrow}
              </span>
            </div>

            <div>
              <h1 className={`text-5xl font-semibold drop-shadow-md ${fontDisplayClass}`}>
                {title}
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/85">
                {sample.dateDisplay}
              </p>
              {guestName && (
                <div className="mt-4 rounded-2xl border border-white/30 bg-black/50 px-5 py-2.5 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200">
                    Invitación Especial
                  </p>
                  <p className="text-base font-semibold text-white">{`¡Hola, ${guestName}!`}</p>
                  {passes && (
                    <p className="text-xs text-white/90">
                      {passes} {passes === 1 ? "lugar reservado" : "lugares reservados"}
                      {table ? ` · Mesa ${table}` : ""}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTap}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-stone-900 shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-amber-700" strokeWidth={1.75} />
              Abrir Invitación
            </button>
          </div>
        </div>
      )}

      {/* 3. NEON DARK / NOCHE VIP */}
      {layoutId === "neon-dark" && (
        <div
          className={`relative w-full max-w-[400px] overflow-hidden rounded-3xl border p-7 text-center shadow-2xl transition-transform duration-700 ${
            opening ? "scale-110" : ""
          }`}
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.accent,
            boxShadow: `0 0 55px -10px ${palette.accent}66`,
          }}
        >
          <div
            className="relative mx-auto mb-5 h-44 w-full overflow-hidden rounded-2xl border"
            style={{ borderColor: palette.border }}
          >
            <img
              src={heroImage}
              alt={title}
              className="animate-ken-burns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div
              className="animate-float-slow absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ backgroundColor: buttonBg, color: palette.accentText }}
            >
              {sample.badgeText || "VIP NIGHT"}
            </div>
          </div>

          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: textAccentOnSurface }}
          >
            {sample.eyebrow}
          </p>
          <h1
            className={`mt-2 py-1 text-4xl font-bold uppercase leading-[1.2] tracking-wide ${fontDisplayClass}`}
            style={{ color: palette.text }}
          >
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] tracking-wider" style={{ color: palette.textMuted }}>
            {sample.dateDisplay} · {sample.timeDisplay}
          </p>
          {guestPill}
          <button
            type="button"
            onClick={handleTap}
            className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: buttonBg,
              color: palette.accentText,
            }}
          >
            <LockOpen className="h-4 w-4" strokeWidth={1.75} />
            Ingresar al Evento
          </button>
        </div>
      )}

      {/* 4. TICKET VIP PERFORADO CON DESGARRO */}
      {layoutId === "ticket-vip" && (
        <div className="relative w-full max-w-[390px]">
          <div
            className={`overflow-hidden rounded-t-3xl border-x border-t shadow-2xl transition-transform duration-700 ${
              opening ? "-translate-y-8 -rotate-2" : ""
            }`}
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-white">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                  <Ticket className="h-4 w-4" strokeWidth={1.75} />
                  {sample.badgeText || "ALL ACCESS"}
                </span>
                <span className="font-mono text-xs opacity-90">N° 0040-27</span>
              </div>
            </div>

            <div className="px-6 pb-4 pt-5 text-center">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: textAccentOnSurface }}
              >
                {sample.eyebrow}
              </p>
              <h1
                className={`mt-1.5 py-1 text-4xl font-bold uppercase leading-[1.2] ${fontDisplayClass}`}
                style={{ color: palette.text }}
              >
                {title}
              </h1>
              <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                {sample.dateDisplay} · {sample.timeDisplay}
              </p>
              {guestPill}
            </div>
          </div>

          {/* Perforated lower stub separating downward on open */}
          <div
            className={`overflow-hidden rounded-b-3xl border-x border-b shadow-2xl transition-transform duration-700 ${
              opening ? "translate-y-8 rotate-2" : ""
            }`}
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div className="relative flex items-center py-3">
              <div
                className="-ml-3 h-6 w-6 rounded-full border"
                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
              />
              <div
                className="mx-2 flex-1 border-t-2 border-dashed"
                style={{ borderColor: palette.border }}
              />
              <div
                className="-mr-3 h-6 w-6 rounded-full border"
                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
              />
            </div>

            <div className="px-6 pb-7 text-center">
              <div className="mx-auto mb-4 flex h-8 w-44 items-stretch justify-center gap-[2px] opacity-65">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w * 2}px`, backgroundColor: palette.text }}
                    className="h-full"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleTap}
                className="min-h-[44px] w-full rounded-xl px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg transition-transform active:scale-95"
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Cortar Ticket & Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIARIO EDITORIAL */}
      {layoutId === "diario-editorial" && (
        <div
          className={`relative w-full max-w-[400px] border-2 p-6 shadow-2xl transition-transform duration-700 ${
            opening ? "scale-105 -rotate-1" : ""
          }`}
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.text,
            color: palette.text,
          }}
        >
          <div className="border-b-2 pb-2 text-center" style={{ borderColor: palette.text }}>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em]">
              <span>{sample.badgeText || "EDICIÓN ESPECIAL"}</span>
              <Newspaper className="h-4 w-4" strokeWidth={1.75} />
              <span>ARGENTINA</span>
            </div>
            <h2 className={`mt-1 text-2xl font-bold tracking-tight ${fontDisplayClass}`}>
              THE CELEBRATION TIMES
            </h2>
          </div>

          <div
            className="border-b py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: palette.border }}
          >
            {sample.dateDisplay}
          </div>

          <div className="py-4 text-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: textAccentOnSurface }}
            >
              {sample.eyebrow}
            </p>
            <h1 className={`mt-1 py-1 text-4xl font-bold leading-[1.2] ${fontDisplayClass}`}>
              {title}
            </h1>
            <div className="mt-3 h-40 w-full overflow-hidden border" style={{ borderColor: palette.text }}>
              <img
                src={heroImage}
                alt={title}
                className={`animate-ken-burns h-full w-full object-cover ${
                  skin.imageFilter ?? ""
                }`}
              />
            </div>
            {guestPill}
          </div>

          <button
            type="button"
            onClick={handleTap}
            className="mt-2 min-h-[44px] w-full py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: palette.text,
              color: palette.surface,
            }}
          >
            Leer Edición Completa
          </button>
        </div>
      )}

      {/* 6. INFANTIL ANIMADO / ILUSTRADO */}
      {layoutId === "infantil-animado" && (
        <div
          className={`relative w-full max-w-[400px] overflow-hidden rounded-[32px] border-2 shadow-2xl transition-transform duration-700 ${
            opening ? "scale-110 rotate-1" : ""
          }`}
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
          }}
        >
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={heroImage}
              alt={title}
              className="animate-ken-burns h-full w-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-16"
              style={{
                background: `linear-gradient(to bottom, transparent, ${palette.surface})`,
              }}
            />
            {sample.badgeText && (
              <div
                className="animate-float-slow absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-md"
                style={{ backgroundColor: buttonBg, color: palette.accentText }}
              >
                {sample.badgeText}
              </div>
            )}
          </div>

          <div className="px-6 pb-8 pt-1 text-center">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: textAccentOnSurface }}
            >
              {sample.eyebrow}
            </p>
            <h1 className={`mt-1 py-1 text-4xl font-bold leading-[1.2] ${fontDisplayClass}`} style={{ color: palette.text }}>
              {title}
            </h1>
            <p className="mt-1 text-[13px] font-medium" style={{ color: palette.textMuted }}>
              {sample.dateDisplay}
            </p>
            {guestPill}
            <button
              type="button"
              onClick={handleTap}
              className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold tracking-wide shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              ¡Abrir Mi Invitación!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
