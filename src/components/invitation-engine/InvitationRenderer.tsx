"use client";

import React, { useEffect, useState } from "react";
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
  Music,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { InvitationSkin } from "@/templates/catalog";
import type {
  DjSongItem,
  EnabledSectionsConfig,
  HeroOverlayStyle,
  ParentsOrHostsGroup,
  PreloadedGuest,
  ScheduleItem,
  TarjetaTier,
  TriviaQuestion,
  TriviaScore,
} from "@/lib/db";
import { EnvelopeGate } from "./EnvelopeGate";
import { AudioPlayerFloat } from "./AudioPlayerFloat";
import { CountdownTimer } from "./CountdownTimer";
import { OrnamentDivider } from "./OrnamentDivider";
import { RsvpModal } from "./RsvpModal";
import { RevealSection } from "./RevealSection";
import { AmbientParticles } from "./AmbientParticles";
import { CornerOrnaments, CircularSaveSeal } from "./CornerOrnaments";
import { CollaborativeAlbumSection } from "./CollaborativeAlbumSection";
import { TriviaSection } from "./TriviaSection";
import {
  AnimatedSectionMedallion,
  CelebrationAdultsIcon,
  CelebrationAttireIcon,
  CelebrationCameraIcon,
  CelebrationCeremonyIcon,
  CelebrationCheckIcon,
  CelebrationGiftIcon,
  CelebrationPinIcon,
  CelebrationStoryIcon,
  CelebrationTicketPriceIcon,
  CelebrationWishesIcon,
} from "./CelebrationIcons";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";
import { getDefaultStoryTitleForCategory } from "@/lib/categoryPresets";

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
  paseType?: "todo" | "ceremonia" | "fiesta";
  customTitle?: string;
  customDateDisplay?: string;
  customTimeDisplay?: string;
  customDateISO?: string;
  customVenue?: string;
  customAddress?: string;
  customAlias?: string;
  customGiftBank?: string;
  customGiftHolder?: string;
  customDressCode?: string;
  customRsvpDeadline?: string;
  customAdultsOnly?: boolean;
  customTarjetaPricing?: TarjetaTier[];
  customTarjetaNote?: string;
  customQuote?: string;
  customParentsOrHosts?: ParentsOrHostsGroup[];
  customStoryTitle?: string;
  customStoryText?: string;
  customSchedule?: ScheduleItem[];
  customHeroImage?: string;
  customHeroOverlay?: HeroOverlayStyle;
  customGallery?: string[];
  customFont?: InvitationSkin["fontDisplay"];
  customAccent?: string;
  customAudioUrl?: string;
  memoryMode?: boolean;
  planId?: "esencial" | "pro" | "asistido";
  wishesList?: PublicWish[];
  allowDjSongs?: boolean;
  initialDjPlaylist?: DjSongItem[];
  triviaTitle?: string;
  triviaQuestions?: TriviaQuestion[];
  initialTriviaScores?: TriviaScore[];
  albumUrl?: string;
  instagramHandle?: string;
  eventHashtag?: string;
  guestList?: PreloadedGuest[];
  enabledSections?: EnabledSectionsConfig;
  isDraftPreview?: boolean;
  panelUrl?: string;
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

function parseEventDateRange(dateISO: string, timeDisplay?: string) {
  const datePart = String(dateISO || "").slice(0, 10);
  const matchDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!matchDate) return null;
  const year = Number(matchDate[1]);
  const month = Number(matchDate[2]);
  const day = Number(matchDate[3]);

  const times = Array.from(String(timeDisplay || "").matchAll(/(\d{1,2}):(\d{2})/g));
  const startH = times[0] ? Math.min(23, Number(times[0][1])) : 20;
  const startM = times[0] ? Math.min(59, Number(times[0][2])) : 0;

  let endH = (startH + 4) % 24;
  let endM = startM;
  let crossesMidnight = startH + 4 >= 24;

  if (times[1]) {
    endH = Math.min(23, Number(times[1][1]));
    endM = Math.min(59, Number(times[1][2]));
    crossesMidnight = endH < startH || (endH === startH && endM <= startM);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`;

  const endDateObj = new Date(Date.UTC(year, month - 1, day + (crossesMidnight ? 1 : 0)));
  const endStr = `${endDateObj.getUTCFullYear()}${pad(endDateObj.getUTCMonth() + 1)}${pad(
    endDateObj.getUTCDate()
  )}T${pad(endH)}${pad(endM)}00`;

  return { startStr, endStr };
}

function buildGoogleCalendarUrl(
  title: string,
  dateISO: string,
  location: string,
  details: string,
  timeDisplay?: string
) {
  const range = parseEventDateRange(dateISO, timeDisplay);
  if (!range) return "https://calendar.google.com";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${range.startStr}/${range.endStr}`,
    ctz: "America/Argentina/Buenos_Aires",
    location,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(
  title: string,
  dateISO: string,
  location: string,
  details: string,
  timeDisplay?: string
) {
  const range = parseEventDateRange(dateISO, timeDisplay);
  if (!range) return;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invita con Alma//ES",
    "BEGIN:VEVENT",
    `DTSTART;TZID=America/Argentina/Buenos_Aires:${range.startStr}`,
    `DTEND;TZID=America/Argentina/Buenos_Aires:${range.endStr}`,
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
  paseType = "todo",
  customTitle,
  customDateDisplay,
  customTimeDisplay,
  customDateISO,
  customVenue,
  customAddress,
  customAlias,
  customGiftBank,
  customGiftHolder,
  customDressCode,
  customRsvpDeadline,
  customAdultsOnly = false,
  customTarjetaPricing,
  customTarjetaNote,
  customQuote,
  customParentsOrHosts,
  customStoryTitle,
  customStoryText,
  customSchedule,
  customHeroImage,
  customHeroOverlay = "natural",
  customGallery,
  customFont,
  customAccent,
  customAudioUrl,
  memoryMode = false,
  planId = "pro",
  wishesList = [],
  allowDjSongs = true,
  initialDjPlaylist = [],
  triviaTitle,
  triviaQuestions = [],
  initialTriviaScores = [],
  albumUrl,
  instagramHandle,
  eventHashtag,
  guestList = [],
  enabledSections,
  isDraftPreview = false,
  panelUrl,
  skipGate = false,
  showPreviewChrome = true,
}: InvitationRendererProps) {
  const isEssentialPlan = planId === "esencial";
  const [isPlaying, setIsPlaying] = useState(false);
  const [gateOpened, setGateOpened] = useState(Boolean(skipGate));
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [giftsExpanded, setGiftsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<"alias" | "cbu" | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [djSongs, setDjSongs] = useState<DjSongItem[]>(initialDjPlaylist);
  const [votedSongIds, setVotedSongIds] = useState<Record<string, boolean>>({});
  const [djGuestName, setDjGuestName] = useState(guestName || "");
  const [djSongText, setDjSongText] = useState("");
  const [djSubmitting, setDjSubmitting] = useState(false);
  const [djFeedback, setDjFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const { sample, layoutId } = skin;
  const palette = customAccent ? { ...skin.palette, accent: customAccent } : skin.palette;
  const isNewspaper = layoutId === "diario-editorial";
  const isTicket = layoutId === "ticket-vip";
  const isEditorialPaper = layoutId === "editorial-sobre";
  const isNeon = layoutId === "neon-dark";
  const isInfantil = layoutId === "infantil-animado";
  const isFullscreen = layoutId === "fullscreen-hero";
  const activeFontKey = customFont || skin.fontDisplay;
  const isScriptHeroFont = activeFontKey === "script" || activeFontKey === "pinyon";
  const heroTitleAnimClass = !gateOpened
    ? ""
    : isScriptHeroFont
    ? "type-hero-ink"
    : isNeon || isTicket
    ? "type-hero-vip"
    : isInfantil
    ? "type-hero-playful"
    : "type-hero-editorial";
  const sectionTitleAnimClass = isInfantil
    ? "type-section-title-playful"
    : isScriptHeroFont && isEditorialPaper
    ? "type-section-title-ink"
    : "type-section-title";

  const cardRadius = isNewspaper
    ? "rounded-none"
    : isTicket
    ? "rounded-2xl"
    : isInfantil
    ? "rounded-[28px]"
    : isNeon
    ? "rounded-2xl"
    : "rounded-[22px]";
  const innerRadius = isNewspaper
    ? "rounded-none"
    : isTicket
    ? "rounded-xl"
    : isInfantil
    ? "rounded-[22px]"
    : "rounded-[18px]";
  const cardShadow = isNewspaper
    ? "shadow-none"
    : isInfantil
    ? "shadow-[0_6px_0_rgba(42,36,32,0.08)]"
    : palette.isDark
    ? "shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)]"
    : "shadow-[0_10px_28px_-14px_rgba(42,36,32,0.12)]";
  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccentOnSurface = ensureContrast(palette.accent, palette.surface, 4.6);
  const textAccentOnBg = ensureContrast(palette.accent, palette.bg, 4.6);
  const textAccentOnAlt = ensureContrast(palette.accent, palette.surfaceAlt, 4.6);
  const showAmbientParticles =
    layoutId === "neon-dark" ||
    layoutId === "infantil-animado" ||
    skin.id === "nina-hadas-sobre" ||
    skin.id === "xv-mariposas-lila";
  const heroImage = customHeroImage || skin.heroImage;
  const heroPhotoFilterClass =
    customHeroOverlay === "translucido-suave"
      ? "opacity-70 saturate-[0.88] blur-[0.5px]"
      : customHeroOverlay === "velo-editorial"
      ? "opacity-60 saturate-[0.78]"
      : customHeroOverlay === "bn-editorial"
      ? "grayscale contrast-[1.06] opacity-75"
      : "";
  const heroOverlayTint =
    customHeroOverlay === "translucido-suave"
      ? `${palette.bg}5E`
      : customHeroOverlay === "velo-editorial"
      ? `${palette.surface}78`
      : customHeroOverlay === "bn-editorial"
      ? `${palette.bg}3D`
      : customHeroOverlay === "cinematico"
      ? "rgba(18, 14, 12, 0.36)"
      : "";
  const galleryList =
    customGallery && customGallery.length > 0 ? customGallery : sample.gallery;

  useEffect(() => {
    if (galleryList.length <= 1 || lightboxIdx !== null) return;
    const timer = window.setInterval(() => {
      setActiveGalleryIdx((i) => (i + 1) % galleryList.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [galleryList.length, lightboxIdx]);

  const paseLabel =
    paseType === "ceremonia"
      ? "Pase válido para Ceremonia"
      : paseType === "fiesta"
      ? "Pase válido para Fiesta y Brindis"
      : "";
  const audioSrc =
    customAudioUrl === "none" ? "" : customAudioUrl || sample.audioUrl;

  const sections: EnabledSectionsConfig = isEssentialPlan
    ? {
        countdown: enabledSections?.countdown ?? true,
        story: false,
        schedule: false,
        gallery: false,
        dressCode: enabledSections?.dressCode ?? true,
        gifts: enabledSections?.gifts ?? true,
        wishes: false,
        djSongs: false,
        djVoting: false,
        trivia: false,
        collaborativeAlbum: false,
        rsvp: enabledSections?.rsvp ?? true,
      }
    : {
        countdown: enabledSections?.countdown ?? true,
        story: enabledSections?.story ?? true,
        schedule: enabledSections?.schedule ?? true,
        gallery: enabledSections?.gallery ?? true,
        dressCode: enabledSections?.dressCode ?? true,
        gifts: enabledSections?.gifts ?? true,
        wishes: enabledSections?.wishes ?? true,
        djSongs: enabledSections?.djSongs ?? true,
        djVoting: enabledSections?.djVoting ?? true,
        trivia: enabledSections?.trivia ?? triviaQuestions.length > 0,
        collaborativeAlbum: enabledSections?.collaborativeAlbum ?? true,
        rsvp: enabledSections?.rsvp ?? true,
      };

  const sortedDjSongs = [...djSongs].sort(
    (a, b) => (b.votes ?? 1) - (a.votes ?? 1) || b.createdAt.localeCompare(a.createdAt)
  );

  const handleVoteDjSong = async (item: DjSongItem) => {
    if (votedSongIds[item.id] || !sections.djVoting) return;
    setVotedSongIds((prev) => ({ ...prev, [item.id]: true }));
    setDjSongs((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, votes: (s.votes ?? 1) + 1 } : s))
    );

    if (eventSlug) {
      try {
        await fetch("/api/songs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSlug,
            songId: item.id,
            fallbackSong: item.song,
            fallbackGuest: item.guestName,
          }),
        });
      } catch {
        // ignore network hiccup on optimistic vote
      }
    }
  };

  const handleAddDjSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (djSubmitting) return;
    if (!djGuestName.trim() || !djSongText.trim()) {
      setDjFeedback({ ok: false, msg: "Escribí tu nombre y la canción o artista." });
      return;
    }
    setDjSubmitting(true);
    setDjFeedback(null);

    if (eventSlug) {
      try {
        const res = await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSlug,
            guestName: djGuestName.trim(),
            song: djSongText.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "No se pudo sumar la canción.");
        }
        if (data.item) {
          setDjSongs((prev) => [data.item as DjSongItem, ...prev]);
        }
        setDjSongText("");
        setDjFeedback({ ok: true, msg: "¡Temazo sumado a la playlist del DJ!" });
      } catch (err) {
        setDjFeedback({
          ok: false,
          msg: err instanceof Error ? err.message : "No se pudo enviar la canción.",
        });
      } finally {
        setDjSubmitting(false);
      }
      return;
    }

    setDjSongs((prev) => [
      {
        id: `preview-${Date.now()}`,
        guestName: djGuestName.trim(),
        song: djSongText.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDjSongText("");
    setDjFeedback({ ok: true, msg: "¡Agregada en vista previa!" });
    setDjSubmitting(false);
  };

  // 3-layer typographic system:
  // Layer 1 (Hero / Monogram): displayFont
  // Layer 2 (Section Headings): sectionSerifFont
  // Layer 3 (Eyebrows / UI): font-ui-jost
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
  const storyHeading =
    customStoryTitle?.trim() ||
    sample.storyTitle ||
    getDefaultStoryTitleForCategory(skin.category, skin.name);
  const storyBody = customStoryText?.trim() || sample.storyText;
  const scheduleList =
    customSchedule && customSchedule.length > 0 ? customSchedule : sample.schedule;
  const dateISO = customDateISO || sample.dateISO;
  const quoteText = customQuote || sample.quote;
  const dressCodeLabel = customDressCode || sample.dressCode.label;
  const aliasText = customAlias || sample.gifts.alias;
  const giftBankText = customGiftBank?.trim() || sample.gifts.bank;
  const giftHolderText = customGiftHolder?.trim() || sample.gifts.holder;

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
          paseType={paseType}
          customTitle={customTitle}
          customHeroImage={heroImage}
          customDateDisplay={dateDisplay}
          customTimeDisplay={timeDisplay}
          fontDisplayClass={displayFont}
          onOpen={() => {
            setIsPlaying(true);
            setGateOpened(true);
          }}
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

      {/* Barra de Modo Borrador (Pendiente de Pago) */}
      {isDraftPreview && (
        <div className="sticky top-0 z-30 border-b border-amber-300/80 bg-amber-50/95 px-4 py-2 text-center text-xs text-amber-950 backdrop-blur-md">
          <span className="font-semibold">Modo Borrador · Pendiente de pago.</span>{" "}
          <span className="hidden sm:inline">
            Este aviso desaparece automáticamente al acreditar tu compra.
          </span>{" "}
          {panelUrl && (
            <Link
              href={`${panelUrl}#pago-transferencia`}
              className="ml-1 inline-block rounded-full bg-amber-900 px-3 py-0.5 text-[11px] font-bold text-white hover:bg-amber-800"
            >
              Abonar / Activar
            </Link>
          )}
        </div>
      )}

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
          gateOpened ? "gate-open" : ""
        } ${isNewspaper ? "md:rounded-none" : "md:rounded-[32px]"}`}
        style={{
          backgroundColor: palette.bg,
          borderColor: isNeon ? `${palette.accent}55` : palette.border,
          backgroundImage: isNeon
            ? `radial-gradient(circle at 50% 0%, ${palette.accent}22, transparent 52%)`
            : isInfantil
            ? `radial-gradient(${palette.accent}1A 1.2px, transparent 1.2px)`
            : undefined,
          backgroundSize: isInfantil ? "20px 20px" : undefined,
        }}
      >
        {(isEditorialPaper || isNewspaper) && (
          <div aria-hidden="true" className="paper-texture absolute inset-0 z-0 opacity-60" />
        )}
        {/* ================= HERO SECTION ================= */}
        {isFullscreen || isEditorialPaper ? (
          <section className="relative overflow-hidden">
            <div className={`relative w-full overflow-hidden ${isFullscreen ? "h-[460px] sm:h-[520px]" : "h-[420px] sm:h-[460px]"}`}>
              <img
                src={heroImage}
                alt={eventTitle}
                className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
              />
              {heroOverlayTint && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: heroOverlayTint }}
                />
              )}
              {!isEditorialPaper && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/80" />
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
              {isFullscreen && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-3.5 rounded-2xl border border-white/40"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-5 rounded-xl border border-white/25"
                  />
                </>
              )}

              {/* Framed plaque: ivory paper plaque on editorial-sobre, fine double hairline glass on fullscreen photographic hero */}
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
                      key={gateOpened ? "ey-open" : "ey-closed"}
                      className={`font-ui-jost relative text-[11px] font-semibold uppercase tracking-[0.24em] ${
                        gateOpened ? "type-eyebrow-reveal" : ""
                      }`}
                      style={{ color: textAccentOnSurface }}
                    >
                      {sample.eyebrow}
                    </p>
                    <h1
                      key={gateOpened ? "h1-open" : "h1-closed"}
                      className={`relative mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold leading-[1.22] ${displayFont} ${heroTitleAnimClass}`}
                      style={{ color: palette.text }}
                    >
                      {eventTitle}
                    </h1>
                    <span
                      aria-hidden="true"
                      className="type-rule-draw relative mx-auto mt-2 block h-[1.5px] w-16"
                      style={{ backgroundColor: palette.accent }}
                    />
                    <div
                      className="relative mt-4 grid grid-cols-3 items-center border-y py-2.5 text-center"
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
                  <div className="relative w-full max-w-[356px] rounded-2xl border border-white/55 bg-black/35 p-1.5 text-center text-white shadow-2xl backdrop-blur-[4px]">
                    <div className="rounded-xl border border-white/25 px-5 py-6">
                      <p
                        key={gateOpened ? "ey-open" : "ey-closed"}
                        className={`font-ui-jost text-on-image text-[11px] font-semibold uppercase tracking-[0.26em] text-white/95 ${
                          gateOpened ? "type-eyebrow-reveal" : ""
                        }`}
                      >
                        {sample.eyebrow}
                      </p>
                      <h1
                        key={gateOpened ? "h1-open" : "h1-closed"}
                        className={`text-on-image mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold leading-[1.22] ${displayFont} ${heroTitleAnimClass}`}
                      >
                        {eventTitle}
                      </h1>
                      <span
                        aria-hidden="true"
                        className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-16 bg-white/80"
                      />
                      <div className="mt-4 grid grid-cols-3 items-center border-y border-white/55 py-2.5 text-center">
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
                  {(passes || table || paseLabel) && (
                    <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa asignada: ${table}` : ""}
                      {(passes || table) && paseLabel ? " · " : ""}
                      {paseLabel}
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
        ) : isNewspaper ? (
          /* DIARIO EDITORIAL HERO: Cabecera de periódico + foto enmarcada + epígrafe */
          <section className="relative px-6 pt-7 pb-4 text-center">
            <div className="border-y-2 py-2.5" style={{ borderColor: palette.text }}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
                <span>{sample.badgeText || "EDICIÓN ESPECIAL"}</span>
                <span>VOL. I · N° 01</span>
                <span>ARGENTINA</span>
              </div>
              <p className={`mt-1 text-2xl font-bold tracking-tight ${displayFont}`} style={{ color: palette.text }}>
                THE CELEBRATION TIMES
              </p>
            </div>
            <div className="border-b py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ borderColor: palette.border, color: textAccentOnBg }}>
              {dateDisplay} · {timeDisplay}
            </div>

            <p
              key={gateOpened ? "ey-open" : "ey-closed"}
              className={`font-ui-jost mt-5 text-[11px] font-bold uppercase tracking-[0.26em] ${
                gateOpened ? "type-eyebrow-reveal" : ""
              }`}
              style={{ color: textAccentOnBg }}
            >
              {sample.eyebrow}
            </p>
            <h1
              key={gateOpened ? "h1-open" : "h1-closed"}
              className={`mt-2 break-words py-1 text-5xl font-bold leading-[1.14] ${displayFont} ${heroTitleAnimClass}`}
              style={{ color: palette.text }}
            >
              {eventTitle}
            </h1>
            <span
              aria-hidden="true"
              className="type-rule-draw mx-auto mt-2 block h-[2px] w-20"
              style={{ backgroundColor: palette.text }}
            />

            <figure className="mt-5 border-2 p-1.5" style={{ borderColor: palette.text, backgroundColor: palette.surface }}>
              <div className="h-[260px] w-full overflow-hidden">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
              </div>
              <figcaption className="border-t pt-1.5 text-[11px] italic" style={{ borderColor: palette.border, color: palette.textMuted }}>
                Edición fotográfica · {eventTitle} — {dateDisplay}
              </figcaption>
            </figure>

            {guestName && (
              <div
                className="mt-5 border-2 px-5 py-4 text-center"
                style={{ backgroundColor: palette.surface, borderColor: palette.text }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textAccentOnSurface }}>
                  Ejemplar Nominado Para
                </p>
                <p className="mt-1 break-words text-base font-bold" style={{ color: palette.text }}>
                  {guestName}
                </p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                    {passes ? `${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                    {passes && table ? " · " : ""}
                    {table ? `Mesa ${table}` : ""}
                    {(passes || table) && paseLabel ? " · " : ""}
                    {paseLabel}
                  </p>
                )}
              </div>
            )}

            <p className="mx-auto mt-5 max-w-sm border-l-2 pl-3 text-left text-[15px] italic leading-[1.65]" style={{ borderColor: palette.accent, color: palette.textMuted }}>
              &ldquo;{quoteText}&rdquo;
            </p>
          </section>
        ) : isTicket ? (
          /* TICKET VIP HERO: Talón de acceso con muescas, código de barras y folio */
          <section className="relative px-5 pt-6 pb-4">
            <div
              className="overflow-hidden rounded-3xl border shadow-lg"
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
            >
              <div className="relative h-[250px] w-full overflow-hidden">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full border border-white/40 bg-black/45 px-3 py-1 backdrop-blur-sm">
                    {sample.badgeText || "ALL ACCESS"}
                  </span>
                  <span className="font-mono rounded-md bg-black/45 px-2.5 py-1">PASE N° 0040</span>
                </div>
              </div>

              <div className="px-5 pt-5 pb-4 text-center">
                <p
                  key={gateOpened ? "ey-open" : "ey-closed"}
                  className={`font-ui-jost text-[11px] font-bold uppercase tracking-[0.24em] ${
                    gateOpened ? "type-eyebrow-reveal" : ""
                  }`}
                  style={{ color: textAccentOnSurface }}
                >
                  {sample.eyebrow}
                </p>
                <h1
                  key={gateOpened ? "h1-open" : "h1-closed"}
                  className={`mt-1.5 break-words py-1 text-4xl sm:text-5xl font-bold uppercase leading-[1.15] ${displayFont} ${heroTitleAnimClass}`}
                  style={{ color: palette.text }}
                >
                  {eventTitle}
                </h1>
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[2px] w-16"
                  style={{ backgroundColor: palette.accent }}
                />

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-dashed py-3 text-center" style={{ borderColor: palette.border }}>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>FECHA</span>
                    <span className="text-xs font-bold">{dateDisplay.split(" de ").slice(0, 2).join(" ")}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>HORA</span>
                    <span className="text-xs font-bold">{timeDisplay}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>ACCESO</span>
                    <span className="text-xs font-bold">{paseType === "ceremonia" ? "CEREMONIA" : paseType === "fiesta" ? "FIESTA" : "VIP TOTAL"}</span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <span className="-ml-3 h-6 w-6 rounded-full border" style={{ backgroundColor: palette.bg, borderColor: palette.border }} />
                <div className="mx-2 flex-1 border-t-2 border-dashed" style={{ borderColor: palette.border }} />
                <span className="-mr-3 h-6 w-6 rounded-full border" style={{ backgroundColor: palette.bg, borderColor: palette.border }} />
              </div>

              <div className="px-5 pb-5 text-center">
                {guestName && (
                  <div className="mb-3 rounded-xl border border-dashed px-4 py-3" style={{ borderColor: palette.accent, backgroundColor: palette.bg }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: textAccentOnBg }}>
                      Titular del Pase
                    </p>
                    <p className="mt-0.5 text-base font-bold" style={{ color: palette.text }}>{guestName}</p>
                    {(passes || table) && (
                      <p className="text-xs" style={{ color: palette.textMuted }}>
                        {passes ? `${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                        {passes && table ? " · " : ""}
                        {table ? `Sector / Mesa ${table}` : ""}
                      </p>
                    )}
                  </div>
                )}
                <div className="mx-auto flex h-7 w-44 items-stretch justify-center gap-[2px] opacity-60">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2].map((w, idx) => (
                    <div key={idx} style={{ width: `${w * 2}px`, backgroundColor: palette.text }} className="h-full" />
                  ))}
                </div>
                <p className="mt-3 text-[14px] italic leading-relaxed" style={{ color: palette.textMuted }}>
                  &ldquo;{quoteText}&rdquo;
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* NEON DARK & INFANTIL ANIMADO HERO */
          <section className="relative overflow-hidden">
            <div className="relative h-[320px] sm:h-[360px] w-full overflow-hidden">
              <img
                src={heroImage}
                alt={eventTitle}
                className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
              />
              {heroOverlayTint && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: heroOverlayTint }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: palette.isDark
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.25) 62%, ${palette.bg} 100%)`
                    : `linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.16) 60%, ${palette.bg} 100%)`,
                }}
              />
              <CornerOrnaments
                color={palette.isDark ? palette.accent : "#FFFFFF"}
                layoutId={layoutId}
              />
            </div>

            <div className="relative -mt-20 px-6 pb-4 text-center">
              <div
                key={gateOpened ? "ey-open" : "ey-closed"}
                className={`font-ui-jost mx-auto inline-block border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-sm rounded-full ${
                  gateOpened ? "type-eyebrow-reveal" : ""
                }`}
                style={{
                  backgroundColor: palette.surface,
                  borderColor: isNeon ? palette.accent : palette.border,
                  color: textAccentOnSurface,
                }}
              >
                {sample.eyebrow}
              </div>

              <h1
                key={gateOpened ? "h1-open" : "h1-closed"}
                className={`mt-4 break-words py-1 text-5xl sm:text-6xl font-semibold leading-[1.2] tracking-tight ${displayFont} ${heroTitleAnimClass}`}
                style={{ color: palette.text }}
              >
                {eventTitle}
              </h1>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[2px] w-16 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />

              <p
                className="font-ui-jost mt-2.5 text-[12px] font-medium uppercase tracking-[0.2em]"
                style={{ color: palette.textMuted }}
              >
                {dateDisplay} · {timeDisplay}
              </p>

              {!isInfantil && (
                <CircularSaveSeal
                  monogram={sample.monogram}
                  color={textAccentOnBg}
                />
              )}

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
                  {(passes || table || paseLabel) && (
                    <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa asignada: ${table}` : ""}
                      {(passes || table) && paseLabel ? " · " : ""}
                      {paseLabel}
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
                  layoutId={layoutId}
                  variant={
                    layoutId === "editorial-sobre" || layoutId === "fullscreen-hero"
                      ? "arch"
                      : "grid"
                  }
                />
              </RevealSection>
            )
          )}

          {/* ================= PADRES / PADRINOS ================= */}
          {!isEssentialPlan && parentsList && parentsList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <section className="text-center">
                <AnimatedSectionMedallion accentColor={textAccentOnBg} surfaceColor={palette.surface} layoutId={layoutId}>
                  <CelebrationCeremonyIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                </AnimatedSectionMedallion>
                <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                  Con la bendición de
                </h2>
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-12"
                  style={{ backgroundColor: palette.accent }}
                />
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

          {/* ================= HISTORIA (Diferenciada por Layout) ================= */}
          {sections.story && storyBody && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              {isNewspaper ? (
                <section
                  className="border-y-2 py-6"
                  style={{ borderColor: palette.text }}
                >
                  <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: textAccentOnBg }}>
                    <span>CRÓNICA CENTRAL</span>
                    <span>EDICIÓN ESPECIAL</span>
                  </div>
                  <h2 className={`${sectionTitleAnimClass} text-[28px] sm:text-[32px] font-bold leading-[1.15] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <p
                    className="mt-3 break-words text-left text-[15px] leading-[1.75] first-letter:float-left first-letter:mr-2.5 first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.88]"
                    style={{ color: palette.textMuted }}
                  >
                    {storyBody}
                  </p>
                </section>
              ) : isEditorialPaper || isFullscreen ? (
                <section
                  className="-mx-6 px-7 py-9 text-center border-y"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    borderColor: palette.border,
                  }}
                >
                  <AnimatedSectionMedallion accentColor={textAccentOnAlt} surfaceColor={palette.surface} layoutId={layoutId}>
                    <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <p className="mx-auto mt-3.5 max-w-sm break-words text-[15px] leading-[1.75]" style={{ color: palette.textMuted }}>
                    {storyBody}
                  </p>
                </section>
              ) : (
                <section
                  className={`${innerRadius} border px-6 py-7 text-center ${cardShadow}`}
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    borderColor: isInfantil ? palette.accent : palette.border,
                  }}
                >
                  <AnimatedSectionMedallion accentColor={textAccentOnAlt} surfaceColor={palette.surface} layoutId={layoutId}>
                    <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <p className="mx-auto mt-3 max-w-sm break-words text-[15px] leading-[1.7]" style={{ color: palette.textMuted }}>
                    {storyBody}
                  </p>
                </section>
              )}
            </RevealSection>
          )}

          {/* ================= LUGARES & MAPA & CALENDARIO ================= */}
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
          <section className="space-y-4">
            <div className="text-center">
              <AnimatedSectionMedallion accentColor={textAccentOnBg} surfaceColor={palette.surface} layoutId={layoutId}>
                <CelebrationPinIcon className="h-7 w-7" />
              </AnimatedSectionMedallion>
              <p
                className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: textAccentOnBg }}
              >
                {isNeon ? "01 // Dónde & Cuándo" : isTicket ? "Puerta & Ubicación" : "Dónde & Cuándo"}
              </p>
              <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                Coordenadas del Evento
              </h2>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: palette.accent }}
              />
            </div>

            <div className="space-y-4">
              {locations.map((loc) => (
                <div
                  key={loc.label}
                  className={`${cardRadius} border p-5 sm:p-6 ${isTicket ? "text-left" : "text-center"} ${cardShadow}`}
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: isNeon ? `${palette.accent}55` : isInfantil ? palette.accent : palette.border,
                  }}
                >
                  {isTicket ? (
                    <>
                      <div className="flex items-center justify-between border-b border-dashed pb-2.5" style={{ borderColor: palette.border }}>
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: textAccentOnSurface }}>
                          SECTOR · {loc.label}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold" style={{ color: palette.text }}>
                          <Clock className="h-3.5 w-3.5" />
                          {loc.time}
                        </span>
                      </div>
                      <h3 className="mt-3 break-words text-lg font-bold">{loc.venue}</h3>
                      <p className="mt-1 break-words text-[14px]" style={{ color: palette.textMuted }}>
                        {loc.address} · {loc.city}
                      </p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                  quoteText,
                  timeDisplay
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
                  downloadIcsFile(eventTitle, dateISO, fullAddress, quoteText, timeDisplay)
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

          {/* ================= ITINERARIO (Diferenciado por Layout) ================= */}
          {sections.schedule && scheduleList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <section>
                <div className="mb-5 text-center">
                  <p
                    className="type-section-eyebrow text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: textAccentOnBg }}
                  >
                    {isNeon ? "02 // Line-Up" : "Programa del Día"}
                  </p>
                  <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>Itinerario</h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                    style={{ backgroundColor: palette.accent }}
                  />
                  {paseLabel && (
                    <p
                      className="mt-2 inline-block rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        borderColor: `${palette.accent}66`,
                        backgroundColor: palette.surface,
                        color: textAccentOnSurface,
                      }}
                    >
                      {paseLabel}
                    </p>
                  )}
                </div>

                {isNewspaper ? (
                  <div className="divide-y border-y-2" style={{ borderColor: palette.text }}>
                    {scheduleList.map((item) => (
                      <div key={item.time + item.title} className="grid grid-cols-[84px_1fr] items-start gap-3 py-3.5" style={{ borderColor: palette.border }}>
                        <span className={`text-sm font-bold ${sectionHeadingFont}`} style={{ color: textAccentOnBg }}>
                          {item.time} hs
                        </span>
                        <div>
                          <h3 className="text-[15px] font-bold">{item.title}</h3>
                          <p className="mt-0.5 text-[13px]" style={{ color: palette.textMuted }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isNeon || isTicket ? (
                  <div className="space-y-2.5">
                    {scheduleList.map((item) => (
                      <div
                        key={item.time + item.title}
                        className={`flex items-center gap-3.5 ${innerRadius} border px-4 py-3.5 ${cardShadow}`}
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: isNeon ? `${palette.accent}44` : palette.border,
                        }}
                      >
                        <span
                          className="flex-shrink-0 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold"
                          style={{ backgroundColor: buttonBg, color: palette.accentText }}
                        >
                          {item.time}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold leading-snug">{item.title}</h3>
                          <p className="mt-0.5 text-[13px]" style={{ color: palette.textMuted }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                /* Mobile <640px: left rail full-width cards; >=640px: center axis alternating */
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
                )}
              </section>
            </RevealSection>
          )}

          {/* ================= GALERÍA DE FOTOS (Collage Bento en Fullscreen / Polaroid en Editorial / Prensa en Diario) ================= */}
          {sections.gallery && galleryList.length > 0 && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <section>
                <div className="mb-5 text-center">
                  <AnimatedSectionMedallion accentColor={textAccentOnBg} surfaceColor={palette.surface} layoutId={layoutId}>
                    <CelebrationCameraIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <p
                    className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: textAccentOnBg }}
                  >
                    {isNeon ? "03 // Galería" : isNewspaper ? "Archivo Fotográfico" : "Recuerdos"}
                  </p>
                  <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                    Momentos Especiales
                  </h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                    style={{ backgroundColor: palette.accent }}
                  />
                </div>

                {isFullscreen && galleryList.length >= 3 ? (
                  /* Collage estilo Revista / e-invitados para portadas fotográficas */
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLightboxIdx(0)}
                      aria-label="Ampliar foto destacada"
                      className={`group relative col-span-2 aspect-[16/10] w-full overflow-hidden ${cardRadius} border ${cardShadow}`}
                      style={{ borderColor: palette.border }}
                    >
                      <img
                        src={galleryList[0]}
                        alt="Momento 1"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${skin.imageFilter ?? ""}`}
                      />
                      <span className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                        {galleryList.length} fotos · Tocar para ampliar
                      </span>
                    </button>
                    {galleryList.slice(1, 5).map((imgUrl, idx) => (
                      <button
                        key={imgUrl + idx}
                        type="button"
                        onClick={() => setLightboxIdx(idx + 1)}
                        aria-label={`Ampliar foto ${idx + 2}`}
                        className={`group relative aspect-square overflow-hidden ${innerRadius} border ${cardShadow}`}
                        style={{ borderColor: palette.border }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Momento ${idx + 2}`}
                          loading="lazy"
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${skin.imageFilter ?? ""}`}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Visor principal con transición suave + tiras de miniaturas */
                  <div
                    className={`relative overflow-hidden ${cardRadius} ${isNewspaper ? "border-2 p-2" : "border p-2.5"} ${cardShadow}`}
                    style={{
                      backgroundColor: palette.surface,
                      borderColor: isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : palette.border,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIdx(activeGalleryIdx)}
                      aria-label="Ampliar foto destacada"
                      className={`relative block aspect-[4/5] w-full overflow-hidden ${innerRadius}`}
                    >
                      <img
                        key={galleryList[activeGalleryIdx]}
                        src={galleryList[activeGalleryIdx] || galleryList[0]}
                        alt={`Momento ${activeGalleryIdx + 1}`}
                        className={`anim-gallery-slide h-full w-full object-cover ${
                          skin.imageFilter ?? ""
                        }`}
                      />
                      <span
                        className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md"
                      >
                        {activeGalleryIdx + 1} / {galleryList.length} · Tocar para ampliar
                      </span>
                    </button>

                    {galleryList.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Foto anterior"
                          onClick={() =>
                            setActiveGalleryIdx(
                              (i) => (i - 1 + galleryList.length) % galleryList.length
                            )
                          }
                          className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Foto siguiente"
                          onClick={() =>
                            setActiveGalleryIdx((i) => (i + 1) % galleryList.length)
                          }
                          className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Tira de miniaturas seleccionables */}
                        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
                          {galleryList.map((imgUrl, idx) => {
                            const isCurrent = idx === activeGalleryIdx;
                            return (
                              <button
                                key={imgUrl + idx}
                                type="button"
                                onClick={() => setActiveGalleryIdx(idx)}
                                aria-label={`Ver foto ${idx + 1}`}
                                className={`relative h-16 w-14 flex-shrink-0 overflow-hidden ${isNewspaper ? "rounded-none" : "rounded-xl"} border-2 transition-all ${
                                  isCurrent ? "scale-[1.03] opacity-100" : "opacity-60 hover:opacity-90"
                                }`}
                                style={{
                                  borderColor: isCurrent ? palette.accent : palette.border,
                                }}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Miniatura ${idx + 1}`}
                                  loading="lazy"
                                  className={`h-full w-full object-cover ${skin.imageFilter ?? ""}`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            </RevealSection>
          )}

          {/* ================= DRESS CODE ================= */}
          {sections.dressCode && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : isInfantil ? palette.accent : palette.border,
              }}
            >
              <AnimatedSectionMedallion accentColor={textAccentOnSurface} surfaceColor={palette.surfaceAlt} layoutId={layoutId}>
                <CelebrationAttireIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
              </AnimatedSectionMedallion>
            <p
              className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: palette.textMuted }}
            >
              {isNeon ? "04 // Dress Code" : "Código de Vestimenta"}
            </p>
            <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
              {dressCodeLabel}
            </h2>
            <span
              aria-hidden="true"
              className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
              style={{ backgroundColor: palette.accent }}
            />
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

          {/* ================= SOLO ADULTOS (OPCIONAL) ================= */}
          {!isEssentialPlan && customAdultsOnly && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} border p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surfaceAlt,
                borderColor: palette.border,
              }}
            >
              <AnimatedSectionMedallion accentColor={textAccentOnAlt} surfaceColor={palette.surface} layoutId={layoutId}>
                <CelebrationAdultsIcon className="h-7 w-7" />
              </AnimatedSectionMedallion>
              <p
                className="type-section-eyebrow font-ui-jost mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: textAccentOnAlt }}
              >
                Evento Exclusivo
              </p>
              <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                Solo Adultos
              </h2>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: palette.accent }}
              />
              <p className="mx-auto mt-2.5 max-w-xs text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
                Queremos que esa noche sólo tengas que preocuparte por disfrutar y pasarla increíble.
              </p>
            </section>
          </RevealSection>
          )}

          {/* ================= VALOR DE TARJETA (OPCIONAL) ================= */}
          {!isEssentialPlan && customTarjetaPricing && customTarjetaPricing.length > 0 && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : palette.border,
              }}
            >
              <AnimatedSectionMedallion accentColor={textAccentOnSurface} surfaceColor={palette.surfaceAlt} layoutId={layoutId}>
                <CelebrationTicketPriceIcon className="h-7 w-7" />
              </AnimatedSectionMedallion>
              <p
                className="type-section-eyebrow font-ui-jost mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: textAccentOnSurface }}
              >
                Información de Entrada
              </p>
              <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                Valor de Tarjeta
              </h2>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: palette.accent }}
              />
              <div className="mt-4 space-y-2 text-left">
                {customTarjetaPricing.map((tier, idx) => (
                  <div
                    key={tier.label + idx}
                    className={`flex items-center justify-between gap-3 ${innerRadius} border px-4 py-3`}
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    }}
                  >
                    <span className="text-[14px] font-medium" style={{ color: palette.text }}>
                      {tier.label}
                    </span>
                    <span className="font-mono text-[15px] font-bold" style={{ color: textAccentOnBg }}>
                      {tier.price}
                    </span>
                  </div>
                ))}
              </div>
              {customTarjetaNote && (
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: palette.textMuted }}>
                  {customTarjetaNote}
                </p>
              )}
              {aliasText && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: palette.border }}>
                  <p className="text-[12px]" style={{ color: palette.textMuted }}>
                    Titular: <strong style={{ color: palette.text }}>{giftHolderText}</strong> · Alias:{" "}
                    <strong className="font-mono" style={{ color: palette.text }}>{aliasText}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(aliasText, "alias")}
                    className={`mt-2.5 inline-flex min-h-[40px] items-center gap-1.5 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all active:scale-95 ${
                      isNewspaper ? "rounded-none" : "rounded-full"
                    }`}
                    style={{
                      backgroundColor: buttonBg,
                      color: palette.accentText,
                    }}
                  >
                    {copiedField === "alias" ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                        ¡Alias Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Copiar Alias para Tarjeta
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
          </RevealSection>
          )}

          {/* ================= REGALOS / VAQUITA + COPIAR ALIAS ================= */}
          {sections.gifts && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : palette.border,
              }}
            >
              <AnimatedSectionMedallion accentColor={textAccentOnSurface} surfaceColor={palette.surfaceAlt} layoutId={layoutId}>
                <CelebrationGiftIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
              </AnimatedSectionMedallion>
            <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
              {sample.gifts.title}
            </h2>
            <span
              aria-hidden="true"
              className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
              style={{ backgroundColor: palette.accent }}
            />
            <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
              {sample.gifts.intro}
            </p>

            <button
              type="button"
              onClick={() => setGiftsExpanded((prev) => !prev)}
              aria-expanded={giftsExpanded}
              className={`mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-all hover:opacity-95 active:scale-95 ${
                isNewspaper ? "rounded-none" : "rounded-full"
              }`}
              style={{
                backgroundColor: giftsExpanded ? palette.bg : buttonBg,
                border: giftsExpanded ? `1px solid ${palette.border}` : "none",
                color: giftsExpanded ? palette.text : palette.accentText,
              }}
            >
              {giftsExpanded ? "Ocultar Alias" : "Ver Alias para Regalo"}
            </button>

            {giftsExpanded && (
              <div
                className={`mt-4 space-y-2.5 ${innerRadius} border p-4 text-left text-[14px]`}
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                }}
              >
                <div className="flex justify-between gap-2 border-b pb-2" style={{ borderColor: palette.border }}>
                  <span style={{ color: palette.textMuted }}>Titular:</span>
                  <span className="break-words text-right font-semibold">{giftHolderText}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
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
              </div>
            )}
          </section>
          </RevealSection>
          )}

          {/* ================= MURO DE BUENOS DESEOS / FIRMAS ================= */}
          {sections.wishes && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section className="space-y-3.5">
              <div className="text-center">
                <AnimatedSectionMedallion accentColor={textAccentOnBg} surfaceColor={palette.surface} layoutId={layoutId}>
                  <CelebrationWishesIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                </AnimatedSectionMedallion>
                <p
                  className="type-section-eyebrow font-ui-jost mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: textAccentOnBg }}
                >
                  Libro de Firmas
                </p>
                <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                  Buenos Deseos
                </h2>
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                  style={{ backgroundColor: palette.accent }}
                />
                <p className="mx-auto mt-2 max-w-xs text-xs" style={{ color: palette.textMuted }}>
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
          {!isEssentialPlan && galleryList.length >= 2 && (skin.category === "boda" || skin.category === "xv") && (
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

          {/* ================= MÚSICA PARA LA FIESTA / PLAYLIST DJ (PRO & LLAVE EN MANO) ================= */}
          {allowDjSongs && sections.djSongs && !memoryMode && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surface,
                borderColor: isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : palette.border,
              }}
            >
              <div
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: palette.surfaceAlt,
                  borderColor: palette.border,
                  color: textAccentOnSurface,
                }}
              >
                <Music className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p
                className="type-section-eyebrow font-ui-jost mt-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: textAccentOnSurface }}
              >
                Playlist de la Fiesta
              </p>
              <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                ¿Qué tema no puede faltar?
              </h2>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: palette.accent }}
              />
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: palette.textMuted }}>
                Agregá la canción que querés escuchar o bailar en la pista para que la reciba nuestro DJ.
              </p>

              <form onSubmit={handleAddDjSong} className="mt-4 space-y-2.5 text-left">
                <input
                  type="text"
                  value={djGuestName}
                  onChange={(e) => setDjGuestName(e.target.value)}
                  placeholder="Tu nombre (ej. Martín)"
                  className={`w-full ${innerRadius} border px-3.5 py-2.5 text-sm outline-none`}
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                    color: palette.text,
                  }}
                />
                <input
                  type="text"
                  value={djSongText}
                  onChange={(e) => setDjSongText(e.target.value)}
                  placeholder="Canción y artista (ej. Don't Stop Me Now - Queen)"
                  className={`w-full ${innerRadius} border px-3.5 py-2.5 text-sm outline-none`}
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                    color: palette.text,
                  }}
                />
                <button
                  type="submit"
                  disabled={djSubmitting}
                  className={`min-h-[44px] w-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 disabled:opacity-60 ${
                    isNewspaper ? "rounded-none" : "rounded-full"
                  }`}
                  style={{
                    backgroundColor: buttonBg,
                    color: palette.accentText,
                  }}
                >
                  {djSubmitting ? "Sumando..." : "Sugerir Canción"}
                </button>
              </form>

              {djFeedback && (
                <p
                  className="mt-3 rounded-xl px-3 py-2 text-xs font-medium"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: djFeedback.ok ? textAccentOnAlt : palette.text,
                  }}
                >
                  {djFeedback.msg}
                </p>
              )}

              {sortedDjSongs.length > 0 && (
                <div className="mt-5 space-y-2 text-left">
                  <p
                    className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: palette.textMuted }}
                  >
                    {sections.djVoting
                      ? `Las más pedidas 🔥 (${sortedDjSongs.length})`
                      : `Últimas sugerencias (${sortedDjSongs.length})`}
                  </p>
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {sortedDjSongs.slice(0, 10).map((item) => {
                      const alreadyVoted = Boolean(votedSongIds[item.id]);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs"
                          style={{
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                          }}
                        >
                          <div className="min-w-0">
                            <span className="block break-words font-medium" style={{ color: palette.text }}>
                              🎵 {item.song}
                            </span>
                            <span className="text-[11px]" style={{ color: palette.textMuted }}>
                              {item.guestName}
                            </span>
                          </div>
                          {sections.djVoting && (
                            <button
                              type="button"
                              onClick={() => handleVoteDjSong(item)}
                              disabled={alreadyVoted}
                              aria-label={`Votar canción ${item.song}`}
                              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-transform active:scale-95"
                              style={{
                                backgroundColor: alreadyVoted ? buttonBg : palette.surface,
                                borderColor: alreadyVoted ? buttonBg : palette.border,
                                color: alreadyVoted ? palette.accentText : palette.text,
                              }}
                            >
                              🔥 {item.votes ?? 1}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </RevealSection>
          )}

          {/* ================= MINI-TRIVIA CON PODIO (PRO & LLAVE EN MANO) ================= */}
          {!isEssentialPlan && sections.trivia && triviaQuestions.length > 0 && !memoryMode && (
            <RevealSection>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <TriviaSection
                eventSlug={eventSlug}
                title={triviaTitle || `¿Cuánto conocés a ${eventTitle}?`}
                questions={triviaQuestions}
                initialScores={initialTriviaScores}
                initialGuestName={guestName}
                palette={palette}
                cardRadius={cardRadius}
                innerRadius={innerRadius}
                cardShadow={cardShadow}
                sectionHeadingFont={sectionHeadingFont}
                textAccentOnSurface={textAccentOnSurface}
                isNewspaper={isNewspaper}
              />
            </RevealSection>
          )}

          {/* ================= ÁLBUM COLABORATIVO QR & HASHTAG (PRO & LLAVE EN MANO) ================= */}
          {!isEssentialPlan &&
            sections.collaborativeAlbum &&
            Boolean(albumUrl || instagramHandle || eventHashtag) && (
              <RevealSection>
                <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
                <CollaborativeAlbumSection
                  albumUrl={albumUrl}
                  instagramHandle={instagramHandle}
                  eventHashtag={eventHashtag}
                  palette={palette}
                  cardRadius={cardRadius}
                  innerRadius={innerRadius}
                  cardShadow={cardShadow}
                  sectionHeadingFont={sectionHeadingFont}
                  textAccentOnSurface={textAccentOnSurface}
                  isNewspaper={isNewspaper}
                />
              </RevealSection>
            )}

          {/* ================= CONFIRMAR ASISTENCIA (RSVP NATIVO) ================= */}
          {sections.rsvp && !memoryMode && (
          <RevealSection>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${isNewspaper ? "rounded-none" : cardRadius} border-2 p-6 sm:p-7 text-center ${cardShadow}`}
              style={{
                backgroundColor: palette.surfaceAlt,
                borderColor: textAccentOnAlt,
              }}
            >
              <AnimatedSectionMedallion accentColor={textAccentOnAlt} surfaceColor={palette.surface} layoutId={layoutId}>
                <CelebrationCheckIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
              </AnimatedSectionMedallion>
              <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont}`}>
                ¿Contamos con vos?
              </h2>
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: palette.accent }}
              />
              <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: palette.textMuted }}>
                {customRsvpDeadline
                  ? `Confirmá tu asistencia antes del ${customRsvpDeadline}. `
                  : `${sample.rsvpDeadline}. `}
                Podés indicar si asistís, alergias o menús especiales (Sin TACC) y sugerir música.
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
        allowSongField={allowDjSongs}
        guestList={!isEssentialPlan ? guestList : []}
      />

      {/* Lightbox Galería con navegación prev/next */}
      {lightboxIdx !== null && galleryList[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label="Cerrar vista ampliada"
            className="absolute right-5 top-5 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          {galleryList.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) =>
                    i === null ? 0 : (i - 1 + galleryList.length) % galleryList.length
                  );
                }}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) => (i === null ? 0 : (i + 1) % galleryList.length));
                }}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={galleryList[lightboxIdx]}
            alt={`Vista ampliada ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="anim-gallery-slide max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
