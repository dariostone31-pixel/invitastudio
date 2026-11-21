"use client";

import React, { useState } from "react";
import { X, CheckCircle2, HeartHandshake } from "lucide-react";
import { SkinPalette } from "@/templates/catalog";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: SkinPalette;
  eventTitle: string;
  eventSlug?: string;
  initialName?: string;
  maxPasses?: number;
  allowKidsMenu?: boolean;
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
}: RsvpModalProps) {
  const [name, setName] = useState(initialName);
  const [attending, setAttending] = useState<boolean>(true);
  const [passesUsed, setPassesUsed] = useState<number>(Math.min(1, maxPasses));
  const [companions, setCompanions] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [song, setSong] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
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
            companions,
            dietary,
            song,
            message,
          }),
        });
        if (!res.ok) {
          throw new Error("No se pudo guardar");
        }
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
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: palette.accent }}
              >
                Confirmación de Asistencia
              </p>
              <h3 className="mt-1 text-xl font-semibold">{eventTitle}</h3>
            </div>

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
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
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
                  className="rounded-xl border py-2.5 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: attending ? palette.accent : palette.bg,
                    borderColor: attending ? palette.accent : palette.border,
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                      Cantidad de lugares (máx. {maxPasses})
                    </label>
                    <select
                      value={passesUsed}
                      onChange={(e) => setPassesUsed(Number(e.target.value))}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                      style={{
                        backgroundColor: palette.bg,
                        borderColor: palette.border,
                        color: palette.text,
                      }}
                    >
                      {Array.from({ length: maxPasses }, (_, idx) => idx + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "persona" : "personas"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                      Acompañantes
                    </label>
                    <input
                      type="text"
                      value={companions}
                      onChange={(e) => setCompanions(e.target.value)}
                      placeholder="Nombres (opcional)"
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                      style={{
                        backgroundColor: palette.bg,
                        borderColor: palette.border,
                        color: palette.text,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                    Restricciones alimentarias / Menú especial (opcional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((opt) => {
                      const active = dietary.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleDietary(opt)}
                          className="rounded-full border px-3 py-1 text-[11px] font-medium transition-all"
                          style={{
                            backgroundColor: active ? palette.accent : palette.bg,
                            borderColor: active ? palette.accent : palette.border,
                            color: active ? palette.accentText : palette.textMuted,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                    ¿Qué tema no puede faltar en la pista?
                  </label>
                  <input
                    type="text"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="Nombre de canción y artista (opcional)"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                      color: palette.text,
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: palette.textMuted }}>
                Mensaje o saludos (opcional)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dejá unas lindas palabras..."
                className="w-full rounded-xl border px-3.5 py-2 text-sm outline-none"
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
              className="w-full rounded-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-95 disabled:opacity-60"
              style={{
                backgroundColor: palette.accent,
                color: palette.accentText,
              }}
            >
              {submitting ? "Guardando..." : "Enviar Confirmación"}
            </button>
          </form>
        ) : (
          <div className="py-4 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${palette.accent}22`, color: palette.accent }}
            >
              {attending ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <HeartHandshake className="h-8 w-8" />
              )}
            </div>
            <h3 className="mt-4 text-xl font-semibold">
              {attending ? `¡Gracias por confirmar, ${name}!` : `Registramos tu aviso, ${name}`}
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
              className="mt-6 w-full rounded-full py-3 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: palette.accent,
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
