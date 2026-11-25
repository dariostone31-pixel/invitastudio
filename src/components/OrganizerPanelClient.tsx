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
  Plus,
  Trash2,
  Upload,
  ClipboardPaste,
  Lock,
  Send,
} from "lucide-react";
import type { EventRecord, PreloadedGuest, RsvpRecord } from "@/lib/db";
import { getWhatsAppHref } from "@/config/business";
import { PaymentPendingBanner } from "./PaymentPendingBanner";

interface OrganizerPanelClientProps {
  event: EventRecord;
  initialRsvps: RsvpRecord[];
  mercadopagoConfigured?: boolean;
}

interface GuestDraftRow {
  id: string;
  name: string;
  maxPasses: number;
  table: string;
  pase: "todo" | "ceremonia" | "fiesta";
  whatsapp: string;
}

function makeBlankGuestRow(index: number): GuestDraftRow {
  return {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index}`,
    name: "",
    maxPasses: 2,
    table: "",
    pase: "todo",
    whatsapp: "",
  };
}

function normalizeGuestWhatsApp(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return digits;
  if (digits.startsWith("0")) return `549${digits.slice(1)}`;
  if (digits.length === 10) return `549${digits}`;
  return digits;
}

function parsePaseValue(raw?: string): "todo" | "ceremonia" | "fiesta" {
  const v = (raw || "").trim().toLowerCase();
  if (v.includes("ceremonia")) return "ceremonia";
  if (v.includes("fiesta")) return "fiesta";
  return "todo";
}

function parseBulkGuestText(text: string): GuestDraftRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: GuestDraftRow[] = [];
  lines.forEach((line, idx) => {
    const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
    const parts = line.split(sep).map((p) => p.replace(/^["']|["']$/g, "").trim());
    const firstLower = (parts[0] || "").toLowerCase();
    if (
      idx === 0 &&
      (firstLower === "nombre" ||
        firstLower === "nombre / familia" ||
        firstLower === "familia" ||
        firstLower === "invitado")
    ) {
      return;
    }
    const name = (parts[0] || "").slice(0, 120);
    if (!name) return;
    const parsedNum = parts[1] ? parseInt(parts[1], 10) : 2;
    const maxPasses =
      Number.isFinite(parsedNum) && parsedNum >= 1 ? Math.min(20, parsedNum) : 2;
    const table = (parts[2] || "").slice(0, 40);
    const pase = parsePaseValue(parts[3]);
    const whatsapp = (parts[4] || "").slice(0, 30);
    rows.push({
      id: `inv-${Date.now()}-${rows.length + 1}`,
      name,
      maxPasses,
      table,
      pase,
      whatsapp,
    });
  });
  return rows;
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
  const [guestPase, setGuestPase] = useState<"todo" | "ceremonia" | "fiesta">("todo");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPanelLink, setCopiedPanelLink] = useState(false);
  const isEssentialPlan = event.planId === "esencial";
  const isPaid =
    event.paymentStatus === "pagado" ||
    (event.status === "publicada" &&
      event.paymentStatus !== "pendiente" &&
      event.paymentStatus !== "rechazado");

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

  // Carga masiva tipo Mini-Excel + Centro de Envío 1-a-1 por WhatsApp
  const [savedGuests, setSavedGuests] = useState<PreloadedGuest[]>(
    () => event.guestList || []
  );
  const [draftRows, setDraftRows] = useState<GuestDraftRow[]>(() => {
    const existing = event.guestList || [];
    if (existing.length > 0) {
      return existing.map((g, idx) => ({
        id: g.id || `inv-${idx + 1}`,
        name: g.name,
        maxPasses: g.maxPasses || 2,
        table: g.table || "",
        pase: g.pase || "todo",
        whatsapp: g.whatsapp || "",
      }));
    }
    return [makeBlankGuestRow(1), makeBlankGuestRow(2), makeBlankGuestRow(3)];
  });
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [savingGuestList, setSavingGuestList] = useState(false);
  const [guestListSavedMsg, setGuestListSavedMsg] = useState<string | null>(null);
  const [sentGuestIds, setSentGuestIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    (event.guestList || []).forEach((g) => {
      if (g.sent) map[g.id] = true;
    });
    return map;
  });
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [sendFilter, setSendFilter] = useState<"all" | "pending" | "sent">("all");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`invita_sent_${event.panelToken}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      if (parsed && typeof parsed === "object") {
        setSentGuestIds((prev) => ({ ...parsed, ...prev }));
      }
    } catch {
      // ignore
    }
  }, [event.panelToken]);

  // User-controlled PDF export options
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [pdfIncludeGuests, setPdfIncludeGuests] = useState(true);
  const [pdfIncludeDietary, setPdfIncludeDietary] = useState(true);
  const [pdfIncludeSongs, setPdfIncludeSongs] = useState(true);
  const [pdfIncludeMessages, setPdfIncludeMessages] = useState(false);

  const handleSaveGuestList = async () => {
    setSavingGuestList(true);
    setGuestListSavedMsg(null);
    const cleaned: PreloadedGuest[] = draftRows
      .map((row, idx) => ({
        id: row.id?.trim() || `inv-${idx + 1}`,
        name: row.name.trim().slice(0, 120),
        maxPasses: Number.isFinite(row.maxPasses)
          ? Math.max(1, Math.min(20, Math.round(row.maxPasses)))
          : 2,
        ...(row.table.trim() ? { table: row.table.trim().slice(0, 40) } : {}),
        pase: row.pase || "todo",
        ...(row.whatsapp.trim() ? { whatsapp: row.whatsapp.trim().slice(0, 30) } : {}),
        ...(sentGuestIds[row.id] ? { sent: true } : {}),
      }))
      .filter((g) => g.name.length > 0)
      .slice(0, 500);

    try {
      const res = await fetch(`/api/panel/${event.panelToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestList: cleaned }),
      });
      if (!res.ok) throw new Error("Error");
      setSavedGuests(cleaned);
      if (cleaned.length > 0) {
        setDraftRows(
          cleaned.map((g) => ({
            id: g.id,
            name: g.name,
            maxPasses: g.maxPasses,
            table: g.table || "",
            pase: g.pase || "todo",
            whatsapp: g.whatsapp || "",
          }))
        );
      }
      setGuestListSavedMsg(
        cleaned.length === 0
          ? "Lista vaciada: los invitados escribirán su nombre libremente."
          : `¡Guardado! ${cleaned.length} pases registrados en la base de datos y listos en el Centro de Envío.`
      );
    } catch {
      setGuestListSavedMsg("No se pudo guardar la lista. Probá nuevamente.");
    } finally {
      setSavingGuestList(false);
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const imported = parseBulkGuestText(content);
      if (imported.length > 0) {
        setDraftRows((prev) => [
          ...prev.filter((r) => r.name.trim().length > 0),
          ...imported,
        ]);
        setGuestListSavedMsg(
          `Se importaron ${imported.length} filas del CSV. Tocá "Guardar toda la lista" para confirmar.`
        );
      }
    } finally {
      e.target.value = "";
    }
  };

  const handleAppendBulkPaste = () => {
    const imported = parseBulkGuestText(bulkPasteText);
    if (imported.length === 0) return;
    setDraftRows((prev) => [
      ...prev.filter((r) => r.name.trim().length > 0),
      ...imported,
    ]);
    setBulkPasteText("");
    setShowBulkPaste(false);
    setGuestListSavedMsg(
      `Se sumaron ${imported.length} filas. Tocá "Guardar toda la lista" para guardarlas.`
    );
  };

  const markGuestSent = (guestId: string) => {
    const nextMap = { ...sentGuestIds, [guestId]: true };
    setSentGuestIds(nextMap);
    try {
      window.localStorage.setItem(
        `invita_sent_${event.panelToken}`,
        JSON.stringify(nextMap)
      );
    } catch {
      // ignore
    }
    const nextSaved = savedGuests.map((g) =>
      g.id === guestId ? { ...g, sent: true } : g
    );
    setSavedGuests(nextSaved);
    fetch(`/api/panel/${event.panelToken}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestList: nextSaved }),
    }).catch(() => {});
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
    ...(guestPase !== "todo" ? { pase: guestPase } : {}),
  }).toString();
  const personalizedPath = `/i/${event.slug}?${personalizedQuery}`;
  const fullPersonalizedUrl = `${origin}${personalizedPath}`;

  const handleCopyInvite = async () => {
    if (!isPaid) return;
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
              Volver a Invita con el Alma
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
              {isPaid ? "Ver Invitación en Vivo" : "Ver Vista Previa (Borrador)"}
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
              <div className="min-w-0">
                <code className="block truncate text-xs text-stone-700">{`/i/${event.slug}`}</code>
                {!isPaid && (
                  <p className="mt-1 text-[11px] font-medium text-amber-800">
                    El botón para copiar y compartir el link con tus invitados se habilitará automáticamente al acreditarse el pago.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!isPaid ? (
                  <Link
                    href={`/i/${event.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver Vista Previa (Borrador)
                  </Link>
                ) : (
                  <>
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
                      {copiedLink ? "¡Copiado!" : "Copiar Link para Invitados"}
                    </button>
                  </>
                )}
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

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                  Nombre / Familia (separá con | si son varios)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej. Juan Pérez | Ana Disalvo"
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
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                  Momento habilitado
                </label>
                <select
                  value={guestPase}
                  onChange={(e) =>
                    setGuestPase(e.target.value as "todo" | "ceremonia" | "fiesta")
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                >
                  <option value="todo">Todo el evento</option>
                  <option value="ceremonia">Solo Ceremonia</option>
                  <option value="fiesta">Solo Fiesta / Brindis</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <code className="block truncate text-xs text-stone-600">{personalizedPath}</code>
              {!isPaid && (
                <p className="mt-1 text-[11px] font-medium text-amber-800">
                  El botón para copiar y compartir el link con tus invitados se habilitará automáticamente al acreditarse el pago.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPaid ? (
                <>
                  <Link
                    href={personalizedPath}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-4 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver Vista Previa (Borrador)
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setGuestName("");
                      setGuestPasses("2");
                      setGuestTable("");
                      setGuestPase("todo");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Limpiar / Siguiente
                  </button>
                </>
              ) : (
                <>
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
                    {copiedLink ? "¡Copiado!" : "Copiar Link para Invitados"}
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
                      setGuestPase("todo");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Limpiar / Siguiente
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
        )}

        {/* Opción 2 · Carga Masiva tipo Mini-Excel + Centro de Envío 1-a-1 por WhatsApp (PRO / Llave en Mano) */}
        {!isEssentialPlan && (
          <section className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-amber-700" />
                  <h2 className="font-cormorant text-2xl font-semibold text-stone-900">
                    Opción 2 · Carga Masiva tipo Mini-Excel y Centro de Envío 1-a-1
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-stone-500">
                  Cargá todos tus invitados o familias de una sola vez, guardalos juntos y enviá cada pase personalizado por WhatsApp con control de enviados. También alimenta el buscador automático del RSVP.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPaste((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-900"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  {showBulkPaste ? "Cerrar pegado" : "Pegar varias filas"}
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-900">
                  <Upload className="h-3.5 w-3.5" />
                  Importar .csv
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCsv}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {showBulkPaste && (
              <div className="space-y-2.5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-xs font-semibold text-stone-800">
                  Pegá filas desde Excel, Google Sheets o texto (columnas: Nombre, Lugares, Mesa, Acceso, WhatsApp)
                </p>
                <textarea
                  rows={4}
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder={"Familia Gómez, 3, 5, Todo el evento, 5493884123456\nLucía Fernández, 2, 8, Solo Fiesta, 3885001122"}
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs outline-none focus:border-stone-900"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleAppendBulkPaste}
                    className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
                  >
                    Sumar filas a la tabla
                  </button>
                </div>
              </div>
            )}

            {/* Tabla Mini-Excel */}
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    <th className="min-w-[180px] px-3 py-2.5">Nombre / Familia *</th>
                    <th className="w-24 px-3 py-2.5">Lugares</th>
                    <th className="w-24 px-3 py-2.5">Mesa</th>
                    <th className="w-40 px-3 py-2.5">Acceso</th>
                    <th className="w-44 px-3 py-2.5">WhatsApp (opc.)</th>
                    <th className="w-12 px-2 py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {draftRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-stone-50/70">
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            setDraftRows((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, name: e.target.value } : r
                              )
                            )
                          }
                          placeholder="Ej. Familia Gómez"
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={row.maxPasses}
                          onChange={(e) =>
                            setDraftRows((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? {
                                      ...r,
                                      maxPasses: Math.max(
                                        1,
                                        Math.min(20, Number(e.target.value) || 1)
                                      ),
                                    }
                                  : r
                              )
                            )
                          }
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.table}
                          onChange={(e) =>
                            setDraftRows((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, table: e.target.value } : r
                              )
                            )
                          }
                          placeholder="Ej. 5"
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.pase}
                          onChange={(e) =>
                            setDraftRows((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? {
                                      ...r,
                                      pase: e.target.value as "todo" | "ceremonia" | "fiesta",
                                    }
                                  : r
                              )
                            )
                          }
                          className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-stone-900"
                        >
                          <option value="todo">Todo el evento</option>
                          <option value="ceremonia">Solo Ceremonia</option>
                          <option value="fiesta">Solo Fiesta</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="tel"
                          value={row.whatsapp}
                          onChange={(e) =>
                            setDraftRows((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, whatsapp: e.target.value } : r
                              )
                            )
                          }
                          placeholder="Ej. 3884123456"
                          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          aria-label="Quitar fila"
                          onClick={() =>
                            setDraftRows((prev) =>
                              prev.length > 1
                                ? prev.filter((_, i) => i !== idx)
                                : [makeBlankGuestRow(1)]
                            )
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setDraftRows((prev) => [...prev, makeBlankGuestRow(prev.length + 1)])
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-stone-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar fila
              </button>

              <button
                type="button"
                disabled={savingGuestList}
                onClick={handleSaveGuestList}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                {savingGuestList ? "Guardando lista..." : "Guardar toda la lista"}
              </button>
            </div>

            {guestListSavedMsg && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">
                {guestListSavedMsg}
              </p>
            )}

            {/* Centro de Envío 1-a-1 por WhatsApp */}
            {savedGuests.length > 0 && (() => {
              const sentCount = savedGuests.filter((g) => Boolean(sentGuestIds[g.id])).length;
              const progressPct = Math.round((sentCount / savedGuests.length) * 100);
              const visibleGuests = savedGuests.filter((g) => {
                const isSent = Boolean(sentGuestIds[g.id]);
                if (sendFilter === "sent") return isSent;
                if (sendFilter === "pending") return !isSent;
                return true;
              });
              return (
                <div className="space-y-4 border-t border-stone-200 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        <Send className="h-3.5 w-3.5" />
                        Centro de Envío 1-a-1 por WhatsApp
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <p className="text-sm font-bold text-stone-900">
                          Enviados: {sentCount} de {savedGuests.length}
                        </p>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["all", `Todos (${savedGuests.length})`],
                          ["pending", `Pendientes (${savedGuests.length - sentCount})`],
                          ["sent", `Enviados (${sentCount})`],
                        ] as const
                      ).map(([k, label]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setSendFilter(k)}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            sendFilter === k
                              ? "bg-stone-900 text-white"
                              : "border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
                      <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                      <span>
                        Pedido en estado <strong>Borrador (Pendiente de pago)</strong>: los botones{" "}
                        <strong>Enviar por WhatsApp</strong> y <strong>Copiar link</strong> permanecen bloqueados hasta que se acredite el pago. Mientras tanto podés usar <strong>Ver Vista Previa</strong>.
                      </span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {visibleGuests.map((g) => {
                      const isSent = Boolean(sentGuestIds[g.id]);
                      const guestPath = `/i/${event.slug}?inv=${encodeURIComponent(g.id)}`;
                      const guestFullUrl = `${origin}${guestPath}`;
                      const cleanGuestWa = normalizeGuestWhatsApp(g.whatsapp);
                      const msg = encodeURIComponent(
                        `¡Hola ${g.name}! Con mucha alegría te enviamos tu invitación personalizada para ${event.eventTitle} (${event.dateDisplay} · ${event.timeDisplay} en ${event.venue}).\nReservamos ${g.maxPasses} ${
                          g.maxPasses === 1 ? "lugar" : "lugares"
                        }${g.table ? ` (Mesa ${g.table})` : ""} para vos:\n${guestFullUrl}`
                      );
                      const waUrl = cleanGuestWa
                        ? `https://wa.me/${cleanGuestWa}?text=${msg}`
                        : `https://wa.me/?text=${msg}`;
                      const paseLabel =
                        g.pase === "ceremonia"
                          ? "Solo Ceremonia"
                          : g.pase === "fiesta"
                          ? "Solo Fiesta"
                          : "Todo el evento";

                      return (
                        <div
                          key={g.id}
                          className={`flex flex-col justify-between gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center ${
                            isSent
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-stone-200 bg-stone-50/60"
                          }`}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-stone-900">
                                {g.name}
                              </span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-700 ring-1 ring-stone-200">
                                {g.maxPasses} {g.maxPasses === 1 ? "lugar" : "lugares"}
                              </span>
                              {g.table && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-700 ring-1 ring-stone-200">
                                  Mesa {g.table}
                                </span>
                              )}
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                {paseLabel}
                              </span>
                              {isSent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Enviado ✓
                                </span>
                              )}
                            </div>
                            <p className="truncate font-mono text-[11px] text-stone-500">
                              {guestPath}
                              {g.whatsapp ? ` · WA: ${g.whatsapp}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isPaid ? (
                              <>
                                <Link
                                  href={guestPath}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard
                                      ?.writeText(guestFullUrl)
                                      .catch(() => {});
                                    setCopiedGuestId(g.id);
                                    setTimeout(() => setCopiedGuestId(null), 1800);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-100"
                                >
                                  {copiedGuestId === g.id ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                  {copiedGuestId === g.id ? "¡Copiado!" : "Copiar link"}
                                </button>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => markGuestSent(g.id)}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  Enviar por WhatsApp
                                </a>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={guestPath}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-100"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver Vista Previa
                                </Link>
                                <button
                                  type="button"
                                  disabled
                                  aria-disabled="true"
                                  title="Disponible al acreditarse el pago"
                                  className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-[11px] font-semibold text-stone-400"
                                >
                                  <Lock className="h-3 w-3" />
                                  Copiar link
                                </button>
                                <button
                                  type="button"
                                  disabled
                                  aria-disabled="true"
                                  title="Disponible al acreditarse el pago"
                                  className="inline-flex cursor-not-allowed items-center gap-1 rounded-full bg-stone-200 px-3 py-1.5 text-[11px] font-semibold text-stone-500"
                                >
                                  <Lock className="h-3 w-3" />
                                  Enviar por WhatsApp
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
            Invita con el Alma · Reporte del Organizador ({event.orderCode})
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
