import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { BUSINESS_CONFIG } from "@/config/business";
import {
  ACTIVE_PROVIDERS,
  LEGAL_STATUS,
  LEGAL_UPDATED_AT,
  LEGAL_VERSION,
} from "@/config/legal";

export const metadata: Metadata = {
  title: `Política de Privacidad — ${BUSINESS_CONFIG.brandName}`,
  description:
    "Información transparente sobre qué datos recoge Invita con el Alma, cómo los protege y qué rol cumple cada parte.",
};

export default function PrivacidadPage() {
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
            <ShieldCheck className="h-4 w-4" />
            Transparencia y Datos Personales
          </div>
          <h1 className="font-display-cormorant text-4xl font-semibold text-[#2A121B] sm:text-5xl">
            Política de Privacidad
          </h1>
          <p className="text-sm leading-relaxed text-[#7A5A62]">
            Este documento describe qué datos personales se recogen y procesan efectivamente en{" "}
            <strong className="text-[#2A121B]">{BUSINESS_CONFIG.brandName}</strong>, quién accede a
            ellos y qué servicios externos intervienen.
          </p>

          {(LEGAL_STATUS.isDraftPendingReview ||
            LEGAL_STATUS.missingProviderFields.length > 0) && (
            <div
              role="note"
              className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"
            >
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                <div>
                  <strong>Aviso pendiente de datos del responsable:</strong>{" "}
                  {LEGAL_STATUS.missingProviderFields.join(" · ")}.
                </div>
              </div>
            </div>
          )}
        </header>

        <section className="space-y-2.5">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            1. Identidad, roles y contacto del responsable
          </h2>
          <p className="text-sm leading-relaxed text-[#574046]">
            En la organización de cada evento intervienen dos roles diferenciados:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#574046]">
            <li>
              <strong>El Organizador del Evento (cliente que contrata):</strong> define qué datos
              publica en su invitación, a quién comparte el enlace y cómo administra las
              confirmaciones de asistencia (RSVP), acompañantes y menús especiales de sus invitados.
            </li>
            <li>
              <strong>{BUSINESS_CONFIG.brandName} (prestador técnico de la plataforma):</strong>{" "}
              provee la infraestructura web para crear la invitación, alojar las fotos cargadas por
              el organizador y registrar las confirmaciones enviadas por sus invitados.
            </li>
          </ul>
          <div className="mt-3 rounded-2xl border border-[#2A121B]/10 bg-[#FAF8F5] p-4 text-xs leading-relaxed text-[#574046]">
            <p>
              <strong>Responsable / Titular:</strong> {BUSINESS_CONFIG.legalHolderName}
            </p>
            {BUSINESS_CONFIG.taxId ? (
              <p>
                <strong>Identificación fiscal (CUIT):</strong> {BUSINESS_CONFIG.taxId}
              </p>
            ) : null}
            <p>
              <strong>Sede / Jurisdicción:</strong> {BUSINESS_CONFIG.legalAddress}
            </p>
            {BUSINESS_CONFIG.supportEmail ? (
              <p>
                <strong>Email de privacidad y soporte:</strong> {BUSINESS_CONFIG.supportEmail}
              </p>
            ) : null}
            <p>
              <strong>WhatsApp de atención:</strong> {BUSINESS_CONFIG.whatsappDisplay}
            </p>
            <p>
              <strong>Horario de atención:</strong> {BUSINESS_CONFIG.supportHours}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            2. Qué datos tratamos y quién puede verlos
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#2A121B]/12">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF1EE] text-[#6B1E30]">
                <tr>
                  <th className="px-3.5 py-2.5 font-bold">Categoría de datos</th>
                  <th className="px-3.5 py-2.5 font-bold">Qué se recoge realmente</th>
                  <th className="px-3.5 py-2.5 font-bold">Quién accede</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A121B]/10 text-[#574046]">
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Comprador / Organizador
                  </td>
                  <td className="px-3.5 py-2.5">
                    Nombre, WhatsApp, correo electrónico, comentarios del pedido, versión de
                    condiciones y fecha UTC de aceptación.
                  </td>
                  <td className="px-3.5 py-2.5">
                    Privado: soporte operativo / producción de {BUSINESS_CONFIG.brandName}. No se
                    publica en la invitación ni en metadata pública.
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Contenido del evento
                  </td>
                  <td className="px-3.5 py-2.5">
                    Título, fecha, horario, salón, dirección, código de vestimenta, frase, padres/anfitriones,
                    historia, itinerario, alias/CBU opcional y fotografías cargadas.
                  </td>
                  <td className="px-3.5 py-2.5">
                    Visible para toda persona que reciba el enlace de la invitación (las páginas
                    llevan etiqueta <code className="font-mono">noindex</code> para desalentar
                    indexación en buscadores).
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Confirmación (RSVP)
                  </td>
                  <td className="px-3.5 py-2.5">
                    Nombre, asistencia, cantidad de lugares, acompañantes (opcional) y canción sugerida (opcional).
                  </td>
                  <td className="px-3.5 py-2.5">
                    Privado del organizador (en su Panel y exportación CSV) y soporte si asiste al evento.
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Restricciones alimentarias y alergias
                  </td>
                  <td className="px-3.5 py-2.5">
                    Opciones opcionales como Sin TACC / Celíaco, Vegetariano, Vegano, Menú Infantil
                    o Sin lactosa / Alergia. Pueden vincularse con información de salud.
                  </td>
                  <td className="px-3.5 py-2.5">
                    Privado exclusivo del organizador en su panel (protegido por token del panel).
                    <strong> Nunca se muestran en la invitación pública.</strong>
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Buenos Deseos (mensaje opcional)
                  </td>
                  <td className="px-3.5 py-2.5">
                    Dedicatoria escrita voluntariamente por el invitado en el formulario RSVP.
                  </td>
                  <td className="px-3.5 py-2.5">
                    Si el organizador mantiene activo el módulo &ldquo;Muro de Buenos Deseos&rdquo;,
                    el mensaje y nombre del firmante se muestran dentro de la invitación a quienes
                    abran el enlace.
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-[#2A121B]">
                    Pagos
                  </td>
                  <td className="px-3.5 py-2.5">
                    Estado, método elegido, identificador de preferencia/pago de Mercado Pago e
                    importe abonado.
                  </td>
                  <td className="px-3.5 py-2.5">
                    <strong>{BUSINESS_CONFIG.brandName} no recibe ni almacena números de tarjeta.</strong>{" "}
                    Los pagos con tarjeta se procesan íntegramente en Mercado Pago.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            3. Finalidades y base del tratamiento
          </h2>
          <p className="text-sm leading-relaxed text-[#574046]">
            Utilizamos los datos exclusivamente para crear, personalizar y mantener operativa la
            invitación contratada, gestionar la lista de invitados del organizador y brindar soporte
            técnico. <strong>No utilizamos los datos de invitados ni restricciones alimentarias para
            publicidad, envío de spam ni cesión comercial a terceros.</strong>
          </p>
          <p className="text-sm leading-relaxed text-[#574046]">
            <strong>Fotografías y datos de menores:</strong> en eventos infantiles o familiares
            (cumpleaños, bautismos, XV años), quien carga fotografías o registra acompañantes
            menores declara contar con la autorización correspondiente de sus progenitores o
            representantes legales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            4. Proveedores y servicios externos efectivamente utilizados
          </h2>
          <div className="space-y-2.5">
            {ACTIVE_PROVIDERS.map((prov) => (
              <div
                key={prov.name}
                className="rounded-2xl border border-[#2A121B]/10 bg-[#FAF8F5] p-4 text-xs leading-relaxed text-[#574046]"
              >
                <p className="font-bold text-[#2A121B]">{prov.name}</p>
                <p className="mt-1">
                  <strong>Servicio:</strong> {prov.role}
                </p>
                <p>
                  <strong>Datos tratados:</strong> {prov.dataShared}
                </p>
                <p>
                  <strong>Ubicación / Transferencia:</strong> {prov.transferNote}
                </p>
                <a
                  href={prov.policyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-semibold text-[#6B1E30] underline"
                >
                  Política de privacidad del proveedor
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            5. Cookies, almacenamiento local y analítica
          </h2>
          <p className="text-sm leading-relaxed text-[#574046]">
            De acuerdo con la inspección técnica del código fuente actual, la aplicación{" "}
            <strong>no instala cookies publicitarias ni scripts de analítica de terceros</strong> y
            no persiste datos personales en <code className="font-mono">localStorage</code> ni{" "}
            <code className="font-mono">sessionStorage</code>. Si en el futuro se incorporan
            herramientas de analítica o seguimiento no esenciales, esta política se actualizará y se
            implementará el mecanismo de consentimiento previo que corresponda.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="font-display-cormorant text-2xl font-semibold text-[#2A121B]">
            6. Conservación, eliminación, derechos y seguridad
          </h2>
          <p className="text-sm leading-relaxed text-[#574046]">
            <strong>Conservación de datos:</strong> los datos del evento e imágenes permanecen
            almacenados mientras la invitación siga activa o hasta que el organizador solicite su
            baja o modificación por el canal de soporte (sujeto a copias de respaldo técnicas del
            proveedor de base de datos).
          </p>
          <p className="text-sm leading-relaxed text-[#574046]">
            <strong>Derechos de acceso, rectificación y supresión (Ley 25.326, Argentina):</strong>{" "}
            los titulares de datos pueden solicitar acceso, actualización o eliminación escribiendo
            al canal oficial de soporte del responsable indicado arriba, indicando el nombre del
            evento o código de pedido.
          </p>
          <p className="text-sm leading-relaxed text-[#574046]">
            <strong>Protección general:</strong> utilizamos conexiones cifradas HTTPS en producción,
            separación entre la invitación pública y el panel del organizador mediante token
            privado, validación de acceso administrativo y sanitización en descargas CSV.
          </p>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2A121B]/10 pt-5 text-xs text-[#7A5A62]">
          <Link href="/condiciones" className="font-semibold text-[#6B1E30] underline">
            Ver Condiciones del Servicio
          </Link>
          <Link href="/encargar" className="font-semibold text-[#6B1E30] underline">
            Ir al formulario de pedido
          </Link>
        </footer>
      </main>
    </div>
  );
}
