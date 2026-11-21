"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, ArrowRight } from "lucide-react";
import { INVITATION_SKINS, CATEGORY_LABELS, EventCategory } from "@/templates/catalog";

const DEFAULT_SKIN_BY_CAT: Record<EventCategory, string> = {
  boda: "boda-sobre-marfil",
  xv: "xv-gala-rosa",
  hombre: "hombre-whisky-gold",
  nino: "nino-dino-aventura",
  nina: "nina-reino-pastel",
  bautismo: "bebe-lino-natural",
};

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
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-stone-50 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
              <Wand2 className="h-3.5 w-3.5" />
              Prueba Instantánea Sin Registro
            </span>
            <h2 className="mt-1.5 font-cormorant text-3xl font-semibold text-stone-900">
              Mirá cómo queda con tu nombre en 5 segundos
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
              No te pedimos tarjeta ni cuenta de Google. Escribí el nombre de tu evento y abrí el sobre al instante.
            </p>
          </div>

          <form onSubmit={handlePreview} className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                Tipo de evento
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as EventCategory)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900"
              >
                {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                Título del evento
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={currentSkin?.sample.title || "Ej. Sofía & Lucas"}
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                Nombre de un invitado (opcional)
              </label>
              <input
                type="text"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder="Ej. Familia Pérez"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-stone-800 active:scale-[0.98]"
              >
                Abrir mi prueba
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
