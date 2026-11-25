"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Check,
  Palette,
  Type,
  Image as ImageIcon,
  Music,
  Sliders,
  ExternalLink,
  Upload,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type {
  EventRecord,
  EnabledSectionsConfig,
  HeroOverlayStyle,
  ParentsOrHostsGroup,
  ScheduleItem,
  TarjetaTier,
  TriviaQuestion,
} from "@/lib/db";
import {
  INVITATION_SKINS,
  CATEGORY_LABELS,
  getSkinById,
  InvitationSkin,
} from "@/templates/catalog";
import { MusicCatalogPicker } from "@/components/MusicCatalogPicker";
import {
  ARGENTINA_BANK_ENTITIES,
  OTHER_BANK_OPTION,
  isKnownBankEntity,
} from "@/config/banks";
import { prepareImageForUpload } from "@/lib/imageUpload";
import {
  getCompatibleCategories,
  getDefaultStoryTitleForCategory,
  getTriviaPresetForCategory,
} from "@/lib/categoryPresets";
import { InvitationRenderer } from "./invitation-engine/InvitationRenderer";
import { PaymentPendingBanner } from "./PaymentPendingBanner";

interface PersonalizerStudioClientProps {
  event: EventRecord;
  mercadopagoConfigured?: boolean;
}

const FONT_OPTIONS: { id: InvitationSkin["fontDisplay"]; label: string; desc: string }[] = [
  { id: "pinyon", label: "Caligrafía Boutique", desc: "Pinyon Script (lujo silencioso)" },
  { id: "script", label: "Caligrafía Romántica", desc: "Alex Brush (cursiva fluida)" },
  { id: "cormorant", label: "Clásica Editorial", desc: "Cormorant Garamond (serif)" },
  { id: "fraunces", label: "Editorial Moderna", desc: "Fraunces (serif expresiva)" },
  { id: "cinzel", label: "Imperial Lujo", desc: "Cinzel (mayúsculas nobles)" },
  { id: "playfair", label: "Revista / Diario", desc: "Playfair Display" },
  { id: "oswald", label: "Urbana / VIP", desc: "Oswald (moderna compacta)" },
  { id: "fredoka", label: "Alegre / Infantil", desc: "Fredoka (redonda amigable)" },
];

const ACCENT_SWATCHES = [
  { name: "Oro Champán", hex: "#B89352" },
  { name: "Rosa Imperial", hex: "#C86D8E" },
  { name: "Verde Salvia", hex: "#5F7D5B" },
  { name: "Azul Francés", hex: "#3B6998" },
  { name: "Terracota Boho", hex: "#B86B4B" },
  { name: "Dorado VIP", hex: "#D4AF37" },
  { name: "Fucsia Neón", hex: "#FF2E93" },
  { name: "Coral Alegre", hex: "#E87A70" },
];

const HERO_OVERLAY_OPTIONS: { id: HeroOverlayStyle; label: string; desc: string }[] = [
  { id: "natural", label: "Nítida natural", desc: "Foto original a color pleno" },
  { id: "translucido-suave", label: "Translúcida profesional", desc: "Lámina suave integrada con el papel" },
  { id: "velo-editorial", label: "Velo editorial", desc: "Tono luminoso tipo revista impresa" },
  { id: "cinematico", label: "Cinemático", desc: "Contraste profundo elegante" },
  { id: "bn-editorial", label: "B&N editorial", desc: "Blanco y negro atemporal" },
];

const SECTION_LABELS: { key: keyof EnabledSectionsConfig; label: string }[] = [
  { key: "countdown", label: "Cuenta Regresiva en vivo" },
  { key: "story", label: "Historia / Mensaje Principal" },
  { key: "schedule", label: "Itinerario / Programa" },
  { key: "gallery", label: "Galería de Fotos" },
  { key: "dressCode", label: "Código de Vestimenta" },
  { key: "gifts", label: "Regalos / Copiar Alias" },
  { key: "wishes", label: "Muro de Buenos Deseos / Firmas" },
  { key: "djSongs", label: "Playlist de la Fiesta (Invitados sugieren canción)" },
  { key: "djVoting", label: "Votación 🔥 en Playlist (Las más pedidas)" },
  { key: "trivia", label: "Mini-Trivia con Podio (Juego interactivo)" },
  { key: "collaborativeAlbum", label: "Álbum Colaborativo QR & Hashtag" },
  { key: "rsvp", label: "Botón Confirmar Asistencia" },
];

export function PersonalizerStudioClient({
  event,
  mercadopagoConfigured = false,
}: PersonalizerStudioClientProps) {
  const isEssentialPlan = event.planId === "esencial";
  const [activeTab, setActiveTab] = useState<
    "estilo" | "textos" | "fotos" | "modulos"
  >(isEssentialPlan ? "textos" : "estilo");

  const [skinId, setSkinId] = useState(event.skinId);
  const [eventTitle, setEventTitle] = useState(event.eventTitle);
  const [dateDisplay, setDateDisplay] = useState(event.dateDisplay);
  const [timeDisplay, setTimeDisplay] = useState(event.timeDisplay);
  const [venue, setVenue] = useState(event.venue);
  const [address, setAddress] = useState(event.address);
  const [alias, setAlias] = useState(event.alias);
  const [giftBank, setGiftBank] = useState(event.giftBank || "");
  const [customBankMode, setCustomBankMode] = useState<boolean>(() =>
    Boolean(event.giftBank && !isKnownBankEntity(event.giftBank))
  );
  const [triviaRestoredMsg, setTriviaRestoredMsg] = useState(false);
  const [giftHolder, setGiftHolder] = useState(event.giftHolder || "");
  const [dressCode, setDressCode] = useState(event.dressCode);
  const [rsvpDeadline, setRsvpDeadline] = useState(event.rsvpDeadline || "");
  const [adultsOnly, setAdultsOnly] = useState(Boolean(event.adultsOnly));
  const [tarjetaPricing, setTarjetaPricing] = useState<TarjetaTier[]>(
    event.tarjetaPricing || []
  );
  const [tarjetaNote, setTarjetaNote] = useState(event.tarjetaNote || "");
  const [quote, setQuote] = useState(event.quote);

  const selectedSkin = getSkinById(skinId);
  const initialCategory = getSkinById(event.skinId).category;
  const compatibleCategories = getCompatibleCategories(initialCategory);
  const filteredSkins = INVITATION_SKINS.filter((s) =>
    compatibleCategories.includes(s.category)
  );

  const [parentsOrHosts, setParentsOrHosts] = useState<ParentsOrHostsGroup[]>(
    event.parentsOrHosts && event.parentsOrHosts.length > 0
      ? event.parentsOrHosts
      : selectedSkin.sample.parentsOrHosts || []
  );
  const [storyTitle, setStoryTitle] = useState(
    event.storyTitle ||
      selectedSkin.sample.storyTitle ||
      getDefaultStoryTitleForCategory(selectedSkin.category, selectedSkin.name)
  );
  const [storyText, setStoryText] = useState(
    event.storyText || selectedSkin.sample.storyText || ""
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    event.schedule && event.schedule.length > 0
      ? event.schedule
      : selectedSkin.sample.schedule || []
  );

  const [fontOverride, setFontOverride] = useState<InvitationSkin["fontDisplay"]>(
    event.fontOverride || selectedSkin.fontDisplay
  );
  const [accentOverride, setAccentOverride] = useState<string>(
    event.accentOverride || selectedSkin.palette.accent
  );
  const [audioOverride, setAudioOverride] = useState<string>(event.audioOverride || "");
  const [songRequest, setSongRequest] = useState<string>(event.songRequest || "");
  const [heroImageUrl, setHeroImageUrl] = useState<string>(event.heroImageUrl || "");
  const [heroOverlayOverride, setHeroOverlayOverride] = useState<HeroOverlayStyle>(
    event.heroOverlayOverride || "natural"
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    event.galleryImages || []
  );
  const [albumUrl, setAlbumUrl] = useState<string>(event.albumUrl || "");
  const [instagramHandle, setInstagramHandle] = useState<string>(event.instagramHandle || "");
  const [eventHashtag, setEventHashtag] = useState<string>(event.eventHashtag || "");
  const [triviaTitle, setTriviaTitle] = useState<string>(
    event.triviaTitle || `¿Cuánto conocés a ${event.eventTitle}?`
  );
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>(
    event.triviaQuestions && event.triviaQuestions.length > 0
      ? event.triviaQuestions
      : getTriviaPresetForCategory(
          selectedSkin.category,
          event.dressCode || selectedSkin.sample.dressCode.label,
          selectedSkin.id
        )
  );
  const [memoryMode, setMemoryMode] = useState<boolean>(Boolean(event.memoryMode));

  const [sections, setSections] = useState<EnabledSectionsConfig>({
    countdown: event.enabledSections?.countdown ?? true,
    story: event.enabledSections?.story ?? true,
    schedule: event.enabledSections?.schedule ?? true,
    gallery: event.enabledSections?.gallery ?? true,
    dressCode: event.enabledSections?.dressCode ?? true,
    gifts: event.enabledSections?.gifts ?? true,
    wishes: event.enabledSections?.wishes ?? true,
    djSongs: event.enabledSections?.djSongs ?? !isEssentialPlan,
    djVoting: event.enabledSections?.djVoting ?? !isEssentialPlan,
    trivia: event.enabledSections?.trivia ?? false,
    collaborativeAlbum: event.enabledSections?.collaborativeAlbum ?? !isEssentialPlan,
    rsvp: event.enabledSections?.rsvp ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const handleSkinChange = (newSkinId: string) => {
    setSkinId(newSkinId);
    const next = getSkinById(newSkinId);
    setFontOverride(next.fontDisplay);
    setAccentOverride(next.palette.accent);
  };

  const handleUploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const prepared = await prepareImageForUpload(files[0]);
      const fd = new FormData();
      fd.append("files", prepared);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo subir la foto de portada.");
      }
      if (data.urls?.[0]) {
        setHeroImageUrl(data.urls[0]);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Error subiendo la imagen."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const preparedList = await Promise.all(
        Array.from(files).slice(0, 6).map((f) => prepareImageForUpload(f))
      );
      const fd = new FormData();
      preparedList.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudieron subir las fotos de galería.");
      }
      if (Array.isArray(data.urls)) {
        setGalleryImages((prev) => [...prev, ...data.urls].slice(0, 8));
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Error subiendo imágenes."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/panel/${event.panelToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinId,
          eventTitle,
          dateDisplay,
          timeDisplay,
          venue,
          address,
          alias,
          giftBank,
          giftHolder,
          dressCode,
          rsvpDeadline,
          adultsOnly,
          tarjetaPricing: tarjetaPricing
            .map((t) => ({ label: t.label.trim(), price: t.price.trim() }))
            .filter((t) => t.label && t.price),
          tarjetaNote: tarjetaNote.trim(),
          quote,
          parentsOrHosts,
          storyTitle,
          storyText,
          schedule,
          heroImageUrl,
          heroOverlayOverride,
          galleryImages,
          fontOverride,
          accentOverride,
          audioOverride,
          ...(event.planId === "asistido" ? { songRequest } : {}),
          albumUrl,
          instagramHandle,
          eventHashtag,
          triviaTitle,
          triviaQuestions,
          memoryMode,
          enabledSections: sections,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudieron guardar los cambios.");
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2600);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error guardando cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* Top Studio Bar */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/panel/${event.panelToken}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Panel
            </Link>
            <div>
              <h1 className="flex items-center gap-1.5 text-sm font-bold text-stone-900 sm:text-base">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Estudio de Personalización · {eventTitle}
              </h1>
              <p className="text-[11px] text-stone-500">
                Editá tipografías, colores, fotos y secciones con vista previa en vivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/i/${event.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:border-stone-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir Link Público
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-stone-800 disabled:opacity-60"
            >
              {savedToast ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Split Screen Studio */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <PaymentPendingBanner
          event={event}
          mercadopagoConfigured={mercadopagoConfigured}
        />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-12">
        {/* Left Controls */}
        <div className="space-y-5 lg:col-span-6">
          {saveError && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {isEssentialPlan && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
              <strong>Tu pedido actual es Plan Esencial:</strong> podés editar los datos básicos del
              evento (título, fecha, horario, lugar, dirección, alias y dress code). El Estudio de
              Personalización completo (fotos propias, colores, tipografías, historia, itinerario y
              pases por familia) corresponde a <strong>Plan PRO</strong> y{" "}
              <strong>Llave en Mano</strong>.
            </div>
          )}

          {/* Tabs */}
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
            {(
              [
                ["estilo", "Estilo & Letra", Palette],
                ["textos", "Textos", FileText],
                ["fotos", "Fotos & Música", ImageIcon],
                ["modulos", "Secciones", Sliders],
              ] as const
            ).map(([id, label, Icon]) => {
              const active = activeTab === id;
              const locked = isEssentialPlan && id !== "textos";
              return (
                <button
                  key={id}
                  type="button"
                  disabled={locked}
                  onClick={() => setActiveTab(id)}
                  title={locked ? "Disponible en Plan PRO y Llave en Mano" : label}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-stone-900 text-white shadow-sm"
                      : locked
                      ? "cursor-not-allowed text-stone-300"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel: Estilo & Tipografía */}
          {activeTab === "estilo" && !isEssentialPlan && (
            <div className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    Modelos de esta categoría ({filteredSkins.length})
                  </span>
                  <span className="text-[11px] font-medium normal-case text-stone-500">
                    {selectedSkin.name}
                  </span>
                </label>
                <div className="grid max-h-64 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
                  {filteredSkins.map((s) => {
                    const active = skinId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSkinChange(s.id)}
                        className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                          active
                            ? "border-[#6B1E30] ring-2 ring-[#6B1E30]/30"
                            : "border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <div className="relative h-20 w-full overflow-hidden bg-stone-100">
                          <img
                            src={s.heroImage}
                            alt={s.name}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              s.imageFilter ?? ""
                            }`}
                          />
                          <span
                            className="absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm"
                            style={{
                              backgroundColor: s.palette.surface,
                              color: s.palette.text,
                            }}
                          >
                            {CATEGORY_LABELS[s.category]}
                          </span>
                        </div>
                        <div className="bg-white p-2">
                          <p className="truncate text-[11px] font-semibold text-stone-900">
                            {s.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <Type className="h-3.5 w-3.5 text-amber-600" />
                  Tipografía del Título Principal
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {FONT_OPTIONS.map((f) => {
                    const active = fontOverride === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontOverride(f.id)}
                        className={`rounded-2xl border p-3 text-left transition-all ${
                          active
                            ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                            : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
                        }`}
                      >
                        <div className={`font-display-${f.id} text-xl font-semibold`}>
                          {f.label}
                        </div>
                        <div className="mt-0.5 text-[10px] opacity-75">{f.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <Palette className="h-3.5 w-3.5 text-amber-600" />
                  Color de Acento y Botones
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {ACCENT_SWATCHES.map((sw) => {
                    const active = accentOverride.toLowerCase() === sw.hex.toLowerCase();
                    return (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => setAccentOverride(sw.hex)}
                        title={sw.name}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-transform ${
                          active
                            ? "scale-105 border-stone-900 bg-stone-900 text-white"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: sw.hex }}
                        />
                        {sw.name}
                      </button>
                    );
                  })}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">
                    <span>Otro color</span>
                    <input
                      type="color"
                      value={accentOverride}
                      onChange={(e) => setAccentOverride(e.target.value)}
                      className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Panel: Textos */}
          {activeTab === "textos" && (
            <div className="grid grid-cols-1 gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Título / Nombres en Portada
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Fecha visible
                </label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={(e) => setDateDisplay(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Horario
                </label>
                <input
                  type="text"
                  value={timeDisplay}
                  onChange={(e) => setTimeDisplay(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Salón / Lugar
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Dirección
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Alias / CBU para Regalos
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Entidad / Billetera (Mesa de Regalos)
                </label>
                <select
                  value={
                    customBankMode
                      ? OTHER_BANK_OPTION
                      : isKnownBankEntity(giftBank)
                      ? giftBank
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === OTHER_BANK_OPTION) {
                      setCustomBankMode(true);
                      if (isKnownBankEntity(giftBank)) {
                        setGiftBank("");
                      }
                    } else {
                      setCustomBankMode(false);
                      setGiftBank(val);
                    }
                  }}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                >
                  <option value="">Seleccionar entidad o billetera...</option>
                  {ARGENTINA_BANK_ENTITIES.map((entity) => (
                    <option key={entity} value={entity}>
                      {entity}
                    </option>
                  ))}
                  <option value={OTHER_BANK_OPTION}>{OTHER_BANK_OPTION}</option>
                </select>
                {customBankMode && (
                  <input
                    type="text"
                    value={giftBank}
                    onChange={(e) => setGiftBank(e.target.value)}
                    placeholder="Escribí el nombre de tu banco o billetera..."
                    className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Titular de la cuenta (opcional)
                </label>
                <input
                  type="text"
                  value={giftHolder}
                  onChange={(e) => setGiftHolder(e.target.value)}
                  placeholder="Ej. Sofía Martínez"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Frase o Dedicatoria de Portada
                </label>
                <textarea
                  rows={2}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              {!isEssentialPlan && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">
                      Fecha límite para confirmar (opcional)
                    </label>
                    <input
                      type="text"
                      value={rsvpDeadline}
                      onChange={(e) => setRsvpDeadline(e.target.value)}
                      placeholder="Ej. 15 de Noviembre de 2026"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2">
                      <div>
                        <span className="block text-xs font-semibold text-stone-800">
                          Cartel &ldquo;Solo Adultos&rdquo;
                        </span>
                        <span className="block text-[10px] text-stone-500">
                          Evento exclusivo para adultos
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adultsOnly}
                        onChange={(e) => setAdultsOnly(e.target.checked)}
                        className="h-4 w-4 accent-stone-900"
                      />
                    </label>
                  </div>
                  <div className="sm:col-span-2 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-semibold text-stone-800">
                          Valor de Tarjeta (opcional)
                        </span>
                        <span className="block text-[10px] text-stone-500">
                          Dejá vacío para ocultar la sección; agregá categorías para mostrar precios
                        </span>
                      </div>
                      {tarjetaPricing.length < 6 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTarjetaPricing((prev) => [
                              ...prev,
                              { label: prev.length === 0 ? "Mayores" : "Menores", price: "$25.000" },
                            ])
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                        >
                          <Plus className="h-3 w-3" /> Agregar tarifa
                        </button>
                      )}
                    </div>
                    {tarjetaPricing.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {tarjetaPricing.map((tier, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_115px_auto] items-center gap-2">
                            <input
                              type="text"
                              value={tier.label}
                              onChange={(e) => {
                                const next = [...tarjetaPricing];
                                next[idx] = { ...next[idx], label: e.target.value };
                                setTarjetaPricing(next);
                              }}
                              placeholder="Ej. Mayores"
                              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-stone-900"
                            />
                            <input
                              type="text"
                              value={tier.price}
                              onChange={(e) => {
                                const next = [...tarjetaPricing];
                                next[idx] = { ...next[idx], price: e.target.value };
                                setTarjetaPricing(next);
                              }}
                              placeholder="$25.000"
                              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTarjetaPricing((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Quitar tarifa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          value={tarjetaNote}
                          onChange={(e) => setTarjetaNote(e.target.value)}
                          placeholder="Nota aclaratoria (ej. Podés abonar hasta 10 días antes)"
                          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {!isEssentialPlan && (
                <>
                  {/* Padres / Anfitriones */}
                  <div className="sm:col-span-2 space-y-3 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Padres / Anfitriones (Con la bendición de)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setParentsOrHosts((prev) => [
                            ...prev,
                            { label: "Padrinos / Anfitriones", names: ["Nombre 1", "Nombre 2"] },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        <Plus className="h-3 w-3" /> Agregar grupo
                      </button>
                    </div>
                    {parentsOrHosts.length === 0 && (
                      <p className="text-xs text-stone-500">
                        Este diseño no incluye bloque de padres/padrinos, pero podés agregar uno arriba si querés mostrarlo.
                      </p>
                    )}
                    {parentsOrHosts.map((grp, gIdx) => (
                      <div
                        key={gIdx}
                        className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={grp.label}
                            placeholder="Ej. Padres de la Novia"
                            onChange={(e) =>
                              setParentsOrHosts((prev) =>
                                prev.map((item, i) =>
                                  i === gIdx ? { ...item, label: e.target.value } : item
                                )
                              )
                            }
                            className="flex-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                          />
                          <button
                            type="button"
                            aria-label="Quitar grupo"
                            onClick={() =>
                              setParentsOrHosts((prev) => prev.filter((_, i) => i !== gIdx))
                            }
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-white hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={grp.names.join(",")}
                          placeholder="Nombres separados por coma (ej. Roberto Martínez, Laura Pereyra)"
                          onChange={(e) =>
                            setParentsOrHosts((prev) =>
                              prev.map((item, i) =>
                                i === gIdx
                                  ? {
                                      ...item,
                                      names: e.target.value.split(","),
                                    }
                                  : item
                              )
                            )
                          }
                          onBlur={() =>
                            setParentsOrHosts((prev) =>
                              prev.map((item, i) =>
                                i === gIdx
                                  ? {
                                      ...item,
                                      names: item.names.map((n) => n.trim()).filter(Boolean),
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Nuestra Historia */}
                  <div className="sm:col-span-2 space-y-2.5 border-t border-stone-200 pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Nuestra Historia / Mensaje Especial
                    </label>
                    <input
                      type="text"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="Título (ej. Nuestra Historia)"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                    />
                    <textarea
                      rows={3}
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      placeholder="Contá brevemente cómo empezó todo o un mensaje para tus invitados..."
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                    />
                  </div>

                  {/* Itinerario / Programa */}
                  <div className="sm:col-span-2 space-y-3 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Itinerario / Programa del Día
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSchedule((prev) => [
                            ...prev,
                            { time: "22:00", title: "Nuevo momento", detail: "Descripción breve" },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        <Plus className="h-3 w-3" /> Agregar horario
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {schedule.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                        >
                          <input
                            type="text"
                            value={row.time}
                            placeholder="19:30"
                            onChange={(e) =>
                              setSchedule((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, time: e.target.value } : it
                                )
                              )
                            }
                            className="col-span-3 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                          />
                          <input
                            type="text"
                            value={row.title}
                            placeholder="Momento (ej. Ceremonia)"
                            onChange={(e) =>
                              setSchedule((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it
                                )
                              )
                            }
                            className="col-span-8 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                          />
                          <button
                            type="button"
                            aria-label="Eliminar horario"
                            onClick={() =>
                              setSchedule((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="col-span-1 flex items-center justify-center rounded-lg text-stone-400 hover:bg-white hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="text"
                            value={row.detail}
                            placeholder="Detalle breve (ej. Jardín principal)"
                            onChange={(e) =>
                              setSchedule((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, detail: e.target.value } : it
                                )
                              )
                            }
                            className="col-span-12 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Panel: Fotos & Música */}
          {activeTab === "fotos" && !isEssentialPlan && (
            <div className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              {uploadError && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                  Foto Principal de Portada
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={heroImageUrl || selectedSkin.heroImage}
                    alt="Portada"
                    className="h-24 w-24 rounded-2xl border border-stone-200 object-cover"
                  />
                  <div className="space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Subiendo..." : "Subir Foto Propia"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadHero}
                        className="hidden"
                      />
                    </label>
                    {heroImageUrl && (
                      <button
                        type="button"
                        onClick={() => setHeroImageUrl("")}
                        className="block text-xs font-medium text-stone-500 underline"
                      >
                        Restaurar arte del modelo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Acabado de Fotografía en Portada
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {HERO_OVERLAY_OPTIONS.map((opt) => {
                    const active = heroOverlayOverride === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHeroOverlayOverride(opt.id)}
                        className={`rounded-2xl border p-3 text-left transition-all ${
                          active
                            ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                            : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="mt-0.5 text-[10px] opacity-75">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                  Fotos de la Galería ({galleryImages.length})
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center hover:border-stone-500">
                  <Upload className="h-5 w-5 text-stone-500" />
                  <span className="mt-1 text-xs font-semibold text-stone-700">
                    Agregar fotos a la galería (hasta 8)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadGallery}
                    className="hidden"
                  />
                </label>
                {galleryImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {galleryImages.map((url, idx) => (
                      <div key={url + idx} className="relative h-16 w-16">
                        <img
                          src={url}
                          alt={`Galería ${idx + 1}`}
                          className="h-full w-full rounded-xl border border-stone-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                  <Music className="h-3.5 w-3.5 text-amber-600" />
                  Pista Musical de Fondo
                </label>
                <MusicCatalogPicker
                  value={audioOverride}
                  onChange={setAudioOverride}
                  skinCategory={selectedSkin.category}
                  defaultTrackLabel={selectedSkin.sample.audioTitle}
                  defaultTrackUrl={selectedSkin.sample.audioUrl}
                  customUploadedOption={
                    event.planId === "asistido" && audioOverride
                      ? {
                          value: audioOverride,
                          label: "Canción personalizada cargada por el estudio",
                        }
                      : null
                  }
                />
                {event.planId === "asistido" && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                    <label className="mb-1 block text-xs font-bold text-amber-950">
                      Canción a elección (Llave en Mano)
                    </label>
                    <input
                      type="text"
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder="Ej. Perfect - Ed Sheeran (o link de referencia)"
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                    <p className="mt-1 text-[11px] text-amber-900">
                      Nuestro equipo valida y carga tu audio definitivo desde producción para que suene sin cortes.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Álbum Colaborativo QR & Redes (opcional)
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-500">
                    Pegá el link de Google Fotos o Drive y el QR se genera solo para que tus invitados suban fotos.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                    Link del Álbum Compartido (Google Fotos / Drive)
                  </label>
                  <input
                    type="url"
                    value={albumUrl}
                    onChange={(e) => setAlbumUrl(e.target.value)}
                    placeholder="https://photos.app.goo.gl/..."
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                  />
                  {albumUrl.toLowerCase().includes("google.com") && (
                    <p
                      role="alert"
                      className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-950"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-700" />
                      <span>
                        Este es un enlace privado de Google Photos que pide iniciar sesión. Usá el botón Compartir → Crear enlace (photos.app.goo.gl) o subí tus fotos directamente desde tu dispositivo.
                      </span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Instagram (opcional)
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@sofiaylucas"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      #Hashtag del evento
                    </label>
                    <input
                      type="text"
                      value={eventHashtag}
                      onChange={(e) => setEventHashtag(e.target.value)}
                      placeholder="#SofiYLucas2026"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel: Módulos On/Off */}
          {activeTab === "modulos" && !isEssentialPlan && (
            <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs text-stone-500">
                Encendé o apagá las secciones que quieras mostrar en tu invitación:
              </p>
              {SECTION_LABELS.map((item) => {
                const enabled = Boolean(sections[item.key] ?? true);
                return (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                  >
                    <div>
                      <span className="block text-sm font-semibold text-stone-800">
                        {item.label}
                      </span>
                      {item.key === "wishes" && (
                        <span className="block text-[11px] text-stone-500">
                          Se llena automáticamente con los saludos que dejan tus invitados en el botón Confirmar Asistencia.
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        setSections((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-stone-900"
                    />
                  </label>
                );
              })}

              {Boolean(sections.trivia) && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Preguntas de la Mini-Trivia
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Editá tus preguntas o agregá hasta 6. Marcá el círculo de la respuesta correcta.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fresh = getTriviaPresetForCategory(
                            selectedSkin.category,
                            dressCode.trim() || selectedSkin.sample.dressCode.label,
                            selectedSkin.id
                          ).map((q, idx) => ({
                            ...q,
                            id: `${q.id}-${Date.now()}-${idx}`,
                            options: [...q.options],
                          }));
                          setTriviaQuestions(fresh);
                          setTriviaRestoredMsg(true);
                          setTimeout(() => setTriviaRestoredMsg(false), 2500);
                        }}
                        className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        {triviaRestoredMsg ? "✓ Sugeridas restauradas" : "Restaurar sugeridas"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (triviaQuestions.length < 6) {
                            setTriviaQuestions((prev) => [
                              ...prev,
                              {
                                id: `q-${Date.now()}`,
                                question: "Nueva pregunta para los invitados",
                                options: ["Opción A", "Opción B", "Opción C"],
                                correctIndex: 0,
                              },
                            ]);
                          }
                        }}
                        className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        + Agregar pregunta
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-stone-600">
                      Título del juego
                    </label>
                    <input
                      type="text"
                      value={triviaTitle}
                      onChange={(e) => setTriviaTitle(e.target.value)}
                      placeholder="¿Cuánto conocés a Sofía y Lucas?"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    {triviaQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-stone-200 bg-white p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-stone-500">
                            Pregunta {qIdx + 1}
                          </span>
                          {triviaQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setTriviaQuestions((prev) => prev.filter((_, idx) => idx !== qIdx))
                              }
                              className="text-[11px] font-semibold text-red-600 hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            setTriviaQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, question: e.target.value } : item
                              )
                            )
                          }
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium outline-none"
                        />
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctIndex === optIdx}
                                onChange={() =>
                                  setTriviaQuestions((prev) =>
                                    prev.map((item, idx) =>
                                      idx === qIdx ? { ...item, correctIndex: optIdx } : item
                                    )
                                  )
                                }
                                title="Marcar como correcta"
                                className="h-3.5 w-3.5 accent-emerald-700"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  setTriviaQuestions((prev) =>
                                    prev.map((item, idx) =>
                                      idx === qIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o, oI) =>
                                              oI === optIdx ? e.target.value : o
                                            ),
                                          }
                                        : item
                                    )
                                  )
                                }
                                className="w-full rounded-lg border border-stone-200 px-2 py-1 text-[11px] outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3.5">
                  <div>
                    <span className="block text-sm font-bold text-amber-950">
                      Modo Recuerdo (Post-Evento)
                    </span>
                    <span className="block text-[11px] text-amber-800">
                      Transforma la cuenta regresiva en un álbum conmemorativo de agradecimientos
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={memoryMode}
                    onChange={(e) => setMemoryMode(e.target.checked)}
                    className="h-4 w-4 accent-amber-700"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Mobile Preview */}
        <div className="lg:col-span-6">
          <div className="sticky top-20 flex flex-col items-center">
            <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Vista Previa en Tiempo Real (Móvil)
            </span>
            <div className="h-[720px] w-full max-w-[400px] overflow-y-auto rounded-[38px] border-[8px] border-stone-900 bg-white shadow-2xl">
              <InvitationRenderer
                skin={selectedSkin}
                eventSlug={event.slug}
                customTitle={eventTitle}
                customDateDisplay={dateDisplay}
                customTimeDisplay={timeDisplay}
                customDateISO={event.dateISO}
                customVenue={venue}
                customAddress={address}
                customAlias={alias}
                customGiftBank={giftBank || undefined}
                customGiftHolder={giftHolder || undefined}
                customDressCode={dressCode}
                customRsvpDeadline={rsvpDeadline || undefined}
                customAdultsOnly={adultsOnly}
                customTarjetaPricing={tarjetaPricing.length > 0 ? tarjetaPricing : undefined}
                customTarjetaNote={tarjetaNote || undefined}
                customQuote={quote}
                customParentsOrHosts={parentsOrHosts}
                customStoryTitle={storyTitle}
                customStoryText={storyText}
                customSchedule={schedule}
                customHeroImage={heroImageUrl || undefined}
                customHeroOverlay={heroOverlayOverride}
                customGallery={galleryImages.length > 0 ? galleryImages : undefined}
                customFont={fontOverride}
                customAccent={accentOverride}
                customAudioUrl={
                  !isEssentialPlan ? audioOverride || undefined : undefined
                }
                memoryMode={memoryMode}
                planId={event.planId}
                allowDjSongs={!isEssentialPlan}
                initialDjPlaylist={event.djPlaylist || []}
                triviaTitle={triviaTitle}
                triviaQuestions={triviaQuestions}
                initialTriviaScores={event.triviaScores || []}
                albumUrl={albumUrl || undefined}
                instagramHandle={instagramHandle || undefined}
                eventHashtag={eventHashtag || undefined}
                enabledSections={sections}
                skipGate={true}
                showPreviewChrome={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
