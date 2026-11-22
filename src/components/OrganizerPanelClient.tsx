"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Utensils,
  Music,
  Download,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Search,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import type { EventRecord, RsvpRecord } from "@/lib/db";

interface OrganizerPanelClientProps {
  event: EventRecord;
  initialRsvps: RsvpRecord[];
}

export function OrganizerPanelClient({
  event,
  initialRsvps,
}: OrganizerPanelClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "dietary">("all");

  // Personalized guest link builder
  const [guestName, setGuestName] = useState("Familia Gómez");
  const [guestPasses, setGuestPasses] = useState("3");
  const [guestTable, setGuestTable] = useState("5");
  const [copiedLink, setCopiedLink] = useState(false);

  const stats = useMemo(() => {
    const yesRows = initialRsvps.filter((r) => r.attending);
    const noRows = initialRsvps.filter((r) => !r.attending);
    const totalPeople = yesRows.reduce((acc, r) => acc + r.passesUsed, 0);
    const dietaryRows = yesRows.filter((r) => r.dietary.length > 0);
    const songs = yesRows.filter((r) => r.song.trim().length > 0);
    return {
      confirmedGroups: yesRows.length,
      declinedGroups: noRows.length,
      totalPeople,
      dietaryCount: dietaryRows.length,
      songs,
    };
  }, [initialRsvps]);

  const filteredRsvps = useMemo(() => {
    return initialRsvps.filter((r) => {
      if (filter === "yes" && !r.attending) return false;
      if (filter === "no" && r.attending) return false;
      if (filter === "dietary" && r.dietary.length === 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.guestName} ${r.companions} ${r.dietary.join(" ")} ${r.song}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialRsvps, filter, search]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const personalizedQuery = new URLSearchParams({
    nombre: guestName.trim() || "Invitado Especial",
    pases: guestPasses || "2",
    ...(guestTable.trim() ? { mesa: guestTable.trim() } : {}),
  }).toString();
  const personalizedPath = `/i/${event.slug}?${personalizedQuery}`;
  const fullPersonalizedUrl = `${origin}${personalizedPath}`;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(fullPersonalizedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const whatsappInviteText = encodeURIComponent(
    `¡Hola ${guestName}! Te enviamos tu invitación personalizada para ${event.eventTitle} (${event.dateDisplay}).\nReservamos ${guestPasses} ${
      Number(guestPasses) === 1 ? "lugar" : "lugares"
    } para vos:\n${fullPersonalizedUrl}`
  );

  const whatsappReminderText = encodeURIComponent(
    `¡Hola ${guestName}! Te recordamos con mucha alegría que falta poquito para ${event.eventTitle} (${event.dateDisplay} · ${event.timeDisplay} en ${event.venue}). Si todavía no pudiste confirmar asistencia o tenés algún menú especial (Sin TACC / vegetariano), podés hacerlo en 10 segundos desde tu pase:\n${fullPersonalizedUrl}`
  );

  const responseRate =
    initialRsvps.length > 0
      ? Math.round((stats.confirmedGroups / initialRsvps.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a InvitaStudio
            </Link>
            <div className="mt-1 flex items-center gap-2.5">
              <h1 className="font-cormorant text-3xl font-bold text-stone-900">
                Panel de Organizador · {event.eventTitle}
              </h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {event.orderCode}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {event.dateDisplay} · {event.venue}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/personalizar/${event.panelToken}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Personalizar Diseño y Fotos
            </Link>
            <Link
              href={`/i/${event.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-stone-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Invitación en Vivo
            </Link>
            <a
              href={`/api/export/${event.panelToken}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar Excel (.csv)
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* 4-Card RSVP Funnel KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              1 · Personas Confirmadas
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-stone-900">{stats.totalPeople}</p>
            <p className="mt-1 text-[11px] text-stone-500">
              {stats.confirmedGroups} de {initialRsvps.length} respuestas ({responseRate}% positivas)
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              2 · Familias que Asisten
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-stone-900">{stats.confirmedGroups}</p>
            <p className="mt-1 text-[11px] text-stone-500">Listas para asignar mesas</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              3 · No Asisten
              <XCircle className="h-4 w-4 text-stone-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-stone-900">{stats.declinedGroups}</p>
            <p className="mt-1 text-[11px] text-stone-500">Avisaron con anticipación</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              4 · Menús Especiales & DJ
              <Utensils className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-stone-900">{stats.dietaryCount}</p>
            <p className="mt-1 text-[11px] text-stone-500">
              Alergias/Sin TACC · {stats.songs.length} temas DJ
            </p>
          </div>
        </section>

        {/* Generador de Links Personalizados por Familia */}
        <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                Generador de Pases por WhatsApp
              </span>
              <h2 className="mt-1 font-cormorant text-2xl font-semibold text-stone-900">
                Creá un link personalizado para cada invitado o familia
              </h2>
              <p className="mt-1 text-xs text-stone-600">
                Al abrir su enlace, la invitación los recibe por su nombre y les muestra exactamente cuántos lugares tienen reservados.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                  Nombre / Familia
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej. Familia Gómez"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                  Lugares asignados
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={guestPasses}
                  onChange={(e) => setGuestPasses(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                  Mesa (opcional)
                </label>
                <input
                  type="text"
                  value={guestTable}
                  onChange={(e) => setGuestTable(e.target.value)}
                  placeholder="Ej. 5"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center">
            <code className="truncate text-xs text-stone-600">{personalizedPath}</code>
            <div className="flex flex-wrap gap-2">
              <Link
                href={personalizedPath}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Probar
              </Link>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "¡Copiado!" : "Copiar Link"}
              </button>
              <a
                href={`https://wa.me/?text=${whatsappInviteText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Enviar por WhatsApp
              </a>
              <a
                href={`https://wa.me/?text=${whatsappReminderText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Recordatorio
              </a>
            </div>
          </div>
        </section>

        {/* Tabla de Confirmaciones + Playlist DJ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="font-cormorant text-2xl font-semibold text-stone-900">
                Lista de Invitados ({filteredRsvps.length})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar invitado..."
                    className="rounded-full border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-stone-900"
                  />
                </div>
                {(
                  [
                    ["all", "Todos"],
                    ["yes", "Asisten"],
                    ["no", "No asisten"],
                    ["dietary", "Menú Especial"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      filter === key
                        ? "bg-stone-900 text-white"
                        : "border border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredRsvps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 py-10 text-center text-xs text-stone-500">
                  Todavía no hay respuestas en este filtro. Probá confirmar desde la invitación en vivo.
                </div>
              ) : (
                filteredRsvps.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900">{r.guestName}</h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              r.attending
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {r.attending
                              ? `Asiste (${r.passesUsed} ${
                                  r.passesUsed === 1 ? "lugar" : "lugares"
                                })`
                              : "No asiste"}
                          </span>
                        </div>
                        {r.companions && (
                          <p className="mt-1 text-xs text-stone-600">
                            <strong>Acompañantes:</strong> {r.companions}
                          </p>
                        )}
                      </div>

                      <span className="text-[11px] text-stone-400">
                        {new Date(r.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>

                    {r.dietary.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.dietary.map((d) => (
                          <span
                            key={d}
                            className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    {(r.song || r.message) && (
                      <div className="mt-2 space-y-1 border-t border-stone-200/80 pt-2 text-xs text-stone-600">
                        {r.song && (
                          <p>
                            <strong>Canción DJ:</strong> {r.song}
                          </p>
                        )}
                        {r.message && <p className="italic">&ldquo;{r.message}&rdquo;</p>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Playlist DJ */}
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-4">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-amber-700" />
              <h2 className="font-cormorant text-2xl font-semibold text-stone-900">
                Playlist para el DJ ({stats.songs.length})
              </h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Temas sugeridos automáticamente por tus invitados al confirmar asistencia.
            </p>
            <div className="mt-4 space-y-2.5">
              {stats.songs.length === 0 ? (
                <p className="text-xs text-stone-400">Aún no sugirieron canciones.</p>
              ) : (
                stats.songs.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs"
                  >
                    <p className="font-semibold text-stone-900">{s.song}</p>
                    <p className="text-[11px] text-stone-500">Por {s.guestName}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
