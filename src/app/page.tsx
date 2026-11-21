import React from "react";
import Link from "next/link";
import {
  Music,
  CheckCircle2,
  Clock,
  ShieldCheck,
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
} from "lucide-react";
import { HeroMockup } from "@/components/HeroMockup";
import { HeroFan } from "@/components/HeroFan";
import { MiniTester } from "@/components/MiniTester";
import { CatalogShowcase } from "@/components/CatalogShowcase";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BUSINESS_CONFIG, PRICING_PLANS } from "@/config/business";

const FAQS = [
  {
    q: "¿Cuánto demoran en entregar mi invitación?",
    a: "Entregamos en menos de 24 horas hábiles desde que recibimos tus datos y fotos. Apenas enviás tu pedido ya podés abrir el borrador y personalizar textos y fotos en vivo.",
  },
  {
    q: "¿Mis invitados tienen que descargar una app o iniciar sesión?",
    a: "Para nada. Se abre directo en el navegador del celular desde WhatsApp, sin logins ni registros previos. Además protegemos los colores para que el modo oscuro del teléfono no arruine el diseño.",
  },
  {
    q: "¿Puedo enviar enlaces personalizados con el nombre de cada familia?",
    a: "Sí. En tu Panel Privado podés generar enlaces únicos del tipo «Familia Gómez — 3 lugares · Mesa 4». Al abrir el sobre, el invitado ve su nombre y sus pases asignados.",
  },
  {
    q: "¿Puedo actualizar la hora, el salón o la música si algo cambia?",
    a: "Sí. Al ser una invitación web real y no una imagen estática, actualizás el dato desde tu estudio o por WhatsApp y el mismo link que ya enviaste refleja el cambio al instante.",
  },
  {
    q: "¿Qué pasa después de la fiesta con mi invitación?",
    a: "Podés activar el Modo Recuerdo con un clic: la cuenta regresiva se transforma en una tarjeta conmemorativa junto a la galería de fotos y el Muro de Buenos Deseos de tus invitados.",
  },
  {
    q: "¿Cómo se paga desde Argentina?",
    a: "Podés abonar por Transferencia Bancaria con 25% OFF automático, o con tarjetas, débito y dinero en cuenta a través de Mercado Pago Checkout Pro.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Elegís el estilo",
    desc: "Explorá 42 diseños en vivo para Bodas, XV, 18 años varón, Niños, Niñas y Bautismos.",
  },
  {
    step: "02",
    title: "Personalizamos",
    desc: "Cargás fecha, mapa, CBU, fotos y música en 2 minutos desde /encargar o en nuestro estudio en vivo.",
  },
  {
    step: "03",
    title: "Revisás antes de enviar",
    desc: "Probás el sobre animado, el audio y la vista exacta en celular en tu borrador antes de compartir.",
  },
  {
    step: "04",
    title: "Compartís por WhatsApp",
    desc: "Enviás tu link con tarjeta OpenGraph y seguís confirmaciones, alergias y canciones en Excel.",
  },
];

const MORE_THAN_INVITE = [
  {
    icon: Camera,
    title: "Galería & Recuerdos",
    desc: "Álbum interactivo con lightbox táctil y Modo Recuerdo post-fiesta.",
  },
  {
    icon: MapPin,
    title: "Ubicación 1 Toque",
    desc: "Botón directo a Google Maps + agendar en Google Calendar o iPhone.",
  },
  {
    icon: CheckCircle2,
    title: "RSVP + Pases + Sin TACC",
    desc: "Confirmación inteligente por familia, alergias y canciones para el DJ.",
  },
  {
    icon: Users,
    title: "Panel & Planilla Excel",
    desc: "Links con nombre por invitado y descarga CSV lista para el salón.",
  },
  {
    icon: Music,
    title: "Música Integrada",
    desc: "Suena al abrir el sobre sin salir a YouTube, con botón flotante.",
  },
];

const GUARANTEES = [
  {
    title: "Entrega real en menos de 24 hs",
    desc: "Cargás los datos en 2 minutos sin cuentas de Google y tenés tu link listo para compartir por WhatsApp.",
  },
  {
    title: "Personalización y cambios incluidos",
    desc: "Si cambia el horario, el salón o querés ajustar la música o tipografía, se actualiza al instante sobre el mismo link.",
  },
  {
    title: "Colores protegidos en modo oscuro",
    desc: "Bloqueamos la paleta original para que el modo oscuro del teléfono nunca arruine las letras ni los fondos.",
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
      <header className="sticky top-0 z-40 border-b border-[#2A121B]/12 bg-[#FFFBFA]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display-cormorant text-[28px] font-semibold italic tracking-tight text-[#6B1E30]">
              Invita
            </span>
            <span className="font-display-cormorant text-[28px] font-semibold italic tracking-tight text-[#C4718C]">
              Studio
            </span>
          </Link>

          <nav className="font-ui-jost hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-[#7A5A62] md:flex">
            <a href="#modelos" className="transition-colors hover:text-[#6B1E30]">
              Modelos (42)
            </a>
            <Link href="/personalizar/demo-boda" className="transition-colors hover:text-[#6B1E30]">
              Personalizador
            </Link>
            <Link href="/panel/demo-boda" className="transition-colors hover:text-[#6B1E30]">
              Panel Demo
            </Link>
            <a href="#precios" className="transition-colors hover:text-[#6B1E30]">
              Precios ARS
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/encargar"
              className="rounded-full bg-[#6B1E30] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_-10px_rgba(107,30,48,0.55)] transition-all hover:bg-[#4A1420]"
            >
              Encargar Ahora
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO EDITORIAL ================= */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-12 pt-10 sm:px-6 lg:pt-16">
        <div
          aria-hidden="true"
          className="animate-drift-1 pointer-events-none absolute -left-24 -top-10 h-80 w-80 rounded-full bg-[#E7AFC0]/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-drift-2 pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-[#B78A4E]/20 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="animate-rise-1 font-ui-jost inline-flex items-center gap-2 rounded-full border border-[#B78A4E]/40 bg-[#FFFBFA] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B1E30] shadow-sm">
              Invitaciones digitales de autor · Argentina
            </span>

            <h1 className="animate-rise-2 font-display-cormorant mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-[#2A121B] sm:text-7xl">
              Tu evento empieza desde el{" "}
              <span className="gold-underline italic text-[#6B1E30]">
                primer clic.
              </span>
            </h1>

            <p className="animate-rise-2 mt-5 max-w-xl text-base leading-relaxed text-[#7A5A62] sm:text-lg">
              Se abre directo en el celular, <strong className="text-[#2A121B]">sin apps ni descargas</strong>. Diseños de estudio con sobre animado 3D, música integrada, mapa en 1 toque y confirmación inteligente listos en{" "}
              <strong className="text-[#6B1E30]">menos de 24 hs</strong>.
            </p>

            <div className="animate-rise-3 mt-7 flex flex-wrap items-center gap-3.5">
              <a
                href="#modelos"
                className="btn-gold-shimmer inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(74,20,32,0.55)] transition-transform hover:scale-[1.02]"
              >
                Explorar 42 Modelos en Vivo
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <Link
                href="/panel/demo-boda"
                className="inline-flex items-center gap-2 rounded-full border border-[#6B1E30]/35 bg-[#FFFBFA] px-5 py-3.5 text-sm font-semibold text-[#6B1E30] transition-colors hover:border-[#6B1E30] hover:bg-white"
              >
                <BarChart3 className="h-4 w-4 text-[#B78A4E]" strokeWidth={1.5} />
                Probar Panel Organizador
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#2A121B]/12 pt-6 text-xs text-[#7A5A62]">
              <div>
                <p className="font-display-cormorant text-2xl font-bold text-[#6B1E30]">&lt; 24 hs</p>
                <p>Entrega garantizada</p>
              </div>
              <div>
                <p className="font-display-cormorant text-2xl font-bold text-[#6B1E30]">25% OFF</p>
                <p>Pagando por Transferencia</p>
              </div>
              <div>
                <p className="font-display-cormorant text-2xl font-bold text-[#6B1E30]">42 Modelos</p>
                <p>Sin apps ni logins</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroMockup />
          </div>
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
          <div className="text-center">
            <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B78A4E]">
              Más que una invitación
            </span>
            <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
              Todo lo que tus invitados necesitan, <span className="italic text-[#6B1E30]">en un solo link</span>
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MORE_THAN_INVITE.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="shadow-bordo-lg rounded-[16px] border border-[#2A121B]/12 border-l-2 border-l-[#B78A4E] bg-[#FBF1EE]/65 p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5 text-[#6B1E30]" strokeWidth={1.5} />
                  <h3 className="mt-3 text-sm font-bold text-[#2A121B]">{card.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">{card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Compromiso & Garantías Verificables */}
          <div className="mt-8 grid grid-cols-1 gap-4 rounded-[20px] border border-[#B78A4E]/35 bg-[#FBF1EE] p-6 sm:grid-cols-3">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="flex items-start gap-3">
                <HeartHandshake className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B78A4E]" strokeWidth={1.5} />
                <div>
                  <h4 className="text-xs font-bold text-[#2A121B]">{g.title}</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#7A5A62]">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA EN 4 PASOS ================= */}
      <section className="border-b border-[#2A121B]/12 bg-[#FBF1EE] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6B1E30]">
              Cómo funciona
            </span>
            <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
              De la idea al WhatsApp en 4 pasos
            </h2>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="rounded-[18px] border border-[#2A121B]/12 border-l-2 border-l-[#B78A4E] bg-[#FFFBFA] p-6 shadow-sm"
              >
                <span className="font-display-cormorant text-3xl font-semibold italic text-[#B78A4E]">
                  {item.step}
                </span>
                <h3 className="mt-2 text-base font-bold text-[#2A121B]">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRECIOS TRANSPARENTES EN ARS ================= */}
      <section id="precios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="font-ui-jost inline-flex items-center gap-1.5 rounded-full border border-[#B78A4E]/40 bg-[#FFFBFA] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B1E30]">
            Precios Transparentes en Pesos Argentinos
          </span>
          <h2 className="font-display-cormorant mt-3 text-4xl font-semibold text-[#2A121B] sm:text-5xl">
            Elegí tu plan <span className="italic text-[#6B1E30]">sin letras chicas</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#7A5A62]">
            Pagás una sola vez por evento. Todos los planes incluyen acceso hasta 30 días después de la fiesta y{" "}
            <strong className="text-[#2A121B]">25% OFF pagando por transferencia</strong>.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-[24px] border p-7 transition-shadow ${
                plan.highlight
                  ? "shadow-bordo-lg border-[#B78A4E] bg-[#4A1420] text-white ring-2 ring-[#E7AFC0]/40 lg:scale-[1.03]"
                  : "border-[#2A121B]/12 bg-[#FFFBFA] text-[#2A121B] shadow-sm"
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
                    <li key={feat} className="flex items-start gap-2">
                      <Check
                        strokeWidth={1.75}
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          plan.highlight ? "text-[#E7AFC0]" : "text-[#6B1E30]"
                        }`}
                      />
                      <span className="leading-relaxed opacity-90">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/encargar"
                className={`mt-8 block w-full rounded-full py-3.5 text-center text-xs font-bold uppercase tracking-[0.18em] transition-transform hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-[#E7AFC0] text-[#2A121B]"
                    : "bg-[#6B1E30] text-white hover:bg-[#4A1420]"
                }`}
              >
                Encargar {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FAQ ACORDEÓN ================= */}
      <section id="faq" className="border-t border-[#2A121B]/12 bg-[#FFFBFA] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B78A4E]">
              Despejá tus dudas
            </span>
            <h2 className="font-display-cormorant mt-2 text-4xl font-semibold text-[#2A121B]">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-[16px] border border-[#2A121B]/12 bg-[#FBF1EE]/60 p-5 transition-colors open:border-[#B78A4E] open:bg-[#FFFBFA]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#2A121B]">
                  <span>{item.q}</span>
                  <ChevronDown
                    strokeWidth={1.5}
                    className="h-4 w-4 flex-shrink-0 text-[#6B1E30] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-[#7A5A62] sm:text-sm">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          {/* CTA Final */}
          <div className="shadow-bordo-lg mt-12 rounded-[26px] bg-[#4A1420] p-8 text-center text-white sm:p-10">
            <Clock className="mx-auto h-7 w-7 text-[#E7AFC0]" strokeWidth={1.5} />
            <h3 className="font-display-cormorant mt-3 text-3xl font-semibold sm:text-4xl">
              ¿Tenés tu evento pronto o buscás un diseño 100% a medida?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#FBF1EE]/85 sm:text-sm">
              Elegí uno de nuestros 42 modelos para tener tu link en menos de 24 hs, o escribinos por WhatsApp si necesitás una propuesta exclusiva para boda destino o evento corporativo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/encargar"
                className="inline-flex items-center gap-2 rounded-full bg-[#E7AFC0] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2A121B] hover:bg-[#f1c4d2]"
              >
                Encargar Mi Invitación
              </Link>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  "¡Hola InvitaStudio! Quiero cotizar una invitación digital."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#E7AFC0]/45 px-6 py-3.5 text-xs font-semibold text-white hover:border-[#E7AFC0]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />
                Cotizar a Medida por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#2A121B]/12 bg-[#FBF1EE] py-8 text-center text-xs text-[#7A5A62]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-[#2A121B]">
            <ShieldCheck className="h-4 w-4 text-[#6B1E30]" strokeWidth={1.5} />
            {BUSINESS_CONFIG.brandName} · Invitaciones Digitales de Autor (Argentina)
          </div>
          <div className="flex items-center gap-4">
            <Link href="/panel/demo-boda" className="hover:text-[#6B1E30]">
              Panel Demo
            </Link>
            <Link href="/admin" className="hover:text-[#6B1E30]">
              Admin Estudio
            </Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp Flotante con Pulse */}
      <WhatsAppFloat />
    </div>
  );
}
