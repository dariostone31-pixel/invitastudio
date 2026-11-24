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
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { INVITATION_SKINS, CATEGORY_LABELS, getSkinById, type InvitationSkin } from "@/templates/catalog";
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

const AUDIO_CHOICES = [
  { label: "Música predeterminada del modelo", value: "" },
  { label: "Piano Romántico (Instrumental)", value: "/audio/romantic-piano.wav" },
  { label: "Lounge Cálido (Eventos & Hombres)", value: "/audio/lounge-warm.wav" },
  { label: "Celesta Alegre (Infantil & Bebé)", value: "/audio/playful-celesta.wav" },
  { label: "Sin música de fondo", value: "none" },
];

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
    "translucido-suave"
  );
  const [audioOverride, setAudioOverride] = useState<string>("");
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
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>(() =>
    getTriviaPresetForCategory(
      skinObj.category,
      skinObj.sample.dressCode.label,
      skinObj.id
    )
  );

  // Sincronizar sugerencias editables al cambiar modelo si el usuario aún no cargó pedido
  useEffect(() => {
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

  // Datos básicos del evento
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTimeStart, setEventTimeStart] = useState("21:00");
  const [eventTimeEnd, setEventTimeEnd] = useState("05:00");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [giftBank, setGiftBank] = useState("Mercado Pago");
  const [giftHolder, setGiftHolder] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [mercadopagoConfigured, setMercadopagoConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setMercadopagoConfigured(Boolean(d?.mercadopagoConfigured)))
      .catch(() => {});
  }, []);

  // Contacto y aceptación legal
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fotos (Portada única + Galería separada)
  const [heroUploadedUrl, setHeroUploadedUrl] = useState<string>("");
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
                triviaQuestions: includeTrivia ? triviaQuestions : undefined,
                enabledSections: {
                  trivia: includeTrivia,
                },
                heroImageUrl: heroUploadedUrl || undefined,
                heroOverlayOverride,
                galleryImages: uploadedUrls,
                fontOverride,
                accentOverride,
                audioOverride,
                ...(albumUrl.trim() ? { albumUrl: albumUrl.trim() } : {}),
                ...(instagramHandle.trim() ? { instagramHandle: instagramHandle.trim() } : {}),
                ...(eventHashtag.trim() ? { eventHashtag: eventHashtag.trim() } : {}),
                ...(selectedPlan === "asistido" && songRequest.trim()
                  ? { songRequest: songRequest.trim() }
                  : {}),
              }
            : {}),
          termsAccepted: true,
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
            ? "Ya activamos la producción de tu invitación (< 24 hs hábiles). Podés revisar tu borrador y tu panel desde los botones de abajo."
            : pending
            ? "Apenas Mercado Pago acredite la operación, tu pedido pasará automáticamente a edición."
            : "Podés reintentar el pago o abonar con 25% OFF por transferencia bancaria."}
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
                <Sparkles className="h-4 w-4 text-amber-600" />
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
          ? `• Canción pedida (Llave en Mano): ${createdOrder.songRequest}\n`
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

        {/* Acceso inmediato a la invitación, panel y ajuste opcional */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/i/${createdOrder.slug}`}
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-900 bg-stone-900 px-3 py-3 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Invitación en Vivo
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
            <Sparkles className="h-4 w-4 text-amber-600" />
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
                  Acreditación automática · Precio de lista: {orderPlanObj.listPrice} ARS
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
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900">
              Abonar por Transferencia Bancaria: {orderPlanObj.transferPrice} ARS
            </span>
            <span className="text-[11px] text-stone-400 line-through">
              {orderPlanObj.listPrice}
            </span>
          </div>
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
                    <span className="ml-1 text-[10px] font-normal opacity-80">transf.</span>
                  </div>
                  <div className="text-[10px] line-through opacity-65">
                    {plan.listPrice} lista / MP
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
            Elegiste {planObj.name} ({planObj.transferPrice} por transferencia · {planObj.listPrice} lista):
          </p>
          <p className="mt-1 text-[11px] leading-relaxed">
            {selectedPlan === "esencial" &&
              "Formulario simplificado: cargás solo los datos esenciales del evento y recibís 1 link único con el diseño y la música predeterminada del modelo elegido (no incluye Estudio de Personalización ni links individuales por familia)."}
            {selectedPlan === "pro" &&
              "Personalización completa incluida: podés editar desde ahora la frase, padres/anfitriones, historia, itinerario y subir fotos propias, y además al confirmar accedés al Estudio en vivo, links personalizados por familia y Excel."}
            {selectedPlan === "asistido" &&
              "Modalidad Llave en Mano: podés cargar tus textos/fotos ahora si querés adelantarlos, o enviarnos todo por soporte y nuestro equipo arma la invitación completa, pases por familia y cambios asistidos."}
          </p>
        </div>
      </div>

      {/* Paso 2: Diseño + Personalización al principio para PRO / Llave en Mano */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 2 · Diseño elegido (42 modelos)
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
              <Sparkles className="h-3.5 w-3.5" />
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
                      <select
                        value={audioOverride}
                        onChange={(e) => setAudioOverride(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-stone-900"
                      >
                        {AUDIO_CHOICES.map((opt) => (
                          <option key={opt.label} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
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
                          Nuestro equipo la optimiza, valida el audio y la deja sonando en tu invitación antes de entregarla. Además, tus invitados tendrán la solapa <strong>Playlist DJ</strong> para sugerir temas para la fiesta.
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
                    <div className="mb-2.5">
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
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div
                          className="w-full rounded-2xl border px-3 py-4 text-center shadow-sm backdrop-blur-[2px]"
                          style={{
                            backgroundColor: `${skinObj.palette.surface}EB`,
                            borderColor: accentOverride,
                            color: skinObj.palette.text,
                          }}
                        >
                          <p
                            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: accentOverride }}
                          >
                            {skinObj.sample.eyebrow}
                          </p>
                          <p
                            className={`font-display-${fontOverride} mt-1.5 break-words text-2xl font-semibold leading-tight`}
                          >
                            {eventTitle.trim() || skinObj.sample.title}
                          </p>
                          <span
                            className="mt-2.5 inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
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

                {/* Preguntas del Juego / Trivia Interactiva */}
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
                          Editá las preguntas y marcá cuál opción es la correcta. Tus invitados compiten en un ranking Top 5.
                        </span>
                      </div>
                    </label>
                    {includeTrivia && (
                      <button
                        type="button"
                        onClick={() =>
                          setTriviaQuestions(
                            getTriviaPresetForCategory(
                              skinObj.category,
                              skinObj.sample.dressCode.label,
                              skinObj.id
                            )
                          )
                        }
                        className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        Restaurar sugeridas
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

                {/* Álbum Colaborativo QR & Hashtag (opcional) */}
                <div className="rounded-2xl border border-stone-200 bg-white p-3.5 space-y-2.5">
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Álbum Colaborativo QR & Hashtag (opcional)
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Si ya tenés un álbum en Google Fotos/Drive o un #hashtag, se genera un QR automático en la invitación.
                    </p>
                  </div>
                  <input
                    type="url"
                    value={albumUrl}
                    onChange={(e) => setAlbumUrl(e.target.value)}
                    placeholder="Link del álbum compartido (https://photos.app.goo.gl/...)"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                  />
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
              Entidad / Billetera de regalos (opcional)
            </label>
            <input
              type="text"
              value={giftBank}
              onChange={(e) => setGiftBank(e.target.value)}
              placeholder="Ej. Mercado Pago, Banco Macro..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["Mercado Pago", "Banco Macro", "Banco Galicia", "Banco Nación", "Brubank", "Santander"].map(
                (bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setGiftBank(bank)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                      giftBank === bank
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {bank}
                  </button>
                )
              )}
            </div>
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
            </>
          )}
        </div>
      </div>

      {/* Paso 4: Entrega del link y aceptación de condiciones */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 4 · Datos para entregarte tu link
        </span>
        <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-600">
          <strong className="text-stone-900">¿Cómo funciona este paso?</strong> Apenas enviás el
          formulario, en esta misma pantalla se generan tu <strong>borrador en vivo</strong> y tu{" "}
          <strong>Panel de Organizador</strong>. Tu WhatsApp y Email los usamos para coordinar la
          confirmación del pago y enviarte tu enlace definitivo listo en menos de 24 hs hábiles.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">Tu Nombre *</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ej. Carolina"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
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
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
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
        <div className="mt-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4">
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
