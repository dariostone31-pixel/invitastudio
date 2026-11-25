"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  CalendarPlus,
  Download,
  Copy,
  Check,
  X,
  ArrowLeft,
  Heart,
  Music,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import { buildMapsSearchUrl, deriveInitialsMonogram } from "@/lib/locationUtils";
import { InvitationSkin } from "@/templates/catalog";
import { getMusicTrackByUrl } from "@/config/musicCatalog";
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
    "PRODID:-//Invita con el Alma//ES",
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

function NewsprintColorPhoto({
  src,
  alt,
  className = "",
  onOpen,
  caption,
}: {
  src: string;
  alt: string;
  className?: string;
  onOpen?: () => void;
  caption?: string;
}) {
  const [inColor, setInColor] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setInColor(true)}
      viewport={{ once: true, amount: 0.35 }}
      className="relative h-full w-full overflow-hidden"
    >
      <button
        type="button"
        onClick={() => {
          setInColor(true);
          onOpen?.();
        }}
        className="group relative block h-full w-full overflow-hidden text-left"
        aria-label={alt}
      >
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-[filter,transform] duration-700 ease-out ${
            inColor ? "grayscale-0 contrast-100" : "grayscale contrast-110"
          } group-hover:grayscale-0 group-hover:contrast-100 ${className}`}
        />
        {caption && (
          <span className="absolute bottom-2.5 right-2.5 border border-[#1C1B19] bg-[#F3EFE6]/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1C1B19]">
            {caption}
          </span>
        )}
      </button>
    </motion.div>
  );
}

function MiniCalendarGrid({
  dateISO,
  accentColor = "#B78A4E",
}: {
  dateISO: string;
  accentColor?: string;
}) {
  const isoMatch = dateISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parsed = new Date(dateISO);
  const valid = !Number.isNaN(parsed.getTime());
  const year = isoMatch ? Number(isoMatch[1]) : valid ? parsed.getFullYear() : 2027;
  const month = isoMatch ? Number(isoMatch[2]) - 1 : valid ? parsed.getMonth() : 4;
  const targetDay = isoMatch ? Number(isoMatch[3]) : valid ? parsed.getDate() : 22;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDayOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      className="mx-auto mt-3 max-w-[290px] rounded-[20px] border bg-[#FFFCF7]/90 p-4 shadow-sm"
      style={{ borderColor: "rgba(183, 138, 78, 0.32)" }}
    >
      <div className="mb-2.5 flex items-center justify-between border-b pb-2" style={{ borderColor: "rgba(183, 138, 78, 0.25)" }}>
        <span className="font-ui-jost text-[11px] font-bold uppercase tracking-[0.22em] text-[#8C6D46]">
          {monthNames[month]}
        </span>
        <span className="font-mono text-[11px] font-semibold text-[#8C6D46]">{year}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#9A846B]">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, idx) => (
          <span key={d + idx} className="py-1">{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[12px]">
        {cells.map((day, idx) => {
          const isEventDay = day === targetDay;
          return (
            <div key={idx} className="flex h-7 items-center justify-center">
              {day ? (
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-medium transition-transform ${
                    isEventDay ? "font-bold text-white shadow-md scale-105" : "text-[#4A3B2C]"
                  }`}
                  style={
                    isEventDay
                      ? { background: `linear-gradient(135deg, #C69B57, ${accentColor})` }
                      : undefined
                  }
                >
                  {day}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloatingIconAura({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

function XvScenographyBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="xv-champagne-scenography absolute inset-0" />
      {/* Plumas etéreas & pétalos difuminados en marfil/champán */}
      <svg
        viewBox="0 0 480 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-45"
      >
        <defs>
          <radialGradient id="petalGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E6C99E" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E6C99E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="petalGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DFB4BE" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#DFB4BE" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="55" cy="190" rx="95" ry="155" transform="rotate(-18 55 190)" fill="url(#petalGlow1)" />
        <ellipse cx="430" cy="410" rx="110" ry="165" transform="rotate(22 430 410)" fill="url(#petalGlow2)" />
        <ellipse cx="68" cy="680" rx="100" ry="150" transform="rotate(14 68 680)" fill="url(#petalGlow1)" />
        {/* Trazos etéreos de pluma/filigrana dorada */}
        <path
          d="M-10 240 Q 48 210 72 275 Q 24 265 -10 240 Z"
          fill="#FAF6F0"
          fillOpacity="0.65"
          stroke="#C69D59"
          strokeOpacity="0.22"
        />
        <path
          d="M490 520 Q 426 485 398 555 Q 448 545 490 520 Z"
          fill="#FAF6F0"
          fillOpacity="0.6"
          stroke="#C69D59"
          strokeOpacity="0.22"
        />
      </svg>
    </div>
  );
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
  const isMagazine = skin.id === "xv-editorial-vogue";
  const isNewsprint = isNewspaper && !isMagazine;
  const isTicket = layoutId === "ticket-vip";
  const isBoardingPass = skin.id === "boda-boarding-pass";
  const isEditorialPaper = layoutId === "editorial-sobre";
  const isMarfil = skin.id === "boda-sobre-marfil";
  const isBohoPampas = skin.id === "boda-boho-pampas";
  const isBotanica =
    skin.id === "boda-botanica-eucalipto" || skin.id === "boda-jardin-botanico";
  const isNeon = layoutId === "neon-dark";
  const isNocheGala = skin.id === "boda-noche-gala";
  const isInfantil = layoutId === "infantil-animado";
  const isFullscreen = layoutId === "fullscreen-hero";
  const isXvStar =
    skin.id === "xv-gala-rosa" ||
    skin.id === "xv-mariposa-sobre" ||
    skin.id === "xv-princesa-imperial";
  const isXvNocturno =
    skin.id === "xv-neon-boliche" ||
    skin.id === "xv-festival-pass" ||
    skin.id === "xv-festival-vip" ||
    skin.id === "xv-mariposas-lila";
  const isHombreClub =
    skin.id === "hombre-whisky-gold" ||
    skin.id === "hombre-club-lounge" ||
    skin.id === "hombre-18-rooftop" ||
    skin.id === "hombre-minimal-mono";
  const isModernKids =
    isInfantil ||
    skin.id === "nino-safari-sobre" ||
    skin.id === "nina-hadas-sobre" ||
    skin.id === "nina-arcoiris-boho" ||
    skin.id === "bebe-lino-natural" ||
    skin.id === "bebe-florcitas-rosa";
  const kidsVariant: "space" | "dino" | "girls" | "baptism" =
    skin.category === "bautismo"
      ? "baptism"
      : skin.category === "nina"
      ? "girls"
      : skin.id.includes("espacio")
      ? "space"
      : "dino";
  const isEditorialPhoto =
    isEditorialPaper &&
    Boolean(customHeroImage || skin.heroImage) &&
    !isMarfil &&
    !isBotanica &&
    !isModernKids &&
    !isHombreClub;
  const useCinematicXvHero = isXvStar || isEditorialPhoto;
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

  const cardRadius = isNewspaper || isHombreClub
    ? "rounded-none"
    : isModernKids
    ? "rounded-[32px]"
    : isXvStar
    ? "rounded-[28px]"
    : isTicket || isXvNocturno
    ? "rounded-2xl"
    : isNeon
    ? "rounded-2xl"
    : "rounded-[22px]";
  const innerRadius = isNewspaper || isHombreClub
    ? "rounded-none"
    : isModernKids
    ? "rounded-[24px]"
    : isXvStar
    ? "rounded-[20px]"
    : isTicket || isXvNocturno
    ? "rounded-xl"
    : "rounded-[18px]";
  const cardShadow = isNewspaper
    ? "shadow-none"
    : isModernKids
    ? "shadow-[0_14px_34px_-10px_rgba(30,40,60,0.08)]"
    : isXvStar
    ? "shadow-[0_20px_46px_-16px_rgba(68,46,26,0.14)]"
    : isXvNocturno
    ? "shadow-[0_18px_44px_-14px_rgba(0,0,0,0.85)]"
    : isHombreClub
    ? "shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)]"
    : isMarfil
    ? "shadow-[0_18px_40px_-15px_rgba(45,30,20,0.12)]"
    : palette.isDark
    ? "shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)]"
    : "shadow-[0_10px_28px_-14px_rgba(42,36,32,0.12)]";
  const buttonBg = isBoardingPass
    ? "#0F2537"
    : isHombreClub
    ? "#C88A4B"
    : isXvStar
    ? "#B78A4E"
    : getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccentOnSurface = isBoardingPass
    ? "#0F2537"
    : isHombreClub
    ? "#C88A4B"
    : isXvStar
    ? "#9B7137"
    : ensureContrast(palette.accent, palette.surface, 4.6);
  const textAccentOnBg = isBoardingPass
    ? "#0F2537"
    : isHombreClub
    ? "#C88A4B"
    : isXvStar
    ? "#9B7137"
    : ensureContrast(palette.accent, palette.bg, 4.6);
  const textAccentOnAlt = isBoardingPass
    ? "#0F2537"
    : isHombreClub
    ? "#C88A4B"
    : isXvStar
    ? "#9B7137"
    : ensureContrast(palette.accent, palette.surfaceAlt, 4.6);
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
    customAudioUrl === "none" || customAudioUrl === "null"
      ? ""
      : customAudioUrl || sample.audioUrl;
  const audioLabel = getMusicTrackByUrl(audioSrc)?.label || sample.audioTitle;

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
        trivia:
          planId === "asistido"
            ? enabledSections?.trivia ?? triviaQuestions.length > 0
            : false,
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

  const dynamicMonogram = deriveInitialsMonogram(customTitle, sample.monogram);

  const customLocsRaw = Array.isArray(enabledSections?.locations)
    ? enabledSections.locations.filter((l) => l && l.venue && l.venue.trim().length > 0)
    : [];
  const customLocsLimited = isEssentialPlan
    ? customLocsRaw.slice(0, 1)
    : customLocsRaw.slice(0, 2);

  const locations =
    customLocsLimited.length > 0
      ? customLocsLimited.map((l, idx) => ({
          label: l.label || (idx === 0 ? "Ceremonia" : "Fiesta"),
          venue: l.venue,
          address: l.address || "Dirección a confirmar",
          city: "Argentina",
          time: l.time || timeDisplay,
          mapsUrl: l.mapsUrl || buildMapsSearchUrl(l.venue, l.address),
        }))
      : customVenue
      ? [
          {
            label: "Recepción / Evento",
            venue: customVenue,
            address: customAddress || "Dirección a confirmar",
            city: "Argentina",
            time: timeDisplay,
            mapsUrl: buildMapsSearchUrl(customVenue, customAddress),
          },
        ]
      : isEssentialPlan
      ? sample.locations.slice(0, 1)
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
            if (audioSrc) setIsPlaying(true);
            setGateOpened(true);
          }}
        />
      )}

      {/* Audio player flotante */}
      {audioSrc && (
        <AudioPlayerFloat
          src={audioSrc}
          title={audioLabel}
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((p) => !p)}
          accentColor={buttonBg}
          surfaceColor={palette.surface}
          textColor={palette.text}
          borderColor={palette.border}
          hasTopChrome={showPreviewChrome}
          hasDraftBanner={isDraftPreview}
          compactBottomLeft={isXvStar}
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
        } ${isNewspaper || isHombreClub ? "md:rounded-none" : "md:rounded-[32px]"}`}
        style={{
          backgroundColor: isMarfil
            ? "#FAF7F2"
            : isNewsprint
            ? "#F3EFE6"
            : isBohoPampas
            ? "#F8F1EA"
            : isBotanica
            ? "#F7F7F0"
            : isBoardingPass
            ? "#F8F9FA"
            : isNocheGala
            ? "#0B0D12"
            : isXvNocturno
            ? "#06070B"
            : isHombreClub
            ? "#110E0C"
            : isModernKids
            ? kidsVariant === "space"
              ? "#162235"
              : kidsVariant === "dino"
              ? "#EEF2F5"
              : kidsVariant === "girls"
              ? "#FDF7F9"
              : "#FAF6F0"
            : palette.bg,
          color: isHombreClub
            ? "#F4ECE1"
            : isXvNocturno
            ? "#F8FAFC"
            : isModernKids && kidsVariant === "space"
            ? "#F8FAFC"
            : isModernKids
            ? "#283242"
            : palette.text,
          borderColor: isNocheGala
            ? "rgba(212, 175, 55, 0.5)"
            : isXvNocturno
            ? "rgba(34, 211, 238, 0.4)"
            : isHombreClub
            ? "rgba(200, 138, 75, 0.52)"
            : isModernKids
            ? `${palette.accent}33`
            : isNeon
            ? `${palette.accent}55`
            : isMarfil
            ? "rgba(183, 138, 78, 0.45)"
            : isNewsprint
            ? "#1C1B19"
            : isBotanica
            ? "rgba(95, 125, 91, 0.48)"
            : isBohoPampas
            ? "rgba(184, 107, 75, 0.35)"
            : isBoardingPass
            ? "rgba(15, 37, 55, 0.22)"
            : palette.border,
          backgroundImage:
            isNeon && !isNocheGala && !isXvNocturno && !isHombreClub
              ? `radial-gradient(circle at 50% 0%, ${palette.accent}22, transparent 52%)`
              : undefined,
        }}
      >
        {isMarfil ? (
          <>
            <div aria-hidden="true" className="cotton-paper-marfil absolute inset-0 z-0" />
            {/* Doble filete dorado artesanal en toda la hoja (separación interna de 4px) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-20 rounded-[18px] md:rounded-[24px]"
              style={{ border: "1px solid rgba(183, 138, 78, 0.45)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 z-20 rounded-[14px] md:rounded-[20px]"
              style={{ border: "1px solid rgba(183, 138, 78, 0.45)" }}
            />
          </>
        ) : isBotanica ? (
          <>
            <div aria-hidden="true" className="laid-paper-botanical absolute inset-0 z-0" />
            {/* Marco doble en verde eucalipto para Jardín Botánico */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-20 rounded-[18px] md:rounded-[24px]"
              style={{ border: "1px solid rgba(95, 125, 91, 0.48)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 z-20 rounded-[14px] md:rounded-[20px]"
              style={{ border: "1px solid rgba(95, 125, 91, 0.32)" }}
            />
          </>
        ) : isBohoPampas ? (
          <div aria-hidden="true" className="linen-sand-pampas absolute inset-0 z-0" />
        ) : isBoardingPass ? (
          <div aria-hidden="true" className="satin-cardstock-boarding absolute inset-0 z-0" />
        ) : isNocheGala ? (
          <>
            <div aria-hidden="true" className="velvet-midnight-gala absolute inset-0 z-0" />
            {/* Doble marco geométrico Art Déco en oro champán #D4AF37 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-20 md:rounded-[24px]"
              style={{ border: "1px solid rgba(212, 175, 55, 0.42)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 z-20 md:rounded-[20px]"
              style={{ border: "1px solid rgba(212, 175, 55, 0.22)" }}
            />
          </>
        ) : isNewsprint ? (
          <>
            <div aria-hidden="true" className="newsprint-vintage absolute inset-0 z-0" />
            {/* Filetes dobles en tinta carbón (#1C1B19) para papel prensa vintage */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-1.5 z-20 border-2 border-[#1C1B19]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[10px] z-20 border border-[#1C1B19]/75"
            />
          </>
        ) : isXvStar ? (
          <XvScenographyBackdrop />
        ) : isXvNocturno ? (
          <div aria-hidden="true" className="neon-club-scenography absolute inset-0 z-0" />
        ) : isHombreClub ? (
          <>
            <div aria-hidden="true" className="club-lounge-walnut absolute inset-0 z-0" />
            {/* Marcos finos en cobre cepillado y oro ámbar #C88A4B */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-20"
              style={{ border: "1px solid rgba(200, 138, 75, 0.44)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 z-20"
              style={{ border: "1px solid rgba(200, 138, 75, 0.22)" }}
            />
          </>
        ) : isModernKids ? (
          <>
            <div
              aria-hidden="true"
              className={`absolute inset-0 z-0 ${
                kidsVariant === "space"
                  ? "kids-nordic-night"
                  : kidsVariant === "dino"
                  ? "kids-nordic-space"
                  : kidsVariant === "girls"
                  ? "girls-pastel-ethereal"
                  : "baptism-cotton-clouds"
              }`}
            />
            {kidsVariant === "space" && (
              <svg aria-hidden="true" viewBox="0 0 480 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-55">
                <circle cx="54" cy="120" r="2" fill="#F6D58E" />
                <circle cx="420" cy="190" r="2.2" fill="#FFFFFF" />
                <circle cx="72" cy="430" r="1.8" fill="#93C5FD" />
                <circle cx="430" cy="610" r="2" fill="#F6D58E" />
                <circle cx="96" cy="770" r="1.6" fill="#FFFFFF" />
                <path d="M54 120 L132 152 L190 112" stroke="#93C5FD" strokeOpacity="0.22" strokeDasharray="3 5" fill="none" />
                <circle cx="410" cy="420" r="34" fill="#D4A34C" fillOpacity="0.1" />
                <ellipse cx="410" cy="420" rx="52" ry="12" transform="rotate(-18 410 420)" stroke="#F6D58E" strokeOpacity="0.24" fill="none" />
              </svg>
            )}
            {kidsVariant === "baptism" && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2.5 z-20 rounded-[26px]"
                style={{ border: "1px solid rgba(183, 154, 108, 0.28)" }}
              />
            )}
          </>
        ) : (
          (isEditorialPaper || isMagazine) && (
            <div aria-hidden="true" className="paper-texture absolute inset-0 z-0 opacity-60" />
          )
        )}
        {/* ================= HERO SECTION ================= */}
        {useCinematicXvHero ? (
          /* TIEMPO 3 — HERO FOTOGRÁFICO CINEMATOGRÁFICO (XV Gala Rosa / Princesa Imperial / Editorial Sobre con Foto) */
          <section id="xv-hero" className="relative overflow-hidden">
            <div className="relative h-[82vh] min-h-[540px] max-h-[660px] w-full overflow-hidden">
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
              {/* Degradado cálido dorado/oscuro en la base */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(30,20,13,0.92) 0%, rgba(96,68,36,0.46) 40%, rgba(28,18,12,0.16) 76%, rgba(28,18,12,0.28) 100%)",
                }}
              />
              {/* Marco fino dorado */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 rounded-[22px] border border-[#E5C687]/40"
              />

              {/* Contenido Hero inferior centrado */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8 text-center text-white">
                {/* Corona minimalista dorada SVG */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={gateOpened ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 4 }}
                  transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 48 32"
                    className="mx-auto mb-2.5 h-7 w-10 text-[#E5C687] drop-shadow"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 25L8 10L17 18L24 6L31 18L40 10L43 25H5Z" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="24" cy="4" r="1.8" fill="currentColor" />
                    <circle cx="40" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                  <p className="font-ui-jost text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F5DFB0]">
                    {skin.category === "xv" ? "MIS XV AÑOS" : sample.eyebrow}
                  </p>
                </motion.div>

                <motion.h1
                  key={gateOpened ? "xv-h1-open" : "xv-h1-closed"}
                  initial={gateOpened ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.05, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display-playfair mt-2.5 break-words text-5xl sm:text-6xl font-semibold uppercase leading-[1.08] tracking-[0.16em] text-[#FFFBF3]"
                  style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
                >
                  {eventTitle}
                </motion.h1>

                {/* Fecha con filetes finos a los lados */}
                <div className="mt-4 flex w-full max-w-[310px] items-center gap-3">
                  <span aria-hidden="true" className="h-[1px] flex-1 bg-[#E5C687]/75" />
                  <span className="font-ui-jost text-[11px] font-medium uppercase tracking-[0.22em] text-[#FAF0DC]">
                    {dateDisplay}
                  </span>
                  <span aria-hidden="true" className="h-[1px] flex-1 bg-[#E5C687]/75" />
                </div>

                {/* Pastilla inferior flotante "DESLIZA PARA MÁS SORPRESAS" */}
                <motion.a
                  href="#xv-story"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5C687]/55 bg-black/35 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F8E7C4] backdrop-blur-md"
                >
                  <span>DESLIZA PARA MÁS SORPRESAS</span>
                  <span aria-hidden="true">↓</span>
                </motion.a>
              </div>
            </div>

            {guestName && (
              <div className="px-6 pt-5">
                <div
                  className="rounded-[24px] border bg-[#FAF6F0]/95 px-5 py-4 text-center shadow-[0_18px_40px_-16px_rgba(68,46,26,0.14)]"
                  style={{ borderColor: "rgba(183, 138, 78, 0.38)" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B7137]">
                    Pase Personalizado
                  </p>
                  <p className="mt-1 break-words text-base font-semibold text-[#35261B]">{guestName}</p>
                  {(passes || table || paseLabel) && (
                    <p className="mt-1 text-[13px] text-[#755F4B]">
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa asignada: ${table}` : ""}
                      {(passes || table) && paseLabel ? " · " : ""}
                      {paseLabel}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : isBohoPampas ? (
          /* BOHO PAMPAS ORGANIC ARCH HERO: Papel lino/arena + arco orgánico doble terracota */
          <section className="relative overflow-hidden px-5 pt-7 pb-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={gateOpened ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.95, y: 8, scale: 0.99 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-[360px] rounded-t-full border p-2"
              style={{
                borderColor: "rgba(184, 107, 75, 0.48)",
                backgroundColor: "rgba(255, 253, 249, 0.65)",
                boxShadow: "0 20px 44px -18px rgba(120, 72, 48, 0.18)",
              }}
            >
              <div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full rounded-b-[20px] border"
                style={{ borderColor: "rgba(184, 107, 75, 0.35)" }}
              >
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(53,37,29,0.78) 0%, rgba(53,37,29,0.18) 45%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-x-4 bottom-5 text-center text-white">
                  <p
                    key={gateOpened ? "ey-open" : "ey-closed"}
                    className={`font-ui-jost text-[10px] font-semibold uppercase tracking-[0.26em] text-[#F5DDD0] ${
                      gateOpened ? "type-eyebrow-reveal" : ""
                    }`}
                  >
                    {sample.eyebrow}
                  </p>
                  <h1
                    key={gateOpened ? "h1-open" : "h1-closed"}
                    className={`mt-1.5 break-words text-4xl sm:text-5xl font-semibold leading-[1.14] text-white ${displayFont} ${heroTitleAnimClass}`}
                  >
                    {eventTitle}
                  </h1>
                  <span
                    aria-hidden="true"
                    className="mx-auto mt-2 block h-[1px] w-16 bg-[#E6B89C]"
                  />
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/90">
                    {dateDisplay} · {timeDisplay}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="px-4 pb-2 pt-5 text-center">
              <CircularSaveSeal monogram={dynamicMonogram} color="#9C5538" />
              {guestName && (
                <div
                  className="mt-5 rounded-[22px] border px-5 py-4"
                  style={{
                    backgroundColor: "rgba(255, 253, 249, 0.85)",
                    borderColor: "rgba(184, 107, 75, 0.42)",
                    boxShadow: "0 14px 32px -14px rgba(120, 72, 48, 0.14)",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#9C5538" }}>
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
        ) : isFullscreen || isEditorialPaper ? (
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
                    background: `linear-gradient(to bottom, transparent, ${isMarfil ? "#FAF7F2" : palette.bg})`,
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

              {/* Framed plaque: ivory paper plaque on editorial-sobre, fine double hairline glass on fullscreen photographic hero — positioned low so faces remain clear */}
              <div className="absolute inset-0 flex items-end justify-center px-4 pb-8 sm:px-6 sm:pb-10">
                {isMarfil ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={gateOpened ? { opacity: 1, y: 0 } : { opacity: 0.92, y: 8 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-[324px] rounded-[20px] bg-[#FFFDFA]/95 px-5 py-5 text-center sm:px-6 sm:py-6"
                    style={{
                      border: "1px solid rgba(183, 138, 78, 0.45)",
                      boxShadow: "0 18px 40px -15px rgba(45, 30, 20, 0.12)",
                      color: palette.text,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[4px] rounded-[16px]"
                      style={{ border: "1px solid rgba(183, 138, 78, 0.45)" }}
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
                    <motion.h1
                      key={gateOpened ? "h1-open" : "h1-closed"}
                      initial={gateOpened ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.2, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className={`relative mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold leading-[1.22] ${displayFont}`}
                      style={{ color: palette.text }}
                    >
                      {eventTitle}
                    </motion.h1>
                    <motion.span
                      aria-hidden="true"
                      key={gateOpened ? "rule-open" : "rule-closed"}
                      initial={gateOpened ? { scaleX: 0 } : { scaleX: 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.95, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="relative mx-auto mt-2.5 block h-[1px] w-24 origin-center"
                      style={{ backgroundColor: "rgba(183, 138, 78, 0.78)" }}
                    />
                    <div
                      className="relative mt-4 grid grid-cols-3 items-center border-y py-2.5 text-center"
                      style={{ borderColor: "rgba(183, 138, 78, 0.35)" }}
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
                  </motion.div>
                ) : isBotanica ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={gateOpened ? { opacity: 1, y: 0 } : { opacity: 0.94, y: 6 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-[324px] rounded-[20px] bg-white/80 px-5 py-5 text-center backdrop-blur-[8px] sm:px-6 sm:py-6"
                    style={{
                      border: "1px solid rgba(95, 125, 91, 0.48)",
                      boxShadow: "0 18px 40px -16px rgba(36, 48, 36, 0.16)",
                      color: palette.text,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[4px] rounded-[16px]"
                      style={{ border: "1px solid rgba(95, 125, 91, 0.34)" }}
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
                      style={{ borderColor: "rgba(95, 125, 91, 0.35)" }}
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
                  </motion.div>
                ) : isEditorialPaper ? (
                  <div
                    className="relative w-full max-w-[324px] rounded-[20px] border px-5 py-5 text-center shadow-[0_18px_38px_-16px_rgba(42,36,32,0.22)] sm:px-6 sm:py-6"
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
              <CircularSaveSeal monogram={dynamicMonogram} color={textAccentOnBg} />

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
        ) : isMagazine ? (
          /* EDICIÓN TAPA DE REVISTA SATINADA (xv-editorial-vogue) */
          <section className="relative px-5 pb-5 pt-6 text-center">
            <div className="relative overflow-hidden border border-[#181818] bg-white p-3.5 shadow-[0_18px_42px_-16px_rgba(24,24,24,0.2)]">
              <div
                aria-hidden="true"
                key={gateOpened ? "sheen-open" : "sheen-idle"}
                className="magazine-glossy-sheen absolute inset-y-0 left-0 z-20 w-1/2"
              />
              {/* Detalles de cabecera de revista */}
              <div className="flex items-center justify-between border-b border-[#181818]/25 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                <span>N° 01 · EDICIÓN ESPECIAL</span>
                <span>{dateDisplay}</span>
              </div>

              <div className="py-3 text-center">
                <p
                  key={gateOpened ? "ey-open" : "ey-closed"}
                  className={`font-ui-jost text-[10px] font-bold uppercase tracking-[0.32em] ${
                    gateOpened ? "type-eyebrow-reveal" : ""
                  }`}
                  style={{ color: textAccentOnSurface }}
                >
                  {sample.eyebrow}
                </p>
                <p
                  className={`mt-1 text-5xl font-bold uppercase tracking-[0.14em] leading-none text-[#181818] ${displayFont}`}
                >
                  VOGUE
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-stone-500">
                  {sample.badgeText || "PORTADA 2027"} · {timeDisplay}
                </p>
              </div>

              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#181818]">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
                  <span
                    className="inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white"
                    style={{ backgroundColor: palette.accent }}
                  >
                    Edición Coleccionista
                  </span>
                  <h1
                    key={gateOpened ? "h1-open" : "h1-closed"}
                    className={`mt-2 break-words text-4xl sm:text-5xl font-semibold leading-[1.08] text-white ${displayFont} ${heroTitleAnimClass}`}
                  >
                    {eventTitle}
                  </h1>
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-white/85">
                    Entrevista · Cronograma · Galería de Moda
                  </p>
                </div>
              </div>
            </div>

            {guestName && (
              <div
                className="mt-4 border border-[#181818] bg-white px-5 py-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textAccentOnSurface }}>
                  Invitación VIP Nominada
                </p>
                <p className="mt-1 break-words text-base font-bold text-[#181818]">
                  {guestName}
                </p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px] text-stone-600">
                    {passes ? `${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                    {passes && table ? " · " : ""}
                    {table ? `Mesa ${table}` : ""}
                    {(passes || table) && paseLabel ? " · " : ""}
                    {paseLabel}
                  </p>
                )}
              </div>
            )}
          </section>
        ) : isNewsprint ? (
          /* DIARIO EDITORIAL HERO: Papel prensa vintage + filetes dobles en tinta carbón #1C1B19 */
          <section className="relative px-7 pt-8 pb-4 text-center">
            <div className="border-y-2 border-[#1C1B19] py-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A463F]">
                <span>{sample.badgeText || "EDICIÓN ESPECIAL"}</span>
                <span>VOL. I · N° 01</span>
                <span>ARGENTINA</span>
              </div>
              <p className={`mt-1 text-2xl font-bold tracking-tight text-[#1C1B19] ${displayFont}`}>
                THE CELEBRATION TIMES
              </p>
            </div>
            <div className="border-b border-[#1C1B19]/40 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: textAccentOnBg }}>
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
              className={`mt-2 break-words py-1 text-5xl font-bold leading-[1.14] text-[#1C1B19] ${displayFont} ${heroTitleAnimClass}`}
            >
              {eventTitle}
            </h1>
            <span
              aria-hidden="true"
              className="type-rule-draw mx-auto mt-2 block h-[2px] w-20 bg-[#1C1B19]"
            />

            <figure className="mt-5 border-2 border-[#1C1B19] bg-[#FAF7EE] p-1.5">
              <div className="h-[260px] w-full overflow-hidden">
                <NewsprintColorPhoto
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns ${heroPhotoFilterClass}`}
                />
              </div>
              <figcaption className="border-t border-[#1C1B19]/35 pt-1.5 text-[11px] italic text-[#4A463F]">
                Edición fotográfica · {eventTitle} — {dateDisplay}
              </figcaption>
            </figure>

            {guestName && (
              <div
                className="mt-5 border-2 border-[#1C1B19] bg-[#FAF7EE] px-5 py-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textAccentOnSurface }}>
                  Ejemplar Nominado Para
                </p>
                <p className="mt-1 break-words text-base font-bold text-[#1C1B19]">
                  {guestName}
                </p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px] text-[#4A463F]">
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
        ) : isBoardingPass ? (
          /* BOARDING PASS PRIMERA CLASE HERO: Cartulina satinada #F8F9FA + Azul Marino #0F2537 + Oro Champán */
          <section className="relative px-5 pb-4 pt-6">
            <div
              className="overflow-hidden rounded-3xl border shadow-[0_22px_48px_-18px_rgba(15,37,55,0.22)]"
              style={{
                backgroundColor: "#F8F9FA",
                borderColor: "rgba(15, 37, 55, 0.22)",
                color: "#0F2537",
              }}
            >
              {/* Cabecera Primera Clase en Azul Marino #0F2537 */}
              <div className="flex items-center justify-between bg-[#0F2537] px-5 py-3 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF6A]">
                  FIRST CLASS · BOARDING PASS
                </span>
                <span className="font-mono text-[10px] tracking-wider text-white/85">FOLIO 01-2027</span>
              </div>

              <div className="relative h-[240px] w-full overflow-hidden border-b" style={{ borderColor: "rgba(15, 37, 55, 0.14)" }}>
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2537]/82 via-[#0F2537]/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full border border-[#D4AF6A]/65 bg-[#0F2537]/75 px-3 py-1 backdrop-blur-sm">
                    {sample.badgeText || "DESTINO AMOR"}
                  </span>
                  <span className="font-mono rounded-md bg-[#0F2537]/75 px-2.5 py-1 text-[#D4AF6A]">FC-0040</span>
                </div>
              </div>

              <div className="px-5 pb-4 pt-5 text-center">
                <p
                  key={gateOpened ? "ey-open" : "ey-closed"}
                  className={`font-ui-jost text-[10px] font-bold uppercase tracking-[0.26em] ${
                    gateOpened ? "type-eyebrow-reveal" : ""
                  }`}
                  style={{ color: "#8C6D3F" }}
                >
                  {sample.eyebrow}
                </p>
                <h1
                  key={gateOpened ? "h1-open" : "h1-closed"}
                  className={`mt-1.5 break-words py-1 text-4xl sm:text-5xl font-bold leading-[1.14] text-[#0F2537] ${displayFont} ${heroTitleAnimClass}`}
                >
                  {eventTitle}
                </h1>
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-20 bg-[#C9A96E]"
                />

                <div
                  className="mt-4 grid grid-cols-3 gap-2 border-y border-dashed py-3 text-center"
                  style={{ borderColor: "rgba(15, 37, 55, 0.25)" }}
                >
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">SECTOR</span>
                    <span className="text-xs font-bold text-[#0F2537]">CEREMONIA</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">PUERTA</span>
                    <span className="text-xs font-bold text-[#0F2537]">{table || "A-01"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">HORARIO</span>
                    <span className="text-xs font-bold text-[#0F2537]">{timeDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Troquelado lateral profundo con muescas circulares y línea punteada */}
              <div className="relative flex items-center py-2">
                <span
                  className="-ml-4 h-8 w-8 rounded-full border shadow-inner"
                  style={{ backgroundColor: "#E9EDF2", borderColor: "rgba(15, 37, 55, 0.26)" }}
                />
                <div
                  className="mx-2 flex-1 border-t-2 border-dashed"
                  style={{ borderColor: "rgba(15, 37, 55, 0.35)" }}
                />
                <span
                  className="-mr-4 h-8 w-8 rounded-full border shadow-inner"
                  style={{ backgroundColor: "#E9EDF2", borderColor: "rgba(15, 37, 55, 0.26)" }}
                />
              </div>

              <div className="px-5 pb-5 text-center">
                {guestName && (
                  <div
                    className="mb-3 rounded-xl border border-dashed bg-white px-4 py-3"
                    style={{ borderColor: "#C9A96E" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#8C6D3F" }}>
                      Pasajero VIP · Titular del Pase
                    </p>
                    <p className="mt-0.5 text-base font-bold text-[#0F2537]">{guestName}</p>
                    {(passes || table) && (
                      <p className="text-xs text-slate-600">
                        {passes ? `${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                        {passes && table ? " · " : ""}
                        {table ? `Puerta / Mesa ${table}` : ""}
                      </p>
                    )}
                  </div>
                )}
                <div className="mx-auto flex h-8 w-48 items-stretch justify-center gap-[2px] opacity-80">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1].map((w, idx) => (
                    <div key={idx} style={{ width: `${w * 2}px`, backgroundColor: "#0F2537" }} className="h-full" />
                  ))}
                </div>
                <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-[#0F2537]/70">
                  {dateDisplay.toUpperCase()} · FC-0040-2027
                </p>
                <p className="mt-3 text-[14px] italic leading-relaxed text-slate-600">
                  &ldquo;{quoteText}&rdquo;
                </p>
              </div>
            </div>
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
        ) : isNocheGala ? (
          /* NOCHE DE GALA ART DÉCO HERO: Terciopelo #0B0D12 + Halo Dorado + Destello + Tipografía Serif Iluminada */
          <section className="relative overflow-hidden px-5 pb-4 pt-7 text-center">
            <div
              className="relative overflow-hidden border p-2"
              style={{
                borderColor: "rgba(212, 175, 55, 0.48)",
                backgroundColor: "rgba(18, 21, 30, 0.72)",
                boxShadow: "0 22px 54px -18px rgba(0, 0, 0, 0.85)",
              }}
            >
              {/* Destello de luz dorada suave recorriendo el marco al cargar */}
              <div
                aria-hidden="true"
                key={gateOpened ? "gala-sheen-open" : "gala-sheen-idle"}
                className="gala-gold-sheen absolute inset-y-0 left-0 z-20 w-1/2"
              />
              {/* Esquineros geométricos Art Déco */}
              <svg aria-hidden="true" className="pointer-events-none absolute left-2 top-2 z-20 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M2 22V2h20M6 18V6h12" />
              </svg>
              <svg aria-hidden="true" className="pointer-events-none absolute right-2 top-2 z-20 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M22 22V2H2M18 18V6H6" />
              </svg>

              <div className="relative h-[340px] w-full overflow-hidden border" style={{ borderColor: "rgba(212, 175, 55, 0.3)" }}>
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(11,13,18,0.18) 0%, rgba(11,13,18,0.45) 55%, rgba(11,13,18,0.96) 100%)",
                  }}
                />
              </div>

              <div className="relative -mt-16 px-4 pb-6 text-center">
                <div
                  className="inline-block border border-[#D4AF37]/60 bg-[#0B0D12]/85 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37] backdrop-blur-sm"
                >
                  {sample.eyebrow}
                </div>
                <motion.h1
                  key={gateOpened ? "gala-h1-open" : "gala-h1-closed"}
                  initial={gateOpened ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`mt-4 break-words py-1 text-4xl sm:text-5xl font-semibold uppercase leading-[1.18] tracking-[0.06em] text-[#F5EFE6] ${displayFont}`}
                  style={{ textShadow: "0 0 28px rgba(212, 175, 55, 0.38)" }}
                >
                  {eventTitle}
                </motion.h1>
                <span aria-hidden="true" className="mx-auto mt-2 block h-[1px] w-24 bg-[#D4AF37]/75" />
                <p className="font-ui-jost mt-3 text-[12px] font-medium uppercase tracking-[0.24em] text-[#B7AFA2]">
                  {dateDisplay} · {timeDisplay}
                </p>
              </div>
            </div>

            <div className="px-4 pt-5">
              <CircularSaveSeal monogram={dynamicMonogram} color="#D4AF37" />
              {guestName && (
                <div
                  className="mt-5 border bg-[#12151E]/75 px-5 py-4 backdrop-blur-md"
                  style={{ borderColor: "rgba(212, 175, 55, 0.42)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
                    Invitación de Gala · Black Tie
                  </p>
                  <p className="mt-1 break-words text-base font-semibold text-[#F5EFE6]">{guestName}</p>
                  {(passes || table || paseLabel) && (
                    <p className="mt-1 text-[13px] text-[#B7AFA2]">
                      {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                      {passes && table ? " · " : ""}
                      {table ? `Mesa ${table}` : ""}
                      {(passes || table) && paseLabel ? " · " : ""}
                      {paseLabel}
                    </p>
                  )}
                </div>
              )}
              <p className="mx-auto mt-5 max-w-sm text-[15px] italic leading-[1.65] text-[#B7AFA2]">
                &ldquo;{quoteText}&rdquo;
              </p>
            </div>
          </section>
        ) : isXvNocturno ? (
          /* XV NOCTURNO & FESTIVAL VIP HERO: Negro carbón #06070B + halos magenta/cian + cristal oscuro esmerilado */
          <section className="relative overflow-hidden px-5 pt-5 pb-4 text-center">
            <div
              className="relative overflow-hidden rounded-[26px] border backdrop-blur-md"
              style={{
                backgroundColor: "rgba(10, 12, 20, 0.78)",
                borderColor: "rgba(34, 211, 238, 0.42)",
                boxShadow: "0 20px 50px -14px rgba(0,0,0,0.88), 0 0 38px -12px rgba(236,72,153,0.35)",
              }}
            >
              <div className="relative h-[340px] w-full overflow-hidden">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(6,7,11,0.96) 0%, rgba(6,7,11,0.4) 55%, rgba(6,7,11,0.22) 100%)",
                  }}
                />
                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em]">
                  <span className="rounded-full border border-[#22D3EE]/50 bg-black/55 px-3 py-1 text-[#22D3EE] backdrop-blur-sm">
                    00 // MAIN STAGE
                  </span>
                  <span className="rounded-full border border-[#EC4899]/60 bg-[#EC4899]/20 px-3 py-1 text-[#F472B6] backdrop-blur-sm">
                    {sample.badgeText || "VIP NIGHT"}
                  </span>
                </div>
              </div>
              <div className="relative -mt-14 px-5 pb-6">
                <p className="font-ui-jost text-[11px] font-bold uppercase tracking-[0.26em] text-[#22D3EE]">
                  {sample.eyebrow}
                </p>
                <h1
                  className={`mt-2 break-words text-4xl sm:text-5xl font-bold uppercase leading-[1.14] tracking-wider text-white ${displayFont} ${heroTitleAnimClass}`}
                  style={{ textShadow: "0 0 26px rgba(34, 211, 238, 0.45)" }}
                >
                  {eventTitle}
                </h1>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.2em] text-slate-300">
                  {dateDisplay} · {timeDisplay}
                </p>
              </div>
            </div>
            {guestName && (
              <div
                className="mt-4 rounded-2xl border px-5 py-4 backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(10, 12, 20, 0.8)",
                  borderColor: "rgba(236, 72, 153, 0.42)",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#EC4899]">
                  Access Pass · Invitación
                </p>
                <p className="mt-1 break-words text-base font-bold text-white">{guestName}</p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px] text-slate-300">
                    {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                    {passes && table ? " · " : ""}
                    {table ? `Sector ${table}` : ""}
                    {(passes || table) && paseLabel ? " · " : ""}
                    {paseLabel}
                  </p>
                )}
              </div>
            )}
            <p className="mx-auto mt-5 max-w-sm text-[15px] italic leading-[1.65] text-slate-300">
              &ldquo;{quoteText}&rdquo;
            </p>
          </section>
        ) : isHombreClub ? (
          /* HOMBRES & +18 CLUB LOUNGE HERO: Nogal/Cuero carbón #110E0C + cobre cepillado #C88A4B */
          <section className="relative overflow-hidden px-5 pt-6 pb-4 text-center">
            <div className="relative border p-2" style={{ borderColor: "rgba(200, 138, 75, 0.45)" }}>
              <div className="relative h-[330px] w-full overflow-hidden">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover contrast-105 ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(17,14,12,0.96) 0%, rgba(17,14,12,0.38) 56%, rgba(17,14,12,0.18) 100%)",
                  }}
                />
              </div>
              <div className="relative -mt-14 px-4 pb-6">
                <span className="inline-block border border-[#C88A4B]/65 bg-[#110E0C]/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#C88A4B]">
                  {sample.eyebrow}
                </span>
                <motion.h1
                  key={gateOpened ? "club-h1-open" : "club-h1-closed"}
                  initial={gateOpened ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                  className={`mt-3 break-words py-1 text-4xl sm:text-5xl font-semibold uppercase leading-[1.16] tracking-[0.1em] text-[#F4ECE1] ${displayFont}`}
                >
                  {eventTitle}
                </motion.h1>
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mt-2 block h-[1px] w-24 origin-center bg-[#C88A4B]"
                />
                <p className="font-ui-jost mt-2.5 text-[12px] font-medium uppercase tracking-[0.22em] text-[#B8A99A]">
                  {dateDisplay} · {timeDisplay}
                </p>
              </div>
            </div>
            {guestName && (
              <div
                className="mt-4 border bg-[#171210]/90 px-5 py-4"
                style={{ borderColor: "rgba(200, 138, 75, 0.42)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C88A4B]">
                  Private Member Pass
                </p>
                <p className="mt-1 break-words text-base font-semibold text-[#F4ECE1]">{guestName}</p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px] text-[#B8A99A]">
                    {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                    {passes && table ? " · " : ""}
                    {table ? `Mesa ${table}` : ""}
                    {(passes || table) && paseLabel ? " · " : ""}
                    {paseLabel}
                  </p>
                )}
              </div>
            )}
            <p className="mx-auto mt-5 max-w-sm text-[15px] italic leading-[1.65] text-[#B8A99A]">
              &ldquo;{quoteText}&rdquo;
            </p>
          </section>
        ) : isModernKids ? (
          /* INFANTIL, NIÑAS & BAUTISMO MODERNO HERO: Tarjeta #FFFDF9 rounded-[32px] + escenografía ilustrada */
          <section className="relative overflow-hidden px-5 pt-5 pb-2 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={gateOpened ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.96, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 110, damping: 14 }}
              className="overflow-hidden rounded-[32px] border bg-[#FFFDF9] p-3.5 shadow-[0_14px_34px_-10px_rgba(30,40,60,0.08)]"
              style={{ borderColor: `${palette.accent}35` }}
            >
              <div className="relative h-64 w-full overflow-hidden rounded-[26px]">
                <img
                  src={heroImage}
                  alt={eventTitle}
                  className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""} ${heroPhotoFilterClass}`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(20,28,42,0.45) 0%, transparent 55%)",
                  }}
                />
                {sample.badgeText && (
                  <span
                    className="absolute right-3.5 top-3.5 rounded-full bg-[#FFFDF9]/92 px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-sm"
                    style={{ color: ensureContrast(palette.accent, "#FFFDF9", 4.6) }}
                  >
                    {sample.badgeText}
                  </span>
                )}
              </div>

              <div className="px-3 pb-4 pt-5">
                <p
                  className="font-ui-jost text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: ensureContrast(palette.accent, "#FFFDF9", 4.6) }}
                >
                  {sample.eyebrow}
                </p>
                <h1
                  className={`mt-1.5 break-words py-1 text-4xl sm:text-5xl font-bold leading-[1.16] ${displayFont}`}
                  style={{ color: "#283242" }}
                >
                  {eventTitle}
                </h1>
                <p className="font-ui-jost mt-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#647082]">
                  {dateDisplay} · {timeDisplay}
                </p>
              </div>
            </motion.div>

            {guestName && (
              <div
                className="mt-4 rounded-[28px] border bg-[#FFFDF9] px-5 py-4 shadow-[0_14px_34px_-10px_rgba(30,40,60,0.08)]"
                style={{ borderColor: `${palette.accent}35` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: ensureContrast(palette.accent, "#FFFDF9", 4.6) }}
                >
                  Pase Especial
                </p>
                <p className="mt-1 break-words text-base font-bold text-[#283242]">{guestName}</p>
                {(passes || table || paseLabel) && (
                  <p className="mt-1 text-[13px] text-[#647082]">
                    {passes ? `Reservamos ${passes} ${passes === 1 ? "lugar" : "lugares"}` : ""}
                    {passes && table ? " · " : ""}
                    {table ? `Mesa ${table}` : ""}
                    {(passes || table) && paseLabel ? " · " : ""}
                    {paseLabel}
                  </p>
                )}
              </div>
            )}

            <p
              className="mx-auto mt-5 max-w-sm text-[15px] italic leading-[1.65]"
              style={{ color: kidsVariant === "space" ? "#CBD5E1" : "#5D697A" }}
            >
              &ldquo;{quoteText}&rdquo;
            </p>
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
                  monogram={dynamicMonogram}
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

        <div className="px-5 pb-24">
          {/* ================= CUENTA REGRESIVA / MODO RECUERDO ================= */}
          {memoryMode ? (
            <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
              <section
                id="xv-countdown"
                className="mt-6 rounded-[28px] border p-6 text-center shadow-sm"
                style={{
                  backgroundColor: isXvStar ? "rgba(250, 246, 240, 0.94)" : palette.surfaceAlt,
                  borderColor: isXvStar ? "rgba(183, 138, 78, 0.35)" : palette.accent,
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
              <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
                <div
                  id="xv-countdown"
                  className={
                    isXvStar
                      ? "mt-6 rounded-[28px] border bg-[#FAF6F0]/94 px-5 py-6 text-center shadow-[0_20px_46px_-16px_rgba(68,46,26,0.14)] backdrop-blur-sm"
                      : undefined
                  }
                  style={isXvStar ? { borderColor: "rgba(183, 138, 78, 0.35)" } : undefined}
                >
                  {isXvStar && (
                    <p className="font-script mb-1 text-4xl leading-none text-[#9B7137]">
                      Falta muy poco
                    </p>
                  )}
                  <CountdownTimer
                    targetISO={dateISO}
                    skinId={skin.id}
                    palette={
                      isXvStar
                        ? {
                            ...palette,
                            bg: "#FAF6F0",
                            surface: "#FFFCF7",
                            accent: "#B78A4E",
                            border: "rgba(183, 138, 78, 0.35)",
                            text: "#35261B",
                            textMuted: "#755F4B",
                          }
                        : palette
                    }
                    fontClass={sectionHeadingFont}
                    layoutId={layoutId}
                    variant={
                      layoutId === "editorial-sobre" || layoutId === "fullscreen-hero"
                        ? "arch"
                        : "grid"
                    }
                  />
                </div>
              </RevealSection>
            )
          )}

          {/* ================= PADRES / PADRINOS ================= */}
          {!isEssentialPlan && parentsList && parentsList.length > 0 && (
            <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
            <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              {isXvStar ? (
                <section
                  id="xv-story"
                  className="rounded-[28px] border bg-[#FAF6F0]/94 px-6 py-8 text-center shadow-[0_20px_46px_-16px_rgba(68,46,26,0.14)] backdrop-blur-sm"
                  style={{ borderColor: "rgba(183, 138, 78, 0.35)" }}
                >
                  <FloatingIconAura enabled={isXvStar}>
                    <AnimatedSectionMedallion accentColor="#9B7137" surfaceColor="#FFFCF7" layoutId={layoutId}>
                      <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                    </AnimatedSectionMedallion>
                  </FloatingIconAura>
                  <p className="font-script mt-3 text-4xl leading-none text-[#9B7137]">
                    Mi Noche Soñada
                  </p>
                  <h2 className={`${sectionTitleAnimClass} mt-1 text-[26px] sm:text-[30px] font-semibold leading-[1.2] text-[#35261B] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2.5 block h-[1.5px] w-14 bg-[#B78A4E]"
                  />
                  <p className="mx-auto mt-4 max-w-sm break-words text-[15px] leading-[1.78] text-[#5D4B3B]">
                    {storyBody}
                  </p>
                </section>
              ) : isXvNocturno ? (
                <section
                  className="rounded-2xl border px-6 py-7 text-center backdrop-blur-md shadow-[0_18px_44px_-14px_rgba(0,0,0,0.85)]"
                  style={{
                    backgroundColor: "rgba(10, 12, 20, 0.78)",
                    borderColor: "rgba(34, 211, 238, 0.36)",
                  }}
                >
                  <AnimatedSectionMedallion accentColor="#22D3EE" surfaceColor="rgba(6,7,11,0.9)" layoutId={layoutId}>
                    <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em] text-[#EC4899]">
                    00 // AFTER MOVIE & STORY
                  </p>
                  <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-bold leading-[1.2] text-white ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm break-words text-[15px] leading-[1.7] text-slate-300">
                    {storyBody}
                  </p>
                </section>
              ) : isHombreClub ? (
                <section
                  className="border bg-[#171210]/90 px-6 py-7 text-center shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)]"
                  style={{ borderColor: "rgba(200, 138, 75, 0.38)" }}
                >
                  <AnimatedSectionMedallion accentColor="#C88A4B" surfaceColor="#110E0C" layoutId={layoutId}>
                    <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-semibold uppercase tracking-[0.08em] leading-[1.2] text-[#F4ECE1] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto mt-2.5 block h-[1px] w-20 origin-center bg-[#C88A4B]"
                  />
                  <p className="mx-auto mt-3.5 max-w-sm break-words text-[15px] leading-[1.72] text-[#B8A99A]">
                    {storyBody}
                  </p>
                </section>
              ) : isModernKids ? (
                <section
                  className="rounded-[32px] border bg-[#FFFDF9] px-6 py-7 text-center shadow-[0_14px_34px_-10px_rgba(30,40,60,0.08)]"
                  style={{ borderColor: `${palette.accent}35` }}
                >
                  <AnimatedSectionMedallion accentColor={ensureContrast(palette.accent, "#FFFDF9", 4.6)} surfaceColor="#FFFDF9" layoutId={layoutId}>
                    <CelebrationStoryIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <h2 className={`${sectionTitleAnimClass} mt-3 text-[28px] sm:text-[32px] font-bold leading-[1.2] text-[#283242] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="type-rule-draw mx-auto mt-2 block h-[2px] w-14 rounded-full"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <p className="mx-auto mt-3 max-w-sm break-words text-[15px] leading-[1.7] text-[#5D697A]">
                    {storyBody}
                  </p>
                </section>
              ) : isMagazine ? (
                <section
                  className="border border-[#181818] bg-white px-6 py-7 text-left shadow-[0_14px_30px_-18px_rgba(24,24,24,0.2)]"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-[#181818]/20 pb-2 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textAccentOnSurface }}>
                    <span>ENTREVISTA EXCLUSIVA</span>
                    <span>EDICIÓN XV</span>
                  </div>
                  <h2 className={`${sectionTitleAnimClass} text-[28px] sm:text-[32px] font-semibold leading-[1.16] text-[#181818] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <p
                    className="mt-3 break-words text-[15px] leading-[1.78] text-stone-600"
                  >
                    {storyBody}
                  </p>
                </section>
              ) : isNewsprint ? (
                <section
                  className="border-y-2 border-[#1C1B19] py-6"
                >
                  <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: textAccentOnBg }}>
                    <span>CRÓNICA CENTRAL</span>
                    <span>EDICIÓN ESPECIAL</span>
                  </div>
                  <h2 className={`${sectionTitleAnimClass} text-[28px] sm:text-[32px] font-bold leading-[1.15] text-[#1C1B19] ${sectionHeadingFont}`}>
                    {storyHeading}
                  </h2>
                  <p
                    className="editorial-drop-cap mt-3 break-words text-left text-[15px] leading-[1.78] text-[#4A463F]"
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
          <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
          <section
            id="xv-coords"
            className={
              isXvStar
                ? "space-y-5 rounded-[28px] border bg-[#FAF6F0]/94 px-5 py-7 shadow-[0_20px_46px_-16px_rgba(68,46,26,0.14)] backdrop-blur-sm"
                : "space-y-4"
            }
            style={isXvStar ? { borderColor: "rgba(183, 138, 78, 0.35)" } : undefined}
          >
            <div className="text-center">
              <FloatingIconAura enabled={isXvStar}>
                <AnimatedSectionMedallion accentColor={isXvStar ? "#9B7137" : isXvNocturno ? "#22D3EE" : isHombreClub ? "#C88A4B" : textAccentOnBg} surfaceColor={isXvStar ? "#FFFCF7" : isModernKids ? "#FFFDF9" : isXvNocturno ? "rgba(6,7,11,0.9)" : isHombreClub ? "#110E0C" : palette.surface} layoutId={layoutId}>
                  <CelebrationPinIcon className="h-7 w-7" />
                </AnimatedSectionMedallion>
              </FloatingIconAura>
              {isXvStar ? (
                <p className="font-script mt-3 text-4xl leading-none text-[#9B7137]">
                  Dónde & Cuándo
                </p>
              ) : (
                <p
                  className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: isXvNocturno ? "#22D3EE" : isHombreClub ? "#C88A4B" : textAccentOnBg }}
                >
                  {isXvNocturno || isNeon ? "01 // DÓNDE & CUÁNDO" : isTicket ? "Puerta & Ubicación" : "Dónde & Cuándo"}
                </p>
              )}
              <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont} ${isHombreClub ? "uppercase tracking-[0.06em]" : ""}`}>
                {isXvStar ? "Agenda & Recepción" : "Coordenadas del Evento"}
              </h2>
              {isHombreClub ? (
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mt-2.5 block h-[1px] w-20 origin-center bg-[#C88A4B]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                  style={{ backgroundColor: isXvStar ? "#B78A4E" : palette.accent }}
                />
              )}
            </div>

            {isXvStar && (
              <div className="space-y-3">
                <MiniCalendarGrid dateISO={dateISO} accentColor="#B78A4E" />
                <div
                  className="mx-auto flex max-w-[290px] items-center justify-between rounded-[18px] border bg-[#FFFCF7]/95 px-4 py-3 text-left shadow-sm"
                  style={{ borderColor: "rgba(183, 138, 78, 0.32)" }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7137]">
                      Horario Recepción
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#35261B]">{dateDisplay}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #C69B57, #9E7333)" }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {timeDisplay}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {locations.map((loc, idx) => (
                <motion.div
                  key={`${loc.label}-${idx}`}
                  variants={
                    isBotanica || isBoardingPass
                      ? {
                          hidden: { opacity: 0, y: 18 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.65, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                          },
                        }
                      : undefined
                  }
                  className={`${cardRadius} border p-5 sm:p-6 ${isTicket && !isXvNocturno ? "text-left" : "text-center"} ${
                    isBotanica ? "backdrop-blur-[8px]" : isNocheGala || isXvNocturno ? "backdrop-blur-md" : ""
                  } ${cardShadow}`}
                  style={{
                    backgroundColor: isXvStar
                      ? "#FFFCF7"
                      : isModernKids
                      ? "#FFFDF9"
                      : isXvNocturno
                      ? "rgba(10, 12, 20, 0.78)"
                      : isHombreClub
                      ? "rgba(22, 17, 14, 0.9)"
                      : isMarfil
                      ? "#FFFDFA"
                      : isBotanica
                      ? "rgba(255, 255, 255, 0.72)"
                      : isBohoPampas
                      ? "#FFFDF9"
                      : isBoardingPass
                      ? "#FFFFFF"
                      : isNocheGala
                      ? "rgba(18, 21, 30, 0.75)"
                      : palette.surface,
                    color: isModernKids ? "#283242" : isHombreClub ? "#F4ECE1" : isXvNocturno ? "#F8FAFC" : undefined,
                    borderColor: isXvStar
                      ? "rgba(183, 138, 78, 0.35)"
                      : isModernKids
                      ? `${palette.accent}35`
                      : isXvNocturno
                      ? "rgba(34, 211, 238, 0.38)"
                      : isHombreClub
                      ? "rgba(200, 138, 75, 0.42)"
                      : isNocheGala
                      ? "rgba(212, 175, 55, 0.36)"
                      : isNeon
                      ? `${palette.accent}55`
                      : isInfantil
                      ? palette.accent
                      : isMarfil
                      ? "rgba(183, 138, 78, 0.45)"
                      : isBotanica
                      ? "rgba(95, 125, 91, 0.36)"
                      : isBohoPampas
                      ? "rgba(184, 107, 75, 0.36)"
                      : isBoardingPass
                      ? "rgba(15, 37, 55, 0.22)"
                      : palette.border,
                  }}
                >
                  {isBoardingPass ? (
                    <>
                      <div className="-mx-5 -mt-5 mb-4 flex items-center justify-between rounded-t-2xl bg-[#0F2537] px-5 py-2.5 text-white sm:-mx-6 sm:-mt-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF6A]">
                          SECTOR 0{idx + 1} · {loc.label}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-white/90">
                          PUERTA {idx === 0 ? "A-01" : "B-02"}
                        </span>
                      </div>
                      <h3 className="break-words text-lg font-bold text-[#0F2537]">{loc.venue}</h3>
                      <p className="mt-1 break-words text-[14px] text-slate-600">
                        {loc.address} · {loc.city}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed pt-2.5 text-[11px]" style={{ borderColor: "rgba(15, 37, 55, 0.22)" }}>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">HORARIO</span>
                          <span className="font-bold text-[#0F2537]">{loc.time}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">CLASE</span>
                          <span className="font-bold text-[#8C6D3F]">FIRST CLASS</span>
                        </div>
                      </div>
                    </>
                  ) : isTicket ? (
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
                    <motion.a
                      href={loc.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 280, damping: 18 }}
                      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 ${
                        isNewspaper || isHombreClub ? "rounded-none" : "rounded-full"
                      }`}
                      style={{
                        background: isXvStar
                          ? "linear-gradient(135deg, #C69B57, #9E7333)"
                          : isXvNocturno
                          ? "linear-gradient(135deg, #EC4899, #0891B2)"
                          : undefined,
                        backgroundColor: isXvStar || isXvNocturno ? undefined : buttonBg,
                        color: isXvStar || isXvNocturno ? "#FFFFFF" : isHombreClub ? "#110E0C" : palette.accentText,
                      }}
                    >
                      <MapPin className="h-4 w-4" strokeWidth={1.75} />
                      Ver en Google Maps
                    </motion.a>
                  </div>
                </motion.div>
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
            <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <section id="sec-itinerario">
                <div className="mb-5 text-center">
                  <p
                    className="type-section-eyebrow text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: isXvNocturno ? "#22D3EE" : isHombreClub ? "#C88A4B" : textAccentOnBg }}
                  >
                    {isXvNocturno || isNeon ? "02 // LINE-UP" : isHombreClub ? "CLUB SCHEDULE" : "Programa del Día"}
                  </p>
                  <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont} ${isHombreClub ? "uppercase tracking-[0.06em]" : ""}`}>Itinerario</h2>
                  {isHombreClub ? (
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                      className="mx-auto mt-2.5 block h-[1px] w-20 origin-center bg-[#C88A4B]"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                      style={{ backgroundColor: palette.accent }}
                    />
                  )}
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
                ) : isNeon || isTicket || isXvNocturno || isHombreClub ? (
                  <div className="space-y-2.5">
                    {scheduleList.map((item, idx) => (
                      <motion.div
                        key={item.time + item.title}
                        variants={
                          isBoardingPass
                            ? {
                                hidden: { opacity: 0, y: 14 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] },
                                },
                              }
                            : undefined
                        }
                        className={`flex items-center gap-3.5 ${innerRadius} border px-4 py-3.5 ${
                          isNocheGala || isXvNocturno ? "backdrop-blur-md" : ""
                        } ${cardShadow}`}
                        style={{
                          backgroundColor: isXvNocturno
                            ? "rgba(10, 12, 20, 0.78)"
                            : isHombreClub
                            ? "rgba(22, 17, 14, 0.9)"
                            : isNocheGala
                            ? "rgba(18, 21, 30, 0.75)"
                            : isBoardingPass
                            ? "#FFFFFF"
                            : palette.surface,
                          borderColor: isXvNocturno
                            ? "rgba(236, 72, 153, 0.38)"
                            : isHombreClub
                            ? "rgba(200, 138, 75, 0.42)"
                            : isNocheGala
                            ? "rgba(212, 175, 55, 0.36)"
                            : isNeon
                            ? `${palette.accent}44`
                            : isBoardingPass
                            ? "rgba(15, 37, 55, 0.22)"
                            : palette.border,
                        }}
                      >
                        <span
                          className={`flex-shrink-0 ${isHombreClub ? "rounded-none" : "rounded-lg"} px-2.5 py-1.5 font-mono text-xs font-bold`}
                          style={{
                            backgroundColor: isBoardingPass ? "#0F2537" : isHombreClub ? "#C88A4B" : isXvNocturno ? "rgba(34, 211, 238, 0.16)" : buttonBg,
                            color: isBoardingPass ? "#D4AF6A" : isHombreClub ? "#110E0C" : isXvNocturno ? "#22D3EE" : palette.accentText,
                            border: isXvNocturno ? "1px solid rgba(34, 211, 238, 0.45)" : undefined,
                          }}
                        >
                          {item.time}
                        </span>
                        <div className="min-w-0">
                          {isBoardingPass && (
                            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C6D3F]">
                              HORARIO · ETAPA 0{idx + 1}
                            </span>
                          )}
                          <h3 className={`text-[15px] font-bold leading-snug ${isHombreClub ? "text-[#F4ECE1]" : isXvNocturno ? "text-white" : ""}`}>{item.title}</h3>
                          <p className="mt-0.5 text-[13px]" style={{ color: isHombreClub ? "#B8A99A" : isXvNocturno ? "#CBD5E1" : palette.textMuted }}>{item.detail}</p>
                        </div>
                      </motion.div>
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
                    const itemCardBg = isModernKids
                      ? "#FFFDF9"
                      : isBotanica
                      ? "rgba(255, 255, 255, 0.72)"
                      : isBohoPampas
                      ? "#FFFDF9"
                      : palette.surface;
                    const itemCardBorder = isModernKids
                      ? `${palette.accent}35`
                      : isBotanica
                      ? "rgba(95, 125, 91, 0.36)"
                      : isBohoPampas
                      ? "rgba(184, 107, 75, 0.36)"
                      : palette.border;
                    return (
                      <motion.div
                        key={item.time + item.title}
                        variants={
                          isBotanica
                            ? {
                                hidden: { opacity: 0, y: 16 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    duration: 0.62,
                                    delay: idx * 0.08,
                                    ease: [0.22, 1, 0.36, 1],
                                  },
                                },
                              }
                            : undefined
                        }
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
                              className={`${innerRadius} border p-4 text-left ${
                                isBotanica ? "backdrop-blur-[8px]" : ""
                              } ${cardShadow} sm:p-4 sm:text-right`}
                              style={{
                                backgroundColor: itemCardBg,
                                borderColor: itemCardBorder,
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
                              className={`${innerRadius} border p-4 text-left ${
                                isBotanica ? "backdrop-blur-[8px]" : ""
                              } ${cardShadow} sm:p-4`}
                              style={{
                                backgroundColor: itemCardBg,
                                borderColor: itemCardBorder,
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
                      </motion.div>
                    );
                  })}
                </div>
                )}
              </section>
            </RevealSection>
          )}

          {/* ================= GALERÍA DE FOTOS (Collage Bento en Fullscreen / Polaroid en Editorial / Prensa en Diario) ================= */}
          {sections.gallery && galleryList.length > 0 && (
            <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
              <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
              <section id="sec-galeria">
                <div className="mb-5 text-center">
                  <AnimatedSectionMedallion accentColor={textAccentOnBg} surfaceColor={palette.surface} layoutId={layoutId}>
                    <CelebrationCameraIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                  </AnimatedSectionMedallion>
                  <p
                    className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: textAccentOnBg }}
                  >
                    {isNeon
                      ? "03 // Galería"
                      : isMagazine
                      ? "Editorial de Moda"
                      : isNewsprint
                      ? "Archivo Fotográfico"
                      : "Recuerdos"}
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

                {isMarfil ? (
                  /* Galería Polaroid artesanal con inclinación orgánica que se endereza al tocar/pasar el cursor */
                  <div className="space-y-4">
                    <motion.div
                      initial={{ rotate: -1.3 }}
                      whileHover={{ rotate: 0, scale: 1.01 }}
                      whileTap={{ rotate: 0, scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 150, damping: 18 }}
                      className="relative mx-auto max-w-[360px] rounded-[16px] border bg-[#FFFDFA] p-3.5 pb-6"
                      style={{
                        borderColor: "rgba(183, 138, 78, 0.45)",
                        boxShadow: "0 18px 40px -15px rgba(45, 30, 20, 0.14)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIdx(activeGalleryIdx)}
                        aria-label="Ampliar foto destacada"
                        className="relative block aspect-[4/5] w-full overflow-hidden rounded-[10px]"
                      >
                        <img
                          key={galleryList[activeGalleryIdx]}
                          src={galleryList[activeGalleryIdx] || galleryList[0]}
                          alt={`Momento ${activeGalleryIdx + 1}`}
                          className={`anim-gallery-slide h-full w-full object-cover ${
                            skin.imageFilter ?? ""
                          }`}
                        />
                        <span className="absolute bottom-3 right-3 rounded-full border border-white/35 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                          {activeGalleryIdx + 1} / {galleryList.length} · Ampliar
                        </span>
                      </button>

                      <div className="mt-3.5 flex items-center justify-between px-1">
                        <span
                          className={`text-xl font-medium ${displayFont}`}
                          style={{ color: palette.text }}
                        >
                          {eventTitle}
                        </span>
                        <span
                          className="font-ui-jost text-[10px] font-semibold uppercase tracking-[0.2em]"
                          style={{ color: textAccentOnSurface }}
                        >
                          Recuerdo #{activeGalleryIdx + 1}
                        </span>
                      </div>

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
                            className="absolute left-5 top-[44%] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Foto siguiente"
                            onClick={() =>
                              setActiveGalleryIdx((i) => (i + 1) % galleryList.length)
                            }
                            className="absolute right-5 top-[44%] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </motion.div>

                    {galleryList.length > 1 && (
                      <div className="no-scrollbar flex items-center justify-center gap-3 overflow-x-auto px-2 py-2">
                        {galleryList.map((imgUrl, idx) => {
                          const isCurrent = idx === activeGalleryIdx;
                          const restTilt = idx % 2 === 0 ? -2.4 : 2.1;
                          return (
                            <motion.button
                              key={imgUrl + idx}
                              type="button"
                              onClick={() => setActiveGalleryIdx(idx)}
                              aria-label={`Ver foto ${idx + 1}`}
                              initial={false}
                              animate={{
                                rotate: isCurrent ? 0 : restTilt,
                                scale: isCurrent ? 1.06 : 0.96,
                              }}
                              whileHover={{ rotate: 0, scale: 1.06 }}
                              whileTap={{ rotate: 0, scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 180, damping: 16 }}
                              className={`relative h-[74px] w-[62px] flex-shrink-0 overflow-hidden rounded-[8px] border bg-[#FFFDFA] p-1 pb-2.5 shadow-[0_8px_18px_-10px_rgba(45,30,20,0.22)] ${
                                isCurrent ? "opacity-100" : "opacity-75 hover:opacity-100"
                              }`}
                              style={{
                                borderColor: isCurrent
                                  ? "rgba(183, 138, 78, 0.85)"
                                  : "rgba(183, 138, 78, 0.35)",
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Miniatura ${idx + 1}`}
                                loading="lazy"
                                className={`h-full w-full rounded-[4px] object-cover ${
                                  skin.imageFilter ?? ""
                                }`}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : isBohoPampas ? (
                  /* Galería en Arcos Orgánicos Terracota para Boho Pampas */
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="mx-auto max-w-[348px] rounded-t-full rounded-b-[24px] border p-2.5"
                      style={{
                        borderColor: "rgba(184, 107, 75, 0.45)",
                        backgroundColor: "rgba(255, 253, 249, 0.85)",
                        boxShadow: "0 18px 36px -16px rgba(120, 72, 48, 0.16)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIdx(activeGalleryIdx)}
                        aria-label="Ampliar foto destacada"
                        className="relative block aspect-[4/5] w-full overflow-hidden rounded-t-full rounded-b-[16px]"
                      >
                        <img
                          key={galleryList[activeGalleryIdx]}
                          src={galleryList[activeGalleryIdx] || galleryList[0]}
                          alt={`Momento ${activeGalleryIdx + 1}`}
                          className={`anim-gallery-slide h-full w-full object-cover ${skin.imageFilter ?? ""}`}
                        />
                        <span className="absolute bottom-3 right-3 rounded-full border border-white/35 bg-[#35251D]/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                          {activeGalleryIdx + 1} / {galleryList.length} · Ampliar
                        </span>
                      </button>
                    </motion.div>

                    {galleryList.length > 1 && (
                      <div className="grid grid-cols-4 gap-2.5">
                        {galleryList.slice(0, 4).map((imgUrl, idx) => {
                          const isCurrent = idx === activeGalleryIdx;
                          return (
                            <button
                              key={imgUrl + idx}
                              type="button"
                              onClick={() => setActiveGalleryIdx(idx)}
                              aria-label={`Ver foto ${idx + 1}`}
                              className={`relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[10px] border p-0.5 transition-all ${
                                isCurrent ? "scale-[1.04] opacity-100" : "opacity-70 hover:opacity-95"
                              }`}
                              style={{
                                borderColor: isCurrent ? "#B86B4B" : "rgba(184, 107, 75, 0.35)",
                                backgroundColor: "#FFFDF9",
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Miniatura ${idx + 1}`}
                                loading="lazy"
                                className={`h-full w-full rounded-t-full rounded-b-[8px] object-cover ${skin.imageFilter ?? ""}`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : isMagazine ? (
                  /* Galería tipo Collage de Moda para Edición Tapa de Revista */
                  <div className="border border-[#181818] bg-white p-3 shadow-[0_14px_30px_-18px_rgba(24,24,24,0.2)]">
                    <div className="mb-2.5 flex items-center justify-between border-b border-[#181818]/20 pb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-stone-500">
                      <span>PORTFOLIO EDITORIAL</span>
                      <span>{galleryList.length} LÁMINAS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setLightboxIdx(0)}
                        aria-label="Ampliar foto destacada"
                        className="group relative col-span-2 aspect-[4/5] w-full overflow-hidden border border-[#181818]"
                      >
                        <img
                          src={galleryList[0]}
                          alt="Editorial 1"
                          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${skin.imageFilter ?? ""}`}
                        />
                        <span className="absolute bottom-3 left-3 border border-white/40 bg-black/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                          LOOK 01 · AMPLIAR
                        </span>
                      </button>
                      {galleryList.slice(1, 5).map((imgUrl, idx) => (
                        <button
                          key={imgUrl + idx}
                          type="button"
                          onClick={() => setLightboxIdx(idx + 1)}
                          aria-label={`Ampliar foto ${idx + 2}`}
                          className="group relative aspect-[3/4] overflow-hidden border border-[#181818]"
                        >
                          <img
                            src={imgUrl}
                            alt={`Editorial ${idx + 2}`}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${skin.imageFilter ?? ""}`}
                          />
                          <span className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#181818]">
                            0{idx + 2}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isNewsprint ? (
                  /* Galería Fotográfica de Imprenta: escala de grises alto contraste -> color natural al entrar en pantalla o tocar */
                  <div className="border-2 border-[#1C1B19] bg-[#FAF7EE] p-2.5">
                    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#1C1B19]">
                      <NewsprintColorPhoto
                        key={galleryList[activeGalleryIdx]}
                        src={galleryList[activeGalleryIdx] || galleryList[0]}
                        alt={`Archivo fotográfico ${activeGalleryIdx + 1}`}
                        onOpen={() => setLightboxIdx(activeGalleryIdx)}
                        caption={`${activeGalleryIdx + 1} / ${galleryList.length} · Ampliar`}
                      />
                    </div>
                    {galleryList.length > 1 && (
                      <div className="mt-2.5 grid grid-cols-4 gap-2">
                        {galleryList.slice(0, 4).map((imgUrl, idx) => {
                          const isCurrent = idx === activeGalleryIdx;
                          return (
                            <div
                              key={imgUrl + idx}
                              className={`aspect-square overflow-hidden border transition-all ${
                                isCurrent ? "border-2 border-[#1C1B19]" : "border-[#1C1B19]/45 opacity-80 hover:opacity-100"
                              }`}
                            >
                              <NewsprintColorPhoto
                                src={imgUrl}
                                alt={`Edición foto ${idx + 1}`}
                                onOpen={() => setActiveGalleryIdx(idx)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-2 border-t border-[#1C1B19]/30 pt-1.5 text-center text-[10px] font-medium italic text-[#4A463F]">
                      Archivo de imprenta · Tocar cualquier lámina para ampliar
                    </p>
                  </div>
                ) : isFullscreen && galleryList.length >= 3 ? (
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
          <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              id="xv-dress"
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${
                isBotanica ? "backdrop-blur-[8px]" : isNocheGala || isXvNocturno ? "backdrop-blur-md" : isXvStar ? "backdrop-blur-sm" : ""
              } ${cardShadow}`}
              style={{
                backgroundColor: isXvStar
                  ? "rgba(250, 246, 240, 0.94)"
                  : isModernKids
                  ? "#FFFDF9"
                  : isXvNocturno
                  ? "rgba(10, 12, 20, 0.78)"
                  : isHombreClub
                  ? "rgba(22, 17, 14, 0.9)"
                  : isBotanica
                  ? "rgba(255, 255, 255, 0.72)"
                  : isBohoPampas
                  ? "#FFFDF9"
                  : isBoardingPass
                  ? "#FFFFFF"
                  : isNocheGala
                  ? "rgba(18, 21, 30, 0.75)"
                  : palette.surface,
                color: isModernKids ? "#283242" : isHombreClub ? "#F4ECE1" : isXvNocturno ? "#F8FAFC" : undefined,
                borderColor: isXvStar
                  ? "rgba(183, 138, 78, 0.35)"
                  : isModernKids
                  ? `${palette.accent}35`
                  : isXvNocturno
                  ? "rgba(34, 211, 238, 0.38)"
                  : isHombreClub
                  ? "rgba(200, 138, 75, 0.42)"
                  : isNocheGala
                  ? "rgba(212, 175, 55, 0.36)"
                  : isNewspaper
                  ? palette.text
                  : isNeon
                  ? `${palette.accent}55`
                  : isInfantil
                  ? palette.accent
                  : isBotanica
                  ? "rgba(95, 125, 91, 0.36)"
                  : isBohoPampas
                  ? "rgba(184, 107, 75, 0.36)"
                  : isBoardingPass
                  ? "rgba(15, 37, 55, 0.22)"
                  : palette.border,
              }}
            >
              {isBoardingPass && (
                <div className="-mx-6 -mt-6 mb-5 flex items-center justify-between rounded-t-2xl bg-[#0F2537] px-5 py-2.5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF6A]">
                    SECTOR · ETIQUETA
                  </span>
                  <span className="font-mono text-[10px] font-bold text-white/90">DRESS CODE</span>
                </div>
              )}
              <FloatingIconAura enabled={isXvStar}>
                <AnimatedSectionMedallion accentColor={isXvStar ? "#9B7137" : isXvNocturno ? "#22D3EE" : isHombreClub ? "#C88A4B" : textAccentOnSurface} surfaceColor={isXvStar ? "#FFFCF7" : isModernKids ? "#FFFDF9" : isXvNocturno ? "rgba(6,7,11,0.9)" : isHombreClub ? "#110E0C" : palette.surfaceAlt} layoutId={layoutId}>
                  <CelebrationAttireIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                </AnimatedSectionMedallion>
              </FloatingIconAura>
            {isXvStar ? (
              <p className="font-script mt-3 text-4xl leading-none text-[#9B7137]">
                Dress Code
              </p>
            ) : (
              <p
                className="type-section-eyebrow mt-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: isXvNocturno ? "#EC4899" : isHombreClub ? "#C88A4B" : isModernKids ? "#647082" : palette.textMuted }}
              >
                {isXvNocturno || isNeon ? "03 // DRESS CODE" : "Código de Vestimenta"}
              </p>
            )}
            <h2 className={`${sectionTitleAnimClass} mt-1.5 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont} ${isHombreClub ? "uppercase tracking-[0.06em]" : ""}`}>
              {dressCodeLabel}
            </h2>
            {isHombreClub ? (
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-2.5 block h-[1px] w-20 origin-center bg-[#C88A4B]"
              />
            ) : (
              <span
                aria-hidden="true"
                className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                style={{ backgroundColor: isXvStar ? "#B78A4E" : palette.accent }}
              />
            )}
            <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: isModernKids ? "#5D697A" : isHombreClub ? "#B8A99A" : isXvNocturno ? "#CBD5E1" : palette.textMuted }}>
              {sample.dressCode.notes}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              {(isXvStar
                ? [
                    { name: "Borgoña", hex: "#6B1E30" },
                    { name: "Oro Champán", hex: "#D4AF6A" },
                    { name: "Negro", hex: "#1C1B19" },
                    { name: "Marfil Suave", hex: "#EFE6D5" },
                  ]
                : sample.dressCode.swatches
              ).map((sw) => (
                <div key={sw.name} className="flex flex-col items-center gap-1.5">
                  <span
                    className="h-8 w-8 rounded-full border-2 shadow-sm"
                    style={{
                      backgroundColor: sw.hex,
                      borderColor: isXvStar ? "rgba(183, 138, 78, 0.55)" : palette.border,
                    }}
                  />
                  <span className="text-[11px] font-medium" style={{ color: isXvStar ? "#5D4B3B" : palette.textMuted }}>
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
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${isBotanica ? "backdrop-blur-[8px]" : isNocheGala ? "backdrop-blur-md" : ""} ${cardShadow}`}
              style={{
                backgroundColor: isBotanica ? "rgba(255, 255, 255, 0.72)" : isBohoPampas ? "#FFFDF9" : isBoardingPass ? "#FFFFFF" : isNocheGala ? "rgba(18, 21, 30, 0.75)" : palette.surface,
                borderColor: isNocheGala ? "rgba(212, 175, 55, 0.36)" : isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : isBotanica ? "rgba(95, 125, 91, 0.36)" : isBohoPampas ? "rgba(184, 107, 75, 0.36)" : isBoardingPass ? "rgba(15, 37, 55, 0.22)" : palette.border,
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
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              id="sec-regalos"
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${isBotanica ? "backdrop-blur-[8px]" : isNocheGala ? "backdrop-blur-md" : ""} ${cardShadow}`}
              style={{
                backgroundColor: isBotanica ? "rgba(255, 255, 255, 0.72)" : isBohoPampas ? "#FFFDF9" : isBoardingPass ? "#FFFFFF" : isNocheGala ? "rgba(18, 21, 30, 0.75)" : palette.surface,
                borderColor: isNocheGala ? "rgba(212, 175, 55, 0.36)" : isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : isBotanica ? "rgba(95, 125, 91, 0.36)" : isBohoPampas ? "rgba(184, 107, 75, 0.36)" : isBoardingPass ? "rgba(15, 37, 55, 0.22)" : palette.border,
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
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
            <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              className={`${cardRadius} ${isNewspaper ? "border-2" : "border"} p-6 text-center ${isBotanica ? "backdrop-blur-[8px]" : isNocheGala ? "backdrop-blur-md" : ""} ${cardShadow}`}
              style={{
                backgroundColor: isBotanica ? "rgba(255, 255, 255, 0.72)" : isBohoPampas ? "#FFFDF9" : isBoardingPass ? "#FFFFFF" : isNocheGala ? "rgba(18, 21, 30, 0.75)" : palette.surface,
                borderColor: isNocheGala ? "rgba(212, 175, 55, 0.36)" : isNewspaper ? palette.text : isNeon ? `${palette.accent}55` : isBotanica ? "rgba(95, 125, 91, 0.36)" : isBohoPampas ? "rgba(184, 107, 75, 0.36)" : isBoardingPass ? "rgba(15, 37, 55, 0.22)" : palette.border,
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
            <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
              <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
          <RevealSection luxurySpring={isMarfil || isXvStar} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala || isXvNocturno || isHombreClub} botanicalStagger={isBotanica || isBoardingPass} elasticSpring={isModernKids}>
            <OrnamentDivider layoutId={layoutId} category={skin.category} skinId={skin.id} color={textAccentOnBg} />
            <section
              id="xv-rsvp"
              className={`${isNewspaper || isHombreClub ? "rounded-none" : cardRadius} ${
                isXvStar || isModernKids || isXvNocturno || isHombreClub ? "border" : "border-2"
              } ${isXvStar || isXvNocturno ? "backdrop-blur-md" : ""} p-6 sm:p-7 text-center ${cardShadow}`}
              style={{
                backgroundColor: isXvStar
                  ? "rgba(250, 246, 240, 0.94)"
                  : isModernKids
                  ? "#FFFDF9"
                  : isXvNocturno
                  ? "rgba(10, 12, 20, 0.8)"
                  : isHombreClub
                  ? "rgba(22, 17, 14, 0.92)"
                  : palette.surfaceAlt,
                color: isModernKids ? "#283242" : isHombreClub ? "#F4ECE1" : isXvNocturno ? "#F8FAFC" : undefined,
                borderColor: isXvStar
                  ? "rgba(183, 138, 78, 0.35)"
                  : isModernKids
                  ? `${palette.accent}35`
                  : isXvNocturno
                  ? "rgba(236, 72, 153, 0.45)"
                  : isHombreClub
                  ? "rgba(200, 138, 75, 0.45)"
                  : textAccentOnAlt,
              }}
            >
              <FloatingIconAura enabled={isXvStar}>
                <AnimatedSectionMedallion accentColor={isXvStar ? "#9B7137" : isXvNocturno ? "#22D3EE" : isHombreClub ? "#C88A4B" : textAccentOnAlt} surfaceColor={isXvStar ? "#FFFCF7" : isModernKids ? "#FFFDF9" : isXvNocturno ? "rgba(6,7,11,0.9)" : isHombreClub ? "#110E0C" : palette.surface} layoutId={layoutId}>
                  <CelebrationCheckIcon category={skin.category} skinId={skin.id} className="h-7 w-7" />
                </AnimatedSectionMedallion>
              </FloatingIconAura>
              {isXvStar && (
                <p className="font-script mt-3 text-4xl leading-none text-[#9B7137]">
                  ¿Nos acompañás?
                </p>
              )}
              {isXvNocturno && (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#22D3EE]">
                  05 // CONFIRMACIÓN VIP
                </p>
              )}
              <h2 className={`${sectionTitleAnimClass} mt-2 text-[28px] sm:text-[32px] font-semibold leading-[1.2] ${sectionHeadingFont} ${isHombreClub ? "uppercase tracking-[0.06em]" : ""}`}>
                ¿Contamos con vos?
              </h2>
              {isHombreClub ? (
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mt-2.5 block h-[1px] w-20 origin-center bg-[#C88A4B]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="type-rule-draw mx-auto mt-2 block h-[1.5px] w-14"
                  style={{ backgroundColor: isXvStar ? "#B78A4E" : palette.accent }}
                />
              )}
              <p className="mt-2.5 text-[15px] leading-[1.65]" style={{ color: isXvStar ? "#5D4B3B" : isModernKids ? "#5D697A" : isHombreClub ? "#B8A99A" : isXvNocturno ? "#CBD5E1" : palette.textMuted }}>
                {customRsvpDeadline
                  ? `Confirmá tu asistencia antes del ${customRsvpDeadline}. `
                  : `${sample.rsvpDeadline}. `}
                Podés indicar si asistís, alergias o menús especiales (Sin TACC) y sugerir música.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                onClick={() => setRsvpOpen(true)}
                className={`mt-5 min-h-[44px] w-full px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-md ${
                  isNewspaper || isHombreClub ? "rounded-none" : "rounded-full"
                }`}
                style={{
                  background: isXvStar
                    ? "linear-gradient(135deg, #C69B57, #9E7333)"
                    : isXvNocturno
                    ? "linear-gradient(135deg, #EC4899, #0891B2)"
                    : undefined,
                  backgroundColor: isXvStar || isXvNocturno ? undefined : buttonBg,
                  color: isXvStar || isXvNocturno ? "#FFFFFF" : isHombreClub ? "#110E0C" : palette.accentText,
                }}
              >
                Confirmar Asistencia
              </motion.button>
            </section>
          </RevealSection>
          )}

          {/* ================= BLOQUE GRACIAS EMOCIONAL (SIN APARIENCIA DE FORMULARIO) ================= */}
          <RevealSection luxurySpring={isMarfil} editorialSlide={isMagazine} organicFluid={isBohoPampas || isNocheGala} botanicalStagger={isBotanica || isBoardingPass}>
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
              <EditorialDiamondIcon className="h-3.5 w-3.5" style={{ color: textAccentOnSurface }} />
              <span>
                Creado con <strong style={{ color: textAccentOnSurface }}>Invita con el Alma</strong> · Creá la tuya
              </span>
            </Link>
          </footer>
        </div>
      </main>

      {/* Barra de Iconos Flotante en el Pie de cada Invitación */}
      {gateOpened && (
        <nav
          data-revealed="true"
          aria-label="Accesos rápidos de la invitación"
          className={`fixed bottom-3.5 z-40 flex items-center justify-around gap-0.5 rounded-full border px-2 py-1.5 shadow-[0_14px_34px_-8px_rgba(24,18,12,0.28)] backdrop-blur-md sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:gap-1.5 sm:px-3 ${
            isXvStar ? "left-[68px] right-3" : "left-3 right-3"
          }`}
          style={{
            backgroundColor: isXvStar
              ? "rgba(250, 246, 240, 0.94)"
              : palette.isDark
              ? `${palette.surface}EB`
              : `${palette.surface}F2`,
            borderColor: isXvStar ? "rgba(183, 138, 78, 0.48)" : palette.border,
            color: isXvStar ? "#4A3B2C" : palette.text,
          }}
        >
          {[
            {
              show: true,
              href: "#xv-coords",
              label: "Ubicación",
              shortLabel: "Lugar",
              icon: <CelebrationPinIcon className="h-[18px] w-[18px]" />,
            },
            {
              show: Boolean(sections.schedule && scheduleList.length > 0),
              href: "#sec-itinerario",
              label: "Itinerario",
              shortLabel: "Agenda",
              icon: <Clock className="h-[17px] w-[17px]" strokeWidth={1.75} />,
            },
            {
              show: Boolean(sections.gallery && galleryList.length > 0),
              href: "#sec-galeria",
              label: "Galería",
              shortLabel: "Fotos",
              icon: (
                <CelebrationCameraIcon
                  category={skin.category}
                  skinId={skin.id}
                  className="h-[18px] w-[18px]"
                />
              ),
            },
            {
              show: Boolean(sections.dressCode),
              href: "#xv-dress",
              label: "Dress Code",
              shortLabel: "Dress",
              icon: (
                <CelebrationAttireIcon
                  category={skin.category}
                  skinId={skin.id}
                  className="h-[18px] w-[18px]"
                />
              ),
            },
            {
              show: Boolean(sections.gifts),
              href: "#sec-regalos",
              label: "Regalos",
              shortLabel: "Regalo",
              icon: (
                <CelebrationGiftIcon
                  category={skin.category}
                  skinId={skin.id}
                  className="h-[18px] w-[18px]"
                />
              ),
            },
            {
              show: Boolean(sections.rsvp && !memoryMode),
              href: "#xv-rsvp",
              label: "Confirmar",
              shortLabel: "RSVP",
              icon: (
                <CelebrationCheckIcon
                  category={skin.category}
                  skinId={skin.id}
                  className="h-[18px] w-[18px]"
                />
              ),
            },
          ]
            .filter((item) => item.show)
            .map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-1 transition-all duration-200 hover:scale-105 active:scale-95 sm:flex-none sm:px-2.5"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                  style={{
                    color: isXvStar ? "#9B7137" : textAccentOnSurface,
                  }}
                >
                  {item.icon}
                </span>
                <span className="whitespace-nowrap text-[7.5px] font-bold uppercase tracking-[0.02em] opacity-85 sm:text-[9px] sm:tracking-[0.08em]">
                  {item.shortLabel}
                </span>
              </a>
            ))}
        </nav>
      )}

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
