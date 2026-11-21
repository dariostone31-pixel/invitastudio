"use client";

import React, { Suspense, useState } from "react";
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
} from "lucide-react";
import { INVITATION_SKINS, CATEGORY_LABELS } from "@/templates/catalog";
import { BUSINESS_CONFIG, PRICING_PLANS } from "@/config/business";
import type { EventRecord } from "@/lib/db";

function EncargarForm() {
  const searchParams = useSearchParams();
  const initialSkin = searchParams.get("modelo") || INVITATION_SKINS[0].id;
  const mpStatus = searchParams.get("mp_status");
  const mpOrder = searchParams.get("order");
  const mpPanel = searchParams.get("panel");
  const mpSlug = searchParams.get("slug");

  const [selectedPlan, setSelectedPlan] = useState<"esencial" | "pro" | "asistido">("pro");
  const [selectedSkin, setSelectedSkin] = useState(initialSkin);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<EventRecord | null>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpNotice, setMpNotice] = useState<string | null>(null);

  const skinObj = INVITATION_SKINS.find((s) => s.id === selectedSkin) ?? INVITATION_SKINS[0];
  const planObj = PRICING_PLANS.find((p) => p.id === selectedPlan) ?? PRICING_PLANS[1];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    if (files.length === 0) return;
    setUploadingPhotos(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && Array.isArray(data.urls)) {
        setUploadedUrls((prev) => [...prev, ...data.urls].slice(0, 6));
      }
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinId: selectedSkin,
          planId: selectedPlan,
          eventTitle,
          eventDate,
          eventTime,
          venue,
          address,
          alias,
          dressCode,
          heroImageUrl: uploadedUrls[0],
          galleryImages: uploadedUrls,
          contactName,
          whatsapp,
          email,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar tu pedido");
      }
      setCreatedOrder(data.order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const copyTransferAlias = async () => {
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
            "Mercado Pago Checkout Pro listo para activar configurando MP_ACCESS_TOKEN."
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
            ? "Ya activamos la producción de tu invitación (<24 hs). Mientras tanto podés personalizar textos y fotos en vivo."
            : pending
            ? "Apenas Mercado Pago acredite la operación, tu pedido pasará automáticamente a edición."
            : "Podés reintentar el pago o abonar con 25% OFF por transferencia bancaria."}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mpSlug && (
            <Link
              href={`/i/${mpSlug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-stone-900 px-3 py-3 text-xs font-semibold text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Invitación
            </Link>
          )}
          {mpPanel && (
            <>
              <Link
                href={`/personalizar/${mpPanel}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900"
              >
                <Sparkles className="h-4 w-4 text-amber-600" />
                Personalizar
              </Link>
              <Link
                href={`/panel/${mpPanel}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-900"
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
    const whatsappSummary = encodeURIComponent(
      `¡Hola ${BUSINESS_CONFIG.brandName}! Acabo de registrar mi pedido ${createdOrder.orderCode}:\n` +
        `• Plan: ${planObj.name} (${planObj.transferPrice} por transferencia)\n` +
        `• Diseño: ${skinObj.name} (${CATEGORY_LABELS[skinObj.category]})\n` +
        `• Evento: ${createdOrder.eventTitle}\n` +
        `• Fecha y hora: ${createdOrder.dateDisplay} · ${createdOrder.timeDisplay}\n` +
        `• Lugar: ${createdOrder.venue} (${createdOrder.address})\n` +
        `• Mis datos: ${createdOrder.contactName} | Email: ${createdOrder.email}`
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
          Ya generamos tu invitación borrador en vivo y tu Panel Privado de Organizador (sin cuentas ni contraseñas).
        </p>

        {/* Acceso inmediato al borrador, personalizador y panel */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/i/${createdOrder.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-900 bg-stone-900 px-3 py-3 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Invitación
          </Link>
          <Link
            href={`/personalizar/${createdOrder.panelToken}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            Personalizar
          </Link>
          <Link
            href={`/panel/${createdOrder.panelToken}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-300 bg-white px-3 py-3 text-xs font-semibold text-stone-900 hover:bg-stone-50"
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
                Acreditación automática · Precio de lista: {planObj.listPrice} ARS
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={startMercadoPagoCheckout}
            disabled={mpLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#009EE3] px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0086C3] disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />
            {mpLoading ? "Conectando con Mercado Pago..." : `Pagar ${planObj.listPrice} con Mercado Pago`}
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
              Abonar con 25% OFF (Transferencia): {planObj.transferPrice} ARS
            </span>
            <span className="text-[11px] line-through text-stone-400">
              {planObj.listPrice}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 border border-amber-200">
            <div>
              <span className="block text-[10px] text-stone-400">ALIAS BANCARIO</span>
              <span className="font-mono font-bold text-stone-900">
                {BUSINESS_CONFIG.bankAlias}
              </span>
            </div>
            <button
              type="button"
              onClick={copyTransferAlias}
              className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white"
            >
              {copiedAlias ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedAlias ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${whatsappSummary}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Ya transferí — Avisar por WhatsApp ({createdOrder.orderCode})
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Paso 1: Plan */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 1 · Elegí tu modalidad
        </span>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-stone-900 bg-stone-900 text-white shadow-md"
                    : "border-stone-200 bg-stone-50/70 text-stone-800 hover:border-stone-400"
                }`}
              >
                <div className="text-xs font-bold">{plan.name}</div>
                <div
                  className={`mt-1 text-xl font-bold ${
                    active ? "text-amber-300" : "text-stone-900"
                  }`}
                >
                  {plan.transferPrice}
                  <span className="ml-1 text-[10px] font-normal opacity-75">transf.</span>
                </div>
                <div className="text-[10px] line-through opacity-60">{plan.listPrice} lista</div>
                <p className="mt-2 text-[11px] leading-relaxed opacity-85">{plan.shortDesc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Diseño */}
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
              Abrir demo de este diseño en otra pestaña
            </Link>
          </div>
        </div>
      </div>

      {/* Paso 3: Datos del evento */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 3 · Datos de tu evento
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
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Fotos desde tu celular (opcional — podés subirlas después desde tu panel)
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-center transition-colors hover:border-stone-500">
              <Upload className="h-6 w-6 text-stone-500" />
              <span className="mt-2 text-xs font-semibold text-stone-700">
                Tocá acá si querés adelantar tus fotos ahora (hasta 6, máx 4 MB c/u)
              </span>
              <span className="mt-0.5 text-[11px] text-stone-400">
                Sin cuentas de Google · También podés cargarlas luego en /personalizar
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {uploadingPhotos && (
              <p className="mt-2 text-xs text-amber-700">Subiendo tus fotos...</p>
            )}
            {uploadedUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedUrls.map((url, idx) => (
                  <img
                    key={url + idx}
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="h-16 w-16 rounded-xl border border-emerald-300 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paso 4: Tus datos */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Paso 4 · ¿A dónde te enviamos el link?
        </span>
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
              placeholder="Ej. 388 15 412 3456"
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
      </div>

      {errorMsg && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-stone-900 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-transform hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60"
      >
        {submitting ? "Creando Pedido..." : "Generar Mi Invitación y Resumen"}
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950"
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
            Encargá tu Invitación Digital
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Completá los datos básicos en 2 minutos. Al confirmar te damos al instante el borrador en vivo y tu Panel de Organizador.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-stone-500">
              Cargando formulario...
            </div>
          }
        >
          <EncargarForm />
        </Suspense>
      </div>
    </div>
  );
}
