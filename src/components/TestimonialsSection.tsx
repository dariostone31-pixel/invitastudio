import React from "react";
import { CheckCircle2, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import { getAuthorizedTestimonials } from "@/config/testimonials";
import { BUSINESS_CONFIG, getWhatsAppHref } from "@/config/business";
import { MotionSection } from "@/components/MotionReveal";
import { AnimatedIconBox } from "@/components/AnimatedIconBox";
import { MotionTap } from "@/components/MotionTapButton";

function GoogleGMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.26-2.08 3.56-5.15 3.56-8.66z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.96H1.28v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.27V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.11c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

const TRUST_GUARANTEES = [
  {
    title: "Borrador en vivo antes de pagar",
    detail:
      "Probás tu diseño personalizado con tus textos y fotos en el estudio interactivo antes de confirmar el pago.",
  },
  {
    title: "Confirmación real en tu Panel",
    detail:
      "Cada invitado confirma asistencia, dieta especial, canciones para el DJ y buenos deseos directo a tu panel con exportación a Excel.",
  },
  {
    title: "Atención humana por WhatsApp",
    detail:
      "Te acompañamos en la carga de datos, ajustes de diseño, valor de tarjeta y pases personalizados.",
  },
];

export function TestimonialsSection() {
  const items = getAuthorizedTestimonials();
  const reviewWaHref = getWhatsAppHref(
    `Hola! Usé ${BUSINESS_CONFIG.brandName} para mi evento y quiero dejar mi reseña verificada:`
  );

  return (
    <section className="border-t border-[#2A121B]/12 bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionSection className="text-center">
          <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/35 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B78A4E] shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            Confianza Verificada
          </span>
          <h2 className="font-display-cormorant mt-3 text-4xl font-semibold text-[#2A121B]">
            {items.length > 0
              ? "Quienes ya celebraron con nosotros"
              : "Transparencia y respaldo real en cada entrega"}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-[#7A5A62] sm:text-sm">
            {items.length > 0
              ? "Reseñas reales publicadas con autorización expresa de nuestros clientes."
              : "Publicamos únicamente reseñas reales autorizadas por quienes usaron su invitación. Mientras tanto, conocé cómo cuidamos cada evento."}
          </p>
        </MotionSection>

        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, idx) => {
              const initial = t.displayName.trim().charAt(0).toUpperCase() || "C";
              return (
                <MotionSection key={t.id} delay={(idx % 3) * 0.06}>
                  <article className="group flex h-full flex-col justify-between rounded-[20px] border border-[#2A121B]/12 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B78A4E]/50 hover:shadow-md">
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {t.image ? (
                            <img
                              src={t.image}
                              alt={t.displayName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B1E30] text-xs font-bold text-white">
                              {initial}
                            </span>
                          )}
                          <div>
                            <p className="flex items-center gap-1 text-xs font-bold text-[#2A121B]">
                              {t.displayName}
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1A73E8]" strokeWidth={1.5} />
                            </p>
                            {(t.eventType || t.date) && (
                              <p className="text-[11px] text-[#7A5A62]">
                                {[t.eventType, t.date].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <GoogleGMark />
                      </div>

                      {typeof t.rating === "number" && t.rating > 0 && (
                        <div
                          className="mb-2.5 flex items-center gap-0.5 text-[#FBBC05]"
                          aria-label={`${t.rating} de 5 estrellas`}
                        >
                          {Array.from({ length: Math.min(5, Math.round(t.rating)) }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
                          ))}
                        </div>
                      )}

                      <p className="text-sm italic leading-relaxed text-[#574046]">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    {t.sourceUrl && (
                      <div className="mt-4 border-t border-[#2A121B]/10 pt-3 text-right text-xs">
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#6B1E30] underline"
                        >
                          {t.sourceLabel || "Ver reseña original"}
                        </a>
                      </div>
                    )}
                  </article>
                </MotionSection>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TRUST_GUARANTEES.map((g, idx) => (
              <MotionSection key={g.title} delay={idx * 0.07}>
                <div className="group flex h-full flex-col justify-between rounded-[20px] border border-[#2A121B]/12 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B78A4E]/50 hover:shadow-[0_16px_34px_-18px_rgba(107,30,48,0.28)]">
                  <div>
                    <AnimatedIconBox
                      index={idx}
                      className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#B78A4E]/35 bg-[#FBF1EE] text-[#6B1E30] shadow-sm transition-colors duration-300 group-hover:bg-[#6B1E30] group-hover:text-white"
                    >
                      <EditorialDiamondIcon className="h-4 w-4" />
                    </AnimatedIconBox>
                    <h3 className="text-sm font-bold text-[#2A121B]">{g.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#574046]">{g.detail}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-[#2A121B]/10 pt-3 text-[11px] font-semibold text-[#6B1E30]">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Incluido en el servicio</span>
                  </div>
                </div>
              </MotionSection>
            ))}
          </div>
        )}

        {reviewWaHref && (
          <MotionSection delay={0.12}>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-[#2A121B]/12 bg-white px-6 py-4 shadow-sm sm:flex-row">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2A121B]/10 bg-[#FAF8F5]">
                  <GoogleGMark />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#2A121B]">
                    ¿Ya celebraste con {BUSINESS_CONFIG.brandName}?
                  </p>
                  <p className="text-[11px] text-[#7A5A62]">
                    Contanos cómo fue tu experiencia para sumarla a nuestras opiniones verificadas.
                  </p>
                </div>
              </div>
            <MotionTap>
              <a
                href={reviewWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer-hover inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#2A121B]/20 bg-[#FAF8F5] px-4 py-2 text-xs font-semibold text-[#2A121B] transition-all duration-300 hover:scale-[1.03] hover:border-[#6B1E30]/40 hover:bg-[#FBF1EE]"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#6B1E30]" strokeWidth={1.5} />
                Enviar mi reseña
              </a>
            </MotionTap>
            </div>
          </MotionSection>
        )}
      </div>
    </section>
  );
}
