import React from "react";

interface BrandLogoProps {
  size?: "md" | "sm";
  showTagline?: boolean;
  className?: string;
}

/**
 * Lockup luminoso "Invita con el Alma":
 * Isotipo SVG sobre luminoso con sello dorado brillante (#C89B54) y detalles en bordó (#6B1E30)
 * sobre fondo claro/transparente + wordmark editorial cohesionado.
 */
export function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  const isSm = size === "sm";

  const iconBox = isSm
    ? "h-10 w-10 rounded-[13px]"
    : "h-11 w-11 sm:h-12 sm:w-12 rounded-[14px]";

  const svgSize = isSm ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10";

  const wordmarkSize = isSm
    ? "text-[21px] sm:text-[23px]"
    : "text-[22px] sm:text-[26px]";

  const subSize = isSm
    ? "text-[7px] sm:text-[7.5px] tracking-[0.16em]"
    : "text-[7px] sm:text-[8px] tracking-[0.16em] sm:tracking-[0.18em]";

  return (
    <span
      className={`group inline-flex flex-shrink-0 items-center gap-2 sm:gap-2.5 ${className}`}
    >
      {/* Luminous light-background emblem (no dark fills) */}
      <span
        className={`relative flex ${iconBox} flex-shrink-0 items-center justify-center border border-[#C89B54]/45 bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F4E9D6]/85 shadow-[0_8px_20px_-10px_rgba(200,155,84,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 group-hover:scale-[1.04] group-hover:border-[#C89B54] group-hover:shadow-[0_10px_24px_-8px_rgba(200,155,84,0.65)]`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className={svgSize}
        >
          <defs>
            <linearGradient
              id="brandEnvelopeGold"
              x1="6"
              y1="10"
              x2="42"
              y2="38"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#E6C37A" />
              <stop offset="50%" stopColor="#C89B54" />
              <stop offset="100%" stopColor="#A67832" />
            </linearGradient>
          </defs>
          {/* Envelope frame */}
          <rect
            x="6.5"
            y="12.5"
            width="35"
            height="24"
            rx="5"
            fill="#FFFDF9"
            fillOpacity="0.9"
            stroke="url(#brandEnvelopeGold)"
            strokeWidth="2.1"
          />
          {/* Flap V-lines */}
          <path
            d="M8.5 15.5L24 27L39.5 15.5"
            stroke="url(#brandEnvelopeGold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle lower fold */}
          <path
            d="M9 33.5L17.8 26.2M39 33.5L30.2 26.2"
            stroke="#C89B54"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Wax seal in burgundy with gold rim */}
          <circle
            cx="24"
            cy="26.2"
            r="5.6"
            fill="#6B1E30"
            stroke="#E6C37A"
            strokeWidth="1.35"
          />
          {/* Heart inside seal */}
          <path
            d="M24 28.9C24 28.9 21.1 27 21.1 25.1C21.1 24.1 21.8 23.4 22.7 23.4C23.3 23.4 23.8 23.8 24 24.2C24.2 23.8 24.7 23.4 25.3 23.4C26.2 23.4 26.9 24.1 26.9 25.1C26.9 27 24 28.9 24 28.9Z"
            fill="#FAF7F2"
          />
          {/* Gold sparkle */}
          <path
            d="M40.5 6.5L41.4 8.8L43.7 9.7L41.4 10.6L40.5 12.9L39.6 10.6L37.3 9.7L39.6 8.8L40.5 6.5Z"
            fill="#C89B54"
          />
        </svg>
      </span>

      {/* Unified tight editorial wordmark */}
      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-display-cormorant ${wordmarkSize} inline-flex items-baseline whitespace-nowrap font-semibold leading-none tracking-[-0.025em]`}
        >
          <span className="text-[#2A121B]">Invita</span>
          <span className="ml-[0.15em] font-medium italic text-[#B3833A]">
            con el
          </span>
          <span className="ml-[0.16em] italic text-[#6B1E30]">Alma</span>
        </span>

        {showTagline && (
          <span
            className={`font-ui-jost mt-1 flex items-center gap-1 whitespace-nowrap font-semibold uppercase leading-none text-[#9B7034] ${subSize}`}
          >
            <span
              aria-hidden="true"
              className="inline-block h-px w-2 bg-[#C89B54]/75"
            />
            <span>Invitaciones Digitales de Studio</span>
          </span>
        )}
      </span>
    </span>
  );
}
