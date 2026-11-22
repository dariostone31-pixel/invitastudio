import React from "react";
import type { EventCategory } from "@/templates/catalog";

interface CelebrationIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Regalo: caja base fija + <g className="anim-gift-lid"> (tapa y lazo) que se eleva levemente y vuelve.
 */
export function CelebrationGiftIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      {/* Caja base + cinta vertical */}
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M12 11v10" />
      {/* Tapa + moño animables */}
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
 * Copas / Fiesta: dos copas en <g> separados que se inclinan y aproximan suavemente.
 */
export function CelebrationToastIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      <g className="anim-cup-left">
        <path d="M5.5 5h5l-.6 4.8a2.5 2.5 0 0 1-4.8-.6L5.5 5z" />
        <path d="M7.6 12.2l-.6 6.8" />
        <path d="M5 19h4.2" />
      </g>
      <g className="anim-cup-right">
        <path d="M13.5 5h5l.4 4.2a2.5 2.5 0 0 1-4.8.6L13.5 5z" />
        <path d="M16.4 12.2l.6 6.8" />
        <path d="M14.8 19H19" />
      </g>
      <path className="anim-toast-spark" d="M12 2.5v1.8M10.2 3.4l.7 1.1M13.8 3.4l-.7 1.1" />
    </svg>
  );
}

/**
 * Cámara / Recuerdos: cuerpo fijo + lente + <g className="anim-camera-flash"> destello breve en esquina.
 */
export function CelebrationCameraIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      <path d="M4 8.5a2 2 0 0 1 2-2h2.2l1.4-2h4.8l1.4 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" />
      <circle cx="12" cy="13" r="3.4" />
      <g className="anim-camera-flash">
        <path d="M17.2 9.5h.01" strokeWidth={2.2} />
        <path d="M19.5 3.5v2M18.5 4.5h2" />
      </g>
    </svg>
  );
}

/**
 * Confirmación: círculo estable + path del check con dibujo progresivo y trazo persistente.
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
      <circle cx="12" cy="12" r="9" />
      <path className="anim-check-draw" d="M8.2 12.4l2.6 2.6 5.4-5.8" />
    </svg>
  );
}

/**
 * Vestimenta: gancho superior fijo + <g className="anim-attire-sway"> prenda con oscilación corta y sutil.
 */
export function CelebrationAttireIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      <path d="M12 3a1.5 1.5 0 0 1 1.3 2.2L12 7" />
      <g className="anim-attire-sway">
        <path d="M12 7L4.5 11.5l1.5 2 2-1V20h8v-7.5l2 1 1.5-2L12 7z" />
      </g>
    </svg>
  );
}

/**
 * Ubicación decorativa: elipse base + <g className="anim-pin-drop"> descenso suave.
 */
export function CelebrationPinIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      <ellipse cx="12" cy="20.2" rx="4.5" ry="1.3" opacity="0.55" />
      <g className="anim-pin-drop">
        <path d="M12 18.5s5.5-5 5.5-9.2a5.5 5.5 0 1 0-11 0c0 4.2 5.5 9.2 5.5 9.2z" />
        <circle cx="12" cy="9.3" r="2" />
      </g>
    </svg>
  );
}

/**
 * Buenos deseos / Libro de firmas: tarjeta con corazón interior que emerge levemente.
 */
export function CelebrationWishesIcon({ className = "h-8 w-8", style }: CelebrationIconProps) {
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
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5v-8z" />
      <g className="anim-wish-heart">
        <path d="M12 13.5s-3.2-2-3.2-4.1a1.8 1.8 0 0 1 3.2-1.1 1.8 1.8 0 0 1 3.2 1.1c0 2.1-3.2 4.1-3.2 4.1z" />
      </g>
    </svg>
  );
}

/**
 * Ceremonia / Anfitriones neutral y temático (sin iglesia genérica por defecto).
 */
export function CelebrationCeremonyIcon({
  category,
  className = "h-8 w-8",
  style,
}: CelebrationIconProps & { category: EventCategory }) {
  if (category === "boda") {
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
        <circle cx="9.2" cy="13.5" r="4.8" />
        <circle cx="14.8" cy="13.5" r="4.8" />
        <g className="anim-toast-spark">
          <path d="M12 4l1.2 2L12 8l-1.2-2L12 4z" />
        </g>
      </svg>
    );
  }
  // Arco de celebración / estrella neutral para XV, bautismo civil/religioso, cumpleaños y hombres
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
      <path d="M5 20V11a7 7 0 0 1 14 0v9" />
      <path d="M3 20h18" />
      <g className="anim-toast-spark">
        <path d="M12 7.5v3M10.5 9h3" />
      </g>
    </svg>
  );
}
