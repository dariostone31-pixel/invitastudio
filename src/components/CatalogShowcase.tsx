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
import { Eye, ArrowRight } from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import { AnimatedCategoryIcon } from "@/components/AnimatedCategoryIcon";
import { AnimatedIconBox } from "@/components/AnimatedIconBox";

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
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: STUDIO_EASE }}
        className="text-center"
      >
        <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/35 bg-[#FFFBFA] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B1E30] shadow-sm">
          <AnimatedIconBox
            floating={false}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FBF1EE] text-[#B78A4E]"
          >
            <EditorialDiamondIcon className="h-3 w-3" />
          </AnimatedIconBox>
          Catálogo Interactivo en Vivo
        </span>
        <h2 className="font-display-cormorant mt-3 text-4xl font-semibold tracking-tight text-[#2A121B] sm:text-5xl">
          Encontrá el estilo <span className="italic text-[#6B1E30]">perfecto</span> para tu evento
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#7A5A62] sm:text-base">
          Tocá cualquier modelo para abrir el sobre 3D animado en vivo, escuchar la música y probar la confirmación de asistencia desde tu celular.
        </p>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, delay: 0.08, ease: STUDIO_EASE }}
        className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCat === cat;
          const count =
            cat === "all"
              ? INVITATION_SKINS.length
              : INVITATION_SKINS.filter((s) => s.category === cat).length;

          return (
            <motion.button
              key={cat}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCat(cat)}
              className={`font-ui-jost inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 ${
                active
                  ? "scale-[1.03] bg-[#6B1E30] text-white shadow-[0_10px_24px_-10px_rgba(107,30,48,0.55)]"
                  : "border border-[#2A121B]/15 bg-[#FFFBFA] text-[#2A121B] hover:-translate-y-0.5 hover:border-[#B78A4E]/70 hover:shadow-sm"
              }`}
            >
              <AnimatedCategoryIcon category={cat} className="h-3.5 w-3.5" />
              <span>{cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}</span>
              <span className={active ? "text-[#E7AFC0]" : "text-[#7A5A62]"}>({count})</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Subtle status & instruction bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-b border-[#2A121B]/10 pb-3 text-[11px] text-[#7A5A62]">
        <span className="font-ui-jost font-medium uppercase tracking-[0.14em]">
          Mostrando <strong className="text-[#6B1E30]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "diseño" : "diseños"}{" "}
          {selectedCat !== "all" ? `en ${CATEGORY_LABELS[selectedCat]}` : "de colección"}
        </span>
        <span className="hidden sm:inline">
          Cada modelo incluye sobre 3D, música, mapa y RSVP en vivo
        </span>
      </div>

      {/* 42 Editorial Full-Bleed 4:5 Cards (Zero Phone Frames) */}
      <div key={selectedCat} className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skin, idx) => {
          const fontClass = FONT_MAP[skin.fontDisplay];
          return (
            <motion.article
              key={skin.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                delay: (idx % 3) * 0.06,
                ease: STUDIO_EASE,
              }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#2A121B]/12 bg-[#FFFBFA] shadow-sm ring-1 ring-transparent transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#B78A4E] hover:shadow-[0_28px_56px_-18px_rgba(74,20,32,0.42)] hover:ring-[#B78A4E]/45"
            >
              {/* Full-Bleed 4:5 Editorial Portrait */}
              <Link
                href={`/demo/${skin.id}`}
                className="relative block aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-stone-900"
              >
                <img
                  src={skin.heroImage}
                  alt={skin.name}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${skin.imageFilter ?? ""}`}
                />

                {/* Top Subtle Glass Scrim & Bottom Cinematic Gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/90 transition-opacity duration-500" />

                {/* Fine Gold Inner Hairline Reveal on Hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 rounded-xl border border-white/20 transition-colors duration-500 group-hover:border-[#E7AFC0]/55"
                />

                {/* Top Floating Glass Category & Featured Badges */}
                <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between gap-2">
                  {skin.featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#B78A4E]/50 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-md">
                      <EditorialDiamondIcon className="h-2.5 w-2.5" />
                      Destacado
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    {CATEGORY_LABELS[skin.category]}
                  </span>
                </div>

                {/* Bottom Editorial Typography Overlay */}
                <div className="absolute inset-x-5 bottom-5 z-10 text-left text-white">
                  <span className="font-ui-jost inline-block rounded-full border border-white/25 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E7AFC0] backdrop-blur-md">
                    {LAYOUT_LABELS[skin.layoutId]}
                  </span>
                  <h3 className={`mt-2.5 break-words text-3xl font-semibold leading-[1.12] text-white drop-shadow-md ${fontClass}`}>
                    {skin.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/85">
                    {skin.subtitle}
                  </p>
                  <p className="font-ui-jost mt-2 text-[10px] uppercase tracking-[0.18em] text-white/75">
                    {skin.sample.title} · {skin.sample.dateDisplay}
                  </p>
                </div>
              </Link>

              {/* Sleek Editorial Action Footer */}
              <div className="flex items-center gap-2.5 border-t border-[#2A121B]/10 bg-[#FFFBFA] p-4">
                <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                  <Link
                    href={`/demo/${skin.id}`}
                    className="btn-shimmer-hover inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-[#6B1E30]/35 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#6B1E30] transition-all duration-300 hover:border-[#6B1E30] hover:bg-[#FBF1EE]"
                  >
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                    Abrir Demo
                  </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                  <Link
                    href={`/encargar?modelo=${skin.id}`}
                    className="btn-gold-shimmer inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_24px_-8px_rgba(107,30,48,0.65)]"
                  >
                    Elegir
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </Link>
                </motion.div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Curaduría Cruzada hacia InvitaFigus — Visible exclusivamente en Infantiles (Niños / Niñas) */}
      {(selectedCat === "nino" || selectedCat === "nina") && (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: STUDIO_EASE }}
          aria-label="Edición temática deportiva InvitaFigus"
          className="relative mt-10 overflow-hidden rounded-2xl border border-[#B78A4E]/55 bg-[#FAF7F2] p-6 shadow-[0_22px_50px_-24px_rgba(42,18,27,0.22)] sm:p-8"
        >
          {/* Doble marco fino dorado editorial */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 rounded-xl border border-[#B78A4E]/25"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Distintivo SVG fino a medida: Escudo geométrico + tipografía 10 */}
              <div
                aria-hidden="true"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#B78A4E]/40 bg-[#FFFBFA] shadow-sm"
              >
                <svg
                  viewBox="0 0 64 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-14 w-14"
                >
                  <path
                    d="M32 4L56 13.5V33.5C56 49.2 45.6 61.5 32 67.5C18.4 61.5 8 49.2 8 33.5V13.5L32 4Z"
                    stroke="#B78A4E"
                    strokeWidth="1.5"
                    fill="#FAF7F2"
                  />
                  <path
                    d="M32 9L51 16.8V33.5C51 46.4 42.5 56.6 32 61.8C21.5 56.6 13 46.4 13 33.5V16.8L32 9Z"
                    stroke="#6B1E30"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                  />
                  <path
                    d="M25 14L32 10.5L39 14"
                    stroke="#B78A4E"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <text
                    x="32"
                    y="43"
                    textAnchor="middle"
                    fill="#2A121B"
                    fontFamily="Georgia, serif"
                    fontWeight="700"
                    fontSize="21"
                    letterSpacing="-0.5"
                  >
                    10
                  </text>
                </svg>
              </div>

              <div className="max-w-2xl">
                <p className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6331]">
                  EDICIÓN TEMÁTICA · COLECCIÓN DEPORTIVA
                </p>
                <h3 className="font-display-cormorant mt-1.5 text-2xl font-semibold leading-snug text-[#2A121B] sm:text-3xl">
                  ¿Buscás una propuesta 100% futbolera para su cumple?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F464D]">
                  Diseñamos un estudio exclusivo para pequeños fanáticos: invitaciones interactivas estilo figurita de colección con los colores y escudos de su club o selección, listas para compartir en minutos.
                </p>
              </div>
            </div>

            <a
              href="https://invitafigus.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui-jost inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-full border border-[#B78A4E] bg-[#2A121B] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6B1E30] hover:shadow-md"
            >
              Explorar InvitaFigus →
            </a>
          </div>
        </motion.aside>
      )}
    </section>
  );
}
