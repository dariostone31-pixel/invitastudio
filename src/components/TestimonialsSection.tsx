import React from "react";
import { Star } from "lucide-react";
import { getAuthorizedTestimonials } from "@/config/testimonials";

/**
 * Bloque preparado para reseñas y testimonios reales autorizados.
 * Mientras no existan testimonios con `publicationAuthorized: true`,
 * este componente no renderiza contenido ni tarjetas de ejemplo.
 */
export function TestimonialsSection() {
  const items = getAuthorizedTestimonials();
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#2A121B]/12 bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B78A4E]">
            Experiencias Reales
          </span>
          <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B]">
            Quienes celebraron con nosotros
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <article
              key={t.id}
              className="flex flex-col justify-between rounded-[20px] border border-[#2A121B]/12 bg-white p-6 shadow-sm"
            >
              <div>
                {typeof t.rating === "number" && t.rating > 0 && (
                  <div className="mb-3 flex items-center gap-1 text-[#B78A4E]" aria-label={`${t.rating} de 5`}>
                    {Array.from({ length: Math.min(5, Math.round(t.rating)) }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                )}
                <p className="text-sm italic leading-relaxed text-[#574046]">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#2A121B]/10 pt-3 text-xs">
                <div>
                  <p className="font-bold text-[#2A121B]">{t.displayName}</p>
                  {(t.eventType || t.date) && (
                    <p className="text-[11px] text-[#7A5A62]">
                      {[t.eventType, t.date].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                {t.sourceUrl && (
                  <a
                    href={t.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#6B1E30] underline"
                  >
                    {t.sourceLabel || "Ver fuente"}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
