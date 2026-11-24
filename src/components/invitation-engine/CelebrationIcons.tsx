import React from "react";
import type { EventCategory, LayoutId } from "@/templates/catalog";

interface CelebrationIconProps {
  className?: string;
  style?: React.CSSProperties;
  category?: EventCategory;
  skinId?: string;
  layoutId?: LayoutId;
}

/**
 * Medallón editorial animado adaptable al layout:
 * - editorial-sobre: doble anillo botánico con halo suave
 * - fullscreen-hero: aro fino arquitectónico
 * - neon-dark: insignia angular nocturna con brillo sutil
 * - ticket-vip: sello perforado tipo boarding/acceso
 * - diario-editorial: sello editorial cuadrado de doble línea
 * - infantil-animado: nube / insignia lúdica suave
 */
export function AnimatedSectionMedallion({
  accentColor,
  surfaceColor,
  layoutId = "editorial-sobre",
  children,
}: {
  accentColor: string;
  surfaceColor: string;
  layoutId?: LayoutId;
  children: React.ReactNode;
}) {
  if (layoutId === "diario-editorial") {
    return (
      <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 border"
          style={{ borderColor: accentColor }}
        />
        <span
          className="relative flex h-12 w-12 items-center justify-center border-2"
          style={{
            backgroundColor: surfaceColor,
            borderColor: accentColor,
            color: accentColor,
          }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (layoutId === "ticket-vip") {
    return (
      <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="anim-badge-halo pointer-events-none absolute inset-0 rounded-2xl border border-dashed"
          style={{
            borderColor: accentColor,
            backgroundColor: `${accentColor}10`,
          }}
        />
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: surfaceColor,
            borderColor: `${accentColor}66`,
            color: accentColor,
          }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (layoutId === "neon-dark") {
    return (
      <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="anim-badge-halo pointer-events-none absolute inset-0.5 rotate-45 rounded-2xl border"
          style={{
            borderColor: `${accentColor}70`,
            boxShadow: `0 0 18px -4px ${accentColor}55`,
          }}
        />
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border"
          style={{
            backgroundColor: surfaceColor,
            borderColor: accentColor,
            color: accentColor,
            boxShadow: `inset 0 0 12px -4px ${accentColor}44`,
          }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (layoutId === "infantil-animado") {
    return (
      <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="anim-badge-halo pointer-events-none absolute inset-0 rounded-[22px] border-2"
          style={{
            borderColor: `${accentColor}55`,
            backgroundColor: `${accentColor}18`,
          }}
        />
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-[18px] border-2 shadow-sm"
          style={{
            backgroundColor: surfaceColor,
            borderColor: accentColor,
            color: accentColor,
          }}
        >
          {children}
        </span>
      </div>
    );
  }

  if (layoutId === "fullscreen-hero") {
    return (
      <div className="relative mx-auto inline-flex h-14 w-14 items-center justify-center">
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-full border"
          style={{
            backgroundColor: surfaceColor,
            borderColor: `${accentColor}55`,
            color: accentColor,
            boxShadow: `0 8px 24px -10px ${accentColor}44`,
          }}
        >
          {children}
        </span>
      </div>
    );
  }

  return (
    <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center">
      <span
        aria-hidden="true"
        className="anim-badge-halo pointer-events-none absolute inset-0 rounded-full border"
        style={{
          borderColor: accentColor,
          backgroundColor: `${accentColor}12`,
        }}
      />
      <span
        className="relative flex h-12 w-12 items-center justify-center rounded-full border shadow-sm"
        style={{
          backgroundColor: surfaceColor,
          borderColor: `${accentColor}55`,
          color: accentColor,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Regalo temático:
 * - Boda / XV / Clásico: caja editorial con tapa y lazo suave
 * - Niños / Niñas / Bebé: globo + estrella o caja festiva
 * - Hombres / Nocturno: sobre / tarjeta de regalo minimal
 */
export function CelebrationGiftIcon({
  className = "h-8 w-8",
  style,
  category,
  skinId,
}: CelebrationIconProps) {
  if (category === "nino" || category === "nina" || category === "bautismo") {
    const isSpace = skinId?.includes("espacio");
    if (isSpace) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <circle cx="12" cy="12" r="5.5" className="anim-draw-primary" />
          <ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-18 12 12)" className="anim-draw-secondary anim-breath-motion" />
          <path d="M18.5 5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" className="anim-adult-spark" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <rect x="4.5" y="11" width="15" height="9.5" rx="2" className="anim-draw-primary" />
        <path d="M12 11v9.5" className="anim-draw-secondary" />
        <g className="anim-gift-lid">
          <rect x="3.5" y="7" width="17" height="4" rx="1.2" />
          <path d="M12 7c-1.4-2.5-4.4-2.4-4.4-.5 0 1.2 1.8.5 4.4.5z" />
          <path d="M12 7c1.4-2.5 4.4-2.4 4.4-.5 0 1.2-1.8.5-4.4.5z" />
        </g>
        <path d="M19.5 3.5v2M18.5 4.5h2" className="anim-toast-spark" />
      </svg>
    );
  }

  if (category === "hombre") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" className="anim-draw-primary" />
        <path d="M3 10h18" className="anim-draw-secondary" />
        <path d="M7.5 14.5h4" className="anim-draw-accent" />
        <g className="anim-adult-spark">
          <circle cx="16.5" cy="14.5" r="1.4" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="1.5" className="anim-draw-primary" />
      <path d="M12 11v10" className="anim-draw-secondary" />
      <g className="anim-gift-lid">
        <rect x="3" y="7" width="18" height="4" rx="1" />
        <path d="M12 7v4" />
        <path d="M12 7c-1.4-2.5-4.5-2.5-4.5-.6 0 1.2 1.8.6 4.5.6z" />
        <path d="M12 7c1.4-2.5 4.5-2.5 4.5-.6 0 1.2-1.8.6-4.5.6z" />
      </g>
    </svg>
  );
}

/**
 * Ícono de Historia / Celebración (ya NO usa copas en niños o bebés):
 * - Boda: dos copas de brindis suaves
 * - XV: estrella brillante / destello gala
 * - Hombre: disco vinilo / lounge
 * - Niño / Niña: globos festivos o estrella mágica
 * - Bautismo: ramita de olivo y corazón
 */
export function CelebrationStoryIcon({
  className = "h-8 w-8",
  style,
  category,
  skinId,
}: CelebrationIconProps) {
  if (category === "nino" || category === "nina") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-breath-motion">
          <path d="M8.5 13c-2.3 0-4-1.9-4-4.3C4.5 6.1 6.3 4 8.5 4s4 2.1 4 4.7c0 2.4-1.7 4.3-4 4.3z" className="anim-draw-primary" />
          <path d="M8.5 13v7" className="anim-draw-secondary" />
        </g>
        <g className="anim-crown-motion">
          <path d="M16 14.5c-2 0-3.5-1.6-3.5-3.7 0-2.2 1.5-4 3.5-4s3.5 1.8 3.5 4c0 2.1-1.5 3.7-3.5 3.7z" className="anim-draw-secondary" />
          <path d="M16 14.5l-.8 5.5" className="anim-draw-accent" />
        </g>
      </svg>
    );
  }

  if (category === "bautismo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <path d="M6.5 15.5A4 4 0 0 1 7.5 8a4.8 4.8 0 0 1 9.2 1.2A3.5 3.5 0 0 1 17.5 16H7a3 3 0 0 1-.5-.5z" className="anim-draw-primary" />
        <g className="anim-wish-heart">
          <path d="M12 13.8s-2.2-1.4-2.2-2.8a1.25 1.25 0 0 1 2.2-.8 1.25 1.25 0 0 1 2.2.8c0 1.4-2.2 2.8-2.2 2.8z" />
        </g>
      </svg>
    );
  }

  if (category === "hombre") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-vinyl-motion">
          <circle cx="12" cy="12" r="8.5" className="anim-draw-primary" />
          <circle cx="12" cy="12" r="4.8" strokeOpacity="0.45" />
          <circle cx="12" cy="12" r="1.8" />
        </g>
      </svg>
    );
  }

  if (category === "xv") {
    if (skinId?.includes("mariposa")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-wing-motion">
            <path d="M12 11C9.5 6 4 5.5 4 9.5c0 2.5 2.8 4 5 4-2 1-3 3.5-1 5 2 1.4 4-.8 4-3.5z" className="anim-draw-primary" />
            <path d="M12 11c2.5-5 8-5.5 8-1.5 0 2.5-2.8 4-5 4 2 1 3 3.5 1 5-2 1.4-4-.8-4-3.5z" className="anim-draw-secondary" />
          </g>
          <path d="M12 6v12" className="anim-draw-accent" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-crown-motion">
          <path d="M12 3.5l2.2 5.4L20 10.5l-4.5 3.6 1.4 5.9L12 16.8 7.1 20l1.4-5.9L4 10.5l5.8-1.6L12 3.5z" className="anim-draw-primary" />
        </g>
        <path d="M19.5 4v2M18.5 5h2" className="anim-toast-spark" />
      </svg>
    );
  }

  return <CelebrationToastIcon className={className} style={style} />;
}

/**
 * Copas / Fiesta: dos copas en <g> separados con destello superior suave.
 */
export function CelebrationToastIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g className="anim-cup-left">
        <path d="M5.5 5h5l-.6 4.8a2.5 2.5 0 0 1-4.8-.6L5.5 5z" className="anim-draw-primary" />
        <path d="M7.6 12.2l-.6 6.8M5 19h4.2" className="anim-draw-secondary" />
      </g>
      <g className="anim-cup-right">
        <path d="M13.5 5h5l.4 4.2a2.5 2.5 0 0 1-4.8.6L13.5 5z" className="anim-draw-primary" />
        <path d="M16.4 12.2l.6 6.8M14.8 19H19" className="anim-draw-secondary" />
      </g>
      <path className="anim-toast-spark" d="M12 2.5v1.8M10.2 3.4l.7 1.1M13.8 3.4l-.7 1.1" />
    </svg>
  );
}

/**
 * Cámara / Recuerdos temáticos
 */
export function CelebrationCameraIcon({
  className = "h-8 w-8",
  style,
  category,
}: CelebrationIconProps) {
  if (category === "nino" || category === "nina") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <rect x="3.5" y="6.5" width="17" height="12.5" rx="3" className="anim-draw-primary" />
        <circle cx="12" cy="12.8" r="3.4" className="anim-draw-secondary" />
        <g className="anim-camera-flash">
          <path d="M17 9.5h.01" strokeWidth={2.3} />
          <path d="M7 4l1 1.5M17 4l-1 1.5" />
        </g>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M4 8.5a2 2 0 0 1 2-2h2.2l1.4-2h4.8l1.4 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" className="anim-draw-primary" />
      <circle cx="12" cy="13" r="3.4" className="anim-draw-secondary" />
      <g className="anim-camera-flash">
        <path d="M17.2 9.5h.01" strokeWidth={2.2} />
        <path d="M19.5 3.5v2M18.5 4.5h2" />
      </g>
    </svg>
  );
}

/**
 * Confirmación: círculo dibujado + check progresivo
 */
export function CelebrationCheckIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" className="anim-draw-primary" />
      <path className="anim-check-draw" d="M8.2 12.4l2.6 2.6 5.4-5.8" />
    </svg>
  );
}

/**
 * Vestimenta temática:
 * - Boda / XV: percha gala / diamante
 * - Hombre: moño / corbata elegante
 * - Niños / Niñas / Bebé: estrella + remera cómoda / corona festiva
 */
export function CelebrationAttireIcon({
  className = "h-8 w-8",
  style,
  category,
}: CelebrationIconProps) {
  if (category === "hombre") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-breath-motion">
          <path d="M4.5 8.5l6.5 3.5-6.5 3.5V8.5z" className="anim-draw-primary" />
          <path d="M19.5 8.5L13 12l6.5 3.5V8.5z" className="anim-draw-secondary" />
          <circle cx="12" cy="12" r="1.8" className="anim-draw-accent" />
        </g>
      </svg>
    );
  }
  if (category === "nino" || category === "nina" || category === "bautismo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-attire-sway">
          <path d="M8.5 5.5a3.5 3.5 0 0 0 7 0l3.5 2-1.5 3.5-2-1V19.5H8.5V10l-2 1L5 7.5l3.5-2z" className="anim-draw-primary" />
          <path d="M12 11.5l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2.7-1.4z" className="anim-draw-accent" />
        </g>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 3a1.5 1.5 0 0 1 1.3 2.2L12 7" className="anim-draw-secondary" />
      <g className="anim-attire-sway">
        <path d="M12 7L4.5 11.5l1.5 2 2-1V20h8v-7.5l2 1 1.5-2L12 7z" className="anim-draw-primary" />
      </g>
    </svg>
  );
}

/**
 * Ubicación decorativa con onda expansiva suave en el suelo
 */
export function CelebrationPinIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="20.2" rx="4.5" ry="1.3" opacity="0.55" className="anim-ripple-ring" />
      <g className="anim-pin-drop">
        <path d="M12 18.5s5.5-5 5.5-9.2a5.5 5.5 0 1 0-11 0c0 4.2 5.5 9.2 5.5 9.2z" className="anim-draw-primary" />
        <circle cx="12" cy="9.3" r="2" className="anim-draw-secondary" />
      </g>
    </svg>
  );
}

/**
 * Buenos deseos / Libro de firmas temático
 */
export function CelebrationWishesIcon({
  className = "h-8 w-8",
  style,
  category,
}: CelebrationIconProps) {
  const isPlayful = category === "nino" || category === "nina";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5v-8z" className="anim-draw-primary" />
      <g className="anim-wish-heart">
        {isPlayful ? (
          <path d="M12 7.2l1.1 2.2 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4L12 7.2z" />
        ) : (
          <path d="M12 13.5s-3.2-2-3.2-4.1a1.8 1.8 0 0 1 3.2-1.1 1.8 1.8 0 0 1 3.2 1.1c0 2.1-3.2 4.1-3.2 4.1z" />
        )}
      </g>
    </svg>
  );
}

/**
 * Ícono protagonista de cada diseño (diferenciado por categoría y skinId específico!)
 */
export function CelebrationCeremonyIcon({
  category = "boda",
  skinId,
  className = "h-8 w-8",
  style,
}: CelebrationIconProps & { category?: EventCategory }) {
  // 1. BODAS
  if (category === "boda") {
    if (skinId === "boda-botanica-eucalipto" || skinId === "boda-boho-pampas") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-breath-motion">
            <path d="M4 19C8 15 13 9 19 4" className="anim-draw-primary" />
            <path d="M9 14c-3-.5-5-2.5-5-5 2.5 0 4.5 2 5 5z" className="anim-draw-secondary" />
            <path d="M14 9c.5-3 2.5-5 5-5 0 2.5-2 4.5-5 5z" className="anim-draw-secondary" />
            <path d="M13 13c3 .5 5 2.5 5 5-2.5 0-4.5-2-5-5z" className="anim-draw-accent" />
          </g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <circle cx="9.2" cy="13.5" r="4.8" className="anim-draw-primary" />
        <circle cx="14.8" cy="13.5" r="4.8" className="anim-draw-secondary" />
        <g className="anim-toast-spark">
          <path d="M12 4l1.2 2L12 8l-1.2-2L12 4z" />
        </g>
      </svg>
    );
  }

  // 2. XV AÑOS
  if (category === "xv") {
    if (skinId?.includes("mariposa")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-wing-motion">
            <path d="M12 11C9.5 6 4 5.5 4 9.5c0 2.5 2.8 4 5 4-2 1-3 3.5-1 5 2 1.4 4-.8 4-3.5z" className="anim-draw-primary" />
            <path d="M12 11c2.5-5 8-5.5 8-1.5 0 2.5-2.8 4-5 4 2 1 3 3.5 1 5-2 1.4-4-.8-4-3.5z" className="anim-draw-secondary" />
          </g>
          <path d="M12 6v12" className="anim-draw-accent" />
        </svg>
      );
    }
    if (skinId === "xv-neon-boliche" || skinId === "xv-festival-pass") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" className="anim-draw-primary" />
          <ellipse cx="12" cy="12" rx="3.2" ry="7.5" className="anim-draw-secondary" />
          <path d="M4.5 12h15" className="anim-draw-accent" />
          <g className="anim-toast-spark">
            <path d="M19 3.5v2M18 4.5h2M5 18.5v2M4 19.5h2" />
          </g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-crown-motion">
          <path d="M3.5 17.5L5.2 8.5l4.2 3.8L12 6.5l2.6 5.8 4.2-3.8 1.7 9H3.5z" className="anim-draw-primary" />
          <path d="M5 20h14" className="anim-draw-secondary" />
        </g>
      </svg>
    );
  }

  // 3. HOMBRES & 18 AÑOS
  if (category === "hombre") {
    if (skinId === "hombre-estadio-vip") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-crown-motion">
            <path d="M7 5h10v5a5 5 0 0 1-10 0V5z" className="anim-draw-primary" />
            <path d="M7 7H4.5a1.5 1.5 0 0 0-1.5 1.5v1A3 3 0 0 0 6 12.5M17 7h2.5A1.5 1.5 0 0 1 21 8.5v1a3 3 0 0 1-3 3" className="anim-draw-secondary" />
            <path d="M12 15v4M8.5 19h7" className="anim-draw-accent" />
          </g>
        </svg>
      );
    }
    if (skinId === "hombre-gaming-cyber") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <rect x="3" y="7" width="18" height="10" rx="4" className="anim-draw-primary" />
          <path d="M7.5 10v4M5.5 12h4" className="anim-draw-secondary" />
          <circle cx="15" cy="11" r="1" className="anim-adult-spark" />
          <circle cx="17.5" cy="13" r="1" className="anim-adult-spark" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-breath-motion">
          <path d="M6.5 6h11l-1 11.5a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L6.5 6z" className="anim-draw-primary" />
          <path d="M7.3 12.5h9.4" className="anim-draw-secondary" />
        </g>
        <path d="M18.5 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" className="anim-adult-spark" />
      </svg>
    );
  }

  // 4. NIÑOS (personalizado por temática)
  if (category === "nino") {
    if (skinId === "nino-espacio-cohete") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-rocket-motion">
            <path d="M14.5 4.5c3 0 5 2 5 5 0 3.5-3 6.5-6.5 8l-5-5c1.5-3.5 4.5-8 6.5-8z" className="anim-draw-primary" />
            <circle cx="14" cy="9.5" r="1.6" className="anim-draw-secondary" />
            <path d="M8 12.5l-3.5 1 2 2.5M11.5 16l-1 3.5-2.5-2" className="anim-draw-accent" />
          </g>
          <path d="M5 19l2-2" className="anim-toast-spark" />
        </svg>
      );
    }
    if (skinId === "nino-campeones-ticket") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-crown-motion">
            <circle cx="12" cy="12" r="8.5" className="anim-draw-primary" />
            <polygon points="12,7.5 15.5,10 14,14 10,14 8.5,10" className="anim-draw-secondary" />
          </g>
        </svg>
      );
    }
    if (skinId === "nino-pixel-gamer" || skinId === "nino-super-comic") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-breath-motion">
            <path d="M13 3L5.5 13h6l-1 8L18.5 11h-6L13 3z" className="anim-draw-primary" />
          </g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-crown-motion">
          <path d="M12 3.5l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8L12 3.5z" className="anim-draw-primary" />
        </g>
      </svg>
    );
  }

  // 5. NIÑAS (personalizado por temática)
  if (category === "nina") {
    if (skinId === "nina-sirena-coral") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-breath-motion">
            <path d="M12 19c-4.5 0-8-2.8-8-7 0-4.2 3.5-7 8-7s8 2.8 8 7c0 4.2-3.5 7-8 7z" className="anim-draw-primary" />
            <path d="M12 5v14M8 6.5L11 18M16 6.5L13 18" className="anim-draw-secondary" />
          </g>
        </svg>
      );
    }
    if (skinId === "nina-arcoiris-boho") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-breath-motion">
            <path d="M4 17a8 8 0 0 1 16 0" className="anim-draw-primary" />
            <path d="M7.2 17a4.8 4.8 0 0 1 9.6 0" className="anim-draw-secondary" />
            <path d="M10.4 17a1.6 1.6 0 0 1 3.2 0" className="anim-draw-accent" />
          </g>
        </svg>
      );
    }
    if (skinId === "nina-pop-star") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
          <g className="anim-crown-motion">
            <circle cx="15" cy="7.5" r="3.2" className="anim-draw-primary" />
            <path d="M12.5 10l-6.5 6.5 2 2L14.5 12" className="anim-draw-secondary" />
            <path d="M5 19.5l1.5-1.5" className="anim-draw-accent" />
          </g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-crown-motion">
          <path d="M4 17.5L5.8 9l4 3.5L12 6.8l2.2 5.7 4-3.5 1.8 8.5H4z" className="anim-draw-primary" />
        </g>
        <path d="M18.5 4.2l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3z" className="anim-adult-spark" />
      </svg>
    );
  }

  // 6. BAUTISMOS & BEBÉ
  if (skinId?.includes("osito") || skinId?.includes("nubes")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        <g className="anim-breath-motion">
          <path d="M15.5 14.5A6 6 0 0 1 9.5 6a6 6 0 1 0 9 7.8 4.8 4.8 0 0 1-3 .7z" className="anim-draw-primary" />
        </g>
        <path d="M17.5 4.5l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3z" className="anim-toast-spark" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M5 20V11a7 7 0 0 1 14 0v9" className="anim-draw-primary" />
      <path d="M3 20h18" className="anim-draw-secondary" />
      <g className="anim-toast-spark">
        <path d="M12 7.5v3M10.5 9h3" />
      </g>
    </svg>
  );
}

/**
 * Solo Adultos: copa elegante con destello estelar sutil.
 */
export function CelebrationAdultsIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M8 4h8l-1 6a3 3 0 0 1-6 0L8 4z" className="anim-draw-primary" />
      <path d="M12 13v7M9 20h6" className="anim-draw-secondary" />
      <g className="anim-adult-spark">
        <path d="M18.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" />
      </g>
    </svg>
  );
}

/**
 * Valor de Tarjeta: ticket / pase con detalle de estrella o moneda
 */
export function CelebrationTicketPriceIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4V7.5z"
        className="anim-draw-primary"
      />
      <path d="M10 6v12" strokeDasharray="2 2" className="anim-draw-secondary" />
      <g className="anim-breath-motion">
        <path d="M15 9.8v4.4M13.5 11.2h3" className="anim-draw-accent" />
      </g>
    </svg>
  );
}
