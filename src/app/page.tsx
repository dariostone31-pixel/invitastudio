import React from "react";
import Link from "next/link";
import {
  Music,
  CheckCircle2,
  Clock,
  Users,
  Smartphone,
  ArrowRight,
  MessageCircle,
  Check,
  BarChart3,
  HeartHandshake,
  ChevronDown,
  Camera,
  MapPin,
  Sparkles,
  LayoutGrid,
  PenLine,
  Eye,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { MotionHeroBlock, MotionSection } from "@/components/MotionReveal";
import { AnimatedIconBox } from "@/components/AnimatedIconBox";
import { MotionTap } from "@/components/MotionTapButton";
import { HeroMockup } from "@/components/HeroMockup";
import { HeroFan } from "@/components/HeroFan";
import { MiniTester } from "@/components/MiniTester";
import { CatalogShowcase } from "@/components/CatalogShowcase";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { BUSINESS_CONFIG, PRICING_PLANS, getWhatsAppHref } from "@/config/business";

const FAQS = [
  {
    q: "¿Cuándo comienza el plazo de entrega y cuánto demora?",
    a: "El plazo estimado de entrega (< 24 horas hábiles) comienza una vez recibido tu pedido con los datos del evento y confirmado el pago o comprobante. Apenas enviás el pedido ya podés ver un borrador técnico para revisar antes de compartir.",
  },
  {
    q: "¿Qué necesito enviar para armar mi invitación?",
    a: "Los datos básicos (título, fecha, horario, salón y dirección). Si elegís Plan PRO o Llave en Mano, también podés editar frase de portada, nombres de padres/anfitriones, historia, itinerario y subir tus fotos propias.",
  },
  {
    q: "¿Qué puedo modificar según el plan y cuántos cambios incluye?",
    a: "En Plan Esencial podés editar los datos básicos del evento con un link único. En Plan PRO podés personalizar todo en vivo desde tu Estudio (tipografía, color, fotos, música, padres, historia, itinerario y módulos). En Llave en Mano el equipo realiza la carga inicial y los cambios previos al evento.",
  },
  {
    q: "¿Mis invitados tienen que descargar una app o iniciar sesión?",
    a: "No. Se abre directo en el navegador del celular desde WhatsApp, sin cuentas ni descargas. Además fijamos la paleta de diseño para mantener la legibilidad aunque el teléfono tenga modo oscuro.",
  },
  {
    q: "¿Puedo enviar enlaces personalizados con el nombre de cada familia?",
    a: "Sí, en Plan PRO y Llave en Mano. Desde tu Panel Privado generás enlaces con el nombre de cada invitado o familia y la cantidad de lugares reservados o mesa asignada.",
  },
  {
    q: "¿Cuánto tiempo estará publicada la invitación y qué pasa después?",
    a: "La invitación permanece publicada durante la organización del evento y hasta que decidas cerrarla o activar el Modo Recuerdo desde tu panel (el plazo definitivo de conservación post-evento está sujeto a definición operativa; podés solicitar su baja en cualquier momento).",
  },
  {
    q: "¿Qué datos reciben los organizadores y qué pasa con las fotos y respuestas?",
    a: "El organizador ve en su Panel Privado quién confirmó, cantidad de lugares, acompañantes, restricciones alimentarias opcionales (Sin TACC, vegetariano, alergias), canción sugerida y mensajes. Solo los deseos del libro de firmas se muestran en la invitación si ese módulo está activo.",
  },
  {
    q: "¿Cómo solicito ayuda o qué pasa si cambia la fecha o cancelo?",
    a: "Si cambia la fecha, horario o salón, actualizamos los datos sobre el mismo enlace sin recargo por reprogramación. Para soporte, reclamos o cancelaciones conforme la normativa argentina de defensa del consumidor, consultá Política de Privacidad y Condiciones del Servicio.",
  },
  {
    q: "¿Cómo se paga desde Argentina?",
    a: "Podés abonar por Transferencia Bancaria con el valor promocional (25% OFF respecto al precio de lista) o con tarjetas, débito y dinero en cuenta mediante Mercado Pago Checkout Pro.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: LayoutGrid,
    title: "Elegís plan y diseño",
    desc: "Explorá 42 modelos en vivo y elegí entre Esencial, PRO o Llave en Mano según cuánto quieras personalizar.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Cargás los datos",
    desc: "Completás los 4 pasos en pocos minutos (en PRO y Llave en Mano ya podés ajustar textos, padres, historia, itinerario y fotos).",
  },
  {
    step: "03",
    icon: Eye,
    title: "Revisás tu borrador",
    desc: "Al instante obtenés tu borrador y tu Panel Privado para revisar todo en tu celular antes de compartirlo.",
  },
  {
    step: "04",
    icon: Share2,
    title: "Compartís y organizás",
    desc: "Enviás el link por WhatsApp y seguís confirmaciones, menús especiales y música en tu panel.",
  },
];

const MORE_THAN_INVITE = [
  {
    num: "01",
    icon: Users,
    title: "Cada invitado recibe la suya",
    desc: "Sobre animado con su nombre grande en la tapa y acceso diferenciado (todo el evento, ceremonia o fiesta).",
  },
  {
    num: "02",
    icon: MapPin,
    title: "Que nadie pregunte “¿a qué hora era?”",
    desc: "Cuenta regresiva, mapa en 1 toque, dress code, Solo Adultos opcional y agendar directo al calendario.",
  },
  {
    num: "03",
    icon: CheckCircle2,
    title: "La lista se arma sola",
    desc: "Confirmación grupal con acompañantes y alergias (Sin TACC), todo ordenado al instante en tu Excel (.xlsx).",
  },
  {
    num: "04",
    icon: Music,
    title: "Que no falte ninguna canción",
    desc: "Música al abrir el sobre + Playlist DJ donde tus invitados sugieren y votan sus temas con pulso en vivo.",
  },
  {
    num: "05",
    icon: Camera,
    title: "Juegos, firmas y Álbum QR",
    desc: "Mini-Trivia con ranking Top 5, mural de buenos deseos, galería con transiciones y Modo Recuerdo.",
  },
];

const GUARANTEES = [
  {
    title: "¿Todavía no tenés tus fotos? Cargalas después",
    desc: "Podés reservar y crear tu invitación hoy con imágenes de ejemplo y subir tu book o fotos propias más adelante desde tu panel.",
  },
  {
    title: "Sin apps ni contraseñas para tus invitados",
    desc: "Se abre directo desde WhatsApp en cualquier celular y mantenemos legibilidad perfecta aunque usen modo oscuro.",
  },
  {
    title: "Precios y alcance transparentes en ARS",
    desc: "Esencial ($24.999), PRO ($29.999) o Llave en Mano ($34.999) por transferencia (25% OFF), sabiendo exactamente qué incluye cada uno.",
  },
];

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="bg-paper-spotlight min-h-screen text-[#2A121B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ================= HEADER BLUR EDITORIAL ================= */}
      <header className="sticky top-0 z-40 border-b border-[#2A121B]/10 bg-[#FFFBFA]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
          <Link href="/" aria-label="Invita con Alma - Inicio" className="shrink-0">
            <BrandLogo />
          </Link>

          <nav
            aria-label="Navegación principal"
            className="font-ui-jost hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F5058] lg:flex xl:gap-8"
          >
            <a
              href="#modelos"
              className="whitespace-nowrap py-1.5 transition-colors hover:text-[#6B1E30]"
            >
              Modelos (42)
            </a>
            <a
              href="#como-funciona"
              className="whitespace-nowrap py-1.5 transition-colors hover:text-[#6B1E30]"
            >
              Cómo funciona
            </a>
            <Link
              href="/personalizar/demo-boda"
              className="whitespace-nowrap py-1.5 transition-colors hover:text-[#6B1E30]"
            >
              Personalizador
            </Link>
            <a
              href="#precios"
              className="whitespace-nowrap py-1.5 transition-colors hover:text-[#6B1E30]"
            >
              Precios ARS
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <MotionTap className="hidden sm:block">
              <Link
                href="/mi-panel"
                className="inline-flex whitespace-nowrap rounded-full border border-[#2A121B]/18 bg-white px-4 py-2 text-xs font-semibold text-[#2A121B] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6B1E30] hover:text-[#6B1E30]"
              >
                Mi Panel
              </Link>
            </MotionTap>
            <MotionTap>
              <Link
                href="/encargar"
                className="btn-gold-shimmer inline-flex whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-10px_rgba(107,30,48,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_14px_30px_-10px_rgba(107,30,48,0.7)] sm:px-5 sm:py-2.5"
              >
                Encargar Ahora
              </Link>
            </MotionTap>
          </div>
        </div>

        {/* Mobile & Tablet quick-anchor strip */}
        <nav
          aria-label="Navegación rápida móvil"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-[#2A121B]/8 bg-[#FBF1EE]/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B1E30] lg:hidden"
        >
          <a
            href="#modelos"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            Modelos (42)
          </a>
          <Link
            href="/mi-panel"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            Mi Panel
          </Link>
          <a
            href="#como-funciona"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            Cómo funciona
          </a>
          <a
            href="#precios"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            Precios
          </a>
          <Link
            href="/personalizar/demo-boda"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            Personalizador
          </Link>
          <a
            href="#faq"
            className="whitespace-nowrap rounded-full border border-[#2A121B]/10 bg-white/95 px-3 py-1 shadow-sm"
          >
            FAQ
          </a>
        </nav>
      </header>

      {/* ================= HERO EDITORIAL ================= */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-12 pt-9 sm:px-6 lg:pb-16 lg:pt-14">
        <div
          aria-hidden="true"
          className="animate-drift-1 pointer-events-none absolute -left-24 -top-10 h-80 w-80 rounded-full bg-[#E7AFC0]/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-drift-2 pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-[#B78A4E]/20 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <MotionHeroBlock delay={0}>
              <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/45 bg-[#FFFBFA]/95 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B1E30] shadow-sm sm:px-4 sm:text-[11px] sm:tracking-[0.22em]">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF1EE] text-[#B78A4E]">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                </span>
                Invitaciones Digitales de Autor · Argentina
              </span>
            </MotionHeroBlock>

            <MotionHeroBlock delay={0.08}>
              <h1 className="font-display-cormorant mt-5 text-[42px] font-semibold leading-[1.03] tracking-tight text-[#2A121B] sm:text-6xl lg:text-[66px]">
                Tu evento empieza desde el{" "}
                <span className="gold-underline italic text-[#6B1E30]">primer clic.</span>
              </h1>
            </MotionHeroBlock>

            <MotionHeroBlock delay={0.16}>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#6E4F57] sm:text-lg">
                Se abre directo en el celular, <strong className="text-[#2A121B]">sin apps ni descargas</strong>. Diseños de autor con sobre animado 3D, música integrada, mapa en 1 toque y confirmación inteligente listos en <strong className="text-[#6B1E30]">menos de 24 hs</strong>.
              </p>
            </MotionHeroBlock>

            <MotionHeroBlock delay={0.24}>
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <MotionTap>
                  <a
                    href="#modelos"
                    className="btn-gold-shimmer inline-flex min-h-[48px] items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-8px_rgba(74,20,32,0.55)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_18px_36px_-10px_rgba(107,30,48,0.68)]"
                  >
                    Explorar 42 Modelos en Vivo
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                </MotionTap>
                <MotionTap>
                  <a
                    href="#como-funciona"
                    className="btn-shimmer-hover group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#6B1E30]/35 bg-[#FFFBFA] px-5 py-3.5 text-sm font-semibold text-[#6B1E30] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6B1E30] hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FBF1EE] text-[#B78A4E] transition-colors duration-300 group-hover:bg-[#6B1E30] group-hover:text-white">
                      <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                    Ver cómo funciona
                  </a>
                </MotionTap>
              </div>
              <p className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-[#7A5A62]">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#B78A4E]" strokeWidth={1.6} />
                <span>Pago único por evento · Borrador inmediato · Editable desde tu celular</span>
              </p>
            </MotionHeroBlock>

            <MotionHeroBlock delay={0.32}>
              <div className="mt-8 grid grid-cols-3 divide-x divide-[#2A121B]/12 rounded-2xl border border-[#2A121B]/10 bg-[#FFFBFA]/75 px-1.5 py-4 shadow-sm backdrop-blur-sm sm:px-4">
                <div className="px-2 sm:px-4">
                  <p className="font-display-cormorant whitespace-nowrap text-[21px] font-bold text-[#6B1E30] sm:text-3xl">&lt; 24 hs</p>
                  <p className="font-ui-jost mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-[#7A5A62] sm:text-[11px] sm:tracking-[0.1em]">
                    Entrega hábil
                  </p>
                </div>
                <div className="px-2 sm:px-4">
                  <p className="font-display-cormorant whitespace-nowrap text-[21px] font-bold text-[#6B1E30] sm:text-3xl">25% OFF</p>
                  <p className="font-ui-jost mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-[#7A5A62] sm:text-[11px] sm:tracking-[0.1em]">
                    Transferencia
                  </p>
                </div>
                <div className="px-2 sm:px-4">
                  <p className="font-display-cormorant whitespace-nowrap text-[21px] font-bold text-[#6B1E30] sm:text-3xl">42 Diseños</p>
                  <p className="font-ui-jost mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-[#7A5A62] sm:text-[11px] sm:tracking-[0.1em]">
                    Sin apps
                  </p>
                </div>
              </div>
            </MotionHeroBlock>
          </div>

          <MotionHeroBlock delay={0.14} className="lg:col-span-5">
            <HeroMockup />
          </MotionHeroBlock>
        </div>
      </section>

      {/* ================= MINI PROBADOR ================= */}
      <MiniTester />

      {/* ================= ABANICO DE DISEÑOS (HERO FAN) ================= */}
      <HeroFan />

      {/* ================= CATÁLOGO 42 MODELOS ================= */}
      <CatalogShowcase />

      {/* ================= MÁS QUE UNA INVITACIÓN (5 CARDS EDITORIALES) ================= */}
      <section id="diferencia" className="border-y border-[#2A121B]/12 bg-[#FFFBFA] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionSection className="text-center">
            <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/35 bg-[#FBF1EE] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B78A4E]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Enamora a tus invitados · Te ordena tu fiesta
            </span>
            <h2 className="font-display-cormorant mt-3 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
              Todo lo que necesitás, <span className="italic text-[#6B1E30]">en un solo link</span>
            </h2>
          </MotionSection>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MORE_THAN_INVITE.map((card, idx) => {
              const Icon = card.icon;
              return (
                <MotionSection key={card.title} delay={idx * 0.06}>
                  <div className="group shadow-bordo-lg flex h-full flex-col rounded-[20px] border border-[#2A121B]/12 border-t-2 border-t-[#B78A4E] bg-[#FBF1EE]/60 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#FFFBFA] hover:shadow-[0_20px_38px_-18px_rgba(107,30,48,0.3)]">
                    <div className="flex items-center justify-between">
                      <AnimatedIconBox
                        index={idx}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#B78A4E]/45 bg-white text-[#6B1E30] shadow-sm transition-colors duration-300 group-hover:border-[#6B1E30] group-hover:bg-[#6B1E30] group-hover:text-white"
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </AnimatedIconBox>
                      <span className="font-display-cormorant text-xl font-semibold italic text-[#B78A4E]/80">
                        {card.num}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold leading-snug text-[#2A121B]">{card.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">{card.desc}</p>
                  </div>
                </MotionSection>
              );
            })}
          </div>

          {/* Compromiso & Garantías Verificables + Demo Panel */}
          <MotionSection delay={0.1}>
            <div className="mt-8 grid grid-cols-1 gap-4 rounded-[22px] border border-[#B78A4E]/35 bg-[#FBF1EE] p-6 sm:grid-cols-3">
              {GUARANTEES.map((g, idx) => (
                <div key={g.title} className="group flex items-start gap-3">
                  <AnimatedIconBox
                    index={idx}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/45 bg-white text-[#B78A4E] shadow-sm transition-colors duration-300 group-hover:bg-[#6B1E30] group-hover:text-white"
                  >
                    <HeartHandshake className="h-4 w-4" strokeWidth={1.5} />
                  </AnimatedIconBox>
                  <div>
                    <h4 className="text-xs font-bold text-[#2A121B]">{g.title}</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#7A5A62]">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionSection>

          <MotionSection delay={0.14}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#2A121B]/12 bg-[#FFFBFA] px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AnimatedIconBox className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#B78A4E]/35 bg-[#FBF1EE] text-[#6B1E30] shadow-sm">
                  <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
                </AnimatedIconBox>
                <div className="text-xs">
                  <strong className="text-[#2A121B]">¿Querés ver cómo organizás tus invitados?</strong>
                  <span className="block text-[#7A5A62]">Probá en vivo el panel con pases por familia, alergias y descarga Excel.</span>
                </div>
              </div>
              <MotionTap>
                <Link
                  href="/panel/demo-boda"
                  className="btn-shimmer-hover inline-flex min-h-[42px] items-center rounded-full border border-[#6B1E30]/35 px-5 py-2.5 text-xs font-semibold text-[#6B1E30] transition-all duration-300 hover:scale-[1.03] hover:border-[#6B1E30] hover:bg-[#FBF1EE]"
                >
                  Probar Panel Demo
                </Link>
              </MotionTap>
            </div>
          </MotionSection>
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA EN 4 PASOS ================= */}
      <section id="como-funciona" className="border-b border-[#2A121B]/12 bg-[#FBF1EE] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionSection className="text-center">
            <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6B1E30]">
              Cómo funciona
            </span>
            <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
              De la idea al WhatsApp en <span className="italic text-[#6B1E30]">4 pasos</span>
            </h2>
          </MotionSection>

          <div className="relative mt-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden h-px border-t border-dashed border-[#B78A4E]/55 lg:block"
            />
            <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item, idx) => {
                const StepIcon = item.icon;
                return (
                  <MotionSection key={item.step} delay={idx * 0.07}>
                    <div className="group flex h-full flex-col rounded-[20px] border border-[#2A121B]/12 border-l-2 border-l-[#B78A4E] bg-[#FFFBFA] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgba(107,30,48,0.28)]">
                      <div className="flex items-center justify-between">
                        <span className="font-display-cormorant text-3xl font-semibold italic text-[#B78A4E]">
                          {item.step}
                        </span>
                        <AnimatedIconBox
                          index={idx}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B78A4E]/35 bg-[#FBF1EE] text-[#6B1E30] shadow-sm transition-colors duration-300 group-hover:bg-[#6B1E30] group-hover:text-white"
                        >
                          <StepIcon className="h-4 w-4" strokeWidth={1.5} />
                        </AnimatedIconBox>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[#2A121B]">{item.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">{item.desc}</p>
                    </div>
                  </MotionSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRECIOS TRANSPARENTES EN ARS ================= */}
      <section id="precios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <MotionSection className="text-center">
          <span className="font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/40 bg-[#FFFBFA] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B1E30] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#B78A4E]" strokeWidth={1.5} />
            Precios Transparentes en Pesos Argentinos
          </span>
          <h2 className="font-display-cormorant mt-3 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
            Elegí tu plan <span className="italic text-[#6B1E30]">sin letras chicas</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#7A5A62]">
            Pagás una sola vez por evento. Incluye borrador inmediato para revisar, activación en &lt; 24 hs hábiles y{" "}
            <strong className="text-[#2A121B]">25% OFF pagando por transferencia</strong>.
          </p>
        </MotionSection>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, idx) => (
            <MotionSection key={plan.id} delay={idx * 0.08} className="flex">
              <div
                className={`relative flex w-full flex-col justify-between rounded-[24px] border p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.highlight
                    ? "shadow-bordo-lg border-[#B78A4E] bg-gradient-to-b from-[#551726] via-[#4A1420] to-[#390E18] text-white ring-2 ring-[#E7AFC0]/40 lg:scale-[1.03]"
                    : "border-[#2A121B]/12 bg-[#FFFBFA] text-[#2A121B] shadow-sm hover:border-[#B78A4E]/50 hover:shadow-[0_20px_40px_-18px_rgba(107,30,48,0.28)]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#E7AFC0] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2A121B] shadow">
                    Más vendido
                  </span>
                )}
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      plan.highlight
                        ? "bg-[#B78A4E] text-white"
                        : "bg-[#FBF1EE] text-[#6B1E30]"
                    }`}
                  >
                    {plan.badge}
                  </span>

                  <h3 className="font-display-cormorant mt-4 text-3xl font-semibold">
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold ${
                        plan.highlight ? "text-[#E7AFC0]" : "text-[#6B1E30]"
                      }`}
                    >
                      {plan.transferPrice}
                    </span>
                    <span className="text-xs opacity-75">ARS transf.</span>
                  </div>
                  <p className="mt-1 text-xs opacity-70">
                    Precio de lista (Mercado Pago / cuotas): {plan.listPrice} ARS
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                            plan.highlight
                              ? "bg-white/10 text-[#E7AFC0]"
                              : "bg-[#FBF1EE] text-[#6B1E30]"
                          }`}
                        >
                          <Check strokeWidth={1.5} className="h-3 w-3" />
                        </span>
                        <span className="leading-relaxed opacity-90">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <MotionTap className="mt-8">
                  <Link
                    href={`/encargar?plan=${plan.id}`}
                    className={`block w-full rounded-full py-3.5 text-center text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.03] ${
                      plan.highlight
                        ? "btn-shimmer-hover bg-[#E7AFC0] text-[#2A121B] shadow-md hover:bg-[#f2c6d4] hover:shadow-[0_12px_26px_-8px_rgba(231,175,192,0.7)]"
                        : "btn-gold-shimmer text-white shadow-sm hover:shadow-[0_12px_26px_-8px_rgba(107,30,48,0.65)]"
                    }`}
                  >
                    Encargar {plan.name}
                  </Link>
                </MotionTap>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* ================= RESEÑAS AUTÉNTICAS & CONFIANZA VERIFICADA ================= */}
      <TestimonialsSection />

      {/* ================= FAQ ACORDEÓN ================= */}
      <section id="faq" className="border-t border-[#2A121B]/12 bg-[#FFFBFA] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <MotionSection className="text-center">
            <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B78A4E]">
              Despejá tus dudas
            </span>
            <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B]">
              Preguntas Frecuentes
            </h2>
          </MotionSection>

          <div className="mt-8 space-y-3">
            {FAQS.map((item, idx) => (
              <MotionSection key={item.q} delay={Math.min(idx * 0.03, 0.18)}>
                <details className="group rounded-[16px] border border-[#2A121B]/12 bg-[#FBF1EE]/60 p-5 transition-colors open:border-[#B78A4E] open:bg-[#FFFBFA]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#2A121B]">
                    <span>{item.q}</span>
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#2A121B]/10 bg-white text-[#6B1E30] transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown strokeWidth={1.5} className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-[#7A5A62] sm:text-sm">
                    {item.a}
                  </p>
                </details>
              </MotionSection>
            ))}
          </div>

          {/* CTA Final */}
          <MotionSection delay={0.1}>
            <div className="shadow-bordo-lg relative mt-12 overflow-hidden rounded-[26px] border border-[#B78A4E]/35 bg-gradient-to-br from-[#551726] via-[#4A1420] to-[#320C15] p-8 text-center text-white sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#B78A4E]/20 blur-2xl"
              />
              <AnimatedIconBox className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E7AFC0]/40 bg-white/10 text-[#E7AFC0]">
                <Clock className="h-6 w-6" strokeWidth={1.5} />
              </AnimatedIconBox>
              <h3 className="font-display-cormorant relative z-10 mt-3 text-3xl font-semibold sm:text-4xl">
                ¿Tenés tu evento pronto o buscás un diseño 100% a medida?
              </h3>
              <p className="relative z-10 mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#FBF1EE]/85 sm:text-sm">
                Elegí uno de nuestros 42 modelos para tener tu link en menos de 24 hs, o escribinos por WhatsApp si necesitás una propuesta exclusiva para boda destino o evento corporativo.
              </p>
              <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3">
                <MotionTap>
                  <Link
                    href="/encargar"
                    className="btn-shimmer-hover inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#E7AFC0] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2A121B] shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-[#f1c4d2] hover:shadow-[0_12px_26px_-8px_rgba(231,175,192,0.7)]"
                  >
                    Encargar Mi Invitación
                  </Link>
                </MotionTap>
                {(() => {
                  const waUrl = getWhatsAppHref(
                    `¡Hola ${BUSINESS_CONFIG.brandName}! Quiero consultar por una invitación digital.`
                  );
                  return waUrl ? (
                    <MotionTap>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-shimmer-hover inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E7AFC0]/45 px-6 py-3.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:border-[#E7AFC0] hover:bg-white/10"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />
                        Consultar por WhatsApp
                      </a>
                    </MotionTap>
                  ) : null;
                })()}
              </div>
            </div>
          </MotionSection>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#2A121B]/12 bg-[#FBF1EE] py-10 text-xs text-[#7A5A62]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <BrandLogo size="sm" />
                <span className="hidden h-4 w-px bg-[#2A121B]/15 sm:inline-block" />
                <span className="text-[11px] font-medium text-[#7A5A62]">
                  {BUSINESS_CONFIG.tagline} (Argentina)
                </span>
              </div>
              <p className="mt-3 text-[11px] text-[#7A5A62]">
                Responsable: {BUSINESS_CONFIG.legalHolderName || "Pendiente de confirmación"} ·{" "}
                Soporte:{" "}
                {BUSINESS_CONFIG.supportEmail ||
                  (BUSINESS_CONFIG.whatsappConfigured
                    ? `WhatsApp +${BUSINESS_CONFIG.whatsappNumber}`
                    : "Canal de soporte pendiente de configuración")}{" "}
                · Horario: {BUSINESS_CONFIG.supportHours || "Pendiente de confirmación"}
              </p>
            </div>

            <nav aria-label="Enlaces legales y demos" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium">
              <Link href="/privacidad" className="py-1 underline decoration-[#B78A4E]/60 underline-offset-4 hover:text-[#6B1E30]">
                Política de Privacidad
              </Link>
              <Link href="/condiciones" className="py-1 underline decoration-[#B78A4E]/60 underline-offset-4 hover:text-[#6B1E30]">
                Condiciones del Servicio
              </Link>
              <Link href="/panel/demo-boda" className="py-1 hover:text-[#6B1E30]">
                Panel Demo
              </Link>
              <Link href="/admin" className="py-1 hover:text-[#6B1E30]">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* WhatsApp Flotante con Pulse */}
      <WhatsAppFloat />
    </div>
  );
}
