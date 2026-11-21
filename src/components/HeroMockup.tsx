"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INVITATION_SKINS } from "@/templates/catalog";
import { Play, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { AnimatedCategoryIcon } from "@/components/AnimatedCategoryIcon";

const FEATURED = INVITATION_SKINS.filter((s) => s.featured);

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  boda: "Boda",
  xv: "XV Años",
  hombre: "18 / Hombres",
  nino: "Niño",
  nina: "Niña",
  bautismo: "Bautismo",
};

const HERO_FONT_MAP = {
  cormorant: "font-display-cormorant",
  fraunces: "font-display-fraunces",
  script: "font-display-script",
  pinyon: "font-display-pinyon",
  cinzel: "font-display-cinzel",
  oswald: "font-display-oswald",
  fredoka: "font-display-fredoka",
  playfair: "font-display-playfair",
};

export function HeroMockup() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = FEATURED[activeIdx] ?? INVITATION_SKINS[0];
  const titleFont = HERO_FONT_MAP[active.fontDisplay];

  return (
    <div className="flex flex-col items-center">
      {/* Category Switcher Pills */}
      <div className="mb-5 flex flex-wrap justify-center gap-1.5">
        {FEATURED.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
              idx === activeIdx
                ? "bg-[#6B1E30] text-white shadow-md"
                : "border border-[#2A121B]/15 bg-[#FFFBFA] text-[#7A5A62] hover:border-[#6B1E30]/50 hover:text-[#2A121B]"
            }`}
          >
            <AnimatedCategoryIcon category={item.category} className="h-3.5 w-3.5" />
            <span>{CATEGORY_SHORT_LABELS[item.category] ?? item.name}</span>
          </button>
        ))}
      </div>

      {/* Realistic Phone Frame with interactive editorial tilt & warm bordó shadow */}
      <div className="phone-wrap animate-phone-in">
        <div className="phone-tilt shadow-bordo-phone relative w-[290px] rounded-[38px] border-[9px] border-[#2A121B] bg-[#2A121B] p-1">
          <div className="absolute left-1/2 top-2.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#2A121B]" />
          <div
            className="relative h-[505px] overflow-hidden rounded-[28px] transition-colors duration-300"
            style={{ backgroundColor: active.palette.bg, color: active.palette.text }}
          >
          {/* Floating music badge */}
          <div
            className="absolute right-3 top-6 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm"
            style={{
              backgroundColor: active.palette.surface,
              borderColor: active.palette.border,
              color: active.palette.text,
            }}
          >
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: active.palette.accent, color: active.palette.accentText }}
            >
              <Play className="h-2.5 w-2.5" />
            </span>
            Música
          </div>

          <img
            src={active.heroImage}
            alt={active.name}
            className="h-56 w-full object-cover"
          />

          <div className="relative -mt-8 px-4 text-center">
            <div
              className="mx-auto inline-block rounded-full border px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: active.palette.surface,
                borderColor: active.palette.border,
                color: active.palette.accent,
              }}
            >
              {active.sample.eyebrow}
            </div>
            <h3 className={`mt-2 text-3xl font-semibold leading-tight ${titleFont}`}>
              {active.sample.title}
            </h3>
            <p className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: active.palette.textMuted }}>
              {active.sample.dateDisplay}
            </p>

            {/* Mini preview of guest pass + actions */}
            <div
              className="mt-3 rounded-2xl border p-3 text-left text-[10px]"
              style={{
                backgroundColor: active.palette.surface,
                borderColor: active.palette.border,
              }}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" style={{ color: active.palette.accent }} />
                  Pase Familia García
                </span>
                <span style={{ color: active.palette.accent }}>4 lugares</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <span
                  className="inline-flex items-center justify-center gap-1 rounded-lg border py-1.5 font-medium"
                  style={{ borderColor: active.palette.border }}
                >
                  <MapPin className="h-3 w-3" style={{ color: active.palette.accent }} />
                  Mapa
                </span>
                <span
                  className="inline-flex items-center justify-center gap-1 rounded-lg py-1.5 font-semibold"
                  style={{
                    backgroundColor: active.palette.accent,
                    color: active.palette.accentText,
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmar
                </span>
              </div>
            </div>

            <Link
              href={`/demo/${active.id}`}
              className="mt-3 block w-full rounded-full py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.18em] shadow-md transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: active.palette.accent,
                color: active.palette.accentText,
              }}
            >
              Probar Demo en Vivo
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
