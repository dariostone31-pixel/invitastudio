"use client";

import React, { useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface AudioPlayerFloatProps {
  src: string;
  title: string;
  isPlaying: boolean;
  onToggle: () => void;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
}

export function AudioPlayerFloat({
  src,
  title,
  isPlaying,
  onToggle,
  accentColor,
  surfaceColor,
  textColor,
  borderColor,
}: AudioPlayerFloatProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser blocked autoplay until user gesture
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, src]);

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={onToggle}
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
        title={title}
        className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-transform active:scale-95"
        style={{
          backgroundColor: `${surfaceColor}E6`,
          borderColor: borderColor,
          color: textColor,
        }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="ml-0.5 h-3 w-3" />}
        </span>

        {isPlaying ? (
          <span className="flex items-end gap-[2px] h-3.5 pr-1">
            <span className="w-[2.5px] rounded-full eq-bar-1" style={{ backgroundColor: accentColor }} />
            <span className="w-[2.5px] rounded-full eq-bar-2" style={{ backgroundColor: accentColor }} />
            <span className="w-[2.5px] rounded-full eq-bar-3" style={{ backgroundColor: accentColor }} />
          </span>
        ) : (
          <span className="flex items-center gap-1 pr-1 opacity-80">
            {isPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Música</span>
          </span>
        )}
      </button>
    </>
  );
}
