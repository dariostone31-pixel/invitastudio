import React from "react";
import type { EventCategory, LayoutId } from "@/templates/catalog";

interface OrnamentDividerProps {
  layoutId: LayoutId;
  category?: EventCategory;
  skinId?: string;
  color: string;
}

export function OrnamentDivider({ layoutId, category, skinId, color }: OrnamentDividerProps) {
  if (layoutId === "ticket-vip") {
    return (
      <div aria-hidden="true" className="relative my-8 flex items-center gap-2.5">
        <span
          className="-ml-9 h-5 w-5 flex-shrink-0 rounded-full border opacity-60"
          style={{ borderColor: color }}
        />
        <div className="h-[1px] flex-1 border-b border-dashed opacity-55" style={{ borderColor: color }} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
        </svg>
        <div className="h-[1px] flex-1 border-b border-dashed opacity-55" style={{ borderColor: color }} />
        <span
          className="-mr-9 h-5 w-5 flex-shrink-0 rounded-full border opacity-60"
          style={{ borderColor: color }}
        />
      </div>
    );
  }

  if (layoutId === "diario-editorial") {
    return (
      <div aria-hidden="true" className="my-8 flex flex-col gap-1 opacity-80">
        <div className="h-[2px] w-full" style={{ backgroundColor: color }} />
        <div className="h-[1px] w-full opacity-45" style={{ backgroundColor: color }} />
      </div>
    );
  }

  if (layoutId === "infantil-animado") {
    const isOcean = skinId?.includes("sirena");
    return (
      <div aria-hidden="true" className="my-7 flex items-center justify-center gap-2.5 opacity-85">
        <span className="h-1.5 w-1.5 rounded-full opacity-55" style={{ backgroundColor: color }} />
        <span className="h-[2px] w-10 rounded-full opacity-55" style={{ backgroundColor: color }} />
        {isOcean ? (
          <svg width="24" height="14" viewBox="0 0 24 14" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 7c3-4 6 4 10 0s7 4 10 0" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 4.8L19 9.5l-4.2 3.1L16.2 18 12 14.9 7.8 18l1.4-5.4L5 9.5l5.2-1.7L12 3z" />
          </svg>
        )}
        <span className="h-[2px] w-10 rounded-full opacity-55" style={{ backgroundColor: color }} />
        <span className="h-1.5 w-1.5 rounded-full opacity-55" style={{ backgroundColor: color }} />
      </div>
    );
  }

  if (layoutId === "neon-dark" || category === "hombre") {
    return (
      <div aria-hidden="true" className="my-8 flex items-center justify-center gap-3 opacity-80">
        <div
          className="h-[1px] flex-1 max-w-[96px]"
          style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
          <rect x="12" y="4" width="11" height="11" transform="rotate(45 12 4)" />
        </svg>
        <div
          className="h-[1px] flex-1 max-w-[96px]"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />
      </div>
    );
  }

  if (layoutId === "fullscreen-hero") {
    return (
      <div aria-hidden="true" className="my-9 flex items-center justify-center gap-3 opacity-70">
        <div className="h-[1px] w-20 opacity-45" style={{ backgroundColor: color }} />
        <span className="h-1.5 w-1.5 rotate-45 border" style={{ borderColor: color }} />
        <div className="h-[1px] w-20 opacity-45" style={{ backgroundColor: color }} />
      </div>
    );
  }

  // Papelería botánica / gala clásica (editorial-sobre)
  return (
    <div aria-hidden="true" className="my-8 flex items-center justify-center gap-3 opacity-80">
      <div className="h-[1px] w-16 opacity-45" style={{ backgroundColor: color }} />
      <svg width="28" height="16" viewBox="0 0 40 20" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <path d="M20 10C16 4 9 3 4 10c5 7 12 6 16 0z" />
        <path d="M20 10c4-6 11-7 16 0-5 7-12 6-16 0z" />
        <circle cx="20" cy="10" r="1.8" fill={color} />
      </svg>
      <div className="h-[1px] w-16 opacity-45" style={{ backgroundColor: color }} />
    </div>
  );
}
