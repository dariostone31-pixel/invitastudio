import React from "react";
import { EventCategory, LayoutId } from "@/templates/catalog";

interface AmbientParticlesProps {
  category: EventCategory;
  layoutId: LayoutId;
  color: string;
}

const PARTICLES = [
  { left: "8%", delay: "0s", duration: "11s", size: 10 },
  { left: "22%", delay: "3.2s", duration: "14s", size: 8 },
  { left: "38%", delay: "1.5s", duration: "12.5s", size: 11 },
  { left: "56%", delay: "4.8s", duration: "13s", size: 9 },
  { left: "74%", delay: "2.1s", duration: "11.5s", size: 10 },
  { left: "89%", delay: "5.5s", duration: "14.5s", size: 8 },
];

export function AmbientParticles({
  category,
  layoutId,
  color,
}: AmbientParticlesProps) {
  const isStarMode =
    category === "nino" ||
    category === "nina" ||
    layoutId === "neon-dark" ||
    layoutId === "ticket-vip";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 mx-auto max-w-[480px] overflow-hidden"
    >
      {PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="animate-petal-fall absolute -top-6 opacity-0"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            color,
          }}
        >
          {isStarMode ? (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor" opacity="0.55">
              <path d="M12 2l2.1 6.2L20 10l-5.9 1.8L12 18l-2.1-6.2L4 10l5.9-1.8L12 2z" />
            </svg>
          ) : (
            <svg width={p.size + 2} height={p.size + 2} viewBox="0 0 20 20" fill="currentColor" opacity="0.45">
              <path d="M10 2C13 6 16 9 13 14C10 18 7 15 6 11C5 7 7 4 10 2Z" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
