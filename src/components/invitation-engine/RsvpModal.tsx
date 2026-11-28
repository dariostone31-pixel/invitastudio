"use client";

import React, { useMemo, useState } from "react";
import { X, CheckCircle2, HeartHandshake, Search } from "lucide-react";
import { SkinPalette } from "@/templates/catalog";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";
import type { PreloadedGuest } from "@/lib/db";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: SkinPalette;
  eventTitle: string;
  eventSlug?: string;
  initialName?: string;
  maxPasses?: number;
  allowKidsMenu?: boolean;
  allowSongField?: boolean;
  guestList?: PreloadedGuest[];
}

const DIETARY_OPTIONS = [
  "Sin TACC / Celíaco",
  "Vegetariano",
  "Vegano",
  "Menú Infantil",
  "Sin lactosa / Alergia",
];

export function RsvpModal({
  isOpen,
  onClose,
  palette,
  eventTitle,
  eventSlug,
  initialName = "",
  maxPasses = 5,
  allowSongField = true,
  guestList = [],
}: RsvpModalProps) {
  const [name, setName] = useState(initialName);
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedMaxPasses, setSelectedMaxPasses] = useState<number>(maxPasses);
  const [attending, setAttending] = useState<boolean>(true);
  const [passesUsed, setPassesUsed] = useState<number>(Math.min(1, maxPasses));

  const matchingGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    if (q.length < 2 || guestList.length === 0) return [];
    return guestList.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 5);
  }, [guestSearch, guestList]);

  const effectiveMaxPasses = selectedMaxPasses || maxPasses;
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [song, setSong] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [wasUpdated, setWasUpdated] = useState(false);

  if (!isOpen) return null;

  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccent = ensureContrast(palette.accent, palette.surface, 4.6);

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) {
      setSubmitError("Ingresá tu nombre y apellido para registrar la confirmación.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    if (eventSlug) {
      try {
        const res = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSlug,
            guestName: name.trim(),
            attending,
            passesUsed: attending ? passesUsed : 0,
            companions: attending
              ? companionNames
                  .slice(0, Math.max(0, passesUsed - 1))
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(", ")
              : "",
            dietary,
            song,
            message,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "No se pudo guardar");
        }
        setWasUpdated(Boolean(data.updated));
      } catch {
        setSubmitError("Hubo un problema de conexión. Intentá nuevamente.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border p-6 shadow-2xl sm:rounded-3xl"
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
          color: palette.text,
        }}
      >
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-opacity hover:opacity-75"
          style={{ borderColor: palette.border, color: palette.textMuted }}
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="pr-8">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: textAccent }}
              >
                Confirmación de Asistencia
              </p>
              <h3 className="mt-1 text-xl font-semibold">{eventTitle}</h3>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.textMuted }}>
                Tu respuesta llega directamente al organizador del evento para organizar mesas y
                catering. No se utiliza para publicidad.
              </p>
            </div>

            {guestList.length > 0 && !initialName && (
              <div
                className="rounded-2xl border p-3"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                }}
              >
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: textAccent }}
                >
                  <Search className="h-3.5 w-3.5" />
                  ¿Querés encontrarte rápido en la lista?
                </label>
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Escribí 2 o más letras de tu nombre..."
                  className="w-full rounded-xl border px-3 py-2 text-base sm:text-xs outline-none"
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  }}
                />
                {matchingGuests.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {matchingGuests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setName(g.name);
                          setSelectedMaxPasses(g.maxPasses || 1);
                          setPassesUsed(g.maxPasses || 1);
                          setGuestSearch("");
                        }}
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-medium transition-opacity hover:opacity-85"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        <span>{g.name}</span>
                        <span className="text-[11px] font-semibold" style={{ color: textAccent }}>
                          {g.maxPasses} {g.maxPasses === 1 ? "lugar" : "lugares"}
                          {g.table ? ` · Mesa ${g.table}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                Tu Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Familia García López o Sofía Pérez"
                className="w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                ¿Vas a poder acompañarnos? *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className="min-h-[44px] rounded-xl border py-2.5 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: attending ? buttonBg : palette.bg,
                    borderColor: attending ? buttonBg : palette.border,
                    color: attending ? palette.accentText : palette.text,
                  }}
                >
                  Sí, ahí estaré
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className="rounded-xl border py-2.5 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: !attending ? palette.text : palette.bg,
                    borderColor: !attending ? palette.text : palette.border,
                    color: !attending ? palette.surface : palette.text,
                  }}
                >
                  No podré asistir
                </button>
              </div>
            </div>

            {attending && (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                      ¿Cuántas personas asisten en total? (máx. {effectiveMaxPasses})
                    </label>
                    <div
                      className="flex items-center justify-between rounded-xl border px-3 py-2"
                      style={{
                        backgroundColor: palette.bg,
                        borderColor: palette.border,
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Restar una persona"
                        onClick={() => setPassesUsed((n) => Math.max(1, n - 1))}
                        disabled={passesUsed <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border text-base font-bold transition-opacity disabled:opacity-40"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold" style={{ color: palette.text }}>
                        {passesUsed} {passesUsed === 1 ? "persona (solo vos)" : "personas"}
                      </span>
                      <button
                        type="button"
                        aria-label="Sumar una persona"
                        onClick={() => setPassesUsed((n) => Math.min(effectiveMaxPasses, n + 1))}
                        disabled={passesUsed >= effectiveMaxPasses}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border text-base font-bold transition-opacity disabled:opacity-40"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {passesUsed > 1 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium" style={{ color: palette.textMuted }}>
                        Nombres de tus {passesUsed - 1} {passesUsed - 1 === 1 ? "acompañante" : "acompañantes"} (opcional)
                      </label>
                      {Array.from({ length: passesUsed - 1 }, (_, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={companionNames[idx] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompanionNames((prev) => {
                              const next = [...prev];
                              next[idx] = val;
                              return next;
                            });
                          }}
                          placeholder={`Nombre del acompañante ${idx + 1}`}
                          className="w-full rounded-xl border px-3 py-2 text-base sm:text-sm outline-none"
                          style={{
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                            color: palette.text,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: palette.textMuted }}>
                    Restricciones alimentarias / Menú especial (opcional)
                  </label>
                  <p className="mb-1.5 text-[11px]" style={{ color: palette.textMuted }}>
                    Solo visible para el organizador para coordinar el menú; no se publica en la invitación.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((opt) => {
                      const active = dietary.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleDietary(opt)}
                          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                          style={{
                            backgroundColor: active ? buttonBg : palette.bg,
                            borderColor: active ? buttonBg : palette.border,
                            color: active ? palette.accentText : palette.textMuted,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {allowSongField && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                    ¿Qué tema no puede faltar en la pista?
                  </label>
                  <input
                    type="text"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="Nombre de canción y artista (opcional)"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm outline-none"
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                      color: palette.text,
                    }}
                  />
                </div>
                )}
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: palette.textMuted }}>
                Mensaje para el Muro de Buenos Deseos (opcional)
              </label>
              <p className="mb-1.5 text-[11px]" style={{ color: palette.textMuted }}>
                Si escribís unas palabras, aparecerán firmadas con tu nombre en la sección Buenos Deseos de esta invitación.
              </p>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dejá unas lindas palabras (opcional)..."
                className="w-full rounded-xl border px-3.5 py-2 text-base sm:text-sm outline-none"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              />
            </div>

            {submitError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] w-full rounded-full py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg transition-transform active:scale-95 disabled:opacity-60"
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              {submitting ? "Guardando..." : "Enviar Confirmación"}
            </button>

            <p className="text-center text-[11px]" style={{ color: palette.textMuted }}>
              Los campos opcionales no son obligatorios para confirmar.{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: textAccent }}
              >
                Privacidad
              </a>
            </p>
          </form>
        ) : (
          <div className="py-4 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${buttonBg}22`, color: textAccent }}
            >
              {attending ? (
                <CheckCircle2 className="animate-check-once h-8 w-8" />
              ) : (
                <HeartHandshake className="h-8 w-8" />
              )}
            </div>
            <h3 className="mt-4 text-xl font-semibold">
              {attending
                ? wasUpdated
                  ? `¡Actualizamos tu confirmación, ${name}!`
                  : `¡Gracias por confirmar, ${name}!`
                : `Registramos tu aviso, ${name}`}
            </h3>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: palette.textMuted }}>
              {attending
                ? `Guardamos ${passesUsed} ${
                    passesUsed === 1 ? "lugar" : "lugares"
                  }${dietary.length ? ` (${dietary.join(", ")})` : ""}. ${
                    eventSlug
                      ? "Tu respuesta ya quedó registrada en el Panel del Organizador."
                      : "En la versión publicada esto llega en vivo al Excel del organizador."
                  }`
                : "Lamentamos que no puedas estar, ¡te vamos a extrañar!"}
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-6 min-h-[44px] w-full rounded-full py-3 text-[13px] font-semibold uppercase tracking-[0.14em]"
              style={{
                backgroundColor: buttonBg,
                color: palette.accentText,
              }}
            >
              Volver a la Invitación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
