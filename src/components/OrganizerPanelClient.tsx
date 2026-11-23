"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Printer,
  ListChecks,
} from "lucide-react";
import type { EventRecord, PreloadedGuest, RsvpRecord } from "@/lib/db";
import { getWhatsAppHref } from "@/config/business";
import { PaymentPendingBanner } from "./PaymentPendingBanner";

interface OrganizerPanelClientProps {
  event: EventRecord;
  initialRsvps: RsvpRecord[];
  mercadopagoConfigured?: boolean;
}

export function OrganizerPanelClient({
  event,
  initialRsvps,
  mercadopagoConfigured = false,
}: OrganizerPanelClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "dietary">("all");

  // Personalized guest link builder
  const [guestName, setGuestName] = useState("Familia Gómez");
  const [guestPasses, setGuestPasses] = useState("3");
  const [guestTable, setGuestTable] = useState("5");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPanelLink, setCopiedPanelLink] = useState(false);
  const isEssentialPlan = event.planId === "esencial";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("invita_saved_panels");
      const list = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(list)
        ? list.filter((x) => x && x.panelToken !== event.panelToken)
        : [];
      filtered.unshift({
        panelToken: event.panelToken,
        eventTitle: event.eventTitle,
        orderCode: event.orderCode,
        slug: event.slug,
      });
      window.localStorage.setItem(
        "invita_saved_panels",
        JSON.stringify(filtered.slice(0, 5))
      );
    } catch {
      // ignore
    }
  }, [event.panelToken, event.eventTitle, event.orderCode, event.slug]);

  // Optional preloaded guest list (ultra-simple line editor)
  const [showGuestListBox, setShowGuestListBox] = useState(false);
  const [guestListText, setGuestListText] = useState(() =>
    (event.guestList || [])
      .map((g) => (g.maxPasses > 1 ? `${g.name}, ${g.maxPasses}` : g.name))
      .join("\n")
  );
  const [savingGuestList, setSavingGuestList] = useState(false);
  const [guestListSavedMsg, setGuestListSavedMsg] = useState<string | null>(null);

  // User-controlled PDF export options
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [pdfIncludeGuests, setPdfIncludeGuests] = useState(true);
  const [pdfIncludeDietary, setPdfIncludeDietary] = useState(true);
  const [pdfIncludeSongs, setPdfIncludeSongs] = useState(true);
  const [pdfIncludeMessages, setPdfIncludeMessages] = useState(false);

  const handleSaveGuestList = async () => {
    setSavingGuestList(true);
    setGuestListSavedMsg(null);
    const parsed: PreloadedGuest[] = guestListText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 500)
      .map((line, idx) => {
        const parts = line.split(/[,\t;]/).map((p) => p.trim());
        const name = parts[0] || "";
        const num = parts[1] ? parseInt(parts[1], 10) : 2;
        const maxPasses = Number.isFinite(num) && num >= 1 ? Math.min(20, num) : 2;
        return {
          id: `g-${idx + 1}`,
          name: name.slice(0, 120),
          maxPasses,
        };
      })
      .filter((g) => g.name.length > 0);

    try {
      const res = await fetch(`/api/panel/${event.panelToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestList: parsed }),
      });
      if (!res.ok) throw new Error("Error");
      setGuestListSavedMsg(
        parsed.length === 0
          ? "Lista vaciada: los invitados escribirán su nombre libremente."
          : `¡Guardado! ${parsed.length} invitados cargados en el buscador del RSVP.`
      );
    } catch {
      setGuestListSavedMsg("No se pudo guardar la lista. Probá nuevamente.");
    } finally {
      setSavingGuestList(false);
    }
  };

  const stats = useMemo(() => {
    const yesRows = initialRsvps.filter((r) => r.attending);
    const noRows = initialRsvps.filter((r) => !r.attending);
    const totalPeople = yesRows.reduce((acc, r) => acc + r.passesUsed, 0);
    const dietaryRows = yesRows.filter((r) => r.dietary.length > 0);
    const playlistIds = new Set((event.djPlaylist || []).map((item) => item.id));
    const rsvpSongs = yesRows
      .filter((r) => r.song.trim().length > 0 && !playlistIds.has(`rsvp-song-${r.id}`))
      .map((r) => ({
        id: `rsvp-song-${r.id}`,
        song: r.song,
        guestName: r.guestName,
        votes: 1,
        source: "RSVP",
      }));
    const extraSongs = (event.djPlaylist || []).map((item) => ({
      id: item.id,
      song: item.song,
      guestName: item.guestName,
      votes: item.votes ?? 1,
      source: "Playlist",
    }));
    const songs = [...extraSongs, ...rsvpSongs].sort((a, b) => b.votes - a.votes);
    return {
      yesRows,
      dietaryRows,
      confirmedGroups: yesRows.length,
      declinedGroups: noRows.length,
      totalPeople,
      dietaryCount: dietaryRows.length,
      songs,
    };
  }, [initialRsvps, event.djPlaylist]);

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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 print:bg-white">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a Invita con Alma
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
              {isEssentialPlan ? "Editar Datos Básicos" : "Personalizar Diseño y Fotos"}
            </Link>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(`${origin}/panel/${event.panelToken}`)
                  .catch(() => {});
                setCopiedPanelLink(true);
                setTimeout(() => setCopiedPanelLink(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:border-stone-900"
            >
              {copiedPanelLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedPanelLink ? "¡Link de Panel Copiado!" : "Guardar Link de mi Panel"}
            </button>
            <Link
              href={`/i/${event.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-stone-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Invitación en Vivo
            </Link>
            {!isEssentialPlan && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPdfPanel((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-stone-900"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Exportar PDF
                </button>
                <a
                  href={`/api/export/${event.panelToken}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar Excel (.xlsx)
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 print:hidden">
        <PaymentPendingBanner
          event={event}
          mercadopagoConfigured={mercadopagoConfigured}
        />

        {event.planId === "asistido" && (
          <section className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-5 shadow-sm print:hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-50">
                  <Sparkles className="h-3 w-3" />
                  Plan Llave en Mano · Carga Asistida Activa
                </span>
                <h2 className="mt-1.5 font-cormorant text-xl font-bold text-stone-900">
                  Nuestro equipo arma los detalles por vos
                </h2>
                <p className="mt-0.5 text-xs text-stone-600">
                  Podés enviarnos tus fotos, canción de fondo elegida o tu lista de invitados por WhatsApp y dejamos todo cargado en menos de 24 hs hábiles.
                  {event.songRequest && (
                    <span className="mt-1 block font-semibold text-amber-950">
                      Canción solicitada: &ldquo;{event.songRequest}&rdquo;
                    </span>
                  )}
                </p>
              </div>
              {(() => {
                const assistWa = getWhatsAppHref(
                  `¡Hola! Soy organizador del pedido ${event.orderCode} (${event.eventTitle}) con Plan Llave en Mano. Quiero enviar fotos/cambios o la canción de fondo para que lo carguen en mi invitación.`
                );
                return assistWa ? (
                  <a
                    href={assistWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar fotos / pedir cambios
                  </a>
                ) : null;
              })()}
            </div>
          </section>
        )}

        {/* Panel Opcional de Reporte PDF elegido por el organizador */}
        {!isEssentialPlan && showPdfPanel && (
          <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-cormorant text-2xl font-semibold text-stone-900">
                  Elegí qué incluir en tu reporte PDF
                </h2>
                <p className="text-xs text-stone-500">
                  Marcá las secciones que necesitás imprimir o guardar como PDF (ideal para el salón, catering o DJ).
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir / Guardar PDF
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={pdfIncludeGuests}
                  onChange={(e) => setPdfIncludeGuests(e.target.checked)}
                  className="h-4 w-4 accent-stone-900"
                />
                Invitados confirmados ({stats.totalPeople})
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={pdfIncludeDietary}
                  onChange={(e) => setPdfIncludeDietary(e.target.checked)}
                  className="h-4 w-4 accent-stone-900"
                />
                Menús especiales / Alergias ({stats.dietaryCount})
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={pdfIncludeSongs}
                  onChange={(e) => setPdfIncludeSongs(e.target.checked)}
                  className="h-4 w-4 accent-stone-900"
                />
                Ranking Playlist DJ ({stats.songs.length})
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={pdfIncludeMessages}
                  onChange={(e) => setPdfIncludeMessages(e.target.checked)}
                  className="h-4 w-4 accent-stone-900"
                />
                Mensajes de invitados
              </label>
            </div>
          </section>
        )}
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

        {/* Link único (Esencial) o Generador de Links Personalizados (PRO / Llave en Mano) */}
        {isEssentialPlan ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Plan Esencial · Link único para compartir
            </span>
            <h2 className="mt-1 font-cormorant text-2xl font-semibold text-stone-900">
              Tu enlace único de invitación
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Compartí este link general por WhatsApp con todos tus invitados. Los pases individuales por familia y la descarga en Excel corresponden a Plan PRO y Llave en Mano.
            </p>
            <div className="mt-4 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 sm:flex-row sm:items-center">
              <code className="truncate text-xs text-stone-700">{`/i/${event.slug}`}</code>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/i/${event.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${origin}/i/${event.slug}`).catch(() => {});
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? "¡Copiado!" : "Copiar Link"}
                </button>
              </div>
            </div>
          </section>
        ) : (
        <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                Opción 1 · Envío individual por WhatsApp
              </span>
              <h2 className="mt-1 font-cormorant text-2xl font-semibold text-stone-900">
                Creá un link personalizado (de a 1 invitado por vez)
              </h2>
              <p className="mt-1 text-xs text-stone-600">
                Escribí el nombre de una persona o familia, envíaselo por WhatsApp y luego tocá &ldquo;Limpiar&rdquo; para pasar al siguiente invitado. Al abrirlo, la tarjeta los saluda por su nombre con sus lugares reservados.
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
                Recordatorio manual
              </a>
              <button
                type="button"
                onClick={() => {
                  setGuestName("");
                  setGuestPasses("2");
                  setGuestTable("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Limpiar / Siguiente
              </button>
            </div>
          </div>
        </section>
        )}

        {/* Lista rápida opcional para buscador RSVP (PRO / Llave en Mano) */}
        {!isEssentialPlan && (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-amber-700" />
                  <h2 className="font-cormorant text-2xl font-semibold text-stone-900">
                    Opción 2 · Buscador automático si enviás 1 solo link general (Opcional)
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-stone-500">
                  Si preferís mandar el mismo link a todo el mundo en lugar de ir uno por uno arriba, pegá acá tu lista de invitados: al tocar &ldquo;Confirmar Asistencia&rdquo;, escriben 2 letras de su nombre y se autocompleta su cupo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuestListBox((v) => !v)}
                className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-900"
              >
                {showGuestListBox ? "Ocultar" : "Cargar / Editar lista"}
              </button>
            </div>

            {showGuestListBox && (
              <div className="mt-4 space-y-3">
                <textarea
                  rows={5}
                  value={guestListText}
                  onChange={(e) => setGuestListText(e.target.value)}
                  placeholder={"Un invitado o familia por línea. Podés agregar la cantidad de lugares separada por coma:\nFamilia Gómez, 3\nLucía Fernández, 2\nMarcos Díaz, 1"}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-xs outline-none focus:border-stone-900"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-stone-500">
                    Formato simple: <code>Nombre y Apellido, lugares</code> (si no ponés número, asigna 2 lugares).
                  </p>
                  <button
                    type="button"
                    disabled={savingGuestList}
                    onClick={handleSaveGuestList}
                    className="rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
                  >
                    {savingGuestList ? "Guardando..." : "Guardar lista en RSVP"}
                  </button>
                </div>
                {guestListSavedMsg && (
                  <p className="text-xs font-medium text-emerald-700">{guestListSavedMsg}</p>
                )}
              </div>
            )}
          </section>
        )}

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
                Playlist para el DJ ({isEssentialPlan ? 0 : stats.songs.length})
              </h2>
            </div>
            {isEssentialPlan ? (
              <p className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-500">
                La solapa <strong>Playlist de la Fiesta</strong> para que tus invitados sugieran canciones al DJ está incluida en <strong>Plan PRO</strong> y <strong>Llave en Mano</strong>.
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-stone-500">
                  Temas sugeridos por tus invitados desde la solapa Playlist de la Fiesta o al confirmar asistencia.
                </p>
                <div className="mt-4 space-y-2.5">
                  {stats.songs.length === 0 ? (
                    <p className="text-xs text-stone-400">Aún no sugirieron canciones.</p>
                  ) : (
                    stats.songs.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">{s.song}</p>
                          <p className="text-[11px] text-stone-500">
                            Por {s.guestName} · {s.source}
                          </p>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                          🔥 {s.votes}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Vista exclusiva para Impresión / Guardar PDF (controlada por checkboxes del organizador) */}
      <div className="hidden print:block p-8 text-stone-900">
        <div className="border-b border-stone-300 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Invita con Alma · Reporte del Organizador ({event.orderCode})
          </p>
          <h1 className="mt-1 font-cormorant text-3xl font-bold">{event.eventTitle}</h1>
          <p className="text-xs text-stone-600">
            {event.dateDisplay} · {event.timeDisplay} · {event.venue}
          </p>
          <p className="mt-2 text-xs font-semibold">
            Resumen: {stats.totalPeople} personas confirmadas ({stats.confirmedGroups} grupos) ·{" "}
            {stats.declinedGroups} no asisten · {stats.dietaryCount} menús especiales
          </p>
        </div>

        {pdfIncludeGuests && (
          <section className="mt-6">
            <h2 className="border-b border-stone-200 pb-1 text-sm font-bold uppercase tracking-wider">
              Invitados Confirmados ({stats.yesRows.length})
            </h2>
            <table className="mt-2 w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-300 text-stone-600">
                  <th className="py-1.5 pr-3">Nombre / Familia</th>
                  <th className="py-1.5 pr-3">Lugares</th>
                  <th className="py-1.5 pr-3">Acompañantes</th>
                  <th className="py-1.5">Menú Especial</th>
                </tr>
              </thead>
              <tbody>
                {stats.yesRows.map((r) => (
                  <tr key={r.id} className="border-b border-stone-200">
                    <td className="py-1.5 pr-3 font-semibold">{r.guestName}</td>
                    <td className="py-1.5 pr-3">{r.passesUsed}</td>
                    <td className="py-1.5 pr-3">{r.companions || "—"}</td>
                    <td className="py-1.5">{r.dietary.join(", ") || "Estándar"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {pdfIncludeDietary && stats.dietaryRows.length > 0 && (
          <section className="mt-6">
            <h2 className="border-b border-stone-200 pb-1 text-sm font-bold uppercase tracking-wider">
              Menús Especiales & Alergias ({stats.dietaryRows.length})
            </h2>
            <ul className="mt-2 space-y-1 text-xs">
              {stats.dietaryRows.map((r) => (
                <li key={r.id}>
                  <strong>{r.guestName}</strong> ({r.passesUsed} lug.): {r.dietary.join(", ")}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pdfIncludeSongs && !isEssentialPlan && stats.songs.length > 0 && (
          <section className="mt-6">
            <h2 className="border-b border-stone-200 pb-1 text-sm font-bold uppercase tracking-wider">
              Ranking Playlist para el DJ ({stats.songs.length})
            </h2>
            <ol className="mt-2 list-decimal pl-5 text-xs space-y-1">
              {stats.songs.map((s) => (
                <li key={s.id}>
                  <strong>{s.song}</strong> — {s.votes} {s.votes === 1 ? "voto" : "votos"} (sugerida por {s.guestName})
                </li>
              ))}
            </ol>
          </section>
        )}

        {pdfIncludeMessages && (
          <section className="mt-6">
            <h2 className="border-b border-stone-200 pb-1 text-sm font-bold uppercase tracking-wider">
              Mensajes y Buenos Deseos
            </h2>
            <div className="mt-2 space-y-1.5 text-xs">
              {initialRsvps
                .filter((r) => r.message.trim().length > 0)
                .map((r) => (
                  <p key={r.id}>
                    <strong>{r.guestName}:</strong> &ldquo;{r.message}&rdquo;
                  </p>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
