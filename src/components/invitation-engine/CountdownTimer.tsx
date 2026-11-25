"use client";

import React, { useEffect, useState } from "react";
import { LayoutId, SkinPalette } from "@/templates/catalog";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

interface CountdownTimerProps {
  targetISO: string;
  palette: SkinPalette;
  fontClass: string;
  variant?: "arch" | "grid";
  layoutId?: LayoutId;
  skinId?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetISO: string): TimeLeft {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (diff <= 0 || Number.isNaN(diff)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({
  targetISO,
  palette,
  fontClass,
  variant = "grid",
  layoutId,
  skinId,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetISO));
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetISO));
    }, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  const items = [
    { value: timeLeft.days, label: "Días" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  const numAccent = ensureContrast(palette.accent, palette.surface, 4.6);
  const archBg = getAccessibleButtonBg(palette.accent, palette.accentText);

  const isXvNocturno =
    skinId === "xv-neon-boliche" ||
    skinId === "xv-festival-pass" ||
    skinId === "xv-festival-vip" ||
    skinId === "xv-mariposas-lila";
  const isHombreClub =
    skinId === "hombre-whisky-gold" ||
    skinId === "hombre-club-lounge" ||
    skinId === "hombre-18-rooftop" ||
    skinId === "hombre-minimal-mono";
  const isModernKids =
    layoutId === "infantil-animado" ||
    skinId === "nino-safari-sobre" ||
    skinId === "nina-hadas-sobre" ||
    skinId === "nina-arcoiris-boho" ||
    skinId === "bebe-lino-natural" ||
    skinId === "bebe-florcitas-rosa";

  // 0A. XV NOCTURNO & FESTIVAL VIP -> Tablero LED elegante en cristal oscuro esmerilado
  if (isXvNocturno) {
    return (
      <div
        className="my-8 rounded-[22px] border p-4 text-center backdrop-blur-md"
        style={{
          backgroundColor: "rgba(10, 12, 20, 0.78)",
          borderColor: "rgba(34, 211, 238, 0.38)",
          boxShadow: "0 16px 38px -14px rgba(0, 0, 0, 0.8), 0 0 28px -10px rgba(236, 72, 153, 0.35)",
        }}
      >
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] font-bold uppercase tracking-[0.24em]">
          <span className="text-[#22D3EE]">00 // STAGE COUNTDOWN</span>
          <span className="inline-flex items-center gap-1.5 text-[#EC4899]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899] animate-pulse" />
            LIVE LED
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border px-1.5 py-3 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(6, 7, 11, 0.88)",
                borderColor: "rgba(236, 72, 153, 0.35)",
                boxShadow: "inset 0 0 14px rgba(34, 211, 238, 0.12)",
              }}
            >
              <div
                className="font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none text-white"
                style={{ textShadow: "0 0 14px rgba(34, 211, 238, 0.75)" }}
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#22D3EE]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 0B. HOMBRES & +18 CLUB LOUNGE -> Tablero sobrio cobre cepillado y oro ámbar #C88A4B
  if (isHombreClub) {
    return (
      <div
        className="my-8 border px-4 py-5 text-center shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)]"
        style={{
          backgroundColor: "rgba(22, 17, 14, 0.9)",
          borderColor: "rgba(200, 138, 75, 0.45)",
        }}
      >
        <p className="font-ui-jost mb-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#C88A4B]">
          PRIVATE CLUB · COUNTDOWN
        </p>
        <div className="grid grid-cols-4 divide-x" style={{ borderColor: "rgba(200, 138, 75, 0.25)" }}>
          {items.map((item) => (
            <div key={item.label} className="px-1 py-1" style={{ borderColor: "rgba(200, 138, 75, 0.25)" }}>
              <div
                className={`text-2xl sm:text-3xl font-semibold tabular-nums leading-none text-[#F4ECE1] ${fontClass}`}
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="font-ui-jost mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#C88A4B]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 0C. INFANTIL, NIÑAS & BAUTISMO MODERNO -> Contenedores en blanco crema puro #FFFDF9 + sombra suave
  if (isModernKids) {
    return (
      <div className="my-8 text-center">
        <p
          className="font-ui-jost mb-3 text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: ensureContrast(palette.accent, palette.bg, 4.5) }}
        >
          Falta Muy Poquito
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border px-2 py-4 transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: "#FFFDF9",
                borderColor: `${palette.accent}38`,
                boxShadow: "0 14px 34px -10px rgba(30, 40, 60, 0.08)",
              }}
            >
              <div
                className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${fontClass}`}
                style={{ color: ensureContrast(palette.accent, "#FFFDF9", 4.6) }}
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div
                className="font-ui-jost mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "#687385" }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 1. EDITORIAL SOBRE -> Arco clásico con círculos
  if (layoutId === "editorial-sobre" || (!layoutId && variant === "arch")) {
    return (
      <div
        className="my-8 rounded-b-[24px] rounded-t-[130px] px-4 pb-8 pt-12 text-center shadow-[0_12px_30px_-14px_rgba(42,36,32,0.18)]"
        style={{
          backgroundColor: archBg,
          color: palette.accentText,
        }}
      >
        <p className="font-ui-jost mb-4 text-[11px] font-semibold uppercase tracking-[0.26em] opacity-95">
          Falta Muy Poco
        </p>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex aspect-square flex-col items-center justify-center rounded-full border border-white/65 bg-white/15 backdrop-blur-sm"
            >
              <div className={`text-xl sm:text-2xl font-semibold tabular-nums leading-none ${fontClass}`}>
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="font-ui-jost mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-95">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. FULLSCREEN HERO / REVISTA -> Retícula editorial minimalista con líneas verticales
  if (layoutId === "fullscreen-hero") {
    return (
      <div
        className="my-8 border-y py-6 text-center"
        style={{ borderColor: palette.border }}
      >
        <p
          className="font-ui-jost mb-4 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: ensureContrast(palette.accent, palette.bg, 4.5) }}
        >
          Cuenta Regresiva
        </p>
        <div className="grid grid-cols-4 divide-x" style={{ borderColor: palette.border }}>
          {items.map((item) => (
            <div key={item.label} className="px-1 py-1" style={{ borderColor: palette.border }}>
              <div
                className={`text-3xl sm:text-4xl font-semibold tabular-nums leading-none ${fontClass}`}
                style={{ color: palette.text }}
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div
                className="font-ui-jost mt-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: palette.textMuted }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. NEON DARK -> HUD Nocturno con brillo sutil
  if (layoutId === "neon-dark") {
    return (
      <div className="my-8 text-center">
        <p
          className="font-ui-jost mb-3 text-[11px] font-bold uppercase tracking-[0.26em]"
          style={{ color: ensureContrast(palette.accent, palette.bg, 4.5) }}
        >
          {"00 // Cuenta Regresiva"}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border px-2 py-3.5 backdrop-blur-md"
              style={{
                backgroundColor: `${palette.surface}CC`,
                borderColor: `${palette.accent}66`,
                boxShadow: `0 0 18px -6px ${palette.accent}55`,
              }}
            >
              <div
                className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${fontClass}`}
                style={{ color: palette.accent }}
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div
                className="font-ui-jost mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: palette.textMuted }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. TICKET VIP -> Talón perforado de boarding pass
  if (layoutId === "ticket-vip") {
    return (
      <div
        className="my-8 overflow-hidden rounded-2xl border"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}
      >
        <div
          className="flex items-center justify-between border-b border-dashed px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ borderColor: palette.border, color: numAccent }}
        >
          <span>Boarding Countdown</span>
          <span className="font-mono">T-MINUS</span>
        </div>
        <div className="grid grid-cols-4 divide-x divide-dashed py-4 text-center" style={{ borderColor: palette.border }}>
          {items.map((item) => (
            <div key={item.label} className="px-1" style={{ borderColor: palette.border }}>
              <div className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none`} style={{ color: palette.text }}>
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: palette.textMuted }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. DIARIO EDITORIAL -> Recuadro impreso recto de doble línea
  if (layoutId === "diario-editorial") {
    return (
      <div
        className="my-8 border-2 p-4 text-center"
        style={{ backgroundColor: palette.surface, borderColor: palette.text }}
      >
        <p
          className="border-b pb-1.5 text-[10px] font-bold uppercase tracking-[0.26em]"
          style={{ borderColor: palette.border, color: palette.text }}
        >
          Edición en Curso · Faltan
        </p>
        <div className="mt-3 grid grid-cols-4 divide-x" style={{ borderColor: palette.border }}>
          {items.map((item) => (
            <div key={item.label} className="px-1" style={{ borderColor: palette.border }}>
              <div className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${fontClass}`} style={{ color: palette.text }}>
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: palette.textMuted }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. INFANTIL ANIMADO -> Burbujas / stickers con relieve colorido
  return (
    <div className="my-8 text-center">
      <p
        className="font-ui-jost mb-3 text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: ensureContrast(palette.accent, palette.bg, 4.5) }}
      >
        ¡Ya Falta Muy Poquito!
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border-2 px-2 py-3.5 transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.accent,
              boxShadow: `0 4px 0 ${palette.accent}44`,
            }}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${fontClass}`}
              style={{ color: numAccent }}
            >
              {String(item.value).padStart(2, "0")}
            </div>
            <div
              className="font-ui-jost mt-1 text-[11px] font-bold uppercase tracking-[0.1em]"
              style={{ color: palette.textMuted }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
