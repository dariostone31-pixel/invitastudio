import React, { useId } from "react";
import type { LayoutId } from "@/templates/catalog";

interface CornerOrnamentsProps {
  color: string;
  layoutId?: LayoutId;
}

export function CornerOrnaments({ color, layoutId = "fullscreen-hero" }: CornerOrnamentsProps) {
  // Diarios y tickets conservan su propia retícula impresa/perforada sin esquinas ornamentales
  if (layoutId === "diario-editorial" || layoutId === "ticket-vip" || layoutId === "infantil-animado") {
    return null;
  }

  const isEditorialPaper = layoutId === "editorial-sobre";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-4 z-10">
      {[
        "left-2 top-2",
        "right-2 top-2 rotate-90",
        "bottom-2 left-2 -rotate-90",
        "bottom-2 right-2 rotate-180",
      ].map((pos) => (
        <svg
          key={pos}
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className={`absolute opacity-65 ${pos}`}
        >
          <path d="M2 22V6a4 4 0 0 1 4-4h16" />
          {isEditorialPaper && <path d="M7 14c2-3.5 5-6 8.5-7" />}
        </svg>
      ))}
    </div>
  );
}

export function CircularSaveSeal({
  text = "INVITACIÓN DIGITAL · AR · ",
  monogram,
  color,
}: {
  text?: string;
  monogram: string;
  color: string;
}) {
  const uid = useId().replace(/:/g, "");
  const pathId = `sealCircle-${uid}`;

  return (
    <div className="relative mx-auto mt-3 flex h-[72px] w-[72px] items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full opacity-85"
        aria-hidden="true"
      >
        <defs>
          <path
            id={pathId}
            d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          />
        </defs>
        <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="50" cy="50" r="24" fill="none" stroke={color} strokeOpacity="0.22" strokeWidth="0.9" />
        <text
          fill={color}
          fontSize="9.4"
          fontWeight="600"
          letterSpacing="2.2"
        >
          <textPath href={`#${pathId}`}>{text}</textPath>
        </text>
      </svg>
      <span
        className="font-display-cormorant absolute text-[13px] font-semibold leading-none tracking-wide"
        style={{ color }}
      >
        {monogram}
      </span>
    </div>
  );
}
