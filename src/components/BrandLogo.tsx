import React from "react";

interface BrandLogoProps {
  size?: "md" | "sm";
  className?: string;
}

/**
 * Isotipo SVG minimalista + wordmark editorial para "Invita con Alma".
 * Escala ampliada (~30% más de presencia) para navbar y footer.
 */
export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const iconBox = size === "sm" ? "h-11 w-11" : "h-12 w-12";
  const svgSize = size === "sm" ? "h-[22px] w-[22px]" : "h-[26px] w-[26px]";
  const textSize =
    size === "sm"
      ? "text-[28px] sm:text-[31px]"
      : "text-[31px] sm:text-[36px]";

  return (
    <span className={`group inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative flex ${iconBox} flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/50 bg-[#FFFBFA] shadow-[0_6px_18px_-8px_rgba(107,30,48,0.28)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#6B1E30]/60 group-hover:shadow-[0_10px_24px_-8px_rgba(107,30,48,0.45)]`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className={svgSize}
        >
          {/* Minimalist envelope frame */}
          <rect
            x="3.2"
            y="6.2"
            width="21.6"
            height="15.6"
            rx="3.4"
            stroke="#6B1E30"
            strokeWidth="1.45"
          />
          {/* Flap lines */}
          <path
            d="M4.3 7.8L14 15.2L23.7 7.8"
            stroke="#6B1E30"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wax seal / soul spark accent */}
          <circle
            cx="14"
            cy="15.2"
            r="2.6"
            fill="#FFFBFA"
            stroke="#B78A4E"
            strokeWidth="1.45"
          />
          <circle cx="14" cy="15.2" r="0.95" fill="#B78A4E" />
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
