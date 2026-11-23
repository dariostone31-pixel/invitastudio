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
import { INVITATION_SKINS, CATEGORY_LABELS, getSkinById } from "@/templates/catalog";
import { BUSINESS_CONFIG, PRICING_PLANS, getWhatsAppHref } from "@/config/business";
import { LEGAL_VERSION } from "@/config/legal";
import { prepareImageForUpload } from "@/lib/imageUpload";
import type { EventRecord, ParentsOrHostsGroup, ScheduleItem } from "@/lib/db";

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
  const [quote, setQuote] = useState(skinObj.sample.quote);
  const [parentsOrHosts, setParentsOrHosts] = useState<ParentsOrHostsGroup[]>(
    skinObj.sample.parentsOrHosts || []
  );
  const [storyTitle, setStoryTitle] = useState(
    skinObj.sample.storyTitle || "Nuestra Historia"
  );
  const [storyText, setStoryText] = useState(skinObj.sample.storyText || "");
  const [schedule, setSchedule] = useState<ScheduleItem[]>(skinObj.sample.schedule || []);

  // Sincronizar sugerencias editables al cambiar modelo si el usuario aún no cargó pedido
  useEffect(() => {
    const s = getSkinById(selectedSkin);
    setQuote(s.sample.quote);
    setParentsOrHosts(s.sample.parentsOrHosts ? structuredClone(s.sample.parentsOrHosts) : []);
    setStoryTitle(s.sample.storyTitle || "Nuestra Historia");
    setStoryText(s.sample.storyText || "");
    setSchedule(s.sample.schedule ? structuredClone(s.sample.schedule) : []);
  }, [selectedSkin]);

  // Datos básicos del evento
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [dressCode, setDressCode] = useState("");

  // Contacto y aceptación legal
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fotos
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

    const missing: string[] = [];
    if (!eventTitle.trim()) missing.push("Título o nombres en portada");
    if (!eventDate.trim()) missing.push("Fecha del evento");
    if (!eventTime.trim()) missing.push("Horario");
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
          eventTime: eventTime.trim(),
          venue: venue.trim(),
          address: address.trim(),
          alias: alias.trim(),
          dressCode: dressCode.trim(),
          ...(isAdvancedPlan
            ? {
                quote,
                parentsOrHosts,
                storyTitle,
                storyText,
                schedule,
                heroImageUrl: uploadedUrls[0],
                galleryImages: uploadedUrls,
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

        {/* Acceso inmediato al borrador, personalizador y panel */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/i/${createdOrder.slug}`}
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-900 bg-stone-900 px-3 py-3 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Borrador
          </Link>
          <Link
            href={`/personalizar/${createdOrder.panelToken}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            {createdOrder.planId === "esencial" ? "Editar Datos Básicos" : "Personalizar en Vivo"}
          </Link>
          <Link
            href={`/panel/${createdOrder.panelToken}`}
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-900 hover:bg-stone-50"
          >
            Panel Invitados
          </Link>
        </div>

        {/* Opción 1: Mercado Pago Checkout Pro */}
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

        {/* Opción 2: Datos Transferencia 25% OFF */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs text-stone-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900">
              Abonar con 25% OFF (Transferencia): {orderPlanObj.transferPrice} ARS
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
                {/* Frase de portada */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Frase / dedicatoria de portada
                  </label>
                  <textarea
                    rows={2}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Ej. Hay momentos en la vida que son especiales por sí solos..."
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm outline-none focus:border-stone-900"
                  />
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
                        value={grp.names.join(", ")}
                        onChange={(e) =>
                          setParentsOrHosts((prev) =>
                            prev.map((item, i) =>
                              i === gIdx
                                ? {
                                    ...item,
                                    names: e.target.value
                                      .split(",")
                                      .map((n) => n.trim())
                                      .filter(Boolean),
                                  }
                                : item
                            )
                          )
                        }
                        placeholder="Nombres separados por coma"
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

                {/* Fotos desde el celular con compresión automática */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">
                    Fotos propias (opcional — también podés subirlas después en tu Estudio)
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-center transition-colors hover:border-stone-500">
                    <Upload className="h-6 w-6 text-stone-500" />
                    <span className="mt-2 text-xs font-semibold text-stone-700">
                      {uploadingPhotos
                        ? "Optimizando y subiendo fotos..."
                        : "Tocá acá para elegir tus fotos (hasta 6 · JPG, PNG o WebP)"}
                    </span>
                    <span className="mt-0.5 text-[11px] text-stone-400">
                      Las optimizamos automáticamente desde tu celular para que carguen rápido
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
                  {uploadError && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                  {uploadedUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadedUrls.map((url, idx) => (
                        <div key={url + idx} className="relative h-16 w-16">
                          <img
                            src={url}
                            alt={`Foto ${idx + 1}`}
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
            <label className="mb-1 block text-xs font-semibold text-stone-700">Horario *</label>
            <input
              type="text"
              required
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              placeholder="Ej. 21:00 hs (o 16:00 a 19:00 hs)"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
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
              Código de vestimenta (opcional)
            </label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="Ej. Elegante Sport / Cómodo para jugar"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900"
            />
          </div>
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
