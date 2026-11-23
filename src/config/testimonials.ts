export type Testimonial = {
  id: string;
  displayName: string;
  quote: string;
  eventType?: string;
  date?: string;
  image?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  rating?: number;
  publicationAuthorized: boolean;
};

/**
 * Fuente controlada de testimonios reales.
 * Regla estricta: publicar únicamente testimonios auténticos con autorización verificada.
 * Mientras no existan reseñas autorizadas reales, mantener este listado vacío.
 */
export const TESTIMONIALS: Testimonial[] = [];

export function getAuthorizedTestimonials(): Testimonial[] {
  return TESTIMONIALS.filter(
    (t) =>
      t.publicationAuthorized === true &&
      t.displayName.trim().length > 0 &&
      t.quote.trim().length > 0
  );
}
