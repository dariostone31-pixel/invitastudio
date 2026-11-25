import React from "react";
import { WhatsAppLogoIcon } from "@/components/BrandOrnaments";
import { BUSINESS_CONFIG, getWhatsAppHref } from "@/config/business";

export function WhatsAppFloat() {
  const href = getWhatsAppHref(
    `¡Hola ${BUSINESS_CONFIG.brandName}! Quiero consultar por una invitación digital.`
  );
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="animate-wa-pulse fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-[#0F5132] py-2 pl-2 pr-4 text-xs font-bold text-white shadow-[0_14px_34px_-8px_rgba(16,185,129,0.55)] transition-transform hover:scale-105 hover:bg-[#0D442A] active:scale-95 sm:bottom-5 sm:right-5 sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-5 sm:text-sm"
    >
      <WhatsAppLogoIcon className="h-8 w-8 flex-shrink-0 drop-shadow-sm sm:h-9 sm:w-9" />
      <span className="tracking-tight whitespace-nowrap">¿Dudas? WhatsApp</span>
    </a>
  );
}
