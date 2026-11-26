"use client";

import React, { useCallback, useEffect, useRef } from "react";
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
  hasDraftBanner?: boolean;
  compactBottomLeft?: boolean;
}

const TARGET_VOLUME = 0.85;
const FADE_DURATION_MS = 2800;
const FADE_STEP_MS = 40;

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
  hasDraftBanner = false,
  compactBottomLeft = false,
}: AudioPlayerFloatProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const [actuallyPlaying, setActuallyPlaying] = React.useState(false);

  const stopFade = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  const startCinematicFadeIn = useCallback(
    (audio: HTMLAudioElement) => {
      stopFade();
      audio.volume = 0;
      const startTime = performance.now();
      fadeTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / FADE_DURATION_MS);
        // Smooth ease-out curve for gentle emotional swell
        const eased = 1 - Math.pow(1 - progress, 2);
        audio.volume = Math.min(TARGET_VOLUME, Number((TARGET_VOLUME * eased).toFixed(3)));
        if (progress >= 1) {
          audio.volume = TARGET_VOLUME;
          stopFade();
        }
      }, FADE_STEP_MS);
    },
    [stopFade]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setActuallyPlaying(true);
            startCinematicFadeIn(audio);
          })
          .catch(() => {
            // Browser blocked autoplay until direct user gesture on player
            setActuallyPlaying(false);
            stopFade();
          });
      } else {
        setActuallyPlaying(!audio.paused);
        if (!audio.paused) startCinematicFadeIn(audio);
      }
    } else {
      stopFade();
      audio.pause();
      audio.volume = 0;
      setActuallyPlaying(false);
    }
  }, [isPlaying, src, startCinematicFadeIn, stopFade]);

  useEffect(() => {
    return () => {
      stopFade();
    };
  }, [stopFade]);

  const handleDirectClick = () => {
    const audio = audioRef.current;
    if (audio) {
      if (actuallyPlaying) {
        stopFade();
        audio.pause();
        audio.volume = 0;
        setActuallyPlaying(false);
        if (isPlaying) onToggle();
      } else {
        audio.volume = 0;
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            setActuallyPlaying(true);
            startCinematicFadeIn(audio);
          }).catch(() => {
            setActuallyPlaying(false);
            stopFade();
          });
        } else {
          setActuallyPlaying(true);
          startCinematicFadeIn(audio);
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
        className={
          compactBottomLeft
            ? "fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_28px_-8px_rgba(45,30,20,0.28)] backdrop-blur-md transition-transform active:scale-95"
            : `fixed right-3 sm:right-4 z-40 flex min-h-[40px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md transition-transform active:scale-95 ${
                hasDraftBanner
                  ? "top-[5.25rem] sm:top-14"
                  : hasTopChrome
                  ? "top-14"
                  : "top-4"
              }`
        }
        style={{
          backgroundColor: compactBottomLeft ? "rgba(250, 246, 240, 0.9)" : `${surfaceColor}E6`,
          borderColor: compactBottomLeft ? "rgba(183, 138, 78, 0.48)" : borderColor,
          color: textColor,
        }}
      >
        {compactBottomLeft ? (
          actuallyPlaying ? (
            <span className="flex items-end gap-[2px] h-3.5">
              <span className="w-[2.5px] rounded-full eq-bar-1" style={{ backgroundColor: accentColor }} />
              <span className="w-[2.5px] rounded-full eq-bar-2" style={{ backgroundColor: accentColor }} />
              <span className="w-[2.5px] rounded-full eq-bar-3" style={{ backgroundColor: accentColor }} />
            </span>
          ) : (
            <Volume2 className="h-4 w-4" style={{ color: accentColor }} />
          )
        ) : (
          <>
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
          </>
        )}
      </button>
    </>
  );
}
