"use client";

import React, { useEffect, useState } from "react";
import { SkinPalette } from "@/templates/catalog";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

interface CountdownTimerProps {
  targetISO: string;
  palette: SkinPalette;
  fontClass: string;
  variant?: "arch" | "grid";
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

  if (variant === "arch") {
    const archBg = getAccessibleButtonBg(palette.accent, palette.accentText);

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

  const numAccent = ensureContrast(palette.accent, palette.surface, 4.6);

  return (
    <div className="my-8 text-center">
      <p
        className="font-ui-jost mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: palette.textMuted }}
      >
        Cuenta Regresiva
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[20px] border px-2 py-3.5 shadow-[0_8px_22px_-12px_rgba(42,36,32,0.1)] transition-colors"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div
              className={`text-2xl sm:text-3xl font-semibold tabular-nums leading-none ${fontClass}`}
              style={{ color: numAccent }}
            >
              {String(item.value).padStart(2, "0")}
            </div>
            <div
              className="font-ui-jost mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em]"
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
