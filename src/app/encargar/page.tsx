"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Upload,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  Sliders,
  MapPin,
} from "lucide-react";
import { EditorialDiamondIcon } from "@/components/BrandOrnaments";
import { INVITATION_SKINS, CATEGORY_LABELS, getSkinById, type InvitationSkin } from "@/templates/catalog";
import { MusicCatalogPicker } from "@/components/MusicCatalogPicker";
import { SubtitleSelectField } from "@/components/SubtitleSelectField";
import { resolveEventSubtitle } from "@/config/subtitlePresets";
import {
  captureUtmAndLeadFromUrl,
  getStoredLeadId,
  getStoredUtms,
  setStoredLeadId,
} from "@/lib/utm";
import {
  ARGENTINA_BANK_ENTITIES,
  OTHER_BANK_OPTION,
  isKnownBankEntity,
} from "@/config/banks";
import { BUSINESS_CONFIG, PRICING_PLANS, getWhatsAppHref } from "@/config/business";
import { LEGAL_VERSION } from "@/config/legal";
import { prepareImageForUpload } from "@/lib/imageUpload";
import {
  getDefaultStoryTitleForCategory,
  getTriviaPresetForCategory,
} from "@/lib/categoryPresets";
import type {
  EventRecord,
  HeroOverlayStyle,
  ParentsOrHostsGroup,
  ScheduleItem,
  TriviaQuestion,
} from "@/lib/db";

const FONT_CHOICES: { id: InvitationSkin["fontDisplay"]; label: string }[] = [
  { id: "pinyon", label: "Caligrafía Boutique" },
  { id: "script", label: "Caligrafía Romántica" },
  { id: "cormorant", label: "Clásica Editorial" },
  { id: "fraunces", label: "Editorial Moderna" },
  { id: "cinzel", label: "Imperial Lujo" },
  { id: "playfair", label: "Revista / Diario" },
  { id: "oswald", label: "Urbana / VIP" },
  { id: "fredoka", label: "Alegre / Infantil" },
];

const ACCENT_CHOICES = [
  { name: "Oro Champán", hex: "#B89352" },
  { name: "Rosa Imperial", hex: "#C86D8E" },
  { name: "Borgoña Alma", hex: "#6B1E30" },
  { name: "Verde Salvia", hex: "#5F7D5B" },
  { name: "Terracota Boho", hex: "#B86B4B" },
  { name: "Dorado VIP", hex: "#D4AF37" },
];

const HERO_OVERLAY_CHOICES: { id: HeroOverlayStyle; label: string; desc: string }[] = [
  { id: "natural", label: "Nítida natural", desc: "Color pleno" },
  { id: "translucido-suave", label: "Translúcida profesional", desc: "Lámina suave" },
  { id: "velo-editorial", label: "Velo editorial", desc: "Estilo revista" },
  { id: "cinematico", label: "Cinemático", desc: "Contraste profundo" },
  { id: "bn-editorial", label: "B&N editorial", desc: "Blanco y negro" },
];

const ENCARGAR_DRAFT_KEY = "invita_encargar_draft_v1";

function EncargarForm() {
  const searchParams = useSearchParams();
  const initialSkin = searchParams.get("modelo") || INVITATION_SKINS[0].id;
  const initialPlanParam = searchParams.get("plan");
  const initialPlan: "esencial" | "pro" | "asistido" =
    initialPlanParam === "esencial" ||
    initialPlanParam === "pro" ||
    initialPlanParam === "asistido"
      ? initialPlanParam
      : "pro";

  const mpStatus = searchParams.get("mp_status");
  const mpOrder = searchParams.get("order");
  const mpPanel = searchParams.get("panel");
  const mpSlug = searchParams.get("slug");
  const mpPaymentId =
    searchParams.get("payment_id") || searchParams.get("collection_id");

  const [selectedPlan, setSelectedPlan] = useState<"esencial" | "pro" | "asistido">(initialPlan);
  const [selectedSkin, setSelectedSkin] = useState(initialSkin);

  const skinObj = getSkinById(selectedSkin);
  const planObj = PRICING_PLANS.find((p) => p.id === selectedPlan) ?? PRICING_PLANS[1];
  const isAdvancedPlan = selectedPlan === "pro" || selectedPlan === "asistido";

  // Personalización inicial (habilitada en PRO y Llave en Mano)
  const [showCustomDetails, setShowCustomDetails] = useState(true);
  const [fontOverride, setFontOverride] = useState<InvitationSkin["fontDisplay"]>(
    skinObj.fontDisplay
  );
  const [accentOverride, setAccentOverride] = useState<string>(skinObj.palette.accent);
  const [heroOverlayOverride, setHeroOverlayOverride] = useState<HeroOverlayStyle>(
    "natural"
  );
  const [audioOverride, setAudioOverride] = useState<string>("none");
  const [subtitleOverride, setSubtitleOverride] = useState<string>("");
  const [songRequest, setSongRequest] = useState<string>("");
  const [albumUrl, setAlbumUrl] = useState<string>("");
  const [instagramHandle, setInstagramHandle] = useState<string>("");
  const [eventHashtag, setEventHashtag] = useState<string>("");
  const [quote, setQuote] = useState(skinObj.sample.quote);
  const [parentsOrHosts, setParentsOrHosts] = useState<ParentsOrHostsGroup[]>(
    skinObj.sample.parentsOrHosts || []
  );
  const [storyTitle, setStoryTitle] = useState(
    skinObj.sample.storyTitle ||
      getDefaultStoryTitleForCategory(skinObj.category, skinObj.name)
  );
  const [storyText, setStoryText] = useState(skinObj.sample.storyText || "");
  const [schedule, setSchedule] = useState<ScheduleItem[]>(skinObj.sample.schedule || []);
  const [includeTrivia, setIncludeTrivia] = useState(true);
  const [triviaRestoredMsg, setTriviaRestoredMsg] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>(() =>
    getTriviaPresetForCategory(
      skinObj.category,
      skinObj.sample.dressCode.label,
      skinObj.id
    )
  );

  // Datos básicos del evento
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTimeStart, setEventTimeStart] = useState("21:00");
  const [eventTimeEnd, setEventTimeEnd] = useState("05:00");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [loc1Label, setLoc1Label] = useState("Ceremonia / Civil");
  const [loc1MapsUrl, setLoc1MapsUrl] = useState("");
  const [loc2Label, setLoc2Label] = useState("Fiesta / Recepción");
  const [loc2Venue, setLoc2Venue] = useState("");
  const [loc2Address, setLoc2Address] = useState("");
  const [loc2Time, setLoc2Time] = useState("");
  const [loc2MapsUrl, setLoc2MapsUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [giftBank, setGiftBank] = useState("Mercado Pago");
  const [customBankMode, setCustomBankMode] = useState(false);
  const [giftHolder, setGiftHolder] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [includeTarjeta, setIncludeTarjeta] = useState(false);
  const [tarjetaTiers, setTarjetaTiers] = useState<Array<{ label: string; price: string }>>([
    { label: "Mayores", price: "$25.000" },
    { label: "Menores (hasta 12 años)", price: "$15.000" },
  ]);
  const [tarjetaNote, setTarjetaNote] = useState("");
  const [mercadopagoConfigured, setMercadopagoConfigured] = useState(false);

  // Contacto y aceptación legal
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false); // DESMARCADO por defecto

  // Fotos (Portada única + Galería separada)
  const [heroUploadedUrl, setHeroUploadedUrl] = useState<string>("");
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hydratedRef = useRef(false);
  const prevSkinRef = useRef(selectedSkin);
  const querySkinParam = searchParams.get("modelo");
  const queryPlanParam = searchParams.get("plan");

  // Restaurar borrador guardado en localStorage al montar (persiste ante recargas y navegación)
  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(ENCARGAR_DRAFT_KEY) ||
        window.sessionStorage.getItem(ENCARGAR_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (
          !queryPlanParam &&
          (d.selectedPlan === "esencial" || d.selectedPlan === "pro" || d.selectedPlan === "asistido")
        ) {
          setSelectedPlan(d.selectedPlan);
        }
        const restoredSkin =
          !querySkinParam && typeof d.selectedSkin === "string" && d.selectedSkin
            ? d.selectedSkin
            : selectedSkin;
        if (!querySkinParam && typeof d.selectedSkin === "string" && d.selectedSkin) {
          setSelectedSkin(d.selectedSkin);
          prevSkinRef.current = d.selectedSkin;
        }
        const sameSkinAsDraft = restoredSkin === d.selectedSkin;
        if (sameSkinAsDraft) {
          if (typeof d.fontOverride === "string") setFontOverride(d.fontOverride as InvitationSkin["fontDisplay"]);
          if (typeof d.accentOverride === "string") setAccentOverride(d.accentOverride);
          if (typeof d.quote === "string") setQuote(d.quote);
          if (Array.isArray(d.parentsOrHosts)) setParentsOrHosts(d.parentsOrHosts as ParentsOrHostsGroup[]);
          if (typeof d.storyTitle === "string") setStoryTitle(d.storyTitle);
          if (typeof d.storyText === "string") setStoryText(d.storyText);
          if (Array.isArray(d.schedule)) setSchedule(d.schedule as ScheduleItem[]);
          if (Array.isArray(d.triviaQuestions) && d.triviaQuestions.length > 0) {
            setTriviaQuestions(d.triviaQuestions as TriviaQuestion[]);
          }
        }
        if (typeof d.heroOverlayOverride === "string") setHeroOverlayOverride(d.heroOverlayOverride as HeroOverlayStyle);
        if (typeof d.audioOverride === "string") setAudioOverride(d.audioOverride);
        if (typeof d.subtitleOverride === "string") setSubtitleOverride(d.subtitleOverride);
        if (typeof d.songRequest === "string") setSongRequest(d.songRequest);
        if (typeof d.albumUrl === "string") setAlbumUrl(d.albumUrl);
        if (typeof d.instagramHandle === "string") setInstagramHandle(d.instagramHandle);
        if (typeof d.eventHashtag === "string") setEventHashtag(d.eventHashtag);
        if (typeof d.includeTrivia === "boolean") setIncludeTrivia(d.includeTrivia);
        if (typeof d.eventTitle === "string") setEventTitle(d.eventTitle);
        if (typeof d.eventDate === "string") setEventDate(d.eventDate);
        if (typeof d.eventTimeStart === "string") setEventTimeStart(d.eventTimeStart);
        if (typeof d.eventTimeEnd === "string") setEventTimeEnd(d.eventTimeEnd);
        if (typeof d.venue === "string") setVenue(d.venue);
        if (typeof d.address === "string") setAddress(d.address);
        if (typeof d.loc1Label === "string") setLoc1Label(d.loc1Label);
        if (typeof d.loc1MapsUrl === "string") setLoc1MapsUrl(d.loc1MapsUrl);
        if (typeof d.loc2Label === "string") setLoc2Label(d.loc2Label);
        if (typeof d.loc2Venue === "string") setLoc2Venue(d.loc2Venue);
        if (typeof d.loc2Address === "string") setLoc2Address(d.loc2Address);
        if (typeof d.loc2Time === "string") setLoc2Time(d.loc2Time);
        if (typeof d.loc2MapsUrl === "string") setLoc2MapsUrl(d.loc2MapsUrl);
        if (typeof d.alias === "string") setAlias(d.alias);
        if (typeof d.giftBank === "string") {
          setGiftBank(d.giftBank);
          setCustomBankMode(Boolean(d.giftBank && !isKnownBankEntity(d.giftBank)));
        }
        if (typeof d.giftHolder === "string") setGiftHolder(d.giftHolder);
        if (typeof d.dressCode === "string") setDressCode(d.dressCode);
        if (typeof d.rsvpDeadline === "string") setRsvpDeadline(d.rsvpDeadline);
        if (typeof d.adultsOnly === "boolean") setAdultsOnly(d.adultsOnly);
        if (typeof d.includeTarjeta === "boolean") setIncludeTarjeta(d.includeTarjeta);
        if (Array.isArray(d.tarjetaTiers)) setTarjetaTiers(d.tarjetaTiers as Array<{ label: string; price: string }>);
        if (typeof d.tarjetaNote === "string") setTarjetaNote(d.tarjetaNote);
        if (typeof d.contactName === "string") setContactName(d.contactName);
        if (typeof d.whatsapp === "string") setWhatsapp(d.whatsapp);
        if (typeof d.email === "string") setEmail(d.email);
        if (typeof d.notes === "string") setNotes(d.notes);
        if (typeof d.termsAccepted === "boolean") setTermsAccepted(d.termsAccepted);
        if (typeof d.heroUploadedUrl === "string") setHeroUploadedUrl(d.heroUploadedUrl);
        if (Array.isArray(d.uploadedUrls)) setUploadedUrls(d.uploadedUrls as string[]);
      }
    } catch {
      // ignore invalid draft
    } finally {
      hydratedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar sugerencias editables solo cuando el usuario cambia activamente de modelo
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (prevSkinRef.current === selectedSkin) return;
    prevSkinRef.current = selectedSkin;
    const s = getSkinById(selectedSkin);
    setFontOverride(s.fontDisplay);
    setAccentOverride(s.palette.accent);
    setQuote(s.sample.quote);
    setParentsOrHosts(s.sample.parentsOrHosts ? structuredClone(s.sample.parentsOrHosts) : []);
    setStoryTitle(
      s.sample.storyTitle || getDefaultStoryTitleForCategory(s.category, s.name)
    );
    setStoryText(s.sample.storyText || "");
    setSchedule(s.sample.schedule ? structuredClone(s.sample.schedule) : []);
    setTriviaQuestions(
      getTriviaPresetForCategory(s.category, s.sample.dressCode.label, s.id)
    );
  }, [selectedSkin]);

  // Persistir borrador automáticamente en localStorage en cada cambio
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(
        ENCARGAR_DRAFT_KEY,
        JSON.stringify({
          selectedPlan,
          selectedSkin,
          fontOverride,
          accentOverride,
          heroOverlayOverride,
          audioOverride,
          subtitleOverride,
          songRequest,
          albumUrl,
          instagramHandle,
          eventHashtag,
          quote,
          parentsOrHosts,
          storyTitle,
          storyText,
          schedule,
          includeTrivia,
          triviaQuestions,
          eventTitle,
          eventDate,
          eventTimeStart,
          eventTimeEnd,
          venue,
          address,
          loc1Label,
          loc1MapsUrl,
          loc2Label,
          loc2Venue,
          loc2Address,
          loc2Time,
          loc2MapsUrl,
          alias,
          giftBank,
          giftHolder,
          dressCode,
          rsvpDeadline,
          adultsOnly,
          includeTarjeta,
          tarjetaTiers,
          tarjetaNote,
          contactName,
          whatsapp,
          email,
          notes,
          termsAccepted,
          heroUploadedUrl,
          uploadedUrls,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [
    selectedPlan,
    selectedSkin,
    fontOverride,
    accentOverride,
    heroOverlayOverride,
    audioOverride,
    subtitleOverride,
    songRequest,
    albumUrl,
    instagramHandle,
    eventHashtag,
    quote,
    parentsOrHosts,
    storyTitle,
    storyText,
    schedule,
    includeTrivia,
    triviaQuestions,
    eventTitle,
    eventDate,
    eventTimeStart,
    eventTimeEnd,
    venue,
    address,
    loc1Label,
    loc1MapsUrl,
    loc2Label,
    loc2Venue,
    loc2Address,
    loc2Time,
    loc2MapsUrl,
    alias,
    giftBank,
    giftHolder,
    dressCode,
    rsvpDeadline,
    adultsOnly,
    includeTarjeta,
    tarjetaTiers,
    tarjetaNote,
    contactName,
    whatsapp,
    email,
    notes,
    termsAccepted,
    heroUploadedUrl,
    uploadedUrls,
  ]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setMercadopagoConfigured(Boolean(d?.mercadopagoConfigured)))
      .catch(() => {});
  }, []);

  const trackedLeadIdRef = useRef<string | null>(null);
  const lastLeadSigRef = useRef<string>("");

  useEffect(() => {
    captureUtmAndLeadFromUrl();
    trackedLeadIdRef.current = getStoredLeadId();
  }, []);

  useEffect(() => {
    if (mpStatus !== "success" || !mpPaymentId) return;
    fetch("/api/mercadopago/verify-return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId: mpPaymentId,
        orderCode: mpOrder || undefined,
        panelToken: mpPanel || undefined,
      }),
    }).catch(() => {});
  }, [mpStatus, mpPaymentId, mpOrder, mpPanel]);

  useEffect(() => {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8) return;
    const sig = `${digits}|${contactName}|${selectedPlan}|${selectedSkin}|${eventTitle}|${consentMarketing}`;
    if (sig === lastLeadSigRef.current) return;

    const timer = window.setTimeout(async () => {
      try {
        lastLeadSigRef.current = sig;
        const utms = getStoredUtms();
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: trackedLeadIdRef.current || undefined,
            stage: "encargar_borrador",
            source: "encargar",
            contactName: contactName.trim() || "Cliente en progreso",
            whatsapp: whatsapp.trim(),
            email: email.trim() || undefined,
            category: skinObj.category,
            skinId: selectedSkin,
            planId: selectedPlan,
            eventTitle: eventTitle.trim() || undefined,
            consentService: true,
            consentMarketing,
            consentTextVersion: "v1-2026",
            consentSource: "encargar_draft",
            utmSource: utms.utmSource,
            utmMedium: utms.utmMedium,
            utmCampaign: utms.utmCampaign,
            utmContent: utms.utmContent,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.leadId) {
          trackedLeadIdRef.current = data.leadId;
          setStoredLeadId(String(data.leadId));
        }
      } catch {
        // captura silenciosa
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    whatsapp,
    contactName,
    email,
    selectedPlan,
    selectedSkin,
    skinObj.category,
    eventTitle,
    consentMarketing,
  ]);

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setUploadError(null);
    try {
      const prepared = await prepareImageForUpload(file);
      const fd = new FormData();
      fd.append("files", prepared);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.urls?.[0]) {
        throw new Error(
          data.error || "No pudimos subir la foto de portada. Probá con otro archivo."
        );
      }
      setHeroUploadedUrl(data.urls[0]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "No se pudo subir la foto de portada."
      );
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  // Envío
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorBannerRef = useRef<HTMLDivElement | null>(null);
  const [createdOrder, setCreatedOrder] = useState<EventRecord | null>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpNotice, setMpNotice] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []).slice(0, 6);
    if (rawFiles.length === 0) return;
    setUploadingPhotos(true);
    setUploadError(null);

    try {
      const prepared = await Promise.all(rawFiles.map((f) => prepareImageForUpload(f)));
      const fd = new FormData();
      prepared.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || "No pudimos guardar las fotos en el servidor. Intentá con JPG más liviano."
        );
      }
      if (Array.isArray(data.urls) && data.urls.length > 0) {
        setUploadedUrls((prev) => [...prev, ...data.urls].slice(0, 6));
      } else {
        throw new Error("El servidor no devolvió las URLs de las fotos.");
      }
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "No se pudieron subir las fotos. Probá con otro archivo JPG o PNG."
      );
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    const formattedEventTime = eventTimeEnd.trim()
      ? `${eventTimeStart.trim()} a ${eventTimeEnd.trim()} hs`
      : eventTimeStart.trim()
      ? `${eventTimeStart.trim()} hs`
      : "";

    const missing: string[] = [];
    if (!eventTitle.trim()) missing.push("Título o nombres en portada");
    if (!eventDate.trim()) missing.push("Fecha del evento");
    if (!eventTimeStart.trim()) missing.push("Horario desde");
    if (!venue.trim()) missing.push("Nombre del salón o lugar");
    if (!address.trim()) missing.push("Dirección y localidad");
    if (!contactName.trim()) missing.push("Tu nombre");
    if (!whatsapp.trim()) missing.push("Tu WhatsApp");
    if (!email.trim() || !email.includes("@")) missing.push("Un email válido");

    if (missing.length > 0) {
      showError(`Completá los siguientes campos obligatorios: ${missing.join(", ")}.`);
      return;
    }

    if (!termsAccepted) {
      showError(
        "Marcá la casilla de aceptación de las Condiciones del Servicio antes de generar tu invitación."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinId: selectedSkin,
          planId: selectedPlan,
          eventTitle: eventTitle.trim(),
          subtitleOverride: subtitleOverride.trim() || undefined,
          eventDate: eventDate.trim(),
          eventTime: formattedEventTime,
          venue: venue.trim(),
          address: address.trim(),
          alias: alias.trim(),
          giftBank: giftBank.trim(),
          giftHolder: giftHolder.trim(),
          dressCode: dressCode.trim(),
          rsvpDeadline: isAdvancedPlan ? rsvpDeadline.trim() : undefined,
          adultsOnly: isAdvancedPlan ? adultsOnly : false,
          tarjetaPricing:
            isAdvancedPlan && includeTarjeta
              ? tarjetaTiers
                  .map((t) => ({ label: t.label.trim(), price: t.price.trim() }))
                  .filter((t) => t.label && t.price)
              : undefined,
          tarjetaNote:
            isAdvancedPlan && includeTarjeta && tarjetaNote.trim()
              ? tarjetaNote.trim()
              : undefined,
          quote: quote.trim(),
          ...(isAdvancedPlan
            ? {
                parentsOrHosts: parentsOrHosts
                  .map((g) => ({
                    label: g.label.trim(),
                    names: g.names.map((n) => n.trim()).filter(Boolean),
                  }))
                  .filter((g) => g.label && g.names.length > 0),
                storyTitle,
                storyText,
                schedule,
                triviaQuestions:
                  selectedPlan === "asistido" && includeTrivia ? triviaQuestions : undefined,
                enabledSections: {
                  trivia: selectedPlan === "asistido" ? includeTrivia : false,
                  locations: [
                    {
                      label: loc1Label.trim() || "Ceremonia / Civil",
                      venue: venue.trim(),
                      address: address.trim(),
                      time: eventTimeStart ? `${eventTimeStart} hs` : "",
                      ...(loc1MapsUrl.trim() ? { mapsUrl: loc1MapsUrl.trim() } : {}),
                    },
                    ...(loc2Venue.trim()
                      ? [
                          {
                            label: loc2Label.trim() || "Fiesta / Recepción",
                            venue: loc2Venue.trim(),
                            address: loc2Address.trim(),
                            time: loc2Time.trim() || (eventTimeStart ? `${eventTimeStart} hs` : ""),
                            ...(loc2MapsUrl.trim() ? { mapsUrl: loc2MapsUrl.trim() } : {}),
                          },
                        ]
                      : []),
                  ],
                },
                heroImageUrl: heroUploadedUrl || undefined,
                heroOverlayOverride,
                galleryImages: uploadedUrls,
                fontOverride,
                accentOverride,
                audioOverride:
                  !audioOverride || audioOverride === "none" || (selectedPlan === "asistido" && songRequest.trim() && audioOverride === "none")
                    ? "none"
                    : audioOverride,
                ...(albumUrl.trim() ? { albumUrl: albumUrl.trim() } : {}),
                ...(instagramHandle.trim() ? { instagramHandle: instagramHandle.trim() } : {}),
                ...(eventHashtag.trim() ? { eventHashtag: eventHashtag.trim() } : {}),
                ...(selectedPlan === "asistido" && songRequest.trim()
                  ? { songRequest: songRequest.trim() }
                  : {}),
              }
            : {
                audioOverride:
                  !audioOverride || audioOverride === "none" ? "none" : "default",
                enabledSections: {
                  countdown: true,
                  story: false,
                  schedule: false,
                  gallery: false,
                  dressCode: true,
                  gifts: true,
                  trivia: false,
                  rsvp: true,
                  locations: [
                    {
                      label: "Recepción / Evento",
                      venue: venue.trim(),
                      address: address.trim(),
                      time: eventTimeStart ? `${eventTimeStart} hs` : "",
                      ...(loc1MapsUrl.trim() ? { mapsUrl: loc1MapsUrl.trim() } : {}),
                    },
                  ],
                },
              }),
          termsAccepted: true,
          consentMarketing,
          leadId: trackedLeadIdRef.current || getStoredLeadId() || undefined,
          utmSource: getStoredUtms().utmSource,
          utmMedium: getStoredUtms().utmMedium,
          utmCampaign: getStoredUtms().utmCampaign,
          utmContent: getStoredUtms().utmContent,
          contactName: contactName.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar tu pedido.");
      }
      try {
        window.localStorage.removeItem(ENCARGAR_DRAFT_KEY);
        window.sessionStorage.removeItem(ENCARGAR_DRAFT_KEY);
      } catch {
        // ignore
      }
      setCreatedOrder(data.order);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error inesperado al registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyTransferAlias = async () => {
    if (!BUSINESS_CONFIG.bankAlias) return;
    try {
      await navigator.clipboard.writeText(BUSINESS_CONFIG.bankAlias);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } catch {
      // ignore
    }
  };

  const startMercadoPagoCheckout = async () => {
    if (!createdOrder || mpLoading) return;
    setMpLoading(true);
    setMpNotice(null);
    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: createdOrder.id }),
      });
      const data = await res.json();
      if (data.mode === "live" && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      if (data.mode === "unconfigured") {
        setMpNotice(
          data.message ||
            "Mercado Pago Checkout Pro está pendiente de configuración de credenciales en este entorno."
        );
      } else {
        setMpNotice(data.error || "No se pudo abrir Mercado Pago.");
      }
    } catch {
      setMpNotice("Error conectando con Mercado Pago.");
    } finally {
      setMpLoading(false);
    }
  };

  if (mpStatus) {
    const approved = mpStatus === "success";
    const pending = mpStatus === "pending";
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            approved
              ? "bg-emerald-100 text-emerald-700"
              : pending
              ? "bg-amber-100 text-amber-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          <CheckCircle2 className="h-9 w-9" />
        </div>
        {mpOrder && (
          <span className="mt-4 inline-block rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-bold text-stone-700">
            Pedido {mpOrder}
          </span>
        )}
        <h1 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
          {approved
            ? "¡Pago acreditado en Mercado Pago!"
            : pending
            ? "Pago en revisión de Mercado Pago"
            : "El pago no se completó"}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {approved
            ? "Pagos con Mercado Pago: activación automática confirmada. Tu enlace público y tu Panel de Organizador ya están desbloqueados y listos para compartir."
            : pending
            ? "Apenas Mercado Pago acredite la operación, tu invitación y tu panel quedarán desbloqueados automáticamente."
            : "Podés reintentar el pago o abonar por transferencia bancaria (se activan en el próximo horario de atención L-V 9-19, Sáb 9-13, con bonus de Pack Ampliado de 8 carteles en 3 tamaños: A3, A5 y stickers)."}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mpSlug && (
            <Link
              href={`/i/${mpSlug}`}
              target="_blank"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-stone-900 px-3 py-3 text-xs font-semibold text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Invitación
            </Link>
          )}
          {mpPanel && (
            <>
              <Link
                href={`/personalizar/${mpPanel}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900"
              >
                <EditorialDiamondIcon className="h-4 w-4 text-amber-600" />
                Personalizar
              </Link>
              <Link
                href={`/panel/${mpPanel}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-900"
              >
                Panel Invitados
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (createdOrder) {
    const orderPlanObj =
      PRICING_PLANS.find((p) => p.id === createdOrder.planId) ?? planObj;
    const whatsappHref = getWhatsAppHref(
      `¡Hola ${BUSINESS_CONFIG.brandName}! Acabo de registrar mi pedido ${createdOrder.orderCode}:\n` +
        `• Plan: ${orderPlanObj.name} (${orderPlanObj.transferPrice} por transferencia)\n` +
        `• Diseño: ${skinObj.name} (${CATEGORY_LABELS[skinObj.category]})\n` +
        `• Evento: ${createdOrder.eventTitle}\n` +
        `• Fecha y hora: ${createdOrder.dateDisplay} · ${createdOrder.timeDisplay}\n` +
        `• Lugar: ${createdOrder.venue} (${createdOrder.address})\n` +
        (createdOrder.planId === "asistido" && createdOrder.songRequest
          ? `• Canción pedida (Llave en Mano): ${createdOrder.songRequest} — Nuestro equipo preparará y cargará esta canción en tu invitación definitiva antes de la entrega.\n`
          : "") +
        `• Contacto: ${createdOrder.contactName} | Email: ${createdOrder.email}`
    );

    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <span className="mt-4 inline-block rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-bold text-stone-700">
          Código de Pedido: {createdOrder.orderCode}
        </span>
        <h1 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
          ¡Pedido registrado con éxito!
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Ya tenés listo tu borrador para revisar y tu Panel Privado de Organizador (guardá estos
          enlaces o sacales captura).
        </p>

        {/* Acceso inmediato al borrador privado, panel y ajuste opcional */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/panel/${createdOrder.panelToken}/preview`}
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-900 bg-stone-900 px-3 py-3 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Borrador Privado
          </Link>
          <Link
            href={`/panel/${createdOrder.panelToken}`}
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-900 hover:bg-stone-50"
          >
            Panel Invitados
          </Link>
          <Link
            href={`/personalizar/${createdOrder.panelToken}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <EditorialDiamondIcon className="h-4 w-4 text-amber-600" />
            {createdOrder.planId === "esencial" ? "Editar Datos Básicos" : "Ajustar Diseño (Opcional)"}
          </Link>
        </div>

        {/* Opción 1: Mercado Pago Checkout Pro (solo visible cuando MP está configurado) */}
        {mercadopagoConfigured && (
          <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-left text-xs text-stone-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-sky-950">
                  Pagar online con Mercado Pago (Tarjetas / Débito / Cuotas)
                </span>
                <span className="mt-0.5 block text-[11px] text-sky-800">
                  Activación automática al instante (incluso fines de semana) · Valor: {orderPlanObj.listPrice} ARS
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={startMercadoPagoCheckout}
              disabled={mpLoading}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#009EE3] px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0086C3] disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {mpLoading
                ? "Conectando con Mercado Pago..."
                : `Pagar ${orderPlanObj.listPrice} con Mercado Pago`}
            </button>
            {mpNotice && (
              <p className="mt-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-[11px] text-sky-900">
                {mpNotice}
              </p>
            )}
          </div>
        )}

        {/* Transferencia Bancaria Directa */}
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs text-stone-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-amber-900">
              Transferencia Bancaria Directa: {orderPlanObj.transferPrice} ARS
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Bonus si transferís: Pack Ampliado 8 carteles
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-900">
            Mismo precio en todos los medios de pago. Transferencias: se activan en el próximo horario de atención (L-V 9-19, Sáb 9-13). Bonus si transferís: Pack Ampliado de 8 carteles en 3 tamaños (A3 para la entrada, A5 para mesas y stickers para copas) con la estética de tu modelo + activación prioritaria.
          </p>
          {BUSINESS_CONFIG.bankAliasConfigured ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2">
              <div>
                <span className="block text-[10px] text-stone-400">ALIAS BANCARIO</span>
                <span className="font-mono font-bold text-stone-900">
                  {BUSINESS_CONFIG.bankAlias}
                </span>
              </div>
              <button
                type="button"
                onClick={copyTransferAlias}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white"
              >
                {copiedAlias ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedAlias ? "Copiado" : "Copiar"}
              </button>
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-[11px] text-amber-900">
              Alias / CBU pendiente de configuración en el entorno. Indicá tu código{" "}
              <strong className="font-mono">{createdOrder.orderCode}</strong> al coordinar el
              pago con soporte.
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar resumen y comprobante por WhatsApp ({createdOrder.orderCode})
            </a>
          ) : (
            <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
              Canal de WhatsApp oficial pendiente de configuración. Guardá tu código{" "}
              <strong className="font-mono">{createdOrder.orderCode}</strong> y tu enlace del
              Panel Privado para continuar.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Paso 1: Plan con diferenciación explícita */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 1 · Elegí tu modalidad
        </span>
        <p className="mt-1 text-xs text-stone-600">
          Los pasos de personalización que ves abajo se adaptan automáticamente al plan que elijas.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-stone-900 bg-stone-900 text-white shadow-md"
                    : "border-stone-200 bg-stone-50/70 text-stone-800 hover:border-stone-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{plan.name}</span>
                    {plan.highlight && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          active
                            ? "bg-amber-300 text-stone-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        Recomendado
                      </span>
                    )}
                  </div>
                  <div
                    className={`mt-1.5 text-2xl font-bold ${
                      active ? "text-amber-300" : "text-stone-900"
                    }`}
                  >
                    {plan.transferPrice}
                    <span className="ml-1 text-[10px] font-normal opacity-80">ARS único</span>
                  </div>
                  <div className="text-[10px] opacity-80">
                    Bonus si transferís: Pack Ampliado 8 carteles (A3, A5, stickers)
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed opacity-90">{plan.shortDesc}</p>
                </div>

                <ul className="mt-3 space-y-1 border-t border-current/15 pt-2.5 text-[10px] opacity-90">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Resumen dinámico de lo que incluye la modalidad elegida */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
          <p className="font-bold">
            Elegiste {planObj.name} ({planObj.transferPrice} ARS · pago único):
          </p>
          <p className="mt-1 text-[11px] leading-relaxed">
            {selectedPlan === "esencial" &&
              "Formulario simplificado: cargás solo los datos esenciales del evento y recibís 1 link único con el diseño y la música predeterminada del modelo elegido (no incluye Estudio de Personalización ni links individuales por familia)."}
            {selectedPlan === "pro" &&
              "Personalización completa incluida: podés editar desde ahora la frase, padres/anfitriones, historia, itinerario, música y subir fotos propias, y al confirmar accedés al Estudio en vivo, link único compartible, Playlist DJ, Galería de Recuerdos QR, Modo Recuerdo y Excel."}
            {selectedPlan === "asistido" &&
              "Modalidad Llave en Mano: podés cargar tus textos/fotos ahora si querés adelantarlos, o enviarnos todo por soporte y nuestro equipo arma la invitación completa, links individuales y por familia, Trivia y cambios asistidos."}
          </p>
        </div>

        {/* H4: Captura temprana de WhatsApp + checkbox marketing (desmarcado por defecto) en Paso 1 */}
        <div className="mt-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4 sm:p-5">
          <p className="text-xs font-bold text-stone-900">
            Tus datos de WhatsApp para guardar tu borrador y enviarte tu enlace *
          </p>
          <p className="mt-0.5 text-[11px] text-stone-600">
            Si dejás tu WhatsApp acá, guardamos tu avance para que no pierdas lo que cargaste y podamos ayudarte si necesitás asistencia.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">Tu Nombre *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ej. Carolina"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">WhatsApp *</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej. 388 412 3456"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
              />
            </div>
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-stone-700">
            <input
              type="checkbox"
              checked={consentMarketing}
              onChange={(e) => setConsentMarketing(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-stone-900"
            />
            <span>
              Quiero recibir también ideas, ofertas y novedades de Invita con el Alma por WhatsApp. Puedo darme de baja cuando quiera respondiendo BAJA.
            </span>
          </label>
        </div>
      </div>

      {/* Paso 2: Diseño + Personalización al principio para PRO / Llave en Mano */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 2 · Diseño elegido (41 modelos)
        </span>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={skinObj.heroImage}
            alt={skinObj.name}
            className="h-24 w-24 rounded-2xl border border-stone-200 object-cover"
          />
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">
              Modelo del catálogo
            </label>
            <select
              value={selectedSkin}
              onChange={(e) => setSelectedSkin(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900"
            >
              {INVITATION_SKINS.map((s) => (
                <option key={s.id} value={s.id}>
                  {CATEGORY_LABELS[s.category]} — {s.name}
                </option>
              ))}
            </select>
            <Link
              href={`/demo/${skinObj.id}`}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
            >
              <EditorialDiamondIcon className="h-3.5 w-3.5" />
              Ver demo en vivo de este diseño
            </Link>
          </div>
        </div>

        {/* Aviso de alcance para Plan Esencial */}
        {!isAdvancedPlan && (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4 text-xs text-stone-600">
            <p className="font-semibold text-stone-900">
              Plan Esencial · Diseño y música genérica predeterminada
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              Este plan mantiene la tipografía, paleta y música instrumental genérica predeterminada del modelo elegido (no incluye la solapa de Playlist DJ para invitados ni cambios visuales). Si querés personalizar fuentes, colores, acabado translúcido o pedir canción propia, elegí{" "}
              <strong>Plan PRO</strong> o <strong>Llave en Mano</strong> arriba.
            </p>
          </div>
        )}

        {/* Bloque de personalización temprana solo para Plan PRO y Llave en Mano */}
        {isAdvancedPlan && (
          <div className="mt-6 border-t border-stone-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Sliders className="h-4 w-4 text-amber-600" />
                  Personalización de tu invitación (incluida en {planObj.name})
                </span>
                <p className="text-[11px] text-stone-500">
                  {selectedPlan === "asistido"
                    ? "Podés editarlo acá ahora o dejarlo para enviárnoslo después y lo cargamos por vos."
                    : "Modificá frase, padres, historia, itinerario y fotos ahora (o luego en tu Estudio en vivo)."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDetails((v) => !v)}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
              >
                {showCustomDetails ? "Ocultar campos avanzados" : "Editar textos y fotos ahora"}
              </button>
            </div>

            {showCustomDetails && (
              <div className="mt-4 space-y-5">
                {/* Tipografía + Color de acento + Música + Acabado de Portada con vista rápida */}
                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4 sm:grid-cols-12">
                  <div className="space-y-4 sm:col-span-7">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Tipografía del Título Principal
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {FONT_CHOICES.map((f) => {
                          const active = fontOverride === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFontOverride(f.id)}
                              className={`rounded-xl border px-3 py-2 text-left transition-all ${
                                active
                                  ? "border-stone-900 bg-stone-900 text-white"
                                  : "border-stone-200 bg-white text-stone-800 hover:border-stone-400"
                              }`}
                            >
                              <span className={`font-display-${f.id} block text-base leading-tight`}>
                                {f.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Color de Acento y Botones
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {ACCENT_CHOICES.map((sw) => {
                          const active = accentOverride.toLowerCase() === sw.hex.toLowerCase();
                          return (
                            <button
                              key={sw.hex}
                              type="button"
                              onClick={() => setAccentOverride(sw.hex)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                active
                                  ? "border-stone-900 bg-stone-900 text-white"
                                  : "border-stone-200 bg-white text-stone-700"
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-black/15"
                                style={{ backgroundColor: sw.hex }}
                              />
                              {sw.name}
                            </button>
                          );
                        })}
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700">
                          <span>Otro</span>
                          <input
                            type="color"
                            value={accentOverride}
                            onChange={(e) => setAccentOverride(e.target.value)}
                            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Acabado de Fotografía en Portada
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {HERO_OVERLAY_CHOICES.map((ov) => {
                          const active = heroOverlayOverride === ov.id;
                          return (
                            <button
                              key={ov.id}
                              type="button"
                              onClick={() => setHeroOverlayOverride(ov.id)}
                              className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                                active
                                  ? "border-stone-900 bg-stone-900 text-white"
                                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                              }`}
                            >
                              {ov.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">
                        Música de Fondo
                      </label>
                      <MusicCatalogPicker
                        value={audioOverride}
                        onChange={setAudioOverride}
                        skinCategory={skinObj.category}
                        defaultTrackLabel={skinObj.sample.audioTitle}
                        defaultTrackUrl={skinObj.sample.audioUrl}
                        compact
                      />
                    </div>

                    {selectedPlan === "asistido" && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                        <label className="mb-1 block text-xs font-bold text-amber-950">
                          Canción de fondo a tu elección (incluida en Llave en Mano)
                        </label>
                        <input
                          type="text"
                          value={songRequest}
                          onChange={(e) => setSongRequest(e.target.value)}
                          placeholder="Ej. Perfect - Ed Sheeran (o link de YouTube/Spotify)"
                          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                        />
                        <p className="mt-1 text-[10px] leading-relaxed text-amber-900">
                          Nuestro equipo preparará y cargará esta canción en tu invitación definitiva antes de la entrega. Además, tus invitados tendrán la solapa <strong>Playlist DJ</strong> para sugerir temas para la fiesta.
                        </p>
                      </div>
                    )}

                    {selectedPlan === "pro" && (
                      <p className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] text-stone-600">
                        <strong>Incluido en Plan PRO:</strong> catálogo musical curado + solapa{" "}
                        <strong>Playlist de la Fiesta</strong> para que tus invitados sugieran canciones al DJ.
                      </p>
                    )}
                  </div>

                  {/* Mini preview visual instantáneo de portada */}
                  <div className="flex flex-col justify-center sm:col-span-5">
                    <div className="mb-2.5 space-y-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-stone-700">
                          Nombre en la portada (vista en vivo) *
                        </label>
                        <input
                          type="text"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder={`Ej. ${skinObj.sample.title}`}
                          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                        />
                      </div>
                      <SubtitleSelectField
                        category={skinObj.category}
                        defaultEyebrow={skinObj.sample.eyebrow}
                        eventTitle={eventTitle || skinObj.sample.title}
                        value={subtitleOverride}
                        onChange={setSubtitleOverride}
                        compact
                      />
                    </div>
                    <span className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                      Vista rápida de tu portada
                    </span>
                    <div
                      className="relative mx-auto h-64 w-full max-w-[230px] overflow-hidden rounded-3xl border shadow-md"
                      style={{
                        backgroundColor: skinObj.palette.bg,
                        borderColor: skinObj.palette.border,
                      }}
                    >
                      <img
                        src={heroUploadedUrl || skinObj.heroImage}
                        alt="Vista rápida portada"
                        className={`h-full w-full object-cover ${
                          heroOverlayOverride === "translucido-suave"
                            ? "opacity-70 saturate-[0.88] blur-[0.5px]"
                            : heroOverlayOverride === "velo-editorial"
                            ? "opacity-60 saturate-[0.78]"
                            : heroOverlayOverride === "bn-editorial"
                            ? "grayscale contrast-[1.06] opacity-75"
                            : ""
                        }`}
                      />
                      {heroOverlayOverride === "cinematico" && (
                        <div className="absolute inset-0 bg-black/35" />
                      )}
                      <div className="absolute inset-0 flex items-end justify-center p-3">
                        <div
                          className="w-full rounded-2xl border bg-white/80 px-3 py-3 text-center shadow-sm backdrop-blur-md"
                          style={{
                            borderColor: accentOverride,
                            color: skinObj.palette.text,
                          }}
                        >
                          <p
                            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: accentOverride }}
                          >
                            {resolveEventSubtitle({
                              category: skinObj.category,
                              eventTitle: eventTitle.trim() || skinObj.sample.title,
                              customSubtitle: subtitleOverride,
                              defaultEyebrow: skinObj.sample.eyebrow,
                            })}
                          </p>
                          <p
                            className={`font-display-${fontOverride} mt-1 break-words text-xl font-semibold leading-tight`}
                          >
                            {eventTitle.trim() || skinObj.sample.title}
                          </p>
                          <span
                            className="mt-2 inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: accentOverride }}
                          >
                            Confirmar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Padres / Anfitriones (ej. bodas y XV) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      Padres / Padrinos / Anfitriones (opcional)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setParentsOrHosts((prev) => [
                          ...prev,
                          { label: "Padres / Anfitriones", names: ["Nombre 1", "Nombre 2"] },
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <Plus className="h-3 w-3" /> Agregar grupo
                    </button>
                  </div>
                  {parentsOrHosts.map((grp, gIdx) => (
                    <div
                      key={gIdx}
                      className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={grp.label}
                          onChange={(e) =>
                            setParentsOrHosts((prev) =>
                              prev.map((item, i) =>
                                i === gIdx ? { ...item, label: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Ej. Padres de la Novia"
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
                        placeholder="Nombres separados por coma (ej. Edith Quispe, Carlos Gómez)"
                        className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                  ))}
                </div>

                {/* Nuestra Historia */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Historia / Mensaje para invitados (opcional)
                  </label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Ej. Nuestra Historia"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                  <textarea
                    rows={2}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Contá cómo empezó todo o dejá unas palabras especiales..."
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                </div>

                {/* Itinerario */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      Itinerario / Programa (opcional)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSchedule((prev) => [
                          ...prev,
                          { time: "21:30", title: "Cena / Brindis", detail: "Salón principal" },
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <Plus className="h-3 w-3" /> Agregar momento
                    </button>
                  </div>
                  {schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                    >
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) =>
                          setSchedule((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, time: e.target.value } : it
                            )
                          )
                        }
                        placeholder="19:30"
                        className="col-span-3 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          setSchedule((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, title: e.target.value } : it
                            )
                          )
                        }
                        placeholder="Momento"
                        className="col-span-8 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                      />
                      <button
                        type="button"
                        aria-label="Eliminar momento"
                        onClick={() =>
                          setSchedule((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 flex items-center justify-center rounded-lg text-stone-400 hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="text"
                        value={item.detail}
                        onChange={(e) =>
                          setSchedule((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, detail: e.target.value } : it
                            )
                          )
                        }
                        placeholder="Detalle"
                        className="col-span-12 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                  ))}
                </div>

                {/* Preguntas del Juego / Trivia Interactiva (exclusivo Plan Llave en Mano) */}
                {selectedPlan === "asistido" ? (
                  <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeTrivia}
                          onChange={(e) => setIncludeTrivia(e.target.checked)}
                          className="h-4 w-4 accent-stone-900"
                        />
                        <div>
                          <span className="block text-xs font-bold text-stone-800">
                            Incluir Juego / Trivia Interactiva ({triviaQuestions.length} preguntas)
                          </span>
                          <span className="block text-[11px] text-stone-500">
                            Exclusivo Llave en Mano: editá las preguntas y marcá cuál opción es la correcta. Tus invitados compiten en un ranking Top 5.
                          </span>
                        </div>
                      </label>
                      {includeTrivia && (
                        <button
                          type="button"
                          onClick={() => {
                            const fresh = getTriviaPresetForCategory(
                              skinObj.category,
                              dressCode.trim() || skinObj.sample.dressCode.label,
                              skinObj.id
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
                      )}
                    </div>

                    {includeTrivia && triviaQuestions.map((tq, qIdx) => (
                      <div
                        key={tq.id || qIdx}
                        className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                            Pregunta {qIdx + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={tq.question}
                          onChange={(e) =>
                            setTriviaQuestions((prev) =>
                              prev.map((item, i) =>
                                i === qIdx ? { ...item, question: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Escribí la pregunta para tus invitados..."
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-stone-900"
                        />
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                          {tq.options.map((opt, oIdx) => {
                            const isCorrect = tq.correctIndex === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${
                                  isCorrect
                                    ? "border-emerald-500 bg-emerald-50/70"
                                    : "border-stone-200 bg-stone-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`encargar-trivia-correct-${qIdx}`}
                                  checked={isCorrect}
                                  title="Marcar como respuesta correcta"
                                  onChange={() =>
                                    setTriviaQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === qIdx ? { ...item, correctIndex: oIdx } : item
                                      )
                                    )
                                  }
                                  className="h-3.5 w-3.5 accent-emerald-600"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    setTriviaQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === qIdx
                                          ? {
                                              ...item,
                                              options: item.options.map((o, j) =>
                                                j === oIdx ? e.target.value : o
                                              ),
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  placeholder={`Opción ${oIdx + 1}`}
                                  className="w-full bg-transparent text-[11px] outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-[11px] text-stone-600">
                    <strong>Juego Interactivo / Trivia personalizada:</strong> disponible exclusivamente en el plan{" "}
                    <strong>Llave en Mano</strong>.
                  </div>
                )}

                {/* Fotos separadas: 1) Portada (1 sola) + 2) Galería */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-950">
                    <strong>¿Todavía no tenés tus fotos o sesión hecha?</strong> Quedate tranquilo: podés crear y reservar tu invitación hoy con las fotos de muestra, y cuando hagas tu book las subís desde tu Panel de Organizador.
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">
                      Foto de Portada (1 sola foto · opcional)
                    </label>
                    <p className="mb-2 text-[11px] text-stone-500">
                      Se mostrará como protagonista en la portada principal y en el sobre animado.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center transition-colors hover:border-stone-500">
                        <Upload className="h-5 w-5 text-stone-500" />
                        <span className="mt-1.5 text-xs font-semibold text-stone-700">
                          {uploadingHero
                            ? "Subiendo foto de portada..."
                            : heroUploadedUrl
                            ? "Cambiar foto de portada"
                            : "Elegir 1 foto para la portada"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingHero}
                          onChange={handleHeroFileChange}
                          className="hidden"
                        />
                      </label>
                      {heroUploadedUrl && (
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <img
                            src={heroUploadedUrl}
                            alt="Foto de portada"
                            className="h-full w-full rounded-xl border border-emerald-400 object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Quitar foto de portada"
                            onClick={() => setHeroUploadedUrl("")}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">
                      Fotos de Galería (opcional · hasta 6 fotos)
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center transition-colors hover:border-stone-500">
                      <Upload className="h-5 w-5 text-stone-500" />
                      <span className="mt-1.5 text-xs font-semibold text-stone-700">
                        {uploadingPhotos
                          ? "Optimizando y subiendo fotos..."
                          : "Agregar fotos a la galería (JPG, PNG o WebP)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingPhotos}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  {uploadedUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploadedUrls.map((url, idx) => (
                        <div key={url + idx} className="relative h-16 w-16">
                          <img
                            src={url}
                            alt={`Galería ${idx + 1}`}
                            className="h-full w-full rounded-xl border border-emerald-300 object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Quitar foto ${idx + 1}`}
                            onClick={() =>
                              setUploadedUrls((prev) => prev.filter((_, i) => i !== idx))
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

                {/* Galería de Recuerdos QR & Hashtag (opcional) */}
                <div className="rounded-2xl border border-stone-200 bg-white p-3.5 space-y-2.5">
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Galería de Recuerdos · Fotos QR & Hashtag (opcional)
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Si ya tenés una galería en Google Fotos/Drive o un #hashtag, se genera un QR automático en la invitación.
                    </p>
                  </div>
                  <input
                    type="url"
                    value={albumUrl}
                    onChange={(e) => setAlbumUrl(e.target.value)}
                    placeholder="Link de tu galería compartida (https://photos.app.goo.gl/...)"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                  />
                  {albumUrl.toLowerCase().includes("google.com") && (
                    <p
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-950"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-700" />
                      <span>
                        Este es un enlace privado de Google Photos que pide iniciar sesión. Usá el botón Compartir → Crear enlace (photos.app.goo.gl) o subí tus fotos directamente desde tu dispositivo.
                      </span>
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="Instagram (ej. @sofiaylucas)"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                    <input
                      type="text"
                      value={eventHashtag}
                      onChange={(e) => setEventHashtag(e.target.value)}
                      placeholder="#Hashtag (ej. #SofiYLucas)"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paso 3: Datos básicos del evento */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 3 · Datos principales de tu evento
        </span>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Título / Nombres en portada *
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Ej. Sofía & Lucas / Mis XV Valentina / Cumple 40 de Martín"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div className="sm:col-span-2">
            <SubtitleSelectField
              category={skinObj.category}
              defaultEyebrow={skinObj.sample.eyebrow}
              eventTitle={eventTitle || skinObj.sample.title}
              value={subtitleOverride}
              onChange={setSubtitleOverride}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">Fecha *</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Horario (Desde / Hasta) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-0.5 block text-[10px] font-medium text-stone-500">Desde *</span>
                <input
                  type="time"
                  required
                  value={eventTimeStart}
                  onChange={(e) => setEventTimeStart(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <span className="mb-0.5 block text-[10px] font-medium text-stone-500">Hasta (opcional)</span>
                <input
                  type="time"
                  value={eventTimeEnd}
                  onChange={(e) => setEventTimeEnd(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
          {/* Coordenadas del Evento (1 para Esencial, hasta 2 independientes para PRO y Llave en Mano) */}
          <div className="sm:col-span-2 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800">
                <MapPin className="h-3.5 w-3.5 text-amber-700" />
                {isAdvancedPlan
                  ? "Coordenadas del Evento (hasta 2 lugares)"
                  : "Coordenada del Evento (1 ubicación)"}
              </span>
              {!isAdvancedPlan && (
                <span className="text-[11px] text-stone-500">
                  Plan Esencial incluye 1 ubicación
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:grid-cols-2">
              {isAdvancedPlan && (
                <div className="sm:col-span-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Coordenada 1 · Lugar Principal
                  </span>
                  <input
                    type="text"
                    value={loc1Label}
                    onChange={(e) => setLoc1Label(e.target.value)}
                    placeholder="Ej. Ceremonia / Civil"
                    className="w-44 rounded-lg border border-stone-300 px-2.5 py-1 text-xs font-semibold outline-none focus:border-stone-900"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Nombre del Salón / Quinta / Iglesia *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ej. Finca Los Olivares"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Dirección y Localidad *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Av. Belgrano 1240, Jujuy"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Link de Google Maps (opcional — si lo dejás vacío se genera automático)
                </label>
                <input
                  type="url"
                  value={loc1MapsUrl}
                  onChange={(e) => setLoc1MapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {isAdvancedPlan && (
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-white p-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Coordenada 2 · Segundo Lugar (opcional)
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Ideal si hacés Ceremonia/Civil y Fiesta en distintos lugares. Si lo dejás vacío, se oculta.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={loc2Label}
                    onChange={(e) => setLoc2Label(e.target.value)}
                    placeholder="Ej. Fiesta / Salón"
                    className="w-44 rounded-lg border border-stone-300 px-2.5 py-1 text-xs font-semibold outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Nombre del Salón / Quinta
                  </label>
                  <input
                    type="text"
                    value={loc2Venue}
                    onChange={(e) => setLoc2Venue(e.target.value)}
                    placeholder="Ej. Salón Las Magnolias"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Dirección y Localidad
                  </label>
                  <input
                    type="text"
                    value={loc2Address}
                    onChange={(e) => setLoc2Address(e.target.value)}
                    placeholder="Ej. Ruta 9 Km 4, San Salvador de Jujuy"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Horario del 2do lugar
                  </label>
                  <input
                    type="text"
                    value={loc2Time}
                    onChange={(e) => setLoc2Time(e.target.value)}
                    placeholder="Ej. 21:30 hs"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Link de Google Maps (opcional)
                  </label>
                  <input
                    type="url"
                    value={loc2MapsUrl}
                    onChange={(e) => setLoc2MapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Alias o CBU para regalos (opcional)
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej. SOFIA.LUCAS.BODA"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
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
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
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
                className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
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
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Código de vestimenta (opcional)
            </label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="Ej. Elegante Sport / Formal"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                "Elegante",
                "Elegante Sport",
                "Formal / Gala",
                "Cocktail",
                "De Blanco",
                "Total Black",
                "Cómodo",
              ].map((dc) => (
                <button
                  key={dc}
                  type="button"
                  onClick={() => setDressCode(dc)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    dressCode === dc
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {dc}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Frase o dedicatoria en portada (opcional)
            </label>
            <textarea
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Ej. Te esperamos para compartir juntos una noche inolvidable."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
            />
          </div>
          {isAdvancedPlan && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Fecha límite para confirmar asistencia (opcional)
                </label>
                <input
                  type="text"
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                  placeholder="Ej. 15 de Noviembre de 2026"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5">
                  <div>
                    <span className="block text-xs font-semibold text-stone-800">
                      Cartel &ldquo;Solo Adultos&rdquo;
                    </span>
                    <span className="block text-[10px] text-stone-500">
                      Aclara con elegancia que el evento es sin niños
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
              <div className="sm:col-span-2 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <span className="block text-xs font-semibold text-stone-900">
                      Valor de Tarjeta (opcional)
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      Mostrá los valores de entrada por categorías (Mayores, Menores, etc.) con copia rápida de alias
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeTarjeta}
                    onChange={(e) => setIncludeTarjeta(e.target.checked)}
                    className="h-4 w-4 accent-stone-900"
                  />
                </label>

                {includeTarjeta && (
                  <div className="mt-3 space-y-2.5 border-t border-stone-200 pt-3">
                    {tarjetaTiers.map((tier, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_130px_auto] items-center gap-2">
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => {
                            const next = [...tarjetaTiers];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setTarjetaTiers(next);
                          }}
                          placeholder="Ej. Mayores"
                          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                        />
                        <input
                          type="text"
                          value={tier.price}
                          onChange={(e) => {
                            const next = [...tarjetaTiers];
                            next[idx] = { ...next[idx], price: e.target.value };
                            setTarjetaTiers(next);
                          }}
                          placeholder="$25.000"
                          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTarjetaTiers((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-200"
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {tarjetaTiers.length < 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          setTarjetaTiers((prev) => [...prev, { label: "", price: "" }])
                        }
                        className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        + Agregar categoría
                      </button>
                    )}
                    <input
                      type="text"
                      value={tarjetaNote}
                      onChange={(e) => setTarjetaNote(e.target.value)}
                      placeholder="Nota aclaratoria (ej. Podés abonar hasta 10 días antes por transferencia)"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paso 4: Entrega del link y aceptación de condiciones */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 4 · Confirmación y entrega de tu link
        </span>
        <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-600">
          <strong className="text-stone-900">¿Cómo funciona la activación?</strong> Apenas enviás el
          formulario, accedés a tu <strong>borrador privado</strong> y tu{" "}
          <strong>Panel de Organizador</strong>. <strong>Listo en menos de 24 hs hábiles.</strong>{" "}
          Pagos con <strong>Mercado Pago: activación automática</strong> al instante (incluso fines de semana).{" "}
          <strong>Transferencias:</strong> se activan en el próximo horario de atención (L-V 9-19, Sáb 9-13).
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Tu Nombre (cargado en Paso 1) *
            </label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ej. Carolina"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/60 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              WhatsApp (cargado en Paso 1) *
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej. 388 412 3456"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/60 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Comentarios o detalles extra (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Queremos agregar ceremonia civil a las 18 hs, o música tranquila..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
            />
          </div>
        </div>

        {/* Aceptación explícita de Condiciones (NO premarcada) + enlace Privacidad */}
        <div className="mt-4 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4">
          <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-stone-700">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-stone-900"
            />
            <span>
              Leí y acepto las{" "}
              <Link
                href="/condiciones"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#6B1E30] underline"
              >
                Condiciones del Servicio
              </Link>{" "}
              (versión <span className="font-mono">{LEGAL_VERSION}</span>) y tomé conocimiento de la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#6B1E30] underline"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
        </div>
      </div>

      {errorMsg && (
        <div
          ref={errorBannerRef}
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[48px] w-full rounded-full bg-stone-900 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-transform hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60"
      >
        {submitting ? "Generando Pedido..." : "Generar Mi Invitación y Resumen"}
      </button>
    </form>
  );
}

export default function EncargarPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Sin cuenta ni contraseña
          </span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-cormorant text-4xl font-semibold text-stone-900 sm:text-5xl">
            Encargá tu Invitación
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Elegí tu plan y modelo en 4 pasos simples. Al finalizar obtenés tu borrador y tu Panel de Organizador al instante.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6" aria-busy="true" aria-label="Cargando formulario">
              <div className="h-40 animate-pulse rounded-3xl border border-stone-200 bg-white/80 p-6" />
              <div className="h-36 animate-pulse rounded-3xl border border-stone-200 bg-white/80 p-6" />
              <div className="h-64 animate-pulse rounded-3xl border border-stone-200 bg-white/80 p-6" />
              <div className="h-44 animate-pulse rounded-3xl border border-stone-200 bg-white/80 p-6" />
            </div>
          }
        >
          <EncargarForm />
        </Suspense>
      </div>
    </div>
  );
}
