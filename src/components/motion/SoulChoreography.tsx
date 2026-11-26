"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionProfile } from "@/templates/catalog";

export type { MotionProfile };

export const SILK_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface SoulSilkRevealProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  immediate?: boolean;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Tinta sobre papel: revelación sedosa con leve desenfoque óptico y desaceleración larga.
 */
export function SoulSilkReveal({
  children,
  className = "",
  style,
  delay = 0,
  immediate = false,
  as = "div",
}: SoulSilkRevealProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
        : {
            whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
            viewport: { once: true, amount: 0.18 },
          })}
      transition={{
        duration: 0.95,
        ease: SILK_EASE,
        delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}

interface SoulGlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isDark?: boolean;
  motionProfile?: MotionProfile;
  immediate?: boolean;
}

/**
 * Cristal esmerilado y profundidad con coreografía interna escalonada (staggerChildren: 0.14).
 */
export function SoulGlassCard({
  children,
  className = "",
  style,
  isDark = false,
  motionProfile = "cinematic",
  immediate = false,
}: SoulGlassCardProps) {
  const glassSurfaceClasses = isDark
    ? "bg-black/55 backdrop-blur-md border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.38)]"
    : "bg-white/75 backdrop-blur-md border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.06)]";

  const containerTransition =
    motionProfile === "editorial"
      ? {
          type: "spring" as const,
          stiffness: 60,
          damping: 22,
          staggerChildren: 0.14,
        }
      : motionProfile === "festive"
      ? {
          type: "spring" as const,
          stiffness: 85,
          damping: 16,
          staggerChildren: 0.14,
        }
      : {
          duration: 0.9,
          ease: SILK_EASE,
          staggerChildren: 0.14,
        };

  return (
    <motion.div
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, amount: 0.18 } })}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: containerTransition,
        },
      }}
      className={`${glassSurfaceClasses} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SoulGlassItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SoulGlassItem({
  children,
  className = "",
  style,
}: SoulGlassItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.72,
            ease: SILK_EASE,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SoulKenBurnsProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  eager?: boolean;
}

/**
 * Fotografía con respiración viva continua e imperceptible (16s ciclo orgánico).
 */
export function SoulKenBurns({
  src,
  alt,
  className = "",
  style,
  eager = true,
}: SoulKenBurnsProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      initial={{ scale: 1, y: 0 }}
      animate={{ scale: 1.07, y: -8 }}
      transition={{
        duration: 16,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className={`h-full w-full object-cover will-change-transform ${className}`}
      style={style}
    />
  );
}

interface SoulScrollTimelineProps {
  children: React.ReactNode;
  accentColor: string;
  baseColor: string;
  className?: string;
  /** Rail left offset on mobile vs centered on sm+ (matches alternating layout) */
  centeredOnDesktop?: boolean;
}

/**
 * Hilo conductor del itinerario conectado al scroll real (useScroll + useSpring).
 */
export function SoulScrollTimeline({
  children,
  accentColor,
  baseColor,
  className = "",
  centeredOnDesktop = true,
}: SoulScrollTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 82%", "end 45%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const railPositionClasses = centeredOnDesktop
    ? "left-[11px] sm:left-1/2 sm:-translate-x-1/2"
    : "left-[11px]";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Base subtle guide rail */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-2 top-2 w-[1.5px] opacity-40 ${railPositionClasses}`}
        style={{ backgroundColor: baseColor }}
      />
      {/* Live-drawn golden/accent thread */}
      <motion.div
        aria-hidden="true"
        style={{
          scaleY: smoothProgress,
          originY: 0,
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}55`,
        }}
        className={`pointer-events-none absolute bottom-2 top-2 w-[2px] rounded-full ${railPositionClasses}`}
      />
      {children}
    </div>
  );
}

interface SoulTimelineDotProps {
  accentColor: string;
  surfaceColor: string;
  index?: number;
  className?: string;
}

export function SoulTimelineDot({
  accentColor,
  surfaceColor,
  index = 0,
  className = "",
}: SoulTimelineDotProps) {
  return (
    <motion.span
      initial={{ scale: 0.65, opacity: 0.45 }}
      whileInView={{ scale: 1.15, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.05, 0.25), ease: SILK_EASE }}
      className={`absolute -left-[19px] top-4 z-10 h-3 w-3 rounded-full border-2 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 ${className}`}
      style={{
        backgroundColor: accentColor,
        borderColor: surfaceColor,
        boxShadow: `0 0 0 4px ${accentColor}22`,
      }}
    />
  );
}

interface SoulParallaxBackdropProps {
  children: React.ReactNode;
  className?: string;
  range?: number;
}

/**
 * Capa atmosférica/botánica con parallax vertical real (-25px a +25px) vinculado al scroll.
 */
export function SoulParallaxBackdrop({
  children,
  className = "",
  range = 25,
}: SoulParallaxBackdropProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
