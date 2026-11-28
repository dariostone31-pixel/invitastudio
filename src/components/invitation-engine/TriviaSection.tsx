"use client";

import React, { useEffect, useRef, useState } from "react";
import { HelpCircle, Trophy, RotateCcw, Check, X } from "lucide-react";
import type { TriviaQuestion, TriviaScore } from "@/lib/db";
import type { SkinPalette } from "@/templates/catalog";
import { getAccessibleButtonBg } from "@/lib/contrast";

interface TriviaSectionProps {
  eventSlug?: string;
  title: string;
  questions: TriviaQuestion[];
  initialScores: TriviaScore[];
  initialGuestName?: string;
  palette: SkinPalette;
  cardRadius: string;
  innerRadius: string;
  cardShadow: string;
  sectionHeadingFont: string;
  textAccentOnSurface: string;
  isNewspaper?: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

export function TriviaSection({
  eventSlug,
  title,
  questions,
  initialScores,
  initialGuestName = "",
  palette,
  cardRadius,
  innerRadius,
  cardShadow,
  sectionHeadingFont,
  textAccentOnSurface,
  isNewspaper = false,
}: TriviaSectionProps) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scores, setScores] = useState<TriviaScore[]>(initialScores);
  const [guestName, setGuestName] = useState(initialGuestName);
  const [saving, setSaving] = useState(false);
  const [savedScore, setSavedScore] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  if (!questions || questions.length === 0) return null;

  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const currentQ = questions[currentIndex];

  const startTrivia = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setSavedScore(false);
    setFeedbackMsg(null);
    setPhase("playing");
  };

  const pickOption = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(nextScore);
    }

    advanceTimerRef.current = setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setPhase("result");
      }
      advanceTimerRef.current = null;
    }, 1200);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || savedScore) return;
    if (!guestName.trim()) {
      setFeedbackMsg("Escribí tu nombre para entrar al podio.");
      return;
    }
    setSaving(true);
    setFeedbackMsg(null);

    if (eventSlug) {
      try {
        const res = await fetch("/api/trivia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSlug,
            guestName: guestName.trim(),
            score,
            total: questions.length,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "No se pudo guardar el puntaje.");
        }
        if (data.item) {
          setScores((prev) =>
            [...prev, data.item as TriviaScore]
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
          );
        }
        setSavedScore(true);
        setFeedbackMsg("¡Puntaje guardado en el podio!");
      } catch (err) {
        setFeedbackMsg(
          err instanceof Error ? err.message : "No se pudo guardar tu puntaje."
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setScores((prev) =>
      [
        ...prev,
        {
          id: `preview-${Date.now()}`,
          guestName: guestName.trim(),
          score,
          total: questions.length,
          createdAt: new Date().toISOString(),
        },
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    );
    setSavedScore(true);
    setSaving(false);
  };

  return (
    <section
      className={`${cardRadius} border p-6 text-center ${cardShadow}`}
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
      }}
    >
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border"
        style={{
          backgroundColor: palette.surfaceAlt,
          borderColor: palette.border,
          color: textAccentOnSurface,
        }}
      >
        <HelpCircle className="h-5 w-5" />
      </div>

      <p
        className="font-ui-jost mt-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: textAccentOnSurface }}
      >
        Juego Interactivo
      </p>

      <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
        {title}
      </h2>

      {phase === "intro" && (
        <>
          <p className="mt-2 text-[14px]" style={{ color: palette.textMuted }}>
            {questions.length} preguntas rápidas · ¡Respondé y entrá al podio!
          </p>
          <button
            type="button"
            onClick={startTrivia}
            className={`mt-4 min-h-[44px] w-full max-w-xs px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-90 ${
              isNewspaper ? "rounded-none" : "rounded-full"
            }`}
            style={{
              backgroundColor: buttonBg,
              color: palette.accentText,
            }}
          >
            Jugar Ahora
          </button>

          {scores.length > 0 && (
            <div className="mt-5 space-y-2 text-left">
              <p
                className="font-ui-jost flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: palette.textMuted }}
              >
                <Trophy className="h-3.5 w-3.5" style={{ color: textAccentOnSurface }} />
                Podio Actual
              </p>
              <div className="space-y-1.5">
                {scores.slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between ${innerRadius} border px-3.5 py-2 text-xs`}
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    }}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-bold"
                        style={{
                          borderColor: idx === 0 ? textAccentOnSurface : palette.border,
                          color: idx === 0 ? textAccentOnSurface : palette.textMuted,
                        }}
                      >
                        0{idx + 1}
                      </span>
                      <span>{s.guestName}</span>
                    </span>
                    <span className="font-mono font-bold" style={{ color: textAccentOnSurface }}>
                      {s.score}/{s.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {phase === "playing" && currentQ && (
        <div className="mt-4 space-y-3 text-left">
          <p
            className="text-center text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: palette.textMuted }}
          >
            Pregunta {currentIndex + 1} de {questions.length}
          </p>
          <p className="text-center text-base font-semibold leading-snug">
            {currentQ.question}
          </p>
          <div className="space-y-2 pt-1">
            {currentQ.options.map((opt, idx) => {
              const hasPicked = selectedOption !== null;
              const isCorrectOption = idx === currentQ.correctIndex;
              const isPickedWrong = hasPicked && selectedOption === idx && !isCorrectOption;
              const isHighlightedCorrect = hasPicked && isCorrectOption;

              const btnBg = isHighlightedCorrect
                ? palette.isDark
                  ? "rgba(16, 185, 129, 0.22)"
                  : "#ECFDF5"
                : isPickedWrong
                ? palette.isDark
                  ? "rgba(239, 68, 68, 0.22)"
                  : "#FEF2F2"
                : palette.bg;

              const btnBorder = isHighlightedCorrect
                ? "#16A34A"
                : isPickedWrong
                ? "#DC2626"
                : palette.border;

              const btnColor = isHighlightedCorrect
                ? palette.isDark
                  ? "#A7F3D0"
                  : "#14532D"
                : isPickedWrong
                ? palette.isDark
                  ? "#FECACA"
                  : "#7F1D1D"
                : palette.text;

              const badgeBg = isHighlightedCorrect
                ? "#16A34A"
                : isPickedWrong
                ? "#DC2626"
                : palette.surfaceAlt;

              const badgeColor =
                isHighlightedCorrect || isPickedWrong ? "#FFFFFF" : textAccentOnSurface;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={hasPicked}
                  onClick={() => pickOption(idx)}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-3 ${innerRadius} border px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                    hasPicked && !isHighlightedCorrect && !isPickedWrong
                      ? "opacity-55"
                      : "active:scale-[0.99]"
                  }`}
                  style={{
                    backgroundColor: btnBg,
                    borderColor: btnBorder,
                    color: btnColor,
                  }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
                      style={{
                        backgroundColor: badgeBg,
                        color: badgeColor,
                      }}
                    >
                      {isHighlightedCorrect ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : isPickedWrong ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        LETTERS[idx] || idx + 1
                      )}
                    </span>
                    <span className="break-words">{opt}</span>
                  </span>
                  {isHighlightedCorrect && (
                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Correcta
                    </span>
                  )}
                  {isPickedWrong && (
                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      Incorrecta
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: palette.textMuted }}>
            Tu Resultado
          </p>
          <p className="text-4xl font-bold" style={{ color: textAccentOnSurface }}>
            {score}/{questions.length}
          </p>
          <p className="text-xs" style={{ color: palette.textMuted }}>
            {score === questions.length
              ? "¡Impecable! Sos prácticamente parte de la familia."
              : score >= Math.ceil(questions.length / 2)
              ? "¡Muy bien! Se nota que prestás atención."
              : "¡La fiesta va a ser el mejor momento para conocernos más!"}
          </p>

          {!savedScore ? (
            <form onSubmit={handleSaveScore} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tu nombre para el podio"
                className={`flex-1 ${innerRadius} border px-3.5 py-2.5 text-base sm:text-sm outline-none`}
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              />
              <button
                type="submit"
                disabled={saving}
                className={`min-h-[44px] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider ${
                  isNewspaper ? "rounded-none" : "rounded-full"
                }`}
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </form>
          ) : (
            <div className="space-y-1.5 pt-2 text-left">
              {scores.slice(0, 5).map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between ${innerRadius} border px-3.5 py-2 text-xs`}
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                  }}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-bold"
                      style={{
                        borderColor: idx === 0 ? textAccentOnSurface : palette.border,
                        color: idx === 0 ? textAccentOnSurface : palette.textMuted,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <span>{s.guestName}</span>
                  </span>
                  <span className="font-mono font-bold" style={{ color: textAccentOnSurface }}>
                    {s.score}/{s.total}
                  </span>
                </div>
              ))}
            </div>
          )}

          {feedbackMsg && (
            <p className="text-xs font-medium" style={{ color: textAccentOnSurface }}>
              {feedbackMsg}
            </p>
          )}

          <button
            type="button"
            onClick={startTrivia}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline"
            style={{ color: palette.textMuted }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Jugar de nuevo
          </button>
        </div>
      )}
    </section>
  );
}
