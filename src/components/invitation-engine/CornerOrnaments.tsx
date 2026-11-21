import React from "react";

interface CornerOrnamentsProps {
  color: string;
}

export function CornerOrnaments({ color }: CornerOrnamentsProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-4 z-10">
      {/* Top Left */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        className="absolute left-2 top-2 opacity-70"
      >
        <path d="M2 24V6a4 4 0 0 1 4-4h18" />
        <path d="M6 14c2-4 6-7 10-8" />
      </svg>
      {/* Top Right */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        className="absolute right-2 top-2 rotate-90 opacity-70"
      >
        <path d="M2 24V6a4 4 0 0 1 4-4h18" />
        <path d="M6 14c2-4 6-7 10-8" />
      </svg>
      {/* Bottom Left */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        className="absolute bottom-2 left-2 -rotate-90 opacity-70"
      >
        <path d="M2 24V6a4 4 0 0 1 4-4h18" />
        <path d="M6 14c2-4 6-7 10-8" />
      </svg>
      {/* Bottom Right */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        className="absolute bottom-2 right-2 rotate-180 opacity-70"
      >
        <path d="M2 24V6a4 4 0 0 1 4-4h18" />
        <path d="M6 14c2-4 6-7 10-8" />
      </svg>
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
  return (
    <div className="relative mx-auto mt-3 flex h-16 w-16 items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="animate-slow-spin h-full w-full opacity-75"
      >
        <defs>
          <path
            id="sealCirclePath"
            d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          />
        </defs>
        <text
          fill={color}
          fontSize="8.8"
          fontWeight="600"
          letterSpacing="2.4"
        >
          <textPath href="#sealCirclePath">{text}</textPath>
        </text>
      </svg>
      <span
        className="font-display-cormorant absolute text-xs font-semibold"
        style={{ color }}
      >
        {monogram}
      </span>
    </div>
  );
}
