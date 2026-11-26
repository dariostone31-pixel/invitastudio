"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { InvitationSkin } from "@/templates/catalog";
import { Ticket, Newspaper, LockOpen, Star } from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import { ensureContrast, getAccessibleButtonBg } from "@/lib/contrast";
import { deriveInitialsMonogram } from "@/lib/locationUtils";
import { resolveEventSubtitle } from "@/config/subtitlePresets";

interface EnvelopeGateProps {
  skin: InvitationSkin;
  guestName?: string;
  passes?: number;
  table?: string;
  paseType?: "todo" | "ceremonia" | "fiesta";
  customTitle?: string;
  customSubtitle?: string;
  customHeroImage?: string;
  customDateDisplay?: string;
  customTimeDisplay?: string;
  fontDisplayClass: string;
  onOpen: () => void;
}

const GATE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function EnvelopeGate({
  skin,
  guestName,
  passes,
  table,
  paseType = "todo",
  customTitle,
  customSubtitle,
  customHeroImage,
  customDateDisplay,
  customTimeDisplay,
  fontDisplayClass,
  onOpen,
}: EnvelopeGateProps) {
  const [opening, setOpening] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [gone, setGone] = useState(false);
  const { palette, layoutId, sample } = skin;
  const heroImage = customHeroImage || skin.heroImage;
  const dateDisplay = customDateDisplay || sample.dateDisplay;
  const timeDisplay = customTimeDisplay || sample.timeDisplay;
  const title = customTitle || sample.title;
  const dynamicMonogram = deriveInitialsMonogram(title, sample.monogram);
  const resolvedSubtitle = resolveEventSubtitle({
    category: skin.category,
    eventTitle: title,
    customSubtitle,
    defaultEyebrow: sample.eyebrow,
  });
  const buttonBg = getAccessibleButtonBg(palette.accent, palette.accentText);
  const textAccentOnSurface = ensureContrast(palette.accent, palette.surface, 4.6);

  const isMarfil = skin.id === "boda-sobre-marfil";
  const isBohoPampas = skin.id === "boda-boho-pampas";
  const isBotanica =
    skin.id === "boda-botanica-eucalipto" || skin.id === "boda-jardin-botanico";
  const isBoardingPass = skin.id === "boda-boarding-pass";
  const isNocheGala = skin.id === "boda-noche-gala";
  const isMagazine = skin.id === "xv-editorial-vogue";
  const isNewsprint = layoutId === "diario-editorial" && !isMagazine;
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
    layoutId === "infantil-animado" ||
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
    layoutId === "editorial-sobre" &&
    Boolean(heroImage) &&
    !isMarfil &&
    !isBotanica &&
    !isModernKids &&
    !isHombreClub;
  const isThreeStepLuxury = isXvStar || isEditorialPhoto;

  useEffect(() => {
    if (!gone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  const handleTap = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
    const fadeStartMs = isThreeStepLuxury
      ? 1100
      : isMarfil
      ? 1000
      : isBotanica
      ? 900
      : isNocheGala || isNewsprint || isModernKids
      ? 720
      : 600;
    setTimeout(() => {
      setFadingOut(true);
    }, fadeStartMs);
    setTimeout(() => {
      setGone(true);
    }, fadeStartMs + 1120);
  };

  if (gone) return null;

  const showGateSparkles =
    layoutId === "neon-dark" ||
    skin.category === "nina" ||
    skin.id === "xv-mariposas-lila";

  const guestNamesList = (guestName || "")
    .split(/[|,·]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  const paseLabel =
    paseType === "ceremonia"
      ? "Pase: Ceremonia"
      : paseType === "fiesta"
      ? "Pase: Fiesta y Brindis"
      : "";

  const guestPill = guestName ? (
    <div
      className="mt-4 inline-flex w-full max-w-[320px] flex-col items-center rounded-2xl border px-5 py-3 text-center shadow-sm"
      style={{
        backgroundColor: palette.isDark
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.96)",
        borderColor: palette.accent,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.24em]"
        style={{ color: palette.isDark ? palette.accent : textAccentOnSurface }}
      >
        {guestNamesList.length > 1 ? "Invitados Especiales" : "Invitación Especial"}
      </span>
      <div className="mt-1 space-y-0.5">
        {guestNamesList.map((n, idx) => (
          <p
            key={idx}
            className={`break-words text-2xl font-semibold leading-tight ${fontDisplayClass}`}
            style={{ color: palette.text }}
          >
            {n}
          </p>
        ))}
      </div>
      {(passes || table || paseLabel) && (
        <div
          className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold"
          style={{ color: palette.textMuted }}
        >
          {passes ? (
            <span>
              {passes} {passes === 1 ? "lugar reservado" : "lugares reservados"}
            </span>
          ) : null}
          {passes && table ? <span>·</span> : null}
          {table ? <span>Mesa {table}</span> : null}
          {paseLabel && (
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                borderColor: `${palette.accent}66`,
                color: palette.isDark ? palette.accent : textAccentOnSurface,
              }}
            >
              {paseLabel}
            </span>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={fadingOut ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: GATE_EASE }}
      className={`envelope-gate fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center p-4 ${
        fadingOut ? "pointer-events-none" : ""
      }`}
      style={{ backgroundColor: palette.bg, touchAction: "manipulation" }}
    >
      {/* Subtle atmospheric backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-lg"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Ambient floating ornaments for night / magic / girls themes */}
      {showGateSparkles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <EditorialDiamondIcon
            className="animate-particle-float absolute left-[12%] top-[18%] h-4 w-4 opacity-55"
            style={{ color: palette.accent }}
          />
          <EditorialDiamondIcon
            className="animate-particle-float absolute right-[15%] top-[24%] h-5 w-5 opacity-50"
            style={{ color: palette.accent, animationDelay: "1.2s" }}
          />
          <Star
            className="animate-particle-float absolute bottom-[20%] left-[18%] h-3.5 w-3.5 opacity-45"
            style={{ color: palette.accent, animationDelay: "2.1s" }}
          />
        </div>
      )}

      {/* 0. APERTURA COREOGRAFIADA EN 3 TIEMPOS (XV Gala Rosa / Princesa Imperial / Editorial Sobre con Foto) */}
      {isThreeStepLuxury && (
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.72, ease: GATE_EASE }}
          className="relative w-full max-w-[408px]"
          style={{ perspective: "1400px" }}
        >
          <div
            className="relative overflow-visible rounded-[30px] border shadow-[0_30px_68px_-16px_rgba(64,44,24,0.34)]"
            style={{
              backgroundColor: "#FAF6F0",
              borderColor: "rgba(183, 138, 78, 0.45)",
            }}
          >
            {/* Papel fino marfil/champán + doble filete dorado */}
            <div className="cotton-paper-pressed pointer-events-none absolute inset-0 z-10 rounded-[30px] opacity-95" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 z-10 rounded-[24px]"
              style={{ border: "1px solid rgba(183, 138, 78, 0.45)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 z-10 rounded-[20px]"
              style={{ border: "1px solid rgba(183, 138, 78, 0.25)" }}
            />

            {/* Escenario 3D del Sobre */}
            <div
              className="relative h-56 w-full overflow-visible rounded-t-[30px]"
              style={{ perspective: "1400px", backgroundColor: "#F2E9DB" }}
            >
              {/* Sombra interior profunda realista */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5] rounded-t-[30px]"
                style={{ boxShadow: "inset 0 26px 38px -14px rgba(68, 46, 24, 0.28)" }}
              />

              {/* Tiempo 2: Tarjeta Intermedia "Te invito" emergiendo al abrir */}
              <motion.div
                initial={false}
                animate={
                  opening
                    ? { y: -88, scale: 1.04, opacity: 1 }
                    : { y: 18, scale: 0.94, opacity: 0.9 }
                }
                transition={{
                  duration: 0.92,
                  delay: opening ? 0.24 : 0,
                  ease: GATE_EASE,
                }}
                className="absolute inset-x-7 bottom-2 top-3 z-[15] flex flex-col items-center justify-center overflow-hidden rounded-t-[24px] border bg-[#FFFCF7] px-5 py-4 text-center shadow-[0_22px_48px_-14px_rgba(64,44,24,0.32)]"
                style={{ borderColor: "rgba(183, 138, 78, 0.58)" }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[5px] rounded-t-[20px]"
                  style={{ border: "1px solid rgba(183, 138, 78, 0.35)" }}
                />
                <motion.p
                  initial={false}
                  animate={opening ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 10 }}
                  transition={{ duration: 0.75, delay: opening ? 0.36 : 0, ease: GATE_EASE }}
                  className="font-script relative text-5xl leading-none"
                  style={{ color: "#B78A4E" }}
                >
                  Te invito
                </motion.p>
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ scaleX: opening ? 1 : 0 }}
                  transition={{ duration: 0.7, delay: opening ? 0.45 : 0, ease: GATE_EASE }}
                  className="relative mx-auto mt-2.5 block h-[1px] w-24 origin-center bg-[#C89D5C]"
                />
                <motion.p
                  initial={false}
                  animate={opening ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.65, delay: opening ? 0.52 : 0 }}
                  className="font-ui-jost relative mt-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7A6247]"
                >
                  {resolvedSubtitle} · {title}
                </motion.p>
              </motion.div>

              {/* Solapas laterales & bolsillo inferior con filigranas ornamentales doradas */}
              <svg
                viewBox="0 0 400 224"
                preserveAspectRatio="none"
                className="pointer-events-none relative z-20 h-full w-full drop-shadow-[0_-6px_14px_rgba(64,44,24,0.14)]"
              >
                <defs>
                  <linearGradient id="xvPocketLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#EFE3D2" />
                    <stop offset="100%" stopColor="#FAF6F0" />
                  </linearGradient>
                  <linearGradient id="xvPocketRight" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EADCCB" />
                    <stop offset="100%" stopColor="#FAF6F0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,0 190,130 0,224"
                  fill="url(#xvPocketLeft)"
                  stroke="rgba(183,138,78,0.45)"
                  strokeWidth="1.2"
                />
                <polygon
                  points="400,0 210,130 400,224"
                  fill="url(#xvPocketRight)"
                  stroke="rgba(183,138,78,0.45)"
                  strokeWidth="1.2"
                />
                {/* Filigranas ornamentales doradas sobre las solapas */}
                <path
                  d="M 16 26 Q 42 52 28 84 M 12 48 Q 36 68 22 98"
                  fill="none"
                  stroke="#C69D59"
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
                <path
                  d="M 384 26 Q 358 52 372 84 M 388 48 Q 364 68 378 98"
                  fill="none"
                  stroke="#C69D59"
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,224 200,112 400,224"
                  fill="#FAF6F0"
                  stroke="rgba(183,138,78,0.5)"
                  strokeWidth="1.2"
                />
                <polyline
                  points="20,218 200,122 380,218"
                  fill="none"
                  stroke="#C69D59"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              </svg>

              {/* Solapa superior 3D rotando hacia arriba (rotateX: -175, duration: 0.8s) */}
              <motion.div
                initial={false}
                animate={{ rotateX: opening ? -175 : 0 }}
                transition={{ duration: 0.8, ease: GATE_EASE }}
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  zIndex: opening ? 6 : 30,
                }}
                className="pointer-events-none absolute inset-x-0 top-0 h-52 w-full"
              >
                <svg
                  viewBox="0 0 400 208"
                  preserveAspectRatio="none"
                  className="h-full w-full drop-shadow-[0_14px_24px_rgba(64,44,24,0.22)]"
                >
                  <polygon
                    points="0,0 400,0 200,158"
                    fill="#F3E9DA"
                    stroke="rgba(183,138,78,0.6)"
                    strokeWidth="1.4"
                  />
                  {/* Filigrana ornamental dorada bordeando la solapa */}
                  <polyline
                    points="16,8 200,145 384,8"
                    fill="none"
                    stroke="#B78A4E"
                    strokeOpacity="0.65"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 164 114 Q 200 132 236 114"
                    fill="none"
                    stroke="#B78A4E"
                    strokeOpacity="0.6"
                    strokeWidth="1.2"
                  />
                </svg>
              </motion.div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2.5 bg-[#FAF6F0]"
              />
            </div>

            {/* Sello de lacre central en relieve dorado con inicial + brillo pulsante suave */}
            <div className="relative z-40 -mt-12 flex justify-center">
              <div className="relative flex items-center justify-center">
                {!opening && (
                  <motion.span
                    aria-hidden="true"
                    animate={{ scale: [1, 1.16, 1], opacity: [0.46, 0.16, 0.46] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -inset-2.5 rounded-full bg-[#D4AF6A]/35 blur-md"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`animate-slow-spin pointer-events-none absolute -inset-3.5 rounded-full border border-dashed border-[#B78A4E]/75 transition-opacity ${
                    opening ? "opacity-0" : ""
                  }`}
                />
                <motion.button
                  type="button"
                  onClick={handleTap}
                  animate={
                    opening
                      ? { scale: 1.24, rotate: 10, opacity: 0 }
                      : { scale: [1, 1.035, 1] }
                  }
                  transition={
                    opening
                      ? { duration: 0.65, ease: GATE_EASE }
                      : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                  }
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={`Abrir invitación${guestName ? ` para ${guestName}` : ""}`}
                  className="envelope-seal relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] shadow-[0_16px_32px_-6px_rgba(92,64,26,0.48),inset_0_3px_8px_rgba(255,255,255,0.45)]"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 25%, #F2D799 0%, #C69B57 52%, #8C652D 100%)",
                    borderColor: "#FFF9ED",
                    color: "#3F2B10",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-full border border-[#FFF9ED]/65"
                  />
                  <span
                    className={`${
                      dynamicMonogram.length > 2 ? "text-xl" : "text-3xl"
                    } font-semibold leading-none ${fontDisplayClass}`}
                  >
                    {dynamicMonogram}
                  </span>
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em]">
                    Abrir
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="relative z-30 px-6 pb-8 pt-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C6D46]">
                {resolvedSubtitle}
              </p>
              <h1 className={`mt-2 py-1 text-5xl font-semibold leading-[1.18] text-[#35261B] ${fontDisplayClass}`}>
                {title}
              </h1>
              <span aria-hidden="true" className="mx-auto mt-1 block h-[1px] w-20 bg-[#B78A4E]/60" />
              <p className="mt-2 text-[13px] tracking-wide text-[#755F4B]">
                {dateDisplay}
              </p>
              {guestPill}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover mt-6 min-h-[44px] w-full rounded-full px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #C69B57 0%, #9E7333 100%)",
                }}
              >
                Tocar el sello para abrir
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 1. EDITORIAL SOBRE 3D REALISTA CON SOLAPAS SUPERPUESTAS Y LACRE EN RELIEVE DORADO */}
      {layoutId === "editorial-sobre" && !isThreeStepLuxury && !isModernKids && (
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: GATE_EASE }}
          className="relative w-full max-w-[408px]"
          style={{ perspective: "1300px" }}
        >
          <div
            className={`relative overflow-visible rounded-[28px] border ${
              isMarfil
                ? "shadow-[0_28px_64px_-18px_rgba(45,30,20,0.28)]"
                : "shadow-[0_32px_68px_-18px_rgba(42,36,32,0.34)]"
            }`}
            style={{
              backgroundColor: isMarfil
                ? "#FAF7F2"
                : isBotanica
                ? "#F7F7F0"
                : palette.surface,
              borderColor: isMarfil
                ? "rgba(183, 138, 78, 0.45)"
                : isBotanica
                ? "rgba(95, 125, 91, 0.48)"
                : palette.border,
            }}
          >
            {/* Pressed cotton-paper / laid botanical paper / standard paper */}
            <div
              className={`${
                isMarfil
                  ? "cotton-paper-pressed opacity-95"
                  : isBotanica
                  ? "laid-paper-botanical opacity-95"
                  : "paper-texture opacity-80"
              } pointer-events-none absolute inset-0 z-10 rounded-[28px]`}
            />
            {/* Double hairline on boda-sobre-marfil or eucalyptus green frame on boda-botanica-eucalipto */}
            {isMarfil || isBotanica ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2 z-10 rounded-[22px]"
                  style={{
                    border: isBotanica
                      ? "1px solid rgba(95, 125, 91, 0.45)"
                      : "1px solid rgba(183, 138, 78, 0.45)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 z-10 rounded-[18px]"
                  style={{
                    border: isBotanica
                      ? "1px solid rgba(95, 125, 91, 0.45)"
                      : "1px solid rgba(183, 138, 78, 0.45)",
                  }}
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 z-10 rounded-[22px] border opacity-45"
                style={{ borderColor: palette.accent }}
              />
            )}

            {/* Top 3D Envelope Stage */}
            <div
              className="relative h-52 w-full overflow-visible rounded-t-[28px]"
              style={{
                perspective: "1300px",
                backgroundColor: isMarfil
                  ? "#F2EAD9"
                  : isBotanica
                  ? "#E8EFE3"
                  : palette.surfaceAlt,
              }}
            >
              {/* Deep inner pocket shadow inside envelope */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5] rounded-t-[28px]"
                style={{
                  boxShadow: "inset 0 22px 34px -16px rgba(45, 30, 20, 0.24)",
                }}
              />

              {/* Inner Heavyweight Invitation Card sliding smoothly out when opened */}
              <motion.div
                initial={false}
                animate={
                  opening
                    ? { y: isMarfil ? -92 : -74, scale: 1.03, opacity: 1 }
                    : { y: 14, scale: 0.96, opacity: 0.97 }
                }
                transition={{
                  duration: isMarfil ? 0.95 : 0.75,
                  delay: opening ? 0.18 : 0,
                  ease: GATE_EASE,
                }}
                className="absolute inset-x-7 bottom-2 top-3 z-10 overflow-hidden rounded-t-2xl border shadow-[0_18px_40px_-15px_rgba(45,30,20,0.28)]"
                style={{
                  backgroundColor: isMarfil ? "#FAF7F2" : palette.bg,
                  borderColor: isMarfil ? "rgba(183, 138, 78, 0.55)" : palette.accent,
                }}
              >
                <img
                  src={heroImage}
                  alt={title}
                  className={`h-full w-full object-cover opacity-95 ${
                    skin.imageFilter ?? ""
                  }`}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: isMarfil
                      ? "linear-gradient(to top, rgba(42,26,20,0.82) 0%, rgba(42,26,20,0.25) 55%, transparent 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                  }}
                />
                <div className="absolute inset-x-4 bottom-3.5 text-center text-white">
                  <motion.p
                    initial={false}
                    animate={
                      opening
                        ? { opacity: 1, y: 0 }
                        : { opacity: isMarfil ? 0.25 : 0.9, y: isMarfil ? 8 : 0 }
                    }
                    transition={{
                      duration: isMarfil ? 1.2 : 0.5,
                      delay: opening ? 0.25 : 0,
                      ease: GATE_EASE,
                    }}
                    className={`truncate text-2xl font-semibold drop-shadow ${fontDisplayClass}`}
                  >
                    {title}
                  </motion.p>
                  {isMarfil && (
                    <motion.span
                      aria-hidden="true"
                      initial={false}
                      animate={{ scaleX: opening ? 1 : 0 }}
                      transition={{
                        duration: 0.95,
                        delay: opening ? 0.42 : 0,
                        ease: GATE_EASE,
                      }}
                      className="mx-auto mt-1.5 block h-[1.5px] w-24 origin-center bg-[#E5C687]"
                    />
                  )}
                </div>
              </motion.div>

              {/* Side & Lower Pocket Flaps with Inner Depth Shadows */}
              <svg
                viewBox="0 0 400 208"
                preserveAspectRatio="none"
                className="pointer-events-none relative z-20 h-full w-full drop-shadow-[0_-6px_14px_rgba(45,30,20,0.14)]"
              >
                <defs>
                  <linearGradient id="pocketShadowLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isMarfil ? "#EFE6D5" : palette.surfaceAlt} />
                    <stop offset="100%" stopColor={isMarfil ? "#FAF7F2" : palette.surface} />
                  </linearGradient>
                  <linearGradient id="pocketShadowRight" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isMarfil ? "#EBE0CC" : palette.surfaceAlt} />
                    <stop offset="100%" stopColor={isMarfil ? "#FAF7F2" : palette.surface} />
                  </linearGradient>
                </defs>
                {/* Left triangular fold */}
                <polygon
                  points="0,0 188,120 0,208"
                  fill="url(#pocketShadowLeft)"
                  stroke={isMarfil ? "rgba(183,138,78,0.4)" : palette.border}
                  strokeWidth="1"
                />
                {/* Right triangular fold */}
                <polygon
                  points="400,0 212,120 400,208"
                  fill="url(#pocketShadowRight)"
                  stroke={isMarfil ? "rgba(183,138,78,0.4)" : palette.border}
                  strokeWidth="1"
                />
                {/* Lower pocket fold */}
                <polygon
                  points="0,208 200,104 400,208"
                  fill={isMarfil ? "#FAF7F2" : palette.surface}
                  stroke={isMarfil ? "rgba(183,138,78,0.45)" : palette.border}
                  strokeWidth="1.2"
                />
              </svg>

              {/* Animated 3D Top Triangular Flap rotating up on X axis */}
              <motion.div
                initial={false}
                animate={{ rotateX: opening ? -175 : 0 }}
                transition={{ duration: isMarfil ? 0.9 : 0.68, ease: GATE_EASE }}
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                }}
                className="pointer-events-none absolute inset-x-0 top-0 z-30 h-48 w-full"
              >
                <svg
                  viewBox="0 0 400 192"
                  preserveAspectRatio="none"
                  className="h-full w-full drop-shadow-[0_14px_22px_rgba(45,30,20,0.24)]"
                >
                  <polygon
                    points="0,0 400,0 200,148"
                    fill={isMarfil ? "#F3EBDC" : palette.surfaceAlt}
                    stroke={isMarfil ? "rgba(183,138,78,0.55)" : palette.accent}
                    strokeOpacity={isMarfil ? "0.7" : "0.45"}
                    strokeWidth="1.5"
                  />
                  <polyline
                    points="14,6 200,136 386,6"
                    fill="none"
                    stroke={isMarfil ? "#B78A4E" : palette.accent}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                  />
                </svg>
              </motion.div>

              {/* Clean bottom mask so pocket edge seals cleanly */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2.5"
                style={{ backgroundColor: isMarfil ? "#FAF7F2" : palette.surface }}
              />
            </div>

            {/* Embossed Wax Seal Button overlapping flap (Burgundy #6B1E30 + Metallic Gold Ring for boda-sobre-marfil) */}
            <div className="relative z-40 -mt-12 flex justify-center">
              <div className="relative flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className={`animate-slow-spin pointer-events-none absolute -inset-3.5 rounded-full border border-dashed opacity-80 transition-opacity ${
                    opening ? "opacity-0" : ""
                  }`}
                  style={{ borderColor: isMarfil ? "#B78A4E" : palette.accent }}
                />
                {isMarfil && !opening && (
                  <motion.span
                    aria-hidden="true"
                    animate={{ scale: [1, 1.14, 1], opacity: [0.42, 0.14, 0.42] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -inset-2 rounded-full bg-[#B78A4E]/30 blur-md"
                  />
                )}
                <motion.button
                  type="button"
                  onClick={handleTap}
                  animate={
                    opening
                      ? { scale: 1.24, rotate: 10, opacity: 0 }
                      : { scale: [1, 1.035, 1] }
                  }
                  transition={
                    opening
                      ? { duration: 0.65, ease: GATE_EASE }
                      : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                  }
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={`Abrir invitación${guestName ? ` para ${guestName}` : ""}`}
                  className={`envelope-seal relative flex h-24 w-24 flex-col items-center justify-center rounded-full ${
                    isMarfil
                      ? "border-[3px] shadow-[0_16px_32px_-6px_rgba(74,20,32,0.55),inset_0_3px_8px_rgba(255,255,255,0.28)]"
                      : "border-4 shadow-[0_14px_28px_-6px_rgba(42,36,32,0.45),inset_0_2px_6px_rgba(255,255,255,0.45)]"
                  }`}
                  style={{
                    background: isMarfil
                      ? "radial-gradient(circle at 30% 25%, #9B354B 0%, #6B1E30 58%, #4A1420 100%)"
                      : `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.28), transparent 55%), ${buttonBg}`,
                    borderColor: isMarfil ? "#D4AF6A" : palette.surface,
                    color: isMarfil ? "#FDF7EE" : palette.accentText,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-full border"
                    style={{
                      borderColor: isMarfil ? "rgba(212, 175, 106, 0.72)" : "rgba(255,255,255,0.35)",
                    }}
                  />
                  <span
                    className={`${
                      dynamicMonogram.length > 2 ? "text-xl" : "text-2xl"
                    } font-semibold leading-none ${fontDisplayClass}`}
                  >
                    {dynamicMonogram}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] opacity-95">
                    Abrir
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="relative z-30 px-6 pb-8 pt-3 text-center">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: palette.textMuted }}
              >
                {resolvedSubtitle}
              </p>
              <h1
                className={`mt-2 py-1 text-5xl font-semibold leading-[1.2] ${fontDisplayClass}`}
                style={{ color: palette.text }}
              >
                {title}
              </h1>
              {isMarfil && (
                <span
                  aria-hidden="true"
                  className="mx-auto mt-1 block h-[1px] w-20 bg-[#B78A4E]/60"
                />
              )}
              <p className="mt-2 text-[13px] tracking-wide" style={{ color: palette.textMuted }}>
                {dateDisplay}
              </p>
              {guestPill}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover mt-6 min-h-[44px] w-full rounded-full px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] shadow-md transition-all hover:opacity-95"
                style={{
                  backgroundColor: isMarfil ? "#6B1E30" : buttonBg,
                  color: isMarfil ? "#FFFFFF" : palette.accentText,
                }}
              >
                Tocar el sello para abrir
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2A. BOHO PAMPAS ARCH GATE (Papel Lino/Arena + Terracota + Arco Orgánico) */}
      {isBohoPampas && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={
            opening
              ? { scale: 1.04, y: -10, opacity: 0.9 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.85, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-[32px] border p-4 shadow-[0_28px_64px_-18px_rgba(92,54,36,0.28)]"
          style={{
            backgroundColor: "#F8F1EA",
            borderColor: "rgba(184, 107, 75, 0.42)",
            color: palette.text,
          }}
        >
          <div aria-hidden="true" className="linen-sand-pampas absolute inset-0 z-0" />
          <div
            className="relative z-10 rounded-[24px] border p-4 text-center"
            style={{ borderColor: "rgba(184, 107, 75, 0.35)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "#9C5538" }}
            >
              {resolvedSubtitle}
            </p>

            {/* Ventana en Arco Orgánico doble terracota */}
            <div className="relative mx-auto mt-3 w-full max-w-[270px] rounded-t-full border p-1.5" style={{ borderColor: "rgba(184, 107, 75, 0.52)" }}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full border" style={{ borderColor: "rgba(184, 107, 75, 0.32)" }}>
                <img
                  src={heroImage}
                  alt={title}
                  className="animate-ken-burns h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(53,37,29,0.72) 0%, rgba(53,37,29,0.12) 50%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-x-4 bottom-4 text-center text-white">
                  <h1 className={`text-4xl font-semibold leading-[1.12] drop-shadow ${fontDisplayClass}`}>
                    {title}
                  </h1>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.22em]" style={{ color: palette.textMuted }}>
              {dateDisplay} · {timeDisplay}
            </p>

            {guestPill}

            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-5 min-h-[44px] w-full rounded-full px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:opacity-95"
              style={{ backgroundColor: "#B86B4B" }}
            >
              Descubrir Invitación
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 2B. FULLSCREEN HERO / DOBLE MARCO FINO 1PX + DEGRADADO OSCURO */}
      {layoutId === "fullscreen-hero" && !isBohoPampas && !isThreeStepLuxury && !isHombreClub && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: GATE_EASE }}
          className="relative flex h-[88vh] max-h-[700px] w-full max-w-[430px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/30 shadow-[0_32px_70px_-18px_rgba(0,0,0,0.6)]"
        >
          <img
            src={heroImage}
            alt={title}
            className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50" />

          {/* Curtain panels parting smoothly on open */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-black/55 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "-translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-black/55 backdrop-blur-sm transition-transform duration-700 ${
              opening ? "translate-x-full" : "translate-x-0 opacity-0"
            }`}
          />

          {/* Double 1px fine hairline architectural frame */}
          <div className="relative z-10 m-3.5 flex flex-1 flex-col items-center justify-between rounded-[22px] border border-white/45 p-2 text-center text-white">
            <div className="flex h-full w-full flex-col items-center justify-between rounded-[16px] border border-white/25 p-5">
              <div className="pt-1">
                <span className="inline-block rounded-full border border-white/35 bg-black/25 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] backdrop-blur-md">
                  {resolvedSubtitle}
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.15, ease: GATE_EASE }}
              >
                <h1 className={`text-5xl font-semibold drop-shadow-md ${fontDisplayClass}`}>
                  {title}
                </h1>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-3 block h-[1px] w-14 bg-white/75"
                />
                <p className="mt-2.5 text-xs uppercase tracking-[0.24em] text-white/90">
                  {dateDisplay}
                </p>
                {guestName && (
                  <div className="mt-4 rounded-2xl border border-white/35 bg-black/55 px-5 py-3 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                      {guestNamesList.length > 1 ? "Invitados Especiales" : "Invitación Especial"}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {guestNamesList.map((n, idx) => (
                        <p
                          key={idx}
                          className={`text-2xl font-semibold leading-tight text-white ${fontDisplayClass}`}
                        >
                          {n}
                        </p>
                      ))}
                    </div>
                    {(passes || table || paseLabel) && (
                      <p className="mt-1 text-xs text-white/90">
                        {passes
                          ? `${passes} ${passes === 1 ? "lugar reservado" : "lugares reservados"}`
                          : ""}
                        {passes && table ? " · " : ""}
                        {table ? `Mesa ${table}` : ""}
                        {paseLabel ? ` · ${paseLabel}` : ""}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.button
                type="button"
                animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
                transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-stone-900 shadow-xl transition-transform hover:scale-[1.02]"
              >
                <EditorialDiamondIcon className="h-4 w-4 text-amber-700" />
                Abrir Invitación
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3A. NOCHE DE GALA ART DÉCO (Terciopelo #0B0D12 + Halo Dorado + Doble Marco Geométrico #D4AF37) */}
      {isNocheGala && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={opening ? { scale: 1.05, opacity: 0.9 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden border p-3.5 text-center shadow-[0_32px_80px_-14px_rgba(0,0,0,0.9)]"
          style={{
            backgroundColor: "#0B0D12",
            borderColor: "rgba(212, 175, 55, 0.55)",
          }}
        >
          <div aria-hidden="true" className="velvet-midnight-gala absolute inset-0 z-0" />
          {/* Destello de luz dorada suave que recorre el marco Art Déco al cargar */}
          <div aria-hidden="true" className="gala-gold-sheen absolute inset-y-0 left-0 z-20 w-1/2" />

          {/* Marco geométrico fino Art Déco de doble línea en oro champán #D4AF37 */}
          <div
            className="relative z-10 border p-5"
            style={{
              borderColor: "rgba(212, 175, 55, 0.42)",
              boxShadow: "inset 0 0 42px -18px rgba(212, 175, 55, 0.25)",
            }}
          >
            {/* Esquineros geométricos Art Déco */}
            <svg aria-hidden="true" className="pointer-events-none absolute left-1.5 top-1.5 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 22V2h20M6 18V6h12" />
            </svg>
            <svg aria-hidden="true" className="pointer-events-none absolute right-1.5 top-1.5 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M22 22V2H2M18 18V6H6" />
            </svg>
            <svg aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 2v20h20M6 6v12h12" />
            </svg>
            <svg aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 h-6 w-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M22 2v20H2M18 6v12H6" />
            </svg>

            <div className="relative mx-auto mb-5 h-44 w-full overflow-hidden border" style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}>
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/90 via-black/25 to-transparent" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 border border-[#D4AF37]/60 bg-[#0B0D12]/80 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#D4AF37] backdrop-blur-sm">
                BLACK TIE · GALA
              </div>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              {resolvedSubtitle}
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.15, ease: GATE_EASE }}
              className={`mt-2.5 py-1 text-4xl font-semibold uppercase leading-[1.18] tracking-[0.06em] text-[#F5EFE6] ${fontDisplayClass}`}
              style={{ textShadow: "0 0 28px rgba(212, 175, 55, 0.38)" }}
            >
              {title}
            </motion.h1>
            <span aria-hidden="true" className="mx-auto mt-2 block h-[1px] w-20 bg-[#D4AF37]/70" />
            <p className="mt-2.5 text-[12px] uppercase tracking-[0.22em] text-[#B7AFA2]">
              {dateDisplay} · {timeDisplay}
            </p>
            {guestPill}
            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#D4AF37] bg-[#D4AF37] px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-[#0B0D12] shadow-[0_12px_30px_-8px_rgba(212,175,55,0.45)] transition-transform hover:scale-[1.01]"
            >
              <LockOpen className="h-4 w-4" strokeWidth={1.6} />
              Ingresar a la Gala
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 3B. XV NOCTURNO & FESTIVAL VIP (Negro carbón #06070B + halos magenta & cian + cristal oscuro esmerilado + destello neón) */}
      {isXvNocturno && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={opening ? { scale: 1.07, opacity: 0.9 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-[28px] border p-6 text-center backdrop-blur-md shadow-[0_28px_72px_-14px_rgba(0,0,0,0.92)]"
          style={{
            backgroundColor: "rgba(10, 12, 20, 0.84)",
            borderColor: "rgba(34, 211, 238, 0.48)",
            boxShadow:
              "0 0 65px -14px rgba(236, 72, 153, 0.42), inset 0 0 36px -18px rgba(34, 211, 238, 0.32)",
          }}
        >
          <div aria-hidden="true" className="neon-club-scenography absolute inset-0 z-0 opacity-90" />
          {opening && <div aria-hidden="true" className="neon-flash-burst absolute inset-0 z-30" />}

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-2.5 text-[10px] font-bold uppercase tracking-[0.24em]">
              <span className="text-[#22D3EE]">00 // ACCESS PASS</span>
              <span className="rounded-full border border-[#EC4899]/60 bg-[#EC4899]/15 px-2.5 py-0.5 text-[#F472B6]">
                {sample.badgeText || "FESTIVAL VIP"}
              </span>
            </div>

            <div
              className="relative mx-auto mb-5 h-44 w-full overflow-hidden rounded-2xl border"
              style={{ borderColor: "rgba(236, 72, 153, 0.5)" }}
            >
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070B]/92 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                <span className="text-[#22D3EE]">{dateDisplay}</span>
                <span className="font-mono text-[#EC4899]">{timeDisplay}</span>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#22D3EE]">
              {resolvedSubtitle}
            </p>
            <h1
              className={`mt-2 py-1 text-4xl font-bold uppercase leading-[1.15] tracking-wider text-white ${fontDisplayClass}`}
              style={{ textShadow: "0 0 24px rgba(34, 211, 238, 0.55)" }}
            >
              {title}
            </h1>
            {guestPill}
            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.96 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#22D3EE]/60 px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_28px_-6px_rgba(34,211,238,0.65)] transition-transform hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #EC4899 0%, #0891B2 100%)",
              }}
            >
              <EditorialDiamondIcon className="h-4 w-4" />
              Activar Pase VIP
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 3C. HOMBRES & +18 CLUB LOUNGE (Nogal/Cuero carbón #110E0C + cobre cepillado #C88A4B + firma sobria) */}
      {isHombreClub && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={opening ? { scale: 1.03, opacity: 0.9 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.72, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden border p-3.5 text-center shadow-[0_32px_76px_-16px_rgba(0,0,0,0.92)]"
          style={{
            backgroundColor: "#110E0C",
            borderColor: "rgba(200, 138, 75, 0.55)",
          }}
        >
          <div aria-hidden="true" className="club-lounge-walnut absolute inset-0 z-0" />
          <div
            className="relative z-10 border p-5"
            style={{
              borderColor: "rgba(200, 138, 75, 0.36)",
              boxShadow: "inset 0 0 40px -20px rgba(200, 138, 75, 0.25)",
            }}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#C88A4B]" style={{ borderColor: "rgba(200, 138, 75, 0.28)" }}>
              <span>PRIVATE LOUNGE</span>
              <span>{sample.badgeText || "RESERVE"}</span>
            </div>

            <div className="relative mx-auto mb-5 h-44 w-full overflow-hidden border" style={{ borderColor: "rgba(200, 138, 75, 0.45)" }}>
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110E0C]/92 via-black/25 to-transparent" />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C88A4B]">
              {resolvedSubtitle}
            </p>
            <h1
              className={`mt-2 py-1 text-4xl font-semibold uppercase leading-[1.16] tracking-[0.12em] text-[#F4ECE1] ${fontDisplayClass}`}
            >
              {title}
            </h1>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.75, ease: GATE_EASE }}
              className="mx-auto mt-2.5 block h-[1px] w-24 origin-center bg-[#C88A4B]/75"
            />
            <p className="mt-2.5 text-[12px] uppercase tracking-[0.2em] text-[#B8A99A]">
              {dateDisplay} · {timeDisplay}
            </p>
            {guestPill}
            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#C88A4B] bg-[#C88A4B] px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-[#110E0C] shadow-lg transition-opacity hover:opacity-95"
            >
              <LockOpen className="h-4 w-4" strokeWidth={1.6} />
              Entrar al Club
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 3D. NEON DARK GENÉRICO / LUZ AMBIENTAL DIFUSA & CONTRASTE NOCTURNO */}
      {layoutId === "neon-dark" && !isNocheGala && !isXvNocturno && !isHombreClub && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={opening ? { scale: 1.08, opacity: 0.85 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-3xl border p-7 text-center shadow-2xl"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.accent,
            boxShadow: `0 0 70px -10px ${palette.accent}77, inset 0 0 36px -18px ${palette.accent}44`,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-35 blur-3xl"
            style={{ backgroundColor: palette.accent }}
          />
          <div
            className="relative mx-auto mb-5 h-44 w-full overflow-hidden rounded-2xl border"
            style={{ borderColor: `${palette.accent}66` }}
          >
            <img
              src={heroImage}
              alt={title}
              className="animate-ken-burns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div
              className="animate-float-slow absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] shadow-lg"
              style={{ backgroundColor: buttonBg, color: palette.accentText }}
            >
              {sample.badgeText || "VIP NIGHT"}
            </div>
          </div>

          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: textAccentOnSurface }}
          >
            {resolvedSubtitle}
          </p>
          <h1
            className={`mt-2 py-1 text-4xl font-bold uppercase leading-[1.2] tracking-wide ${fontDisplayClass}`}
            style={{ color: palette.text, textShadow: `0 0 24px ${palette.accent}44` }}
          >
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] tracking-wider" style={{ color: palette.textMuted }}>
            {dateDisplay} · {timeDisplay}
          </p>
          {guestPill}
          <motion.button
            type="button"
            animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
            transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleTap}
            className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              backgroundColor: buttonBg,
              color: palette.accentText,
              boxShadow: `0 12px 28px -8px ${palette.accent}77`,
            }}
          >
            <LockOpen className="h-4 w-4" strokeWidth={1.5} />
            Ingresar al Evento
          </motion.button>
        </motion.div>
      )}

      {/* 4A. BOARDING PASS PRIMERA CLASE (boda-boarding-pass: Cartulina #F8F9FA + Marino #0F2537 + Troquelado Profundo) */}
      {isBoardingPass && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: GATE_EASE }}
          className="relative w-full max-w-[398px]"
        >
          {/* Cuerpo superior del Boarding Pass */}
          <motion.div
            animate={opening ? { y: -36, rotate: -1.6 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.65, ease: GATE_EASE }}
            className="relative overflow-hidden rounded-t-3xl border-x border-t shadow-[0_24px_56px_-18px_rgba(15,37,55,0.35)]"
            style={{
              backgroundColor: "#F8F9FA",
              borderColor: "rgba(15, 37, 55, 0.22)",
              color: "#0F2537",
            }}
          >
            <div aria-hidden="true" className="satin-cardstock-boarding absolute inset-0 z-0" />
            {/* Cabecera Primera Clase en Azul Marino Profundo #0F2537 */}
            <div className="relative z-10 flex items-center justify-between bg-[#0F2537] px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#D4AF6A]" strokeWidth={1.6} />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF6A]">
                  FIRST CLASS · BOARDING PASS
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-white/85">FC-0040</span>
            </div>

            <div className="relative z-10 h-36 w-full overflow-hidden border-b" style={{ borderColor: "rgba(15, 37, 55, 0.14)" }}>
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2537]/80 via-[#0F2537]/20 to-transparent" />
              <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                <span>{sample.badgeText || "DESTINO AMOR"}</span>
                <span className="font-mono text-[#D4AF6A]">FOLIO 01-2027</span>
              </div>
            </div>

            <div className="relative z-10 px-6 pb-4 pt-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: "#8C6D3F" }}>
                {resolvedSubtitle}
              </p>
              <h1 className={`mt-1.5 py-0.5 text-4xl font-bold leading-[1.15] text-[#0F2537] ${fontDisplayClass}`}>
                {title}
              </h1>
              <div className="mt-3 grid grid-cols-3 border-y border-dashed py-2 text-center text-[11px]" style={{ borderColor: "rgba(15, 37, 55, 0.25)" }}>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">SECTOR</span>
                  <span className="font-bold text-[#0F2537]">CEREMONIA</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">PUERTA</span>
                  <span className="font-bold text-[#0F2537]">{table || "A-01"}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">HORARIO</span>
                  <span className="font-bold text-[#0F2537]">{timeDisplay}</span>
                </div>
              </div>
              {guestPill}
            </div>
          </motion.div>

          {/* Talón inferior desprendible (tap o deslizar hacia abajo) con muescas circulares profundas */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 72 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 26) handleTap();
            }}
            animate={opening ? { y: 54, rotate: 3.4, opacity: 0.88 } : { y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: GATE_EASE }}
            className="relative cursor-grab overflow-hidden rounded-b-3xl border-x border-b bg-[#F8F9FA] shadow-[0_24px_56px_-18px_rgba(15,37,55,0.35)] active:cursor-grabbing"
            style={{ borderColor: "rgba(15, 37, 55, 0.22)" }}
          >
            <div aria-hidden="true" className="satin-cardstock-boarding absolute inset-0 z-0" />
            {/* Muescas circulares profundas + línea punteada de corte realista */}
            <div className="relative z-10 flex items-center py-3">
              <div
                className="-ml-4 h-8 w-8 rounded-full border shadow-inner"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: "rgba(15, 37, 55, 0.28)",
                }}
              />
              <div
                className="mx-2 flex-1 border-t-2 border-dashed"
                style={{ borderColor: "rgba(15, 37, 55, 0.35)" }}
              />
              <div
                className="-mr-4 h-8 w-8 rounded-full border shadow-inner"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: "rgba(15, 37, 55, 0.28)",
                }}
              />
            </div>

            <div className="relative z-10 px-6 pb-7 text-center">
              {/* Código de barras nítido + folio */}
              <div className="mx-auto mb-1.5 flex h-9 w-48 items-stretch justify-center gap-[2px] opacity-85">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w * 2}px`, backgroundColor: "#0F2537" }}
                    className="h-full"
                  />
                ))}
              </div>
              <p className="mb-4 font-mono text-[10px] tracking-[0.24em] text-[#0F2537]/75">
                * FC-0040-2027-BODA *
              </p>

              <motion.button
                type="button"
                animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
                transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover min-h-[44px] w-full rounded-xl px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-lg"
                style={{ backgroundColor: "#0F2537" }}
              >
                Cortar Ticket &amp; Entrar
              </motion.button>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Tocá el botón o deslizá el talón hacia abajo
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 4B. TICKET VIP PERFORADO GENÉRICO */}
      {layoutId === "ticket-vip" && !isBoardingPass && !isXvNocturno && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          className="relative w-full max-w-[392px]"
        >
          <motion.div
            animate={opening ? { y: -38, rotate: -2.5 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: GATE_EASE }}
            className="overflow-hidden rounded-t-3xl border-x border-t shadow-2xl"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-white">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                  <Ticket className="h-4 w-4" strokeWidth={1.5} />
                  {sample.badgeText || "ALL ACCESS"}
                </span>
                <span className="font-mono text-xs opacity-90">N° 0040-27</span>
              </div>
            </div>

            <div className="px-6 pb-4 pt-5 text-center">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: textAccentOnSurface }}
              >
                {resolvedSubtitle}
              </p>
              <h1
                className={`mt-1.5 py-1 text-4xl font-bold uppercase leading-[1.2] ${fontDisplayClass}`}
                style={{ color: palette.text }}
              >
                {title}
              </h1>
              <p className="mt-1 text-[13px]" style={{ color: palette.textMuted }}>
                {sample.dateDisplay} · {sample.timeDisplay}
              </p>
              {guestPill}
            </div>
          </motion.div>

          {/* Perforated lower stub separating downward on open */}
          <motion.div
            animate={opening ? { y: 38, rotate: 2.5 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: GATE_EASE }}
            className="overflow-hidden rounded-b-3xl border-x border-b shadow-2xl"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border,
            }}
          >
            <div className="relative flex items-center py-3">
              <div
                className="-ml-3 h-6 w-6 rounded-full border"
                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
              />
              <div
                className="mx-2 flex-1 border-t-2 border-dashed"
                style={{ borderColor: palette.accent }}
              />
              <div
                className="-mr-3 h-6 w-6 rounded-full border"
                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
              />
            </div>

            <div className="px-6 pb-7 text-center">
              <div className="mx-auto mb-4 flex h-8 w-44 items-stretch justify-center gap-[2px] opacity-70">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w * 2}px`, backgroundColor: palette.text }}
                    className="h-full"
                  />
                ))}
              </div>
              <motion.button
                type="button"
                animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
                transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTap}
                className="btn-shimmer-hover min-h-[44px] w-full rounded-xl px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] shadow-lg"
                style={{
                  backgroundColor: buttonBg,
                  color: palette.accentText,
                }}
              >
                Cortar Ticket & Entrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 5A. TAPA DE REVISTA SATINADA (xv-editorial-vogue) */}
      {isMagazine && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={
            opening
              ? { rotateY: -22, x: -24, scale: 1.03, opacity: 0.9 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.78, ease: GATE_EASE }}
          style={{ transformPerspective: 1400, transformOrigin: "left center" }}
          className="relative w-full max-w-[404px] overflow-hidden border bg-white p-4 shadow-[0_32px_64px_-18px_rgba(0,0,0,0.45)]"
        >
          {/* Destello diagonal sutil de papel satinado al cargar */}
          <div
            aria-hidden="true"
            className="magazine-glossy-sheen absolute inset-y-0 left-0 z-30 w-1/2"
          />
          <div
            className="relative border p-4"
            style={{ borderColor: "#181818", color: "#181818" }}
          >
            {/* Cabecera Editorial de Revista */}
            <div className="flex items-center justify-between border-b border-[#181818]/25 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
              <span>N° 01 · EDICIÓN XV</span>
              <span>{dateDisplay}</span>
            </div>

            <div className="py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em]" style={{ color: palette.accent }}>
                {resolvedSubtitle}
              </p>
              <h2 className={`mt-1 text-5xl font-bold uppercase tracking-[0.14em] leading-none ${fontDisplayClass}`}>
                VOGUE
              </h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-stone-500">
                Edición Coleccionista · Alta Costura
              </p>
            </div>

            {/* Retrato principal + titulares superpuestos */}
            <div className="relative mt-1 aspect-[4/5] w-full overflow-hidden border border-[#181818]">
              <img
                src={heroImage}
                alt={title}
                className={`animate-ken-burns h-full w-full object-cover ${skin.imageFilter ?? ""}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
                <span
                  className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white"
                  style={{ backgroundColor: palette.accent }}
                >
                  Portada Exclusiva
                </span>
                <h1 className={`mt-1.5 text-4xl font-semibold leading-[1.08] text-white ${fontDisplayClass}`}>
                  {title}
                </h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/85">
                  Entrevista · Cronograma · Dress Code
                </p>
              </div>
            </div>

            {guestPill}

            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-4 min-h-[44px] w-full border border-[#181818] bg-[#181818] py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-stone-800"
            >
              Abrir Edición de Revista
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 5B. EDICIÓN DIARIO VINTAGE DOBLADA (Papel Prensa #F3EFE6 + Tinta Carbón #1C1B19) */}
      {isNewsprint && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: GATE_EASE }}
          style={{ perspective: 1300 }}
          className="relative w-full max-w-[408px] overflow-hidden border-2 border-[#1C1B19] bg-[#F3EFE6] p-[4px] shadow-[0_28px_60px_-18px_rgba(28,27,25,0.45)]"
        >
          <div aria-hidden="true" className="newsprint-vintage absolute inset-0 z-0" />
          <div className="relative z-10 border border-[#1C1B19] p-5" style={{ color: "#1C1B19" }}>
            {/* Mitad superior de primera plana */}
            <div className="border-b-2 border-[#1C1B19] pb-2.5 text-center">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A463F]">
                <span>{sample.badgeText || "EDICIÓN ESPECIAL"}</span>
                <Newspaper className="h-4 w-4 text-[#1C1B19]" strokeWidth={1.6} />
                <span>VOL. I · N° 01</span>
              </div>
              <h2 className={`mt-1 text-2xl font-bold tracking-tight text-[#1C1B19] ${fontDisplayClass}`}>
                THE CELEBRATION TIMES
              </h2>
            </div>

            <div className="flex items-center justify-between border-b border-[#1C1B19]/40 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A463F]">
              <span>ARGENTINA</span>
              <span>{dateDisplay}</span>
              <span>EJEMPLAR ÚNICO</span>
            </div>

            {/* Pliegue central + portada inferior doblada que se despliega suavemente */}
            <div className="relative mt-3">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 border-t border-dashed border-[#1C1B19]/35 transition-opacity duration-500 ${
                  opening ? "opacity-0" : "opacity-100"
                }`}
              />
              <motion.div
                initial={{ scaleY: 0.96, rotateX: 8 }}
                animate={
                  opening
                    ? { scaleY: 1.05, rotateX: -28, y: -12, opacity: 0.85 }
                    : { scaleY: 0.96, rotateX: 8, y: 0, opacity: 1 }
                }
                transition={{ duration: 0.82, ease: GATE_EASE }}
                style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
                className="relative border border-[#1C1B19]/35 bg-[#F7F3EA]/80 px-3.5 py-4 text-center shadow-[inset_0_12px_18px_-14px_rgba(28,27,25,0.28)]"
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: "#4A463F" }}
                >
                  {resolvedSubtitle}
                </p>
                <h1 className={`mt-1.5 py-0.5 text-4xl font-bold leading-[1.16] text-[#1C1B19] ${fontDisplayClass}`}>
                  {title}
                </h1>
                <div className="mt-3 h-36 w-full overflow-hidden border border-[#1C1B19]">
                  <img
                    src={heroImage}
                    alt={title}
                    className={`animate-ken-burns h-full w-full object-cover grayscale contrast-110 transition-all duration-700 ${
                      opening ? "grayscale-0 contrast-100" : ""
                    }`}
                  />
                </div>
                {guestPill}
              </motion.div>
            </div>

            {/* Titular / Sello de apertura */}
            <motion.button
              type="button"
              animate={!opening ? { scale: [1, 1.035, 1] } : { scale: 0.98, opacity: 0.6 }}
              transition={{ duration: 3.2, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-4 min-h-[44px] w-full border-2 border-[#1C1B19] bg-[#1C1B19] py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#F3EFE6] transition-opacity hover:opacity-92"
            >
              Abrir Edición Especial
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 6. INFANTIL, NIÑAS & BAUTISMO MODERNO (Sello ilustrado temático + destello de estrellas + física elástica) */}
      {isModernKids && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.92 }}
          animate={
            opening
              ? { scale: 1.08, y: -10, opacity: 0.94 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 110, damping: 14 }}
          className="relative w-full max-w-[404px] overflow-hidden rounded-[32px] border shadow-[0_24px_60px_-14px_rgba(30,40,60,0.18)]"
          style={{
            backgroundColor: "#FFFDF9",
            borderColor:
              kidsVariant === "space"
                ? "rgba(92, 134, 186, 0.38)"
                : kidsVariant === "dino"
                ? "rgba(123, 158, 135, 0.42)"
                : kidsVariant === "girls"
                ? "rgba(216, 152, 178, 0.45)"
                : "rgba(183, 154, 108, 0.38)",
          }}
        >
          {/* Escenografía ilustrada de fondo */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-0 opacity-80 ${
              kidsVariant === "space"
                ? "kids-nordic-night"
                : kidsVariant === "dino"
                ? "kids-nordic-space"
                : kidsVariant === "girls"
                ? "girls-pastel-ethereal"
                : "baptism-cotton-clouds"
            }`}
          />

          {/* Ilustraciones SVG finas por temática */}
          {kidsVariant === "space" && (
            <svg aria-hidden="true" viewBox="0 0 400 180" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-44 w-full opacity-55">
              <circle cx="52" cy="36" r="1.5" fill="#F6D58E" />
              <circle cx="118" cy="24" r="1.2" fill="#FFFFFF" />
              <circle cx="312" cy="34" r="1.8" fill="#F6D58E" />
              <circle cx="356" cy="72" r="1.3" fill="#FFFFFF" />
              <path d="M52 36 L118 24 L168 48" stroke="#93C5FD" strokeOpacity="0.28" strokeDasharray="3 4" fill="none" />
              <circle cx="340" cy="44" r="18" fill="#D4A34C" fillOpacity="0.18" />
              <ellipse cx="340" cy="44" rx="28" ry="7" transform="rotate(-18 340 44)" stroke="#F6D58E" strokeOpacity="0.45" fill="none" />
            </svg>
          )}
          {kidsVariant === "dino" && (
            <svg aria-hidden="true" viewBox="0 0 400 180" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-44 w-full opacity-55">
              <path d="M-10 140 Q 75 75 145 140 Z" fill="#7B9E87" fillOpacity="0.2" />
              <path d="M275 150 Q 345 65 420 150 Z" fill="#D4A34C" fillOpacity="0.18" />
              <circle cx="332" cy="42" r="16" fill="#D4A34C" fillOpacity="0.24" />
            </svg>
          )}
          {kidsVariant === "girls" && (
            <svg aria-hidden="true" viewBox="0 0 400 180" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-44 w-full opacity-65">
              <path d="M24 170 Q 200 -20 376 170" stroke="#D898B2" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
              <circle cx="66" cy="44" r="2.2" fill="#D4AF6A" fillOpacity="0.6" />
              <circle cx="336" cy="48" r="2" fill="#D4AF6A" fillOpacity="0.6" />
            </svg>
          )}
          {kidsVariant === "baptism" && (
            <svg aria-hidden="true" viewBox="0 0 400 180" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-44 w-full opacity-75">
              <path d="M20 72 Q 44 46 74 56 Q 94 34 126 52 Q 150 54 152 74 Z" fill="#FFFFFF" fillOpacity="0.72" />
              <path d="M248 64 Q 272 40 302 48 Q 324 28 352 46 Q 376 48 378 68 Z" fill="#FFFFFF" fillOpacity="0.72" />
            </svg>
          )}

          {/* Foto hero suave arriba */}
          <div className="relative z-10 px-4 pt-4">
            <div
              className="relative h-48 w-full overflow-hidden rounded-[26px] border"
              style={{
                borderColor:
                  kidsVariant === "space"
                    ? "rgba(147, 197, 253, 0.35)"
                    : "rgba(183, 138, 78, 0.25)",
              }}
            >
              <img
                src={heroImage}
                alt={title}
                className="animate-ken-burns h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(20, 26, 38, 0.35) 0%, transparent 55%)",
                }}
              />
              {sample.badgeText && (
                <div
                  className="animate-float-slow absolute right-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255, 253, 249, 0.92)",
                    color: kidsVariant === "space" ? "#1E3A5F" : textAccentOnSurface,
                  }}
                >
                  {sample.badgeText}
                </div>
              )}
            </div>
          </div>

          {/* Sello ilustrado / Medalla temática interactiva + partículas radiales al abrir */}
          <div className="relative z-20 -mt-9 flex justify-center">
            <div className="relative flex items-center justify-center">
              {opening &&
                [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  return (
                    <motion.span
                      key={deg}
                      initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                      animate={{
                        x: Math.cos(rad) * 58,
                        y: Math.sin(rad) * 58,
                        scale: 1.15,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.72, ease: "easeOut" }}
                      className="pointer-events-none absolute h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          kidsVariant === "space"
                            ? "#F6D58E"
                            : kidsVariant === "girls"
                            ? "#EC9BB6"
                            : kidsVariant === "dino"
                            ? "#7B9E87"
                            : "#C9A46A",
                      }}
                    />
                  );
                })}
              <motion.button
                type="button"
                onClick={handleTap}
                animate={
                  opening
                    ? { scale: 1.24, opacity: 0 }
                    : { scale: [1, 1.035, 1] }
                }
                transition={
                  opening
                    ? { duration: 0.65, ease: GATE_EASE }
                    : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                }
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Abrir invitación${guestName ? ` para ${guestName}` : ""}`}
                className="envelope-seal relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#FFFDF9] shadow-[0_14px_30px_-8px_rgba(30,40,60,0.28)]"
                style={{
                  background:
                    kidsVariant === "space"
                      ? "linear-gradient(135deg, #2D4A70, #1B2C45)"
                      : kidsVariant === "dino"
                      ? "linear-gradient(135deg, #87A992, #5F826B)"
                      : kidsVariant === "girls"
                      ? "linear-gradient(135deg, #E5A5BD, #C884A3)"
                      : "linear-gradient(135deg, #D9BA82, #B89352)",
                  color: "#FFFDF9",
                }}
              >
                {kidsVariant === "space" ? (
                  /* Cohete ilustrado minimalista */
                  <svg viewBox="0 0 28 28" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16.5 4.5c3 0 6 1.5 7 7-3.5 3.5-6.5 6.5-10 8l-5-5c1.5-3.5 4.5-6.5 8-10Z" />
                    <circle cx="16.5" cy="11.5" r="1.8" />
                    <path d="M8.5 14.5 5 15.5l-1 4 4-1 1-3.5Z" />
                    <path d="M13.5 19.5 12.5 23l-4 1" />
                  </svg>
                ) : kidsVariant === "dino" ? (
                  /* Hoja & brújula aventura nórdica */
                  <svg viewBox="0 0 28 28" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="14" cy="14" r="9.5" />
                    <polygon points="17.5,10.5 15.2,15.2 10.5,17.5 12.8,12.8" fill="currentColor" fillOpacity="0.25" />
                  </svg>
                ) : kidsVariant === "girls" ? (
                  /* Coronita delicada dorada/pastel */
                  <svg viewBox="0 0 28 28" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 20.5h19l-1.5-10-5 4.5L14 7.5 11 15l-5-4.5-1.5 10Z" />
                    <circle cx="14" cy="5.5" r="1.2" fill="currentColor" />
                  </svg>
                ) : (
                  /* Nube dorada con destello bautismo/bebé */
                  <svg viewBox="0 0 28 28" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.5 19.5h12.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 9.9 10.3a4.2 4.2 0 0 0-2.4 9.2Z" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-8 pt-3 text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{
                color:
                  kidsVariant === "space"
                    ? "#D4A34C"
                    : kidsVariant === "dino"
                    ? "#5A7D65"
                    : kidsVariant === "girls"
                    ? "#B76B8C"
                    : "#9E7B42",
              }}
            >
              {resolvedSubtitle}
            </p>
            <h1
              className={`mt-1.5 py-1 text-4xl font-bold leading-[1.18] ${fontDisplayClass}`}
              style={{ color: kidsVariant === "space" ? "#FFFDF9" : "#283242" }}
            >
              {title}
            </h1>
            <p
              className="mt-1 text-[13px] font-medium"
              style={{ color: kidsVariant === "space" ? "#CBD5E1" : "#647082" }}
            >
              {dateDisplay} · {timeDisplay}
            </p>
            {guestPill}
            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={handleTap}
              className="btn-shimmer-hover mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-md"
              style={{
                background:
                  kidsVariant === "space"
                    ? "linear-gradient(135deg, #D4A34C, #B6832F)"
                    : kidsVariant === "dino"
                    ? "linear-gradient(135deg, #7B9E87, #5A7D65)"
                    : kidsVariant === "girls"
                    ? "linear-gradient(135deg, #D898B2, #B76B8C)"
                    : "linear-gradient(135deg, #C9A46A, #A58046)",
              }}
            >
              <EditorialDiamondIcon className="h-4 w-4" />
              Tocar la medalla para abrir
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
