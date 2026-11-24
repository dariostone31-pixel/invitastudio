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
