"use client";

import React, { useState } from "react";
import type { EventCategory } from "@/templates/catalog";
import {
  SUBTITLE_PRESETS_BY_CATEGORY,
  isSinglePersonWeddingTitle,
} from "@/config/subtitlePresets";

interface SubtitleSelectFieldProps {
  category: EventCategory;
  defaultEyebrow: string;
  eventTitle: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function SubtitleSelectField({
  category,
  defaultEyebrow,
  eventTitle,
  value,
  onChange,
  compact = false,
}: SubtitleSelectFieldProps) {
  const presets = SUBTITLE_PRESETS_BY_CATEGORY[category] || [];
  const isPreset = presets.includes(value);
  const [customMode, setCustomMode] = useState(
    Boolean(value.trim()) && !isPreset
  );

  const selectValue = customMode
    ? "__custom__"
    : value === ""
    ? ""
    : isPreset
    ? value
    : "__custom__";

  const showSingleNameHint =
    category === "boda" &&
    !value.trim() &&
    isSinglePersonWeddingTitle(eventTitle);

  return (
    <div className="space-y-1.5">
      <label
        className={`block font-semibold text-stone-700 ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        Subtítulo de Portada
      </label>
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "__custom__") {
            setCustomMode(true);
            if (!value.trim() || isPreset) {
              onChange("");
            }
          } else {
            setCustomMode(false);
            onChange(next);
          }
        }}
        className={`w-full rounded-xl border border-stone-300 bg-white outline-none focus:border-stone-900 ${
          compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
        }`}
      >
        <option value="">
          Automático según modelo ({defaultEyebrow})
        </option>
        {presets.map((preset) => (
          <option key={preset} value={preset}>
            {preset}
          </option>
        ))}
        <option value="__custom__">Escribir subtítulo personalizado...</option>
      </select>

      {(customMode || (Boolean(value.trim()) && !isPreset)) && (
        <input
          type="text"
          maxLength={70}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej. Somos más que novios · 12 de Diciembre"
          className={`w-full rounded-xl border border-stone-300 bg-white outline-none focus:border-stone-900 ${
            compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
          }`}
        />
      )}

      {showSingleNameHint && (
        <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[11px] leading-snug text-amber-900">
          Detectamos un solo nombre en la portada: si son dos, separalos con{" "}
          <strong>&amp;</strong> o <strong>y</strong> (ej.{" "}
          <em>Darío &amp; Gisela</em>), o elegí un subtítulo arriba (por defecto
          mostraremos <strong>&ldquo;¡Celebramos el Amor!&rdquo;</strong>).
        </p>
      )}
    </div>
  );
}
