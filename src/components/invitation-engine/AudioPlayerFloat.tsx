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
  hasTopChrome?: boolean;
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
  hasTopChrome = false,
}: AudioPlayerFloatProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [actuallyPlaying, setActuallyPlaying] = React.useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setActuallyPlaying(true))
          .catch(() => {
            // Browser blocked autoplay until direct user gesture on player
            setActuallyPlaying(false);
          });
      } else {
        setActuallyPlaying(!audio.paused);
      }
    } else {
      audio.pause();
      setActuallyPlaying(false);
    }
  }, [isPlaying, src]);

  const handleDirectClick = () => {
    const audio = audioRef.current;
    if (audio) {
      if (actuallyPlaying) {
        audio.pause();
        setActuallyPlaying(false);
        if (isPlaying) onToggle();
      } else {
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => setActuallyPlaying(true)).catch(() => setActuallyPlaying(false));
        } else {
          setActuallyPlaying(true);
        }
        if (!isPlaying) onToggle();
      }
    } else {
      onToggle();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={handleDirectClick}
        aria-label={actuallyPlaying ? "Pausar música" : "Reproducir música"}
        aria-pressed={actuallyPlaying}
        title={title}
        className={`fixed right-3 sm:right-4 z-40 flex min-h-[40px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md transition-transform active:scale-95 ${
          hasTopChrome ? "top-14 sm:top-14" : "top-4"
        }`}
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
          {actuallyPlaying ? <Pause className="h-3 w-3" /> : <Play className="ml-0.5 h-3 w-3" />}
        </span>

        {actuallyPlaying ? (
          <span className="flex items-end gap-[2px] h-3.5 pr-1">
            <span className="w-[2.5px] rounded-full eq-bar-1" style={{ backgroundColor: accentColor }} />
            <span className="w-[2.5px] rounded-full eq-bar-2" style={{ backgroundColor: accentColor }} />
            <span className="w-[2.5px] rounded-full eq-bar-3" style={{ backgroundColor: accentColor }} />
          </span>
        ) : (
          <span className="flex items-center gap-1 pr-1 opacity-80">
            {actuallyPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Música</span>
          </span>
        )}
      </button>
    </>
  );
}
