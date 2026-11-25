"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { INVITATION_SKINS, CATEGORY_LABELS } from "@/templates/catalog";
import { ensureContrast } from "@/lib/contrast";

const FAN_IDS = [
  "boda-botanica-eucalipto",
  "xv-gala-rosa",
  "boda-sobre-marfil",
  "hombre-whisky-gold",
  "nino-dino-aventura",
];

const ROTATIONS = [
  "-rotate-12 -translate-y-2 z-10 hidden sm:block",
  "-rotate-6 translate-y-1 z-20",
  "rotate-0 -translate-y-2 z-30 scale-105",
  "rotate-6 translate-y-1 z-20",
  "rotate-12 -translate-y-2 z-10 hidden sm:block",
];

const STUDIO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HeroFan() {
  const skins = FAN_IDS.map(
    (id) => INVITATION_SKINS.find((s) => s.id === id) ?? INVITATION_SKINS[0]
  );

  return (
    <section className="mx-auto max-w-6xl overflow-hidden px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.7, ease: STUDIO_EASE }}
        className="mb-8 text-center"
      >
        <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.34em] text-[#6B1E30]">
          Curaduría de Autor
        </span>
        <h2 className="font-display-cormorant mt-2 text-3xl font-semibold text-[#2A121B] sm:text-4xl">
          Explorá estilos con <span className="italic text-[#6B1E30]">alma propia</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.7, delay: 0.08, ease: STUDIO_EASE }}
        className="group/fan flex items-center justify-center py-6"
      >
        <div className="flex items-center justify-center -space-x-10 sm:-space-x-5">
          {skins.map((skin, idx) => {
            const fanAccent = ensureContrast(skin.palette.accent, skin.palette.bg, 4.6);
            return (
              <Link
                key={skin.id}
                href={`/demo/${skin.id}`}
                className={`group/card relative h-64 w-36 overflow-hidden rounded-[26px] border-[5px] border-[#2A121B] bg-white shadow-[0_28px_55px_-18px_rgba(74,20,32,0.38)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:z-40 hover:-translate-y-4 hover:rotate-0 hover:scale-105 group-hover/fan:mx-1 sm:h-72 sm:w-44 ${ROTATIONS[idx]}`}
                style={{ backgroundColor: skin.palette.bg }}
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={skin.heroImage}
                    alt={skin.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full border border-white/30 bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {CATEGORY_LABELS[skin.category]}
                  </span>
                </div>
                <div
                  className="px-3 pt-2.5 text-center"
                  style={{ color: skin.palette.text }}
                >
                  <span
                    className="font-ui-jost block truncate text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: fanAccent }}
                  >
                    {skin.sample.eyebrow}
                  </span>
                  <p className="font-display-cormorant mt-1 truncate text-lg font-semibold leading-snug">
                    {skin.sample.title}
                  </p>
                  <p
                    className="mt-1 text-[11px] font-medium"
                    style={{ color: skin.palette.textMuted }}
                  >
                    Ver diseño →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
