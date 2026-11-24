import React from "react";

interface BrandLogoProps {
  size?: "md" | "sm";
  className?: string;
}

/**
 * Isotipo SVG minimalista + wordmark editorial para "Invita con Alma".
 * Combina un sobre estilizado de líneas finas con un sello/destello dorado central.
 */
export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const iconBox = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize =
    size === "sm"
      ? "text-[22px] sm:text-[24px]"
      : "text-[25px] sm:text-[27px]";

  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative flex ${iconBox} flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/45 bg-[#FFFBFA] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-[#6B1E30]/50 group-hover:shadow-[0_6px_18px_-6px_rgba(107,30,48,0.45)]`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className="h-[19px] w-[19px]"
        >
          {/* Minimalist envelope frame */}
          <rect
            x="3.5"
            y="6.5"
            width="21"
            height="15"
            rx="3.2"
            stroke="#6B1E30"
            strokeWidth="1.45"
          />
          {/* Flap lines */}
          <path
            d="M4.5 8L14 15.2L23.5 8"
            stroke="#6B1E30"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wax seal / soul spark accent */}
          <circle
            cx="14"
            cy="15.2"
            r="2.4"
            fill="#FFFBFA"
            stroke="#B78A4E"
            strokeWidth="1.4"
          />
          <circle cx="14" cy="15.2" r="0.85" fill="#B78A4E" />
        </svg>
      </span>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={`font-display-cormorant ${textSize} font-semibold italic tracking-tight text-[#6B1E30]`}
        >
          Invita
        </span>
        <span
          className={`font-display-cormorant ${textSize} font-semibold italic tracking-tight text-[#B78A4E]`}
        >
          con Alma
        </span>
      </span>
    </span>
  );
}
