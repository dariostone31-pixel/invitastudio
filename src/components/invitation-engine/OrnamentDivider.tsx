import React from "react";
import { LayoutId } from "@/templates/catalog";

interface OrnamentDividerProps {
  layoutId: LayoutId;
  color: string;
}

export function OrnamentDivider({ layoutId, color }: OrnamentDividerProps) {
  if (layoutId === "ticket-vip") {
    return (
      <div className="my-7 flex items-center gap-2 opacity-65">
        <div className="h-[1px] flex-1 border-b border-dashed" style={{ borderColor: color }} />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          className="animate-icon-beat"
        >
          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
        </svg>
        <div className="h-[1px] flex-1 border-b border-dashed" style={{ borderColor: color }} />
      </div>
    );
  }

  if (layoutId === "diario-editorial") {
    return (
      <div className="my-7 flex flex-col gap-1 opacity-75">
        <div className="h-[2px] w-full" style={{ backgroundColor: color }} />
        <div className="h-[1px] w-full opacity-50" style={{ backgroundColor: color }} />
      </div>
    );
  }

  if (layoutId === "infantil-animado") {
    return (
      <div className="my-7 flex items-center justify-center gap-3 opacity-85">
        <span className="h-[1.5px] w-12 rounded-full" style={{ backgroundColor: color }} />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          className="animate-icon-sway"
        >
          <path d="M12 3l1.8 4.8L19 9.5l-4.2 3.1L16.2 18 12 14.9 7.8 18l1.4-5.4L5 9.5l5.2-1.7L12 3z" />
        </svg>
        <span className="h-[1.5px] w-12 rounded-full" style={{ backgroundColor: color }} />
      </div>
    );
  }

  return (
    <div className="my-8 flex items-center justify-center gap-3 opacity-80">
      <div className="h-[1px] w-16 opacity-50" style={{ backgroundColor: color }} />
      <svg
        width="28"
        height="16"
        viewBox="0 0 40 20"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        className="animate-icon-beat"
      >
        <path d="M20 10C16 4 9 3 4 10c5 7 12 6 16 0z" />
        <path d="M20 10c4-6 11-7 16 0-5 7-12 6-16 0z" />
        <circle cx="20" cy="10" r="2" fill={color} />
      </svg>
      <div className="h-[1px] w-16 opacity-50" style={{ backgroundColor: color }} />
    </div>
  );
}
