"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wand2, ArrowRight } from "lucide-react";
import { AnimatedIconBox } from "@/components/AnimatedIconBox";
import { INVITATION_SKINS, CATEGORY_LABELS, EventCategory } from "@/templates/catalog";

const DEFAULT_SKIN_BY_CAT: Record<EventCategory, string> = {
  boda: "boda-sobre-marfil",
  xv: "xv-gala-rosa",
  hombre: "hombre-whisky-gold",
  nino: "nino-dino-aventura",
  nina: "nina-reino-pastel",
  bautismo: "bebe-lino-natural",
};

const STUDIO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MiniTester() {
  const router = useRouter();
  const [cat, setCat] = useState<EventCategory>("boda");
  const [title, setTitle] = useState("");
  const [guest, setGuest] = useState("");

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    const skinId = DEFAULT_SKIN_BY_CAT[cat];
    const params = new URLSearchParams();
    if (title.trim()) params.set("evento", title.trim());
    if (guest.trim()) params.set("nombre", guest.trim());
    params.set("pases", "2");
    router.push(`/demo/${skinId}?${params.toString()}`);
  };

  const currentSkin = INVITATION_SKINS.find((s) => s.id === DEFAULT_SKIN_BY_CAT[cat]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.7, ease: STUDIO_EASE }}
      className="mx-auto max-w-5xl px-4 py-6 sm:px-6"
    >
      <div className="group overflow-hidden rounded-3xl border border-[#B78A4E]/40 bg-gradient-to-br from-[#FBF1EE] via-[#FFFBFA] to-[#FAF8F5] p-6 shadow-lg transition-shadow duration-300 hover:shadow-[0_20px_44px_-18px_rgba(107,30,48,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B1E30]">
              <AnimatedIconBox className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B78A4E]/40 bg-white text-[#B78A4E] shadow-sm">
                <Wand2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </AnimatedIconBox>
              Prueba Instantánea Sin Registro
            </span>
            <h2 className="font-display-cormorant mt-2 text-3xl font-semibold text-[#2A121B]">
              Mirá cómo queda con tu nombre en 5 segundos
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">
              No te pedimos tarjeta ni cuenta de Google. Escribí el nombre de tu evento y abrí el sobre al instante.
            </p>
          </div>

          <form onSubmit={handlePreview} className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#2A121B]">
                Tipo de evento
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as EventCategory)}
                className="w-full rounded-xl border border-[#2A121B]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
              >
                {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#2A121B]">
                Título del evento
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={currentSkin?.sample.title || "Ej. Sofía & Lucas"}
                className="w-full rounded-xl border border-[#2A121B]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#2A121B]">
                Nombre de un invitado (opcional)
              </label>
              <input
                type="text"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder="Ej. Familia Pérez"
                className="w-full rounded-xl border border-[#2A121B]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
              />
            </div>

            <div className="flex items-end">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="btn-gold-shimmer inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_26px_-10px_rgba(107,30,48,0.65)]"
              >
                Abrir mi prueba
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
