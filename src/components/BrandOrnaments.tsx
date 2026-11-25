import React from "react";

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Refined 4-point couture editorial fleuron (replaces generic Sparkles icon).
 */
export function EditorialDiamondIcon({ className = "h-3.5 w-3.5", style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d="M12 2.5C12.8 7.8 16.2 11.2 21.5 12C16.2 12.8 12.8 16.2 12 21.5C11.2 16.2 7.8 12.8 2.5 12C7.8 11.2 11.2 7.8 12 2.5Z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Official-style rounded-square WhatsApp vector emblem.
 */
export function WhatsAppLogoIcon({ className = "h-6 w-6", style }: IconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <rect width="36" height="36" rx="9" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M18.02 7.5C12.38 7.5 7.8 12.06 7.8 17.68c0 2.02.59 3.9 1.62 5.49l-1.06 3.86 3.96-1.04a10.22 10.22 0 0 0 5.7 1.72h.01c5.64 0 10.22-4.56 10.22-10.18 0-2.72-1.06-5.28-2.99-7.2A10.18 10.18 0 0 0 18.02 7.5Zm5.98 14.43c-.25.71-1.45 1.35-2.01 1.43-.52.08-1.18.11-1.91-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5-4.37-5.15-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.27-.3.6-.38.8-.38.2 0 .4 0 .58.01.18.01.43-.07.68.52.25.6.85 2.09.93 2.24.08.15.13.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.53-.15.15-.31.32-.13.62.18.3.78 1.29 1.68 2.09 1.16 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.58.35.07.12.07.72-.18 1.43Z"
      />
    </svg>
  );
}
