"use client";

import React, { useEffect, useState } from "react";
import { SkinPalette } from "@/templates/catalog";

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
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetISO));

  useEffect(() => {
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
    return (
      <div
        className="my-8 rounded-b-[28px] rounded-t-[130px] px-4 pb-8 pt-12 text-center shadow-lg"
        style={{
          backgroundColor: palette.accent,
          color: palette.accentText,
        }}
      >
        <p className="font-ui-jost mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] opacity-90">
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
              <div className="font-ui-jost mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] opacity-90">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 text-center">
      <p
        className="font-ui-jost mb-3 text-[11px] font-semibold uppercase tracking-[0.26em]"
        style={{ color: palette.textMuted }}
      >
        Cuenta Regresiva
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border px-2 py-3.5 shadow-sm transition-colors"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div
              className={`text-2xl sm:text-3xl font-semibold tabular-nums leading-none ${fontClass}`}
              style={{ color: palette.accent }}
            >
              {String(item.value).padStart(2, "0")}
            </div>
            <div
              className="font-ui-jost mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em]"
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
