"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

interface ParticleSpec {
  id: number;
  left: string;
  top: string;
  size: number;
  isStar?: boolean;
  duration: number;
  delay: number;
  driftY: number;
  driftX: number;
  opacityMax: number;
}

const GOLD_PARTICLES: ParticleSpec[] = [
  { id: 1, left: "7%", top: "16%", size: 5, isStar: true, duration: 7.5, delay: 0, driftY: -18, driftX: 8, opacityMax: 0.7 },
  { id: 2, left: "16%", top: "68%", size: 4, duration: 9, delay: 0.8, driftY: -22, driftX: -6, opacityMax: 0.5 },
  { id: 3, left: "26%", top: "24%", size: 3.5, duration: 8.2, delay: 1.4, driftY: -14, driftX: 10, opacityMax: 0.55 },
  { id: 4, left: "34%", top: "82%", size: 6, isStar: true, duration: 10.5, delay: 0.4, driftY: -24, driftX: 7, opacityMax: 0.6 },
  { id: 5, left: "46%", top: "14%", size: 4, duration: 8.8, delay: 2.1, driftY: -16, driftX: -9, opacityMax: 0.48 },
  { id: 6, left: "53%", top: "48%", size: 5, isStar: true, duration: 9.5, delay: 1.1, driftY: -20, driftX: 8, opacityMax: 0.58 },
  { id: 7, left: "62%", top: "18%", size: 3.5, duration: 7.8, delay: 0.3, driftY: -15, driftX: -7, opacityMax: 0.5 },
  { id: 8, left: "71%", top: "76%", size: 4.5, duration: 9.2, delay: 1.7, driftY: -19, driftX: 9, opacityMax: 0.55 },
  { id: 9, left: "82%", top: "15%", size: 6, isStar: true, duration: 10, delay: 0.6, driftY: -22, driftX: -8, opacityMax: 0.65 },
  { id: 10, left: "91%", top: "38%", size: 4, duration: 8.4, delay: 2.4, driftY: -17, driftX: -6, opacityMax: 0.5 },
  { id: 11, left: "88%", top: "72%", size: 5.5, isStar: true, duration: 11, delay: 1.3, driftY: -20, driftX: 6, opacityMax: 0.6 },
  { id: 12, left: "12%", top: "42%", size: 3, duration: 7.4, delay: 2.8, driftY: -14, driftX: 6, opacityMax: 0.45 },
  { id: 13, left: "57%", top: "84%", size: 3.5, duration: 8.6, delay: 0.9, driftY: -16, driftX: -5, opacityMax: 0.48 },
  { id: 14, left: "76%", top: "46%", size: 3, duration: 9.8, delay: 1.9, driftY: -18, driftX: 7, opacityMax: 0.45 },
];

export function InteractiveHeroSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mouseX = useMotionValue(520);
  const mouseY = useMotionValue(260);

  const smoothX = useSpring(mouseX, { stiffness: 95, damping: 24, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 95, damping: 24, mass: 0.6 });

  const champagneHalo = useMotionTemplate`radial-gradient(560px circle at ${smoothX}px ${smoothY}px, rgba(226, 193, 128, 0.28), rgba(244, 226, 190, 0.16) 42%, transparent 74%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b border-[#C89B54]/20 bg-[#FAF7F2]"
    >
      {/* Ambient luminous ivory + soft champagne gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_18%_12%,rgba(255,253,248,0.95),transparent_65%),radial-gradient(ellipse_60%_55%_at_84%_22%,rgba(232,206,154,0.22),transparent_65%),radial-gradient(ellipse_55%_45%_at_50%_95%,rgba(243,232,213,0.45),transparent_70%)]"
      />

      {/* Mouse-following soft champagne halo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: champagneHalo }}
      />

      {/* Slowly drifting golden micro-particles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {GOLD_PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            style={{ left: p.left, top: p.top }}
            initial={{ opacity: p.opacityMax * 0.45, y: 0, x: 0, scale: 0.9 }}
            animate={{
              y: [0, p.driftY, 0],
              x: [0, p.driftX, 0],
              opacity: [p.opacityMax * 0.35, p.opacityMax, p.opacityMax * 0.35],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute"
          >
            {p.isStar ? (
              <svg
                width={p.size * 2.2}
                height={p.size * 2.2}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4L8 0Z"
                  fill="#C89B54"
                  fillOpacity="0.72"
                />
              </svg>
            ) : (
              <span
                className="block rounded-full bg-[#C89B54]"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  boxShadow: "0 0 10px rgba(200, 155, 84, 0.55)",
                }}
              />
            )}
          </motion.span>
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-9 sm:px-6 lg:pb-16 lg:pt-14">
        {children}
      </div>
    </section>
  );
}
