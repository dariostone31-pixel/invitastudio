import React from "react";

interface BrandLogoProps {
  size?: "md" | "sm";
  showTagline?: boolean;
  className?: string;
}

/**
 * Lockup editorial "Invita con Alma":
 * Emblema oficial en medallón borgoña/oro + wordmark tipográfico unificado.
 */
export function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  const isSm = size === "sm";

  const sealBox = isSm
    ? "h-10 w-10 rounded-[13px] p-1"
    : "h-11 w-11 sm:h-12 sm:w-12 rounded-[14px] p-1";

  const wordmarkSize = isSm
    ? "text-[22px] sm:text-[24px]"
    : "text-[23px] sm:text-[27px]";

  const subSize = isSm
    ? "text-[8px] tracking-[0.24em]"
    : "text-[8px] sm:text-[8.5px] tracking-[0.26em]";

  return (
    <span
      className={`group inline-flex flex-shrink-0 items-center gap-2.5 sm:gap-3 ${className}`}
    >
      {/* Jewel seal medallion hosting the bespoke gold & crimson emblem */}
      <span
        className={`relative flex ${sealBox} flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B0C16] via-[#441322] to-[#1A070D] ring-1 ring-[#B78A4E]/65 shadow-[0_10px_22px_-10px_rgba(74,20,32,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-300 group-hover:scale-[1.04] group-hover:ring-[#D4A55D] group-hover:shadow-[0_12px_26px_-8px_rgba(107,30,48,0.65)]`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(231,175,192,0.22),transparent_62%)]"
        />
        <img
          src="/images/brand/invita-con-alma-logo.webp"
          alt="Emblema Invita con Alma"
          width={48}
          height={48}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
        />
      </span>

      {/* Unified editorial wordmark (no separated blocks) */}
      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-display-cormorant ${wordmarkSize} inline-flex items-baseline whitespace-nowrap font-semibold leading-none tracking-[-0.025em]`}
        >
          <span className="text-[#2A121B]">Invita</span>
          <span className="ml-[0.16em] font-medium italic text-[#9C6F34]">con</span>
          <span className="ml-[0.20em] italic text-[#6B1E30]">Alma</span>
        </span>

        {showTagline && (
          <span
            className={`font-ui-jost mt-1 flex items-center gap-1.5 whitespace-nowrap font-semibold uppercase leading-none text-[#8F6532] ${subSize}`}
          >
            <span
              aria-hidden="true"
              className="inline-block h-px w-2.5 bg-[#B78A4E]/70"
            />
            <span>Invitaciones de Autor</span>
          </span>
        )}
      </span>
    </span>
  );
}
