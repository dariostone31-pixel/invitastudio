import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";
import { BUSINESS_CONFIG, PRICING_PLANS } from "@/config/business";
import { LEGAL_STATUS, LEGAL_UPDATED_AT, LEGAL_VERSION } from "@/config/legal";

export const metadata: Metadata = {
  title: `Condiciones del Servicio — ${BUSINESS_CONFIG.brandName}`,
  description:
    "Condiciones comerciales, alcance de planes, plazos de entrega, pagos y soporte de Invita con el Alma.",
};

export default function CondicionesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-[#2A121B] sm:px-6">
      <main className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-[#2A121B]/12 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A121B]/10 pb-5">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[#6B1E30] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {BUSINESS_CONFIG.brandName}
          </Link>
          <span className="rounded-full bg-[#FBF1EE] px-3 py-1 text-[11px] font-semibold text-[#6B1E30]">
            Versión {LEGAL_VERSION} · Actualizado {LEGAL_UPDATED_AT}
          </span>
        </div>

        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B78A4E]">
            <FileText className="h-4 w-4" />
            Términos de Contratación
          </div>
          <h1 className="font-display-cormorant text-4xl font-semibold text-[#2A121B] sm:text-5xl">
            Condiciones del Servicio
          </h1>
          <p className="text-sm leading-relaxed text-[#7A5A62]">
            Estas condiciones regulan la contratación de invitaciones digitales interactivas a
            través de <strong className="text-[#2A121B]">{BUSINESS_CONFIG.brandName}</strong>.
          </p>

          <div
            role="note"
            className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
              <div>
                <strong>Borrador sujeto a revisión jurídica profesional (Argentina):</strong>{" "}
                antes de la operación comercial definitiva, este borrador debe revisarse conforme
                a la Ley 24.240 de Defensa del Consumidor y normativa civil/comercial aplicable.
                {LEGAL_STATUS.missingProviderFields.length > 0 && (
                  <p className="mt-1.5">
                    <strong>Bloqueo pendiente de datos del prestador:</strong>{" "}
                    {LEGAL_STATUS.missingProviderFields.join(" · ")}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-2.5 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            1. Identificación del prestador y descripción del servicio
          </h2>
          <p>
            <strong>Prestador:</strong>{" "}
            {BUSINESS_CONFIG.legalHolderName || "Pendiente de confirmación del titular"} ·{" "}
            <strong>CUIT:</strong> {BUSINESS_CONFIG.taxId || "Pendiente de confirmación"} ·{" "}
            <strong>Contacto:</strong>{" "}
            {BUSINESS_CONFIG.supportEmail || "Pendiente de confirmación en configuración"}.
          </p>
          <p>
            {BUSINESS_CONFIG.brandName} ofrece la creación, alojamiento web y publicación de
            invitaciones digitales interactivas accesibles desde el navegador del celular, junto con
            un panel privado de gestión para el organizador del evento.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            2. Alcance de cada plan y modalidad de personalización
          </h2>
          <div className="space-y-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-[#2A121B]/10 bg-[#FAF8F5] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-[#2A121B]">{plan.name}</h3>
                  <span className="text-xs font-semibold text-[#6B1E30]">
                    {plan.transferPrice} ARS (transferencia) · {plan.listPrice} ARS (lista/MP)
                  </span>
                </div>
                <p className="mt-1 text-xs">{plan.shortDesc}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            3. Materiales del cliente, plazo de entrega y revisiones
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Inicio del cómputo de entrega:</strong> el plazo estimado de activación y
              revisión (&lt; 24 horas hábiles) comienza una vez recibido el pedido con los datos
              obligatorios del evento y confirmado el pago o comprobante correspondiente.
            </li>
            <li>
              <strong>Borrador inmediato:</strong> al registrar un pedido se genera una vista
              borrador técnica para revisión previa del cliente antes de compartir el enlace
              definitivo.
            </li>
            <li>
              <strong>Derechos sobre materiales aportados:</strong> el cliente garantiza contar con
              los derechos y permisos necesarios sobre las fotografías, textos, nombres y datos que
              carga o envía para su publicación.
            </li>
            <li>
              <strong>Revisiones, cambios y trabajo adicional:</strong> en Plan PRO el organizador
              puede editar en línea los campos habilitados en su Estudio de Personalización. En
              Llave en Mano se incluyen cambios asistidos sobre la misma plantilla antes del
              evento. El desarrollo de diseños exclusivos fuera de catálogo o funcionalidades a
              medida se presupuesta por separado previo acuerdo escrito.
            </li>
          </ul>
        </section>

        <section className="space-y-2.5 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            4. Vigencia de publicación y cambios de fecha del evento
          </h2>
          <p>
            La invitación permanece publicada durante la organización del evento y hasta su cierre o
            activación del Modo Recuerdo por parte del organizador (plazo máximo exacto de archivo
            post-evento pendiente de definición operativa sin promesas de almacenamiento perpetuo).
          </p>
          <p>
            Si la fecha, horario o salón del evento se reprograma, el organizador puede actualizar
            los datos en línea (PRO / Llave en Mano) o solicitar la actualización al canal de
            soporte conservando el mismo enlace sin costo extra por reprogramación.
          </p>
        </section>

        <section className="space-y-2.5 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            5. Pagos, errores atribuibles, cancelaciones y reembolsos
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Formas de pago:</strong> Transferencia bancaria (con el precio promocional
              exhibido) o pago online a través de Mercado Pago Checkout Pro (precio de lista).
            </li>
            <li>
              <strong>Errores atribuibles al servicio:</strong> si la invitación publicada presenta
              fallas técnicas o diferencias respecto a los datos aportados por el cliente,{" "}
              {BUSINESS_CONFIG.brandName} lo corregirá sin cargo a la brevedad.
            </li>
            <li>
              <strong>Cancelaciones y derecho de arrepentimiento:</strong> conforme a la normativa
              argentina aplicable de contratación a distancia y defensa del consumidor, si el
              cliente decide cancelar o ejercer su derecho de revocación dentro de los plazos legales
              aplicables, deberá notificarlo por el canal de soporte con su código de pedido. En
              caso de servicios ya ejecutados o personalizados con conformidad expresa del cliente,
              se evaluará cada solicitud respetando los derechos irrenunciables del consumidor.
            </li>
          </ul>
        </section>

        <section className="space-y-2.5 text-sm leading-relaxed text-[#574046]">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            6. Proveedores externos, soporte y reclamos
          </h2>
          <p>
            El funcionamiento de pagos online, mapas externos (Google Maps), calendario y envío de
            enlaces por WhatsApp depende de servicios de terceros cuyos términos y disponibilidad
            son propios de cada proveedor.
          </p>
          <p>
            Para soporte, consultas o reclamos, utilizá el canal oficial informado en{" "}
            <Link href="/privacidad" className="font-semibold text-[#6B1E30] underline">
              Política de Privacidad
            </Link>
            , indicando tu código de pedido (ej. <code className="font-mono">INV-...</code>).
          </p>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2A121B]/10 pt-5 text-xs text-[#7A5A62]">
          <Link href="/privacidad" className="font-semibold text-[#6B1E30] underline">
            Leer Política de Privacidad
          </Link>
          <Link href="/encargar" className="font-semibold text-[#6B1E30] underline">
            Volver a Encargar
          </Link>
        </footer>
      </main>
    </div>
  );
}
