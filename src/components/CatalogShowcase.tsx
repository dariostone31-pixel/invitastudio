"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  INVITATION_SKINS,
  CATEGORY_LABELS,
  LAYOUT_LABELS,
  EventCategory,
} from "@/templates/catalog";
import { Eye, Sparkles, ArrowRight } from "lucide-react";

const CATEGORIES: ("all" | EventCategory)[] = [
  "all",
  "boda",
  "xv",
  "hombre",
  "nino",
  "nina",
  "bautismo",
];

const CATEGORY_ICONS: Record<"all" | EventCategory, string> = {
  all: "✨",
  boda: "💍",
  xv: "👑",
  hombre: "🥂",
  nino: "🚀",
  nina: "🌸",
  bautismo: "🕊️",
};

const FONT_MAP = {
  cormorant: "font-display-cormorant",
  fraunces: "font-display-fraunces",
  script: "font-display-script",
  pinyon: "font-display-pinyon",
  cinzel: "font-display-cinzel",
  oswald: "font-display-oswald",
  fredoka: "font-display-fredoka",
  playfair: "font-display-playfair",
};

export function CatalogShowcase() {
  const [selectedCat, setSelectedCat] = useState<"all" | EventCategory>("all");

  const filtered =
    selectedCat === "all"
      ? INVITATION_SKINS
      : INVITATION_SKINS.filter((s) => s.category === selectedCat);

  return (
    <section id="modelos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="font-ui-jost inline-flex items-center gap-1.5 rounded-full border border-[#B78A4E]/35 bg-[#FFFBFA] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B1E30]">
          <Sparkles className="h-3.5 w-3.5 text-[#B78A4E]" strokeWidth={1.5} />
          Catálogo Interactivo en Vivo
        </span>
        <h2 className="font-display-cormorant mt-3 text-4xl font-semibold tracking-tight text-[#2A121B] sm:text-5xl">
          Encontrá el estilo <span className="italic text-[#6B1E30]">perfecto</span> para tu evento
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#7A5A62] sm:text-base">
          Tocá cualquier modelo para abrir el sobre animado en vivo, escuchar la música y probar la confirmación de asistencia desde tu celular.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCat === cat;
          const count =
            cat === "all"
              ? INVITATION_SKINS.length
              : INVITATION_SKINS.filter((s) => s.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`font-ui-jost rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-[#6B1E30] text-white shadow-md"
                  : "border border-[#2A121B]/15 bg-[#FFFBFA] text-[#2A121B] hover:border-[#6B1E30]/60"
              }`}
            >
              <span className="mr-1.5">{CATEGORY_ICONS[cat]}</span>
              {cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}{" "}
              <span className={active ? "text-[#E7AFC0]" : "text-[#7A5A62]"}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Models Grid with panelIn entrance */}
      <div key={selectedCat} className="animate-panel-in mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skin) => {
          const fontClass = FONT_MAP[skin.fontDisplay];
          return (
            <article
              key={skin.id}
              className="group flex flex-col overflow-hidden rounded-[20px] border border-[#2A121B]/12 bg-[#FFFBFA] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_42px_-20px_rgba(74,20,32,0.38)]"
            >
              {/* Framed Mobile Preview Card */}
              <div
                className="relative flex items-center justify-center px-6 pt-7 pb-5"
                style={{ backgroundColor: skin.palette.surfaceAlt }}
              >
                {skin.featured && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-stone-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                    Destacado
                  </span>
                )}
                <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-stone-700 shadow-sm">
                  {CATEGORY_LABELS[skin.category]}
                </span>

                {/* Phone mockup frame */}
                <Link
                  href={`/demo/${skin.id}`}
                  className="relative block h-72 w-48 overflow-hidden rounded-[26px] border-[5px] border-stone-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundColor: skin.palette.bg }}
                >
                  <div className="absolute inset-x-0 top-0 z-10 mx-auto h-3.5 w-20 rounded-b-xl bg-stone-900" />
                  <img
                    src={skin.heroImage}
                    alt={skin.name}
                    loading="lazy"
                    decoding="async"
                    className={`h-36 w-full object-cover ${skin.imageFilter ?? ""}`}
                  />
                  <div
                    className="relative -mt-6 px-3 pb-4 text-center"
                    style={{ color: skin.palette.text }}
                  >
                    <span
                      className="inline-block rounded-full border px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: skin.palette.surface,
                        borderColor: skin.palette.border,
                        color: skin.palette.accent,
                      }}
                    >
                      {skin.sample.eyebrow}
                    </span>
                    <h4 className={`mt-2 truncate text-xl font-semibold ${fontClass}`}>
                      {skin.sample.title}
                    </h4>
                    <p className="mt-0.5 text-[9px]" style={{ color: skin.palette.textMuted }}>
                      {skin.sample.dateDisplay}
                    </p>
                    <div
                      className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm"
                      style={{
                        backgroundColor: skin.palette.accent,
                        color: skin.palette.accentText,
                      }}
                    >
                      <Eye className="h-2.5 w-2.5" />
                      Abrir Demo
                    </div>
                  </div>
                </Link>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="font-ui-jost border-l-2 border-[#B78A4E] pl-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B1E30]">
                    {LAYOUT_LABELS[skin.layoutId]}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#2A121B]">{skin.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#7A5A62]">{skin.subtitle}</p>
                </div>

                <div className="mt-5 flex items-center gap-2.5">
                  <Link
                    href={`/demo/${skin.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#6B1E30]/35 bg-white px-4 py-2.5 text-xs font-semibold text-[#6B1E30] transition-colors hover:border-[#6B1E30] hover:bg-[#FBF1EE]"
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Ver invitación
                  </Link>
                  <Link
                    href={`/encargar?modelo=${skin.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#6B1E30] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#4A1420]"
                  >
                    Elegir
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
