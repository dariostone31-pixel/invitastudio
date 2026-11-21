import React from "react";
import { MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/config/business";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
        "¡Hola InvitaStudio! Quiero consultar por una invitación digital."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="animate-wa-pulse fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl transition-transform hover:scale-105 hover:bg-emerald-700 active:scale-95"
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">¿Dudas? WhatsApp</span>
    </a>
  );
}
