"use client";

import React, { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, VolumeX } from "lucide-react";
import {
  ALL_MUSIC_TRACKS,
  MUSIC_CATEGORIES,
  getDefaultMusicCategoryForSkin,
  type MusicCategoryId,
} from "@/config/musicCatalog";

interface MusicCatalogPickerProps {
  value: string;
  onChange: (value: string) => void;
  skinCategory: string;
  defaultTrackLabel?: string;
  defaultTrackUrl?: string;
  customUploadedOption?: { value: string; label: string } | null;
  compact?: boolean;
}

export function MusicCatalogPicker({
  value,
  onChange,
  skinCategory,
  defaultTrackLabel,
  defaultTrackUrl,
  customUploadedOption,
  compact = false,
}: MusicCatalogPickerProps) {
  const [activeGroup, setActiveGroup] = useState<"all" | MusicCategoryId>(() =>
    getDefaultMusicCategoryForSkin(skinCategory)
  );
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setActiveGroup(getDefaultMusicCategoryForSkin(skinCategory));
  }, [skinCategory]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePreview = (url: string) => {
    if (!url || url === "none") return;

    if (playingUrl === url && audioRef.current) {
      audioRef.current.pause();
      setPlayingUrl(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingUrl(null);
    audio
      .play()
      .then(() => setPlayingUrl(url))
      .catch(() => setPlayingUrl(null));
  };

  const visibleGroups =
    activeGroup === "all"
      ? MUSIC_CATEGORIES
      : MUSIC_CATEGORIES.filter((g) => g.id === activeGroup);

  const isKnownOption =
    value === "" ||
    value === "none" ||
    ALL_MUSIC_TRACKS.some((t) => t.value === value);

  return (
    <div className="space-y-2.5">
      {/* Native grouped select for fast selection & full accessibility */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-stone-300 bg-white outline-none focus:border-stone-900 ${
          compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
        }`}
      >
        <option value="">
          {defaultTrackLabel
            ? `Música predeterminada del modelo (${defaultTrackLabel})`
            : "Música predeterminada del modelo"}
        </option>
        {MUSIC_CATEGORIES.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {group.tracks.map((track) => (
              <option key={track.id} value={track.value}>
                {track.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value="none">Sin música de fondo</option>
        {customUploadedOption && !isKnownOption && (
          <option value={customUploadedOption.value}>
            {customUploadedOption.label}
          </option>
        )}
      </select>

      {/* Visual category-grouped selector with instant audio preview */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-2.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <Music className="h-3 w-3 text-[#6B1E30]" />
            Catálogo por categoría
          </span>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveGroup("all")}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                activeGroup === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
              }`}
            >
              Todas (14)
            </button>
            {MUSIC_CATEGORIES.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                  activeGroup === group.id
                    ? "bg-[#6B1E30] text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
                }`}
              >
                {group.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-56 space-y-2.5 overflow-y-auto pr-0.5">
          {/* Quick default & mute pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange("")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                value === ""
                  ? "border-[#6B1E30] bg-[#6B1E30]/10 font-semibold text-[#6B1E30]"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
              }`}
            >
              <span>Predeterminada</span>
              {defaultTrackUrl && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(defaultTrackUrl);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePreview(defaultTrackUrl);
                    }
                  }}
                  aria-label="Escuchar canción predeterminada"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-white"
                >
                  {playingUrl === defaultTrackUrl ? (
                    <Pause className="h-2.5 w-2.5" />
                  ) : (
                    <Play className="ml-0.5 h-2.5 w-2.5" />
                  )}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setPlayingUrl(null);
                onChange("none");
              }}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                value === "none"
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              <VolumeX className="h-3 w-3" />
              Sin música
            </button>
          </div>

          {visibleGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                {group.label}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {group.tracks.map((track) => {
                  const selected = value === track.value;
                  const isPlaying = playingUrl === track.value;
                  return (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 transition-all ${
                        selected
                          ? "border-[#6B1E30] bg-[#FBF1EE] text-[#2A121B]"
                          : "border-stone-200/80 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onChange(track.value)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-xs font-semibold">
                          {track.title}
                        </span>
                        <span className="block truncate text-[10px] text-stone-500">
                          {track.artist}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePreview(track.value)}
                        aria-label={
                          isPlaying
                            ? `Pausar ${track.label}`
                            : `Escuchar ${track.label}`
                        }
                        className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isPlaying
                            ? "border-[#6B1E30] bg-[#6B1E30] text-white"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="ml-0.5 h-3 w-3" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
