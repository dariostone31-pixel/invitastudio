"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CalendarPlus,
  Download,
  Copy,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  Heart,
} from "lucide-react";
import { InvitationSkin } from "@/templates/catalog";
import type {
  EnabledSectionsConfig,
  ParentsOrHostsGroup,
  ScheduleItem,
} from "@/lib/db";
import { EnvelopeGate } from "./EnvelopeGate";
import { AudioPlayerFloat } from "./AudioPlayerFloat";
import { CountdownTimer } from "./CountdownTimer";
import { OrnamentDivider } from "./OrnamentDivider";
import { RsvpModal } from "./RsvpModal";
import { RevealSection } from "./RevealSection";
import { AmbientParticles } from "./AmbientParticles";
import { CornerOrnaments, CircularSaveSeal } from "./CornerOrnaments";
import {
  CelebrationAttireIcon,
  CelebrationCameraIcon,
  CelebrationCeremonyIcon,
  CelebrationCheckIcon,
  CelebrationGiftIcon,
  CelebrationPinIcon,
  CelebrationToastIcon,
  CelebrationWishesIcon,
} from "./CelebrationIcons";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";

export interface PublicWish {
  id: string;
  guestName: string;
  message: string;
}

interface InvitationRendererProps {
  skin: InvitationSkin;
  eventSlug?: string;
  guestName?: string;
  passes?: number;
  table?: string;
  customTitle?: string;
  customDateDisplay?: string;
  customTimeDisplay?: string;
  customDateISO?: string;
  customVenue?: string;
  customAddress?: string;
  customAlias?: string;
  customDressCode?: string;
  customQuote?: string;
  customParentsOrHosts?: ParentsOrHostsGroup[];
  customStoryTitle?: string;
  customStoryText?: string;
  customSchedule?: ScheduleItem[];
  customHeroImage?: string;
  customGallery?: string[];
  customFont?: InvitationSkin["fontDisplay"];
  customAccent?: string;
  customAudioUrl?: string;
  memoryMode?: boolean;
  wishesList?: PublicWish[];
  enabledSections?: EnabledSectionsConfig;
  skipGate?: boolean;
  showPreviewChrome?: boolean;
}

const FONT_MAP: Record<InvitationSkin["fontDisplay"], string> = {
  cormorant: "font-display-cormorant",
  fraunces: "font-display-fraunces",
  script: "font-display-script",
  pinyon: "font-display-pinyon",
  cinzel: "font-display-cinzel",
  oswald: "font-display-oswald",
  fredoka: "font-display-fredoka",
  playfair: "font-display-playfair",
};

function buildGoogleCalendarUrl(title: string, dateISO: string, location: string, details: string) {
  const start = new Date(dateISO);
  if (Number.isNaN(start.getTime())) return "https://calendar.google.com";
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(title: string, dateISO: string, location: string, details: string) {
  const start = new Date(dateISO);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invita con Alma//ES",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${details}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function InvitationRenderer({
  skin,
  eventSlug,
  guestName,
  passes,
  table,
  customTitle,
  customDateDisplay,
  customTimeDisplay,
  customDateISO,
  customVenue,
  customAddress,
  customAlias,
  customDressCode,
  customQuote,
  customParentsOrHosts,
  customStoryTitle,
  customStoryText,
  customSchedule,
  customHeroImage,
  customGallery,
  customFont,
  customAccent,
  customAudioUrl,
  memoryMode = false,
  wishesList = [],
  enabledSections,
  skipGate = false,
  showPreviewChrome = true,
}: InvitationRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"alias" | "cbu" | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { sample, layoutId } = skin;
  const palette = customAccent ? { ...skin.palette, accent: customAccent } : skin.palette;
  const isNewspaper = layoutId === "diario-editorial";
  const isTicket = layoutId === "ticket-vip";
  const isEditorialPaper = layoutId === "editorial-sobre";
  const cardRadius = isNewspaper ? "rounded-none" : isTicket ? "rounded-2xl" : "rounded-[22px]";
  const innerRadius = isNewspaper ? "rounded-none" : isTicket ? "rounded-xl" : "rounded-[18px]";
  const cardShadow = isNewspaper
    ? "shadow-none"
    : palette.isDark
    ? "shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)]"
    : "shadow-[0_10px_28px_-14px_rgba(42,36,32,0.12)]";
  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccentOnSurface = ensureContrast(palette.accent, palette.surface, 4.6);
  const textAccentOnBg = ensureContrast(palette.accent, palette.bg, 4.6);
  const textAccentOnAlt = ensureContrast(palette.accent, palette.surfaceAlt, 4.6);
  const showAmbientParticles =
    layoutId === "neon-dark" ||
    skin.id === "nina-hadas-sobre" ||
    skin.id === "xv-mariposas-lila";
  const heroImage = customHeroImage || skin.heroImage;
  const galleryList =
    customGallery && customGallery.length > 0 ? customGallery : sample.gallery;
  const audioSrc =
    customAudioUrl === "none" ? "" : customAudioUrl || sample.audioUrl;

  const sections: EnabledSectionsConfig = {
    countdown: enabledSections?.countdown ?? true,
    story: enabledSections?.story ?? true,
    schedule: enabledSections?.schedule ?? true,
    gallery: enabledSections?.gallery ?? true,
    dressCode: enabledSections?.dressCode ?? true,
    gifts: enabledSections?.gifts ?? true,
    wishes: enabledSections?.wishes ?? true,
    rsvp: enabledSections?.rsvp ?? true,
  };

  // 3-layer typographic system:
  // Layer 1 (Hero / Monogram): displayFont
  // Layer 2 (Section Headings): sectionSerifFont
  // Layer 3 (Eyebrows / UI): font-ui-jost
  const activeFontKey = customFont || skin.fontDisplay;
  const displayFont = FONT_MAP[activeFontKey];
  const sectionHeadingFont =
    skin.category === "nino" || skin.category === "nina"
      ? "font-display-fredoka"
      : activeFontKey === "oswald" || activeFontKey === "cinzel"
      ? "font-display-cinzel"
      : "font-display-cormorant";
  const effectiveSkin =
    customAccent || customHeroImage
      ? { ...skin, palette, heroImage }
      : skin;
  const eventTitle = customTitle || sample.title;
  const dateDisplay = customDateDisplay || sample.dateDisplay;
  const timeDisplay = customTimeDisplay || sample.timeDisplay;
  const parentsList =
    customParentsOrHosts && customParentsOrHosts.length > 0
      ? customParentsOrHosts
      : sample.parentsOrHosts;
  const storyHeading = customStoryTitle?.trim() || sample.storyTitle || "Nuestra Historia";
  const storyBody = customStoryText?.trim() || sample.storyText;
  const scheduleList =
    customSchedule && customSchedule.length > 0 ? customSchedule : sample.schedule;
  const dateISO = customDateISO || sample.dateISO;
  const quoteText = customQuote || sample.quote;
  const dressCodeLabel = customDressCode || sample.dressCode.label;
  const aliasText = customAlias || sample.gifts.alias;

  const locations = customVenue
    ? [
        {
          label: "Recepción / Evento",
          venue: customVenue,
          address: customAddress || "Dirección a confirmar",
          city: "Argentina",
          time: timeDisplay,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${customVenue} ${customAddress || ""}`
          )}`,
        },
      ]
    : sample.locations;

  const mainVenue = locations[locations.length - 1];
  const fullAddress = `${mainVenue.venue}, ${mainVenue.address}, ${mainVenue.city}`;

  const handleCopy = async (text: string, field: "alias" | "cbu") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {/* Gate / Sobre animado */}
      {!skipGate && (
        <EnvelopeGate
          skin={effectiveSkin}
          guestName={guestName}
          passes={passes}
          table={table}
          customTitle={customTitle}
          fontDisplayClass={displayFont}
          onOpen={() => setIsPlaying(true)}
        />
      )}

      {/* Audio player flotante */}
      {audioSrc && (
        <AudioPlayerFloat
          src={audioSrc}
          title={sample.audioTitle}
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((p) => !p)}
          accentColor={buttonBg}
          surfaceColor={palette.surface}
          textColor={palette.text}
          borderColor={palette.border}
          hasTopChrome={showPreviewChrome}
        />
      )}

      {/* Ambient Falling Petals / Sparkles: solo en temáticas nocturnas / mágicas */}
      {showAmbientParticles && (
        <AmbientParticles category={skin.category} layoutId={layoutId} color={palette.accent} />
      )}

      {/* Fondo atmosférico sutil en escritorio */}
      <div
        className="pointer-events-none fixed inset-0 hidden bg-cover bg-center opacity-15 blur-2xl md:block"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Barra de Demo / Preview */}
      {showPreviewChrome && (
        <div className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 px-4 py-2 text-xs text-stone-700 backdrop-blur-md">
          <div className="mx-auto flex max-w-[480px] items-center justify-between gap-2">
            <Link
              href="/#modelos"
              className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-stone-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Catálogo
            </Link>
            <span className="truncate text-[11px] font-medium text-stone-500">
              Demo: <strong className="text-stone-800">{skin.name}</strong>
            </span>
            <Link
              href={`/encargar?modelo=${skin.id}`}
              className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Elegir este
            </Link>
          </div>
        </div>
      )}

      {/* Contenedor Mobile-First (480px máx centrado en escritorio) */}
      <main
        className={`relative z-10 mx-auto min-h-screen w-full max-w-[480px] shadow-2xl md:my-6 md:overflow-hidden md:border ${
          isNewspaper ? "md:rounded-none" : "md:rounded-[32px]"
        }`}
        style={{
          backgroundColor: palette.bg,
          borderColor: palette.border,
        }}
      >
        {(isEditorialPaper || isNewspaper) && (
          <div aria-hidden="true" className="paper-texture absolute inset-0 z-0 opacity-60" />
        )}
        {/* ================= HERO SECTION ================= */}
        {layoutId === "fullscreen-hero" || layoutId === "editorial-sobre" ? (
          <section className="relative overflow-hidden">
            <div className="relative h-[420px] sm:h-[460px] w-full overflow-hidden">
              <img
                src={heroImage}
                alt={eventTitle}
                className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""}`}
              />
              {!isEditorialPaper && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/70" />
              )}
              {isEditorialPaper && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${palette.bg})`,
                  }}
                />
              )}
              <CornerOrnaments
                color={isEditorialPaper ? textAccentOnSurface : "#FFFFFF"}
                layoutId={layoutId}
              />

              {/* Framed plaque: ivory paper plaque on editorial-sobre, dark glass on fullscreen photographic hero */}
              <div className="absolute inset-0 flex items-center justify-center px-6">
                {isEditorialPaper ? (
                  <div
                    className="relative w-full max-w-[332px] rounded-[20px] border px-5 py-7 text-center shadow-[0_18px_38px_-16px_rgba(42,36,32,0.22)]"
                    style={{
                      backgroundColor: `${palette.surface}F2`,
                      borderColor: palette.border,
                      color: palette.text,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-2 rounded-[14px] border opacity-55"
                      style={{ borderColor: palette.accent }}
                    />
                    <p
                      className="font-ui-jost relative text-[11px] font-semibold uppercase tracking-[0.24em]"
                      style={{ color: textAccentOnSurface }}
                    >
                      {sample.eyebrow}
                    </p>
                    <h1
                      className={`animate-tracking-expand relative mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold leading-[1.22] ${displayFont}`}
                      style={{ color: palette.text }}
                    >
                      {eventTitle}
                    </h1>
                    <div
                      className="relative mt-5 grid grid-cols-3 items-center border-y py-2.5 text-center"
                      style={{ borderColor: palette.border }}
                    >
                      <span className="font-ui-jost text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: palette.textMuted }}>
                        {dateDisplay.split(" ")[0]}
                      </span>
                      <span className={`text-3xl font-bold leading-none ${sectionHeadingFont}`} style={{ color: textAccentOnSurface }}>
                        {dateDisplay.match(/\d{1,2}/)?.[0] || "17"}
                      </span>
                      <span className="font-ui-jost text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: palette.textMuted }}>
                        {timeDisplay}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[350px] rounded-2xl border border-white/60 bg-black/35 px-5 py-7 text-center text-white shadow-xl backdrop-blur-[4px]">
                    <p className="font-ui-jost text-on-image text-[11px] font-semibold uppercase tracking-[0.26em] text-white/95">
                      {sample.eyebrow}
                    </p>
                    <h1
                      className={`animate-tracking-expand text-on-image mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold leading-[1.22] ${displayFont}`}
                    >
                      {eventTitle}
                    </h1>
                    <div className="mt-5 grid grid-cols-3 items-center border-y border-white/65 py-2.5 text-center">
                      <span className="font-ui-jost text-on-image text-[11px] uppercase tracking-[0.18em] text-white/95">
                        {dateDisplay.split(" ")[0]}
                      </span>
                      <span className={`text-on-image text-3xl font-bold leading-none ${sectionHeadingFont}`}>
                        {dateDisplay.match(/\d{1,2}/)?.[0] || "17"}
                      </span>
                      <span className="font-ui-jost text-on-image text-[11px] uppercase tracking-[0.18em] text-white/95">
                        {timeDisplay}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-4 pt-5 text-center">
              <CircularSaveSeal monogram={sample.monogram} color={textAccentOnBg} />

              {guestName && (
                <div
                  className={`mt-5 ${cardRadius} border px-5 py-4 ${cardShadow}`}
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.accent,
                  }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: textAccentOnSurface }}
                  >
                    Pase Personalizado
                  </p>
                  <p className="mt-1 break-words text-base font-semibold" style={{ color: palette.text }}>
                    {guestName}
                  </p>
                  {(passes || table) && (
                    <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa asignada: ${table}` : ""}
                    </p>
                  )}
                </div>
              )}

              <p
                className="mx-auto mt-5 max-w-sm text-[15px] italic leading-[1.65]"
                style={{ color: palette.textMuted }}
              >
                &ldquo;{quoteText}&rdquo;
              </p>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden">
            <div className="relative h-[320px] sm:h-[360px] w-full overflow-hidden">
              <img
                src={heroImage}
                alt={eventTitle}
                className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""}`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: palette.isDark
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.45) 55%, ${palette.bg} 100%)`
                    : `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 55%, ${palette.bg} 100%)`,
                }}
              />
              <CornerOrnaments
                color={palette.isDark ? palette.accent : "#FFFFFF"}
                layoutId={layoutId}
              />
            </div>

            <div className="relative -mt-20 px-6 pb-4 text-center">
              <div
                className={`font-ui-jost mx-auto inline-block border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-sm ${
                  isNewspaper ? "rounded-none" : "rounded-full"
                }`}
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  color: textAccentOnSurface,
                }}
              >
                {sample.eyebrow}
              </div>

              <h1
                className={`animate-tracking-expand mt-4 break-words py-1 text-5xl sm:text-6xl font-semibold leading-[1.2] tracking-tight ${displayFont}`}
                style={{ color: palette.text }}
              >
                {eventTitle}
              </h1>

              <p
                className="font-ui-jost mt-2 text-[12px] font-medium uppercase tracking-[0.2em]"
                style={{ color: palette.textMuted }}
              >
                {dateDisplay} · {timeDisplay}
              </p>

              <CircularSaveSeal
                monogram={sample.monogram}
                color={textAccentOnBg}
              />

              {/* Pase personalizado si viene en URL */}
              {guestName && (
                <div
                  className={`mt-5 ${cardRadius} border px-5 py-4 ${cardShadow}`}
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.accent,
                  }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: textAccentOnSurface }}
                  >
                    Pase Personalizado
                  </p>
                  <p className="mt-1 break-words text-base font-semibold" style={{ color: palette.text }}>
                    {guestName}
                  </p>
                  {(passes || table) && (
                    <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa asignada: ${table}` : ""}
                    </p>
                  )}
                </div>
              )}

              <p
                className="mx-auto mt-6 max-w-sm text-[15px] italic leading-[1.65]"
                style={{ color: palette.textMuted }}
              >
                &ldquo;{quoteText}&rdquo;
              </p>
            </div>
          </section>
        )}

        <div className="px-6 pb-14">
          {/* ================= CUENTA REGRESIVA / MODO RECUERDO ================= */}
          {memoryMode ? (
            <RevealSection>
              <section
                className="mt-6 rounded-3xl border p-6 text-center shadow-sm"
                style={{
                  backgroundColor: palette.surfaceAlt,
                  borderColor: palette.accent,
                }}
              >
                <Heart className="animate-heart-once mx-auto h-6 w-6" style={{ color: textAccentOnAlt }} />
                <p
                  className="font-ui-jost mt-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: textAccentOnAlt }}
                >
                  Álbum & Modo Recuerdo
                </p>
                <h2 className={`mt-1 text-3xl font-semibold ${sectionHeadingFont}`}>
                  ¡Gracias por haber sido parte!
                </h2>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: palette.textMuted }}>
                  Reviví nuestras fotos favoritas y los mensajes de cariño que dejaron quienes compartieron este día inolvidable.
                </p>
              </section>
            </RevealSection>
          ) : (
            sections.countdown && (
              <RevealSection>
                <CountdownTimer
                  targetISO={dateISO}
                  palette={palette}
                  fontClass={sectionHeadingFont}
                  variant={
                    layoutId === "editorial-sobre" || layoutId === "fullscreen-hero"
                      ? "arch"
                      : "grid"
                  }
                />
              </RevealSection>
            )
          )}

          {/* ================= PADRES / PADRINOS (Bloque narrativo abierto) ================= */}
          {parentsList && parentsList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
              <section className="text-center">
                <CelebrationCeremonyIcon category={skin.category} className="mx-auto h-9 w-9" style={{ color: textAccentOnBg }} />
                <h2 className={`mt-2.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                  Con la bendición de
                </h2>
                <div
                  className="mt-5 grid grid-cols-1 gap-5 border-y py-5 sm:grid-cols-2 sm:gap-4"
                  style={{ borderColor: palette.border }}
                >
                  {parentsList.map((group) => (
                    <div key={group.label} className="px-2">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: textAccentOnBg }}
                      >
                        {group.label}
                      </p>
                      <div className="mt-2 space-y-1 text-[15px] font-medium leading-relaxed">
                        {group.names.map((n) => (
                          <p key={n} className="break-words">{n}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </RevealSection>
          )}

          {/* ================= HISTORIA (Bloque narrativo abierto sobre tono suave) ================= */}
          {sections.story && storyBody && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
              <section
                className={`${innerRadius} px-6 py-7 text-center`}
                style={{
                  backgroundColor: palette.surfaceAlt,
                }}
              >
                <CelebrationToastIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnAlt }} />
                <h2 className={`mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                  {storyHeading}
                </h2>
                <p className="mx-auto mt-2.5 max-w-sm break-words text-[15px] leading-[1.7]" style={{ color: palette.textMuted }}>
                  {storyBody}
                </p>
              </section>
            </RevealSection>
          )}

          {/* ================= LUGARES & MAPA & CALENDARIO (Bloque práctico delimitado) ================= */}
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
          <section className="space-y-4">
            <div className="text-center">
              <CelebrationPinIcon className="mx-auto mb-2 h-8 w-8" style={{ color: textAccentOnBg }} />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: textAccentOnBg }}
              >
                Dónde & Cuándo
              </p>
              <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                Coordenadas del Evento
              </h2>
            </div>

            <div className="space-y-4">
              {locations.map((loc) => (
                <div
                  key={loc.label}
                  className={`${cardRadius} border p-5 sm:p-6 text-center ${cardShadow}`}
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  }}
                >
                  <span
                    className={`inline-block px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                      isNewspaper ? "rounded-none border" : "rounded-full"
                    }`}
                    style={{
                      backgroundColor: palette.surfaceAlt,
                      borderColor: palette.border,
                      color: textAccentOnAlt,
                    }}
                  >
                    {loc.label}
                  </span>
                  <h3 className="mt-2.5 break-words text-lg font-semibold">{loc.venue}</h3>
                  <p className="mt-1.5 break-words text-[15px] leading-[1.6]" style={{ color: palette.textMuted }}>
                    {loc.address} · {loc.city}
                  </p>
                  <p
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: textAccentOnSurface }}
                  >
                    <Clock className="h-4 w-4" strokeWidth={1.75} />
                    {loc.time}
                  </p>
                  <div className="mt-4">
                    <a
                      href={loc.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 ${
                        isNewspaper ? "rounded-none" : "rounded-full"
                      }`}
                      style={{
                        backgroundColor: buttonBg,
                        color: palette.accentText,
                      }}
                    >
                      <MapPin className="h-4 w-4" strokeWidth={1.75} />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones Agendar Fecha */}
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
              <a
                href={buildGoogleCalendarUrl(
                  eventTitle,
                  dateISO,
                  fullAddress,
                  quoteText
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 ${innerRadius} border px-4 py-3 text-[13px] font-semibold transition-opacity hover:opacity-80`}
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              >
                <CalendarPlus className="h-4 w-4" strokeWidth={1.75} style={{ color: textAccentOnSurface }} />
                Google Calendar
              </a>
              <button
                type="button"
                onClick={() =>
                  downloadIcsFile(eventTitle, dateISO, fullAddress, quoteText)
                }
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 ${innerRadius} border px-4 py-3 text-[13px] font-semibold transition-opacity hover:opacity-80`}
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              >
                <Download className="h-4 w-4" strokeWidth={1.75} style={{ color: textAccentOnSurface }} />
                Calendario iPhone (.ics)
              </button>
            </div>
          </section>
          </RevealSection>

          {/* ================= ITINERARIO ================= */}
          {sections.schedule && scheduleList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
              <section>
                <div className="mb-5 text-center">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: textAccentOnBg }}
                  >
                    Programa del Día
                  </p>
                  <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>Itinerario</h2>
                </div>

                {/* Mobile <640px: left rail full-width cards; >=640px: center axis alternating */}
                <div className="relative space-y-4 pl-6 sm:pl-0">
                  <div
                    className="absolute bottom-2 left-[11px] top-2 w-[1.5px] sm:left-1/2 sm:-translate-x-1/2"
                    style={{ backgroundColor: palette.border }}
                  />
                  {scheduleList.map((item, idx) => {
                    const isLeft = idx % 2 === 0;
                    return (
                      <div
                        key={item.time + item.title}
                        className="relative sm:grid sm:grid-cols-2 sm:items-center sm:gap-4"
                      >
                        <span
                          className="absolute -left-[19px] top-4 z-10 h-3 w-3 rounded-full border-2 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                          style={{
                            backgroundColor: textAccentOnBg,
                            borderColor: palette.bg,
                          }}
                        />
                        {isLeft ? (
                          <>
                            <div
                              className={`${innerRadius} border p-4 text-left ${cardShadow} sm:p-4 sm:text-right`}
                              style={{
                                backgroundColor: palette.surface,
                                borderColor: palette.border,
                              }}
                            >
                              <span
                                className="font-ui-jost text-[12px] font-bold tracking-wider"
                                style={{ color: textAccentOnSurface }}
                              >
                                {item.time} hs
                              </span>
                              <h3 className="mt-1 text-[15px] font-semibold">
                                {item.title}
                              </h3>
                              <p
                                className="mt-1 text-[14px] leading-relaxed"
                                style={{ color: palette.textMuted }}
                              >
                                {item.detail}
                              </p>
                            </div>
                            <div className="hidden sm:block" />
                          </>
                        ) : (
                          <>
                            <div className="hidden sm:block" />
                            <div
                              className={`${innerRadius} border p-4 text-left ${cardShadow} sm:p-4`}
                              style={{
                                backgroundColor: palette.surface,
                                borderColor: palette.border,
                              }}
                            >
                              <span
                                className="font-ui-jost text-[12px] font-bold tracking-wider"
                                style={{ color: textAccentOnSurface }}
                              >
                                {item.time} hs
                              </span>
                              <h3 className="mt-1 text-[15px] font-semibold">
                                {item.title}
                              </h3>
                              <p
                                className="mt-1 text-[14px] leading-relaxed"
                                style={{ color: palette.textMuted }}
                              >
                                {item.detail}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </RevealSection>
          )}

          {/* ================= GALERÍA DE FOTOS ================= */}
          {sections.gallery && galleryList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
              <section>
                <div className="mb-4 text-center">
                  <CelebrationCameraIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnBg }} />
                  <h2 className={`mt-2 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                    Momentos Especiales
                  </h2>
                </div>
                <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                  {galleryList.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={() => setLightboxImg(imgUrl)}
                      aria-label={`Ampliar foto ${idx + 1}`}
                      className={`group relative h-60 w-52 flex-shrink-0 snap-center overflow-hidden ${cardRadius} border ${cardShadow}`}
                      style={{ borderColor: palette.border }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          skin.imageFilter ?? ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </section>
            </RevealSection>
          )}

          {/* ================= DRESS CODE ================= */}
          {sections.dressCode && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
            <section
              className={`${cardRadius} border p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              <CelebrationAttireIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnSurface }} />
            <p
              className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: palette.textMuted }}
            >
              Código de Vestimenta
            </p>
            <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
              {dressCodeLabel}
            </h2>
            <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
              {sample.dressCode.notes}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3.5">
              {sample.dressCode.swatches.map((sw) => (
                <div key={sw.name} className="flex flex-col items-center gap-1">
                  <span
                    className="h-7 w-7 rounded-full border shadow-inner"
                    style={{ backgroundColor: sw.hex, borderColor: palette.border }}
                  />
                  <span className="text-[11px]" style={{ color: palette.textMuted }}>
                    {sw.name}
                  </span>
                </div>
              ))}
            </div>

            {(sample.adultOnlyNote || sample.kidsNote) && (
              <div
                className={`mt-5 ${innerRadius} border px-4 py-3 text-[14px] leading-relaxed`}
                style={{
                  backgroundColor: palette.surfaceAlt,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              >
                {sample.adultOnlyNote || sample.kidsNote}
              </div>
            )}
          </section>
          </RevealSection>
          )}

          {/* ================= REGALOS / VAQUITA + COPIAR ALIAS ================= */}
          {sections.gifts && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
            <section
              className={`${cardRadius} border p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              <CelebrationGiftIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnSurface }} />
            <h2 className={`mt-2.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
              {sample.gifts.title}
            </h2>
            <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
              {sample.gifts.intro}
            </p>

            <div
              className={`mt-5 space-y-2.5 ${innerRadius} border p-4 text-left text-[14px]`}
              style={{
                backgroundColor: palette.bg,
                borderColor: palette.border,
              }}
            >
              <div className="flex justify-between gap-2">
                <span style={{ color: palette.textMuted }}>Titular:</span>
                <span className="break-words text-right font-semibold">{sample.gifts.holder}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span style={{ color: palette.textMuted }}>Entidad:</span>
                <span className="break-words text-right font-semibold">{sample.gifts.bank}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="min-w-0">
                  <span className="block text-[11px]" style={{ color: palette.textMuted }}>
                    ALIAS
                  </span>
                  <span className="break-all font-mono font-semibold">{aliasText}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(aliasText, "alias")}
                  className={`inline-flex min-h-[44px] flex-shrink-0 items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
                    isNewspaper ? "rounded-none" : "rounded-full"
                  }`}
                  style={{
                    backgroundColor: buttonBg,
                    color: palette.accentText,
                  }}
                >
                  {copiedField === "alias" ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={1.75} />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" strokeWidth={1.75} />
                      Copiar Alias
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 border-t pt-2.5" style={{ borderColor: palette.border }}>
                <div className="min-w-0">
                  <span className="block text-[11px]" style={{ color: palette.textMuted }}>
                    CBU / CVU
                  </span>
                  <span className="block break-all font-mono text-[13px]">{sample.gifts.cbu}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(sample.gifts.cbu, "cbu")}
                  className={`inline-flex min-h-[44px] flex-shrink-0 items-center gap-1.5 border px-3.5 py-2 text-[13px] font-medium ${
                    isNewspaper ? "rounded-none" : "rounded-full"
                  }`}
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  {copiedField === "cbu" ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={1.75} />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" strokeWidth={1.75} />
                      CBU
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
          </RevealSection>
          )}

          {/* ================= MURO DE BUENOS DESEOS / FIRMAS ================= */}
          {sections.wishes && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
            <section className="space-y-3.5">
              <div className="text-center">
                <CelebrationWishesIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnBg }} />
                <p
                  className="font-ui-jost mt-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: textAccentOnBg }}
                >
                  Libro de Firmas
                </p>
                <h2 className={`mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                  Buenos Deseos
                </h2>
                <p className="mx-auto mt-1 max-w-xs text-xs" style={{ color: palette.textMuted }}>
                  Mensajes escritos por nuestros invitados al confirmar su asistencia.
                </p>
              </div>
              {wishesList.length > 0 ? (
                <div className="space-y-3">
                  {wishesList.slice(0, 6).map((w) => (
                    <div
                      key={w.id}
                      className={`${cardRadius} border p-5 ${cardShadow}`}
                      style={{
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                      }}
                    >
                      <p className="break-words text-[15px] italic leading-[1.6]" style={{ color: palette.textMuted }}>
                        &ldquo;{w.message}&rdquo;
                      </p>
                      <p className="font-ui-jost mt-2 text-[12px] font-semibold" style={{ color: textAccentOnSurface }}>
                        — {w.guestName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`${cardRadius} border border-dashed p-5 text-center`}
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  }}
                >
                  <p className="text-[13px] leading-relaxed" style={{ color: palette.textMuted }}>
                    Todavía no hay mensajes publicados. Cuando tus invitados confirmen asistencia en
                    el botón de abajo y dejen un saludo, aparecerá firmado acá.
                  </p>
                </div>
              )}
            </section>
          </RevealSection>
          )}

          {/* ================= LOS PROTAGONISTAS (2 CARDS FOTO 1:1) ================= */}
          {galleryList.length >= 2 && (skin.category === "boda" || skin.category === "xv") && (
            <RevealSection>
              <div className="mt-8 grid grid-cols-2 gap-3.5">
                {galleryList.slice(0, 2).map((img, i) => (
                  <div
                    key={img + i}
                    className={`relative aspect-square overflow-hidden ${cardRadius} border ${cardShadow}`}
                    style={{ borderColor: palette.border }}
                  >
                    <img
                      src={img}
                      alt={
                        skin.category === "boda"
                          ? i === 0
                            ? eventTitle
                            : "Brindis de Honor"
                          : `Protagonista ${i + 1}`
                      }
                      loading="lazy"
                      className={`h-full w-full object-cover ${skin.imageFilter ?? ""}`}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-24"
                      style={{
                        background: "linear-gradient(to top, rgba(28, 22, 18, 0.85) 0%, transparent 100%)",
                      }}
                    />
                    <div className="absolute inset-x-3 bottom-3 text-center text-white">
                      <p className={`break-words text-lg font-semibold leading-tight ${sectionHeadingFont}`}>
                        {skin.category === "boda"
                          ? i === 0
                            ? eventTitle
                            : "Brindis de Honor"
                          : i === 0
                          ? eventTitle
                          : "Noche Soñada"}
                      </p>
                      <p className="font-ui-jost mt-0.5 text-[11px] uppercase tracking-[0.16em] opacity-95">
                        {skin.category === "boda"
                          ? i === 0
                            ? "Los Novios"
                            : "Celebración"
                          : i === 0
                          ? "Quinceañera"
                          : "Celebración"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>
          )}

          {/* ================= CONFIRMAR ASISTENCIA (RSVP NATIVO) ================= */}
          {sections.rsvp && !memoryMode && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} color={textAccentOnBg} />
            <section
              className={`${isNewspaper ? "rounded-none" : "rounded-[24px]"} border-2 p-6 sm:p-7 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surfaceAlt,
                borderColor: textAccentOnAlt,
              }}
            >
              <CelebrationCheckIcon className="mx-auto h-9 w-9" style={{ color: textAccentOnAlt }} />
              <h2 className={`mt-2.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                ¿Contamos con vos?
              </h2>
              <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
                {sample.rsvpDeadline}. Podés indicar si asistís, alergias o menús especiales (Sin TACC) y sugerir música.
              </p>
              <button
                type="button"
                onClick={() => setRsvpOpen(true)}
                className={`mt-5 min-h-[44px] w-full px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-md transition-transform hover:scale-[1.01] active:scale-95 ${
                  isNewspaper ? "rounded-none" : "rounded-full"
                }`}
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Confirmar Asistencia
              </button>
            </section>
          </RevealSection>
          )}

          {/* ================= BLOQUE GRACIAS EMOCIONAL (SIN APARIENCIA DE FORMULARIO) ================= */}
          <RevealSection>
            <section
              className={`relative mt-9 overflow-hidden ${isNewspaper ? "rounded-none border" : "rounded-[24px]"}`}
              style={isNewspaper ? { borderColor: palette.border } : undefined}
            >
              <img
                src={galleryList[0] || heroImage}
                alt="Gracias"
                loading="lazy"
                className={`h-56 w-full object-cover ${skin.imageFilter ?? ""}`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(20,16,14,0.78) 0%, rgba(20,16,14,0.45) 55%, rgba(20,16,14,0.28) 100%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <p className="font-ui-jost text-on-image text-[11px] font-semibold uppercase tracking-[0.26em] text-white/95">
                  Te esperamos
                </p>
                <p className={`text-on-image mt-2 break-words py-1 text-4xl font-semibold leading-[1.2] ${displayFont}`}>
                  ¡Gracias por acompañarnos!
                </p>
              </div>
            </section>
          </RevealSection>

          {/* ================= FOOTER VIRAL VISIBLE ================= */}
          <footer className="mt-12 border-t pt-6 text-center" style={{ borderColor: palette.border }}>
            <Link
              href="/?utm_source=invitacion&utm_medium=footer"
              className="font-ui-jost inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
                color: palette.text,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: textAccentOnSurface }} />
              <span>
                Creado con <strong style={{ color: textAccentOnSurface }}>Invita con Alma</strong> · Creá la tuya
              </span>
            </Link>
          </footer>
        </div>
      </main>

      {/* Modal Nativo RSVP */}
      <RsvpModal
        isOpen={rsvpOpen}
        onClose={() => setRsvpOpen(false)}
        palette={palette}
        eventTitle={eventTitle}
        eventSlug={eventSlug}
        initialName={guestName}
        maxPasses={passes ?? 5}
      />

      {/* Lightbox Galería */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            aria-label="Cerrar vista ampliada"
            className="absolute right-5 top-5 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Vista ampliada"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
