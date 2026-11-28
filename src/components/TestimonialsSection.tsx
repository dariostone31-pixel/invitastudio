import React from "react";
import { getAuthorizedTestimonials } from "@/config/testimonials";
import { BUSINESS_CONFIG, getWhatsAppHref } from "@/config/business";
import { MotionSection } from "@/components/MotionReveal";
import { MotionTap } from "@/components/MotionTapButton";

function EditorialStar({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d="M8 1.2L9.9 5.3L14.4 5.9L11.1 9.0L11.9 13.5L8 11.3L4.1 13.5L4.9 9.0L1.6 5.9L6.1 5.3L8 1.2Z"
        fill={filled ? "#B78A4E" : "none"}
        stroke="#B78A4E"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FineSealBadgeIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect
        x="4"
        y="7.5"
        width="28"
        height="21"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M5.5 9.5L18 19.5L30.5 9.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="18"
        cy="19"
        r="3.2"
        fill="#FAF8F5"
        stroke="#B78A4E"
        strokeWidth="1.35"
      />
    </svg>
  );
}

function FineChecklistRsvpIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect
        x="6.5"
        y="4.5"
        width="23"
        height="27"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M12 12.5L14.3 14.8L18.5 10.5"
        stroke="#B78A4E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 13H24.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M12 19.5L14.3 21.8L18.5 17.5"
        stroke="#B78A4E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 20H24.5M12 26H24.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FineQrAlbumIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect x="8.5" y="8.5" width="3" height="3" rx="0.6" fill="#B78A4E" />
      <rect
        x="21"
        y="5"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect x="24.5" y="8.5" width="3" height="3" rx="0.6" fill="#B78A4E" />
      <rect
        x="5"
        y="21"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect x="8.5" y="24.5" width="3" height="3" rx="0.6" fill="#B78A4E" />
      <path
        d="M21 21H25V25H21V21ZM27.5 21H31M27.5 27.5H31V31H21V27.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FineVerifiedTick() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="#B78A4E" strokeWidth="1.2" />
      <path
        d="M5.2 8.2L7.1 10.1L10.9 6.1"
        stroke="#6B1E30"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CLIENT_SOLUTIONS = [
  {
    badge: "01 · Sin comprar a ciegas",
    title: "Ves tu invitación armada antes de pagar",
    pain: "Evitás pagar un diseño sin saber cómo lucen tus nombres, horarios y fotos en el celular.",
    outcome: "Borrador interactivo en vivo en el momento",
    Icon: FineSealBadgeIcon,
  },
  {
    badge: "02 · Cero caos de mensajes",
    title: "Confirmaciones, menús y mesas ordenadas",
    pain: "Dejás de perseguir respuestas en chats sueltos o perder alergias alimentarias para el catering.",
    outcome: "Confirmaciones claras y Excel listo (en Llave en Mano: pases nominales)",
    Icon: FineChecklistRsvpIcon,
  },
  {
    badge: "03 · Fiesta viva y post-evento",
    title: "Playlist DJ, Galería de Recuerdos QR y Modo Recuerdo",
    pain: "Tus invitados sugieren temas (ves quién pidió cada canción en Excel), suben fotos con QR y tras la fiesta la tarjeta se convierte en álbum.",
    outcome: "PDF A4 de 4 carteles QR listos para imprimir",
    Icon: FineQrAlbumIcon,
  },
];

export function TestimonialsSection() {
  const items = getAuthorizedTestimonials();
  const reviewWaHref = getWhatsAppHref(
    `Hola! Usé ${BUSINESS_CONFIG.brandName} para mi evento y quiero compartir mi experiencia:`
  );

  return (
    <section className="border-t border-[#2A121B]/12 bg-[#FAF8F5] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MotionSection className="text-center">
          <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/40 bg-[#FFFBFA] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6331] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B78A4E]" />
            {items.length > 0 ? "Experiencias Reales" : "Diseñado para Organizadores Reales"}
          </span>
          <h2 className="font-display-cormorant mt-3 text-4xl font-semibold tracking-tight text-[#2A121B] sm:text-[42px]">
            {items.length > 0 ? (
              <>
                Lo que dicen quienes{" "}
                <span className="italic text-[#6B1E30]">celebraron con nosotros</span>
              </>
            ) : (
              <>
                Menos estrés organizando,{" "}
                <span className="italic text-[#6B1E30]">más disfrute</span> en tu evento
              </>
            )}
          </h2>
          <p className="mx-auto mt-2.5 max-w-2xl text-xs leading-relaxed text-[#6E5159] sm:text-sm">
            {items.length > 0
              ? "Opiniones auténticas enviadas por anfitriones que usaron su invitación digital y su panel."
              : "Cada detalle resuelve un problema concreto desde el día uno: enviar tu invitación clara, ordenar confirmaciones y atesorar recuerdos."}
          </p>
        </MotionSection>

        {items.length > 0 ? (
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, idx) => {
              const initial = t.displayName.trim().charAt(0).toUpperCase() || "C";
              const starsCount = Math.min(5, Math.max(1, Math.round(t.rating || 5)));
              return (
                <MotionSection key={t.id} delay={(idx % 3) * 0.06}>
                  <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#2A121B]/12 bg-[#FFFBFA] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B78A4E]/60 hover:shadow-[0_18px_38px_-20px_rgba(42,18,27,0.28)]">
                    <div>
                      <div
                        className="mb-3.5 flex items-center gap-1"
                        aria-label={`${starsCount} de 5 estrellas`}
                      >
                        {Array.from({ length: starsCount }).map((_, i) => (
                          <EditorialStar key={i} />
                        ))}
                      </div>

                      <p className="text-sm leading-relaxed text-[#432B32]">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#2A121B]/10 pt-4">
                      <div className="flex items-center gap-3">
                        {t.image ? (
                          <img
                            src={t.image}
                            alt={t.displayName}
                            className="h-10 w-10 rounded-full border border-[#B78A4E]/40 object-cover"
                          />
                        ) : (
                          <span className="font-display-cormorant flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/40 bg-[#6B1E30] text-base font-bold text-[#FAF7F2]">
                            {initial}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-xs font-bold text-[#2A121B]">
                            <span>{t.displayName}</span>
                            <FineVerifiedTick />
                          </p>
                          {(t.eventType || t.date) && (
                            <p className="truncate text-[11px] text-[#7A5A62]">
                              {[t.eventType, t.date].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>

                      {t.sourceUrl && (
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ui-jost shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B1E30] underline decoration-[#B78A4E]/60 underline-offset-4 hover:text-[#4A1420]"
                        >
                          {t.sourceLabel || "Ver"}
                        </a>
                      )}
                    </div>
                  </article>
                </MotionSection>
              );
            })}
          </div>
        ) : (
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {CLIENT_SOLUTIONS.map((item, idx) => {
              const IconComp = item.Icon;
              return (
                <MotionSection key={item.title} delay={idx * 0.07}>
                  <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#2A121B]/12 bg-[#FFFBFA] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B78A4E]/60 hover:shadow-[0_20px_42px_-22px_rgba(107,30,48,0.28)]">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#B78A4E]/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-ui-jost text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A6331]">
                          {item.badge}
                        </span>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B78A4E]/35 bg-[#FAF7F2] text-[#6B1E30] transition-colors duration-300 group-hover:border-[#6B1E30]/35 group-hover:bg-[#FBF1EE]">
                          <IconComp />
                        </div>
                      </div>

                      <h3 className="font-display-cormorant mt-4 text-2xl font-semibold leading-snug text-[#2A121B]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#5F464D] sm:text-[13px]">
                        {item.pain}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-[#2A121B]/10 pt-3.5 text-[11px] font-semibold text-[#6B1E30]">
                      <FineVerifiedTick />
                      <span>{item.outcome}</span>
                    </div>
                  </article>
                </MotionSection>
              );
            })}
          </div>
        )}

        {reviewWaHref && (
          <MotionSection delay={0.12}>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#B78A4E]/35 bg-[#FFFBFA] px-6 py-4 shadow-sm sm:flex-row">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/35 bg-[#FAF7F2]">
                  <EditorialStar />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#2A121B]">
                    ¿Ya celebraste con {BUSINESS_CONFIG.brandName}?
                  </p>
                  <p className="text-[11px] text-[#6E5159]">
                    Compartinos cómo te fue con tus invitados para sumar tu testimonio real autorizado.
                  </p>
                </div>
              </div>
              <MotionTap>
                <a
                  href={reviewWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui-jost inline-flex min-h-[40px] flex-shrink-0 items-center justify-center rounded-full border border-[#6B1E30]/30 bg-[#FAF7F2] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B1E30] transition-all duration-300 hover:scale-[1.03] hover:border-[#6B1E30] hover:bg-[#6B1E30] hover:text-white"
                >
                  Enviar mi experiencia →
                </a>
              </MotionTap>
            </div>
          </MotionSection>
        )}
      </div>
    </section>
  );
}
