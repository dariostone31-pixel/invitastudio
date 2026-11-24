"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { InvitationSkin } from "@/templates/catalog";
import { Sparkles, Ticket, Newspaper, LockOpen, Star } from "lucide-react";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

interface EnvelopeGateProps {
  skin: InvitationSkin;
  guestName?: string;
  passes?: number;
  table?: string;
  paseType?: "todo" | "ceremonia" | "fiesta";
  customTitle?: string;
  customHeroImage?: string;
  customDateDisplay?: string;
  customTimeDisplay?: string;
  fontDisplayClass: string;
  onOpen: () => void;
}

const GATE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function EnvelopeGate({
  skin,
  guestName,
  passes,
  table,
  paseType = "todo",
  customTitle,
  customHeroImage,
  customDateDisplay,
  customTimeDisplay,
  fontDisplayClass,
  onOpen,
}: EnvelopeGateProps) {
  const [opening, setOpening] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [gone, setGone] = useState(false);
  const { palette, layoutId, sample } = skin;
  const heroImage = customHeroImage || skin.heroImage;
  const dateDisplay = customDateDisplay || sample.dateDisplay;
  const timeDisplay = customTimeDisplay || sample.timeDisplay;
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
    }, 620);
    setTimeout(() => {
      setGone(true);
    }, 1020);
  };

  if (gone) return null;

  const showGateSparkles =
    layoutId === "neon-dark" ||
    skin.category === "nina" ||
    skin.id === "xv-mariposas-lila";

  const guestNamesList = (guestName || "")
    .split(/[|,·]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  const paseLabel =
    paseType === "ceremonia"
      ? "Pase: Ceremonia"
      : paseType === "fiesta"
      ? "Pase: Fiesta y Brindis"
      : "";

  const guestPill = guestName ? (
    <div
      className="mt-4 inline-flex w-full max-w-[320px] flex-col items-center rounded-2xl border px-5 py-3 text-center shadow-sm"
      style={{
        backgroundColor: palette.isDark
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.96)",
        borderColor: palette.accent,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.24em]"
        style={{ color: palette.isDark ? palette.accent : textAccentOnSurface }}
      >
        {guestNamesList.length > 1 ? "Invitados Especiales" : "Invitación Especial"}
      </span>
      <div className="mt-1 space-y-0.5">
        {guestNamesList.map((n, idx) => (
          <p
            key={idx}
            className={`break-words text-2xl font-semibold leading-tight ${fontDisplayClass}`}
            style={{ color: palette.text }}
          >
            {n}
          </p>
        ))}
      </div>
      {(passes || table || paseLabel) && (
        <div
          className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold"
          style={{ color: palette.textMuted }}
        >
          {passes ? (
            <span>
              {passes} {passes === 1 ? "lugar reservado" : "lugares reservados"}
            </span>
          ) : null}
          {passes && table ? <span>·</span> : null}
          {table ? <span>Mesa {table}</span> : null}
          {paseLabel && (
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                borderColor: `${palette.accent}66`,
                color: palette.isDark ? palette.accent : textAccentOnSurface,
              }}
            >
              {paseLabel}
            </span>
          )}
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
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-lg"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Ambient floating sparkles for night / magic / girls themes */}
      {showGateSparkles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Sparkles
            className="animate-particle-float absolute left-[12%] top-[18%] h-4 w-4 opacity-55"
            style={{ color: palette.accent }}
          />
          <Sparkles
            className="animate-particle-float absolute right-[15%] top-[24%] h-5 w-5 opacity-50"
            style={{ color: palette.accent, animationDelay: "1.2s" }}
          />
          <Star
            className="animate-particle-float absolute bottom-[20%] left-[18%] h-3.5 w-3.5 opacity-45"
            style={{ color: palette.accent, animationDelay: "2.1s" }}
          />
        </div>
      )}

      {/* 1. EDITORIAL SOBRE 3D REALISTA CON SOLAPAS SUPERPUESTAS Y LACRE EN RELIEVE DORADO */}
      {layoutId === "editorial-sobre" && (
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: GATE_EASE }}
          className="relative w-full max-w-[408px]"
          style={{ perspective: "1300px" }}
        >
          <div
            className="relative overflow-visible rounded-[28px] border shadow-[0_32px_68px_-18px_rgba(42,36,32,0.34)]"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            {/* Subtle cotton-paper texture */}
            <div className="paper-texture pointer-events-none absolute inset-0 z-10 rounded-[28px] opacity-80" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-10 rounded-[22px] border opacity-45"
              style={{ borderColor: palette.accent }}
            />

            {/* Top 3D Envelope Stage */}
            <div
              className="relative h-48 w-full overflow-visible rounded-t-[28px]"
              style={{
                perspective: "1200px",
                backgroundColor: palette.surfaceAlt,
              }}
            >
              {/* Inner Invitation Card sliding smoothly out when opened */}
              <motion.div
                initial={false}
                animate={
                  opening
                    ? { y: -74, scale: 1.03, opacity: 1 }
                    : { y: 12, scale: 0.96, opacity: 0.96 }
                }
                transition={{
                  duration: 0.75,
                  delay: opening ? 0.14 : 0,
                  ease: GATE_EASE,
                }}
                className="absolute inset-x-7 bottom-2 top-3 z-10 overflow-hidden rounded-t-2xl border shadow-[0_14px_32px_-12px_rgba(42,36,32,0.35)]"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.accent,
                }}
              >
                <img
                  src={heroImage}
                  alt={title}
                  className={`h-full w-full object-cover opacity-95 ${
                    skin.imageFilter ?? ""
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute inset-x-3 bottom-2.5 text-center text-white">
                  <p className={`truncate text-lg font-semibold drop-shadow ${fontDisplayClass}`}>
                    {title}
                  </p>
                </div>
              </motion.div>

              {/* Side & Lower Pocket Flaps with Inner Depth Shadows */}
              <svg
                viewBox="0 0 400 192"
                preserveAspectRatio="none"
                className="pointer-events-none relative z-20 h-full w-full drop-shadow-[0_-4px_10px_rgba(42,36,32,0.08)]"
              >
                <defs>
                  <linearGradient id="pocketShadowLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={palette.surfaceAlt} />
                    <stop offset="100%" stopColor={palette.surface} />
                  </linearGradient>
                </defs>
                {/* Left triangular fold */}
                <polygon
                  points="0,0 185,112 0,192"
                  fill="url(#pocketShadowLeft)"
                  stroke={palette.border}
                  strokeWidth="1"
                />
                {/* Right triangular fold */}
                <polygon
                  points="400,0 215,112 400,192"
                  fill={palette.surfaceAlt}
                  stroke={palette.border}
                  strokeWidth="1"
                />
                {/* Lower pocket fold */}
                <polygon
                  points="0,192 200,96 400,192"
                  fill={palette.surface}
                  stroke={palette.border}
                  strokeWidth="1.2"
                />
              </svg>

              {/* Animated 3D Top Triangular Flap rotating up on X axis */}
              <motion.div
                initial={false}
                animate={{ rotateX: opening ? -172 : 0 }}
                transition={{ duration: 0.68, ease: GATE_EASE }}
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                }}
                className="pointer-events-none absolute inset-x-0 top-0 z-30 h-44 w-full"
              >
                <svg
                  viewBox="0 0 400 176"
                  preserveAspectRatio="none"
                  className="h-full w-full drop-shadow-[0_12px_18px_rgba(42,36,32,0.22)]"
                >
                  <polygon
                    points="0,0 400,0 200,140"
                    fill={palette.surfaceAlt}
                    stroke={palette.accent}
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />
                  <polyline
                    points="14,6 200,130 386,6"
                    fill="none"
                    stroke={palette.accent}
                    strokeOpacity="0.35"
                    strokeWidth="1"
                  />
                </svg>
              </motion.div>

              {/* Clean bottom mask so pocket edge seals cleanly */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2.5"
                style={{ backgroundColor: palette.surface }}
              />
            </div>

            {/* Embossed Golden Wax Seal Button overlapping flap */}
            <div className="relative z-40 -mt-12 flex justify-center">
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className={`animate-slow-spin pointer-events-none absolute -inset-3 rounded-full border border-dashed opacity-75 transition-opacity ${
                    opening ? "opacity-0" : ""
                  }`}
                  style={{ borderColor: palette.accent }}
                />
                <motion.button
                  type="button"
                  onClick={handleTap}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={`Abrir invitación${guestName ? ` para ${guestName}` : ""}`}
                  className={`envelope-seal relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 shadow-[0_14px_28px_-6px_rgba(42,36,32,0.45),inset_0_2px_6px_rgba(255,255,255,0.45)] transition-all duration-500 ${
                    opening ? "scale-125 rotate-12 opacity-0" : "animate-seal-pulse"
                  }`}
                  style={{
                    background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.28), transparent 55%), ${buttonBg}`,
                    borderColor: palette.surface,
                    color: palette.accentText,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-full border border-white/35"
                  />
                  <span className={`text-xl font-semibold leading-none ${fontDisplayClass}`}>
                    {sample.monogram}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] opacity-95">
                    Abrir
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="relative z-30 px-6 pb-8 pt-3 text-center">
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
                {dateDisplay}
              </p>
              {guestPill}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover mt-6 min-h-[44px] w-full rounded-full px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] shadow-md transition-all hover:opacity-95"
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Tocar el sello para abrir
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. FULLSCREEN HERO / DOBLE MARCO FINO 1PX + DEGRADADO OSCURO */}
      {layoutId === "fullscreen-hero" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: GATE_EASE }}
          className="relative flex h-[88vh] max-h-[700px] w-full max-w-[430px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/30 shadow-[0_32px_70px_-18px_rgba(0,0,0,0.6)]"
        >
          <img
            src={heroImage}
            alt={title}
            className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50" />

          {/* Curtain panels parting smoothly on open */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-black/55 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "-translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-black/55 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />

          {/* Double 1px fine hairline architectural frame */}
          <div className="relative z-10 m-3.5 flex flex-1 flex-col items-center justify-between rounded-[22px] border border-white/45 p-2 text-center text-white">
            <div className="flex h-full w-full flex-col items-center justify-between rounded-[16px] border border-white/25 p-5">
              <div className="pt-1">
                <span className="inline-block rounded-full border border-white/35 bg-black/25 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] backdrop-blur-md">
                  {sample.eyebrow}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.15, ease: GATE_EASE }}
              >
                <h1 className={`text-5xl font-semibold drop-shadow-md ${fontDisplayClass}`}>
                  {title}
                </h1>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-3 block h-[1px] w-14 bg-white/75"
                />
                <p className="mt-2.5 text-xs uppercase tracking-[0.24em] text-white/90">
                  {dateDisplay}
                </p>
                {guestName && (
                  <div className="mt-4 rounded-2xl border border-white/35 bg-black/55 px-5 py-3 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                      {guestNamesList.length > 1 ? "Invitados Especiales" : "Invitación Especial"}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {guestNamesList.map((n, idx) => (
                        <p
                          key={idx}
                          className={`text-2xl font-semibold leading-tight text-white ${fontDisplayClass}`}
                        >
                          {n}
                        </p>
                      ))}
                    </div>
                    {(passes || table || paseLabel) && (
                      <p className="mt-1 text-xs text-white/90">
                        {passes
                          ? `${passes} ${passes === 1 ? "lugar reservado" : "lugares reservados"}`
                          : ""}
                        {passes && table ? " · " : ""}
                        {table ? `Mesa ${table}` : ""}
                        {paseLabel ? ` · ${paseLabel}` : ""}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-stone-900 shadow-xl transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 text-amber-700" strokeWidth={1.5} />
                Abrir Invitación
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. NEON DARK / LUZ AMBIENTAL DIFUSA & CONTRASTE NOCTURNO */}
      {layoutId === "neon-dark" && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={opening ? { scale: 1.08, opacity: 0.85 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-3xl border p-7 text-center shadow-2xl"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.accent,
            boxShadow: `0 0 70px -10px ${palette.accent}77, inset 0 0 36px -18px ${palette.accent}44`,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-35 blur-3xl"
            style={{ backgroundColor: palette.accent }}
          />
          <div
            className="relative mx-auto mb-5 h-44 w-full overflow-hidden rounded-2xl border"
            style={{ borderColor: `${palette.accent}66` }}
          >
            <img
              src={heroImage}
              alt={title}
              className="animate-ken-burns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div
              className="animate-float-slow absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] shadow-lg"
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
            style={{ color: palette.text, textShadow: `0 0 24px ${palette.accent}44` }}
          >
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] tracking-wider" style={{ color: palette.textMuted }}>
            {dateDisplay} · {timeDisplay}
          </p>
          {guestPill}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleTap}
            className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              backgroundColor: buttonBg,
              color: palette.accentText,
              boxShadow: `0 12px 28px -8px ${palette.accent}77`,
            }}
          >
            <LockOpen className="h-4 w-4" strokeWidth={1.5} />
            Ingresar al Evento
          </motion.button>
        </motion.div>
      )}

      {/* 4. TICKET VIP PERFORADO CON DESGARRO FRAMER MOTION */}
      {layoutId === "ticket-vip" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[392px]"
        >
          <motion.div
            animate={opening ? { y: -38, rotate: -2.5 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: GATE_EASE }}
            className="overflow-hidden rounded-t-3xl border-x border-t shadow-2xl"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-white">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                  <Ticket className="h-4 w-4" strokeWidth={1.5} />
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
          </motion.div>

          {/* Perforated lower stub separating downward on open */}
          <motion.div
            animate={opening ? { y: 38, rotate: 2.5 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: GATE_EASE }}
            className="overflow-hidden rounded-b-3xl border-x border-b shadow-2xl"
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
                style={{ borderColor: palette.accent }}
              />
              <div
                className="-mr-3 h-6 w-6 rounded-full border"
                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
              />
            </div>

            <div className="px-6 pb-7 text-center">
              <div className="mx-auto mb-4 flex h-8 w-44 items-stretch justify-center gap-[2px] opacity-70">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w * 2}px`, backgroundColor: palette.text }}
                    className="h-full"
                  />
                ))}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover min-h-[44px] w-full rounded-xl px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg"
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Cortar Ticket & Entrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 5. DIARIO EDITORIAL */}
      {layoutId === "diario-editorial" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={opening ? { scale: 1.04, rotate: -0.8 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] border-2 p-6 shadow-2xl"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.text,
            color: palette.text,
          }}
        >
          <div className="border-b-2 pb-2 text-center" style={{ borderColor: palette.text }}>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em]">
              <span>{sample.badgeText || "EDICIÓN ESPECIAL"}</span>
              <Newspaper className="h-4 w-4" strokeWidth={1.5} />
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
            {dateDisplay}
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
            <div className="mt-3 h-40 w-full overflow-hidden border-2" style={{ borderColor: palette.text }}>
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

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleTap}
            className="btn-shimmer-hover mt-2 min-h-[44px] w-full py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
            style={{
              backgroundColor: palette.text,
              color: palette.surface,
            }}
          >
            Leer Edición Completa
          </motion.button>
        </motion.div>
      )}

      {/* 6. INFANTIL ANIMADO / ILUSTRADO */}
      {layoutId === "infantil-animado" && (
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.94 }}
          animate={opening ? { scale: 1.07, rotate: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 16 }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-[32px] border-2 shadow-2xl"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.accent,
            boxShadow: `0 24px 55px -16px ${palette.accent}55`,
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
              {dateDisplay}
            </p>
            {guestPill}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold tracking-wide shadow-lg transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              ¡Abrir Mi Invitación!
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
