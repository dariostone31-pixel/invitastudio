"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  INVITATION_SKINS,
  CATEGORY_LABELS,
  LAYOUT_LABELS,
  EventCategory,
} from "@/templates/catalog";
import { Eye, Sparkles, ArrowRight } from "lucide-react";
import { AnimatedCategoryIcon } from "@/components/AnimatedCategoryIcon";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

const CATEGORIES: ("all" | EventCategory)[] = [
  "all",
  "boda",
  "xv",
  "hombre",
  "nino",
  "nina",
  "bautismo",
];

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

const STUDIO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CatalogShowcase() {
  const [selectedCat, setSelectedCat] = useState<"all" | EventCategory>("all");

  const filtered =
    selectedCat === "all"
      ? INVITATION_SKINS
      : INVITATION_SKINS.filter((s) => s.category === selectedCat);

  return (
    <section id="modelos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.7, ease: STUDIO_EASE }}
        className="text-center"
      >
        <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/35 bg-[#FFFBFA] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B1E30] shadow-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FBF1EE] text-[#B78A4E]">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          </span>
          Catálogo Interactivo en Vivo
        </span>
        <h2 className="font-display-cormorant mt-3 text-4xl font-semibold tracking-tight text-[#2A121B] sm:text-5xl">
          Encontrá el estilo <span className="italic text-[#6B1E30]">perfecto</span> para tu evento
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#7A5A62] sm:text-base">
          Tocá cualquier modelo para abrir el sobre animado en vivo, escuchar la música y probar la confirmación de asistencia desde tu celular.
        </p>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.7, delay: 0.08, ease: STUDIO_EASE }}
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
      >
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
              className={`font-ui-jost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                active
                  ? "scale-[1.03] bg-[#6B1E30] text-white shadow-[0_10px_24px_-10px_rgba(107,30,48,0.55)]"
                  : "border border-[#2A121B]/15 bg-[#FFFBFA] text-[#2A121B] hover:-translate-y-0.5 hover:border-[#6B1E30]/60 hover:shadow-sm"
              }`}
            >
              <AnimatedCategoryIcon category={cat} className="h-3.5 w-3.5" />
              <span>{cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}</span>
              <span className={active ? "text-[#E7AFC0]" : "text-[#7A5A62]"}>({count})</span>
            </button>
          );
        })}
      </motion.div>

      {/* Models Grid with Framer Motion scroll entrance + studio micro-interactions */}
      <div key={selectedCat} className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skin, idx) => {
          const fontClass = FONT_MAP[skin.fontDisplay];
          const pillTextColor = ensureContrast(skin.palette.accent, skin.palette.surface, 4.6);
          const demoBtnBg = getAccessibleButtonBg(skin.palette.accent, skin.palette.accentText);
          return (
            <motion.article
              key={skin.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{
                duration: 0.7,
                delay: (idx % 3) * 0.06,
                ease: STUDIO_EASE,
              }}
              className="group flex flex-col overflow-hidden rounded-[22px] border border-[#2A121B]/12 bg-[#FFFBFA] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#B78A4E]/50 hover:shadow-[0_24px_48px_-20px_rgba(74,20,32,0.36)]"
            >
              {/* Framed Mobile Preview Card */}
              <div
                className="relative flex items-center justify-center px-6 pt-7 pb-5"
                style={{ backgroundColor: skin.palette.surfaceAlt }}
              >
                {skin.featured && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-stone-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 shadow-sm">
                    Destacado
                  </span>
                )}
                <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-stone-700 shadow-sm">
                  {CATEGORY_LABELS[skin.category]}
                </span>

                {/* Phone mockup frame with image zoom on hover */}
                <Link
                  href={`/demo/${skin.id}`}
                  className="relative block h-72 w-48 overflow-hidden rounded-[26px] border-[5px] border-stone-900 shadow-2xl transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03]"
                  style={{ backgroundColor: skin.palette.bg }}
                >
                  <div className="absolute inset-x-0 top-0 z-10 mx-auto h-3.5 w-20 rounded-b-xl bg-stone-900" />
                  <div className="h-36 w-full overflow-hidden">
                    <img
                      src={skin.heroImage}
                      alt={skin.name}
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${skin.imageFilter ?? ""}`}
                    />
                  </div>
                  <div
                    className="relative -mt-6 px-3 pb-4 text-center"
                    style={{ color: skin.palette.text }}
                  >
                    <span
                      className="inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        backgroundColor: skin.palette.surface,
                        borderColor: skin.palette.border,
                        color: pillTextColor,
                      }}
                    >
                      {skin.sample.eyebrow}
                    </span>
                    <h4 className={`mt-2 break-words text-lg font-semibold leading-snug ${fontClass}`}>
                      {skin.sample.title}
                    </h4>
                    <p className="mt-0.5 text-[10px]" style={{ color: skin.palette.textMuted }}>
                      {skin.sample.dateDisplay}
                    </p>
                    <div
                      className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: demoBtnBg,
                        color: skin.palette.accentText,
                      }}
                    >
                      <Eye className="h-2.5 w-2.5" strokeWidth={1.5} />
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
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border border-[#6B1E30]/35 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#6B1E30] transition-all duration-300 hover:border-[#6B1E30] hover:bg-[#FBF1EE]"
                  >
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                    Ver invitación
                  </Link>
                  <Link
                    href={`/encargar?modelo=${skin.id}`}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#6B1E30] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:bg-[#4A1420] hover:shadow-[0_10px_22px_-8px_rgba(107,30,48,0.65)]"
                  >
                    Elegir
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
