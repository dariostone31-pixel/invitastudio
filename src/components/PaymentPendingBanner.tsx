"use client";

import React, { useState } from "react";
import { Check, Copy, CreditCard, MessageCircle, ShieldAlert } from "lucide-react";
import { BUSINESS_CONFIG, getWhatsAppHref, PRICING_PLANS } from "@/config/business";
import type { EventRecord } from "@/lib/db";

interface PaymentPendingBannerProps {
  event: EventRecord;
  mercadopagoConfigured?: boolean;
}

export function PaymentPendingBanner({
  event,
  mercadopagoConfigured = false,
}: PaymentPendingBannerProps) {
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  if (event.paymentStatus === "pagado") return null;

  const planObj =
    PRICING_PLANS.find((p) => p.id === event.planId) ?? PRICING_PLANS[1];

  const paymentSummaryMsg = `¡Hola! Quiero abonar por transferencia mi pedido ${event.orderCode} (${planObj.name} · ${planObj.transferPrice} ARS) para activar mi invitación "${event.eventTitle}".`;
  const whatsappHref = getWhatsAppHref(paymentSummaryMsg);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(paymentSummaryMsg);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyAlias = async () => {
    if (!BUSINESS_CONFIG.bankAliasConfigured) return;
    try {
      await navigator.clipboard.writeText(BUSINESS_CONFIG.bankAlias);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleMercadoPago = async () => {
    if (mpLoading) return;
    setMpLoading(true);
    setMpError(null);
    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: event.id, orderCode: event.orderCode }),
      });
      const data = await res.json().catch(() => ({}));
      const targetUrl = data.initPoint || data.checkoutUrl;
      if (!res.ok || !targetUrl) {
        setMpError(
          data.error ||
            data.message ||
            "No pudimos iniciar Mercado Pago. Podés abonar por transferencia."
        );
        return;
      }
      window.location.href = targetUrl;
    } catch {
      setMpError("Error de conexión con Mercado Pago. Probá por transferencia.");
    } finally {
      setMpLoading(false);
    }
  };

  return (
    <section
      id="pago-transferencia"
      className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm print:hidden"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <ShieldAlert className="h-3.5 w-3.5" />
            Borrador · Pendiente de pago
          </div>
          <h2 className="font-cormorant text-2xl font-bold text-stone-900">
            Activá tu enlace definitivo ({planObj.name})
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-stone-600">
            Podés editar y probar todo tu evento tranquilo. Una vez acreditado el pago, quitamos el aviso de borrador y tu link público queda 100% listo para enviar a tus invitados.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:min-w-[320px]">
          <div className="rounded-2xl border border-amber-200 bg-white p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-stone-900">
                Transferencia Directa · Bonus si transferís
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                {planObj.transferPrice} ARS
              </span>
            </div>
            <p className="mt-1 text-[11px] text-amber-900">
              Mismo precio que Mercado Pago. Transferencias: se activan en el próximo horario de atención (L-V 9-19, Sáb 9-13). Bonus si transferís: Pack Ampliado de 8 carteles en 3 tamaños (A3 para la entrada, A5 para mesas y stickers para copas) con la estética de tu modelo + activación prioritaria.
            </p>

            {BUSINESS_CONFIG.bankAliasConfigured ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-stone-400">
                    ALIAS BANCARIO · {BUSINESS_CONFIG.bankHolder}
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {BUSINESS_CONFIG.bankAlias}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAlias}
                  className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white"
                >
                  {copiedAlias ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedAlias ? "Copiado" : "Copiar"}
                </button>
              </div>
            ) : (
              <div className="mt-1.5 space-y-2">
                <p className="text-[11px] text-stone-600">
                  Soliciá el Alias/CBU enviando tu código{" "}
                  <strong className="font-mono text-stone-900">{event.orderCode}</strong> y recibí confirmación rápida para activar tu invitación.
                </p>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-800 hover:bg-stone-100"
                >
                  {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSummary
                    ? "¡Mensaje con tu código copiado!"
                    : `Copiar mensaje de pago (${event.orderCode})`}
                </button>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap gap-2">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {BUSINESS_CONFIG.bankAliasConfigured
                    ? "Enviar comprobante por WhatsApp"
                    : "Pedir Alias y pagar por WhatsApp"}
                </a>
              )}
              {!whatsappHref && BUSINESS_CONFIG.supportEmail && (
                <a
                  href={`mailto:${BUSINESS_CONFIG.supportEmail}?subject=${encodeURIComponent(
                    `Comprobante Pedido ${event.orderCode}`
                  )}`}
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 py-1.5 text-[11px] font-bold text-white hover:bg-stone-800"
                >
                  Enviar comprobante por Email ({BUSINESS_CONFIG.supportEmail})
                </a>
              )}
            </div>
          </div>

          {mercadopagoConfigured && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 text-xs">
              <p className="mb-2 text-[11px] font-medium text-sky-900">
                Pagos con Mercado Pago: activación automática al instante (incluso fines de semana).
              </p>
              <button
                type="button"
                onClick={handleMercadoPago}
                disabled={mpLoading}
                className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-[#009EE3] px-4 py-2 font-bold text-white hover:bg-[#0086C3] disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {mpLoading
                  ? "Conectando..."
                  : `Pagar ${planObj.listPrice} con Mercado Pago (Tarjetas / Cuotas)`}
              </button>
              {mpError && <p className="mt-1.5 text-[11px] text-red-700">{mpError}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
