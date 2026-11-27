"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wand2, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { AnimatedIconBox } from "@/components/AnimatedIconBox";
import { WhatsAppLogoIcon } from "@/components/BrandOrnaments";
import { INVITATION_SKINS, CATEGORY_LABELS, EventCategory } from "@/templates/catalog";
import {
  captureUtmAndLeadFromUrl,
  getOrCreateTesterSessionId,
  getStoredUtms,
  setStoredLeadId,
} from "@/lib/utm";

const DEFAULT_SKIN_BY_CAT: Record<EventCategory, string> = {
  boda: "boda-sobre-marfil",
  xv: "xv-gala-rosa",
  hombre: "hombre-whisky-gold",
  nino: "nino-dino-aventura",
  nina: "nina-reino-pastel",
  bautismo: "bebe-lino-natural",
};

const STUDIO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CONSENT_TEXT_VERSION = "v1-2026";

export function MiniTester() {
  const router = useRouter();
  const [cat, setCat] = useState<EventCategory>("boda");
  const [title, setTitle] = useState("");
  const [guest, setGuest] = useState("");
  const [step, setStep] = useState<"event" | "contact">("event");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false); // DESMARCADO por defecto
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const trackedStepsRef = useRef<Set<string>>(new Set());

  const skinId = DEFAULT_SKIN_BY_CAT[cat];
  const currentSkin = INVITATION_SKINS.find((s) => s.id === skinId);

  const trackFunnelStep = (
    stepName: "step_1" | "step_2" | "step_3" | "step_4" | "generated",
    catOverride?: EventCategory
  ) => {
    const key = `${stepName}:${catOverride || cat}`;
    if (trackedStepsRef.current.has(key)) return;
    trackedStepsRef.current.add(key);

    const utms = getStoredUtms();
    const sessionId = getOrCreateTesterSessionId();
    fetch("/api/funnel-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        source: "minitester",
        step: stepName,
        category: catOverride || cat,
        skinId: DEFAULT_SKIN_BY_CAT[catOverride || cat],
        utmSource: utms.utmSource,
      }),
      keepalive: true,
    }).catch(() => {});
  };

  useEffect(() => {
    captureUtmAndLeadFromUrl();
  }, []);

  const buildDemoUrl = (leadId?: string) => {
    const params = new URLSearchParams();
    if (title.trim()) params.set("evento", title.trim());
    if (guest.trim()) params.set("nombre", guest.trim());
    params.set("pases", "2");
    if (leadId) params.set("leadId", leadId);
    return `/demo/${skinId}?${params.toString()}`;
  };

  const handlePrepareTrial = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    trackFunnelStep("step_3");
    setStep("contact");
  };

  const handleCaptureAndOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const digits = whatsapp.replace(/\D/g, "");
    if (!contactName.trim()) {
      setErrorMsg("Escribí tu nombre para personalizar el envío.");
      return;
    }
    if (digits.length < 8) {
      setErrorMsg("Ingresá tu número de WhatsApp con código de área (ej. 388 412 3456).");
      return;
    }

    trackFunnelStep("step_4");
    setSaving(true);
    try {
      const utms = getStoredUtms();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "prueba_capturada",
          source: "minitester",
          contactName: contactName.trim(),
          whatsapp: whatsapp.trim(),
          category: cat,
          skinId,
          eventTitle: title.trim() || currentSkin?.sample.title,
          guestSample: guest.trim() || undefined,
          consentService: true,
          consentMarketing,
          consentTextVersion: CONSENT_TEXT_VERSION,
          consentSource: "minitester",
          testerStep: "generated",
          utmSource: utms.utmSource,
          utmMedium: utms.utmMedium,
          utmCampaign: utms.utmCampaign,
          utmContent: utms.utmContent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "Revisá el número de WhatsApp e intentá de nuevo.");
        setSaving(false);
        return;
      }
      const leadId = data.leadId ? String(data.leadId) : undefined;
      if (leadId) {
        setStoredLeadId(leadId);
      }
      trackFunnelStep("generated");
      router.push(buildDemoUrl(leadId));
    } catch {
      setErrorMsg("No pudimos guardar tu contacto. Intentá de nuevo.");
      setSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.7, ease: STUDIO_EASE }}
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
    >
      <div className="group relative overflow-hidden rounded-[26px] border border-[#B78A4E]/45 bg-gradient-to-br from-[#FBF1EE] via-[#FFFBFA] to-[#F9F4EE] p-6 shadow-[0_18px_42px_-20px_rgba(74,20,32,0.22)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-20px_rgba(107,30,48,0.28)] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-[20px] border border-[#B78A4E]/15"
        />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="font-ui-jost inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B1E30]">
              <AnimatedIconBox className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B78A4E]/45 bg-white text-[#B78A4E] shadow-sm">
                <Wand2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </AnimatedIconBox>
              Prueba Instantánea Gratis
            </span>
            <h2 className="font-display-cormorant mt-2.5 text-3xl font-semibold leading-tight text-[#2A121B]">
              {step === "event" ? (
                <>
                  Mirá cómo queda con tu nombre en{" "}
                  <span className="italic text-[#6B1E30]">5 segundos</span>
                </>
              ) : (
                <>
                  Tu prueba está lista para{" "}
                  <span className="italic text-[#6B1E30]">abrir el sobre</span>
                </>
              )}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A62]">
              {step === "event"
                ? "Sin tarjetas ni registros largos. Escribí los datos de tu evento y generá tu prueba al instante."
                : "Tu prueba está lista. Para guardarla y recibir el link por WhatsApp, dejanos tu número."}
            </p>
          </div>

          {step === "event" ? (
            <form onSubmit={handlePrepareTrial} className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="font-ui-jost mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5A62]">
                  Tipo de evento
                </label>
                <select
                  value={cat}
                  onChange={(e) => {
                    const nextCat = e.target.value as EventCategory;
                    setCat(nextCat);
                    trackFunnelStep("step_1", nextCat);
                  }}
                  className="w-full rounded-xl border border-[#2A121B]/18 bg-white px-3.5 py-2.5 text-sm font-medium text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
                >
                  {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((k) => (
                    <option key={k} value={k}>
                      {CATEGORY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-ui-jost mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5A62]">
                  Título del evento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      trackFunnelStep("step_2");
                    }
                  }}
                  placeholder={currentSkin?.sample.title || "Ej. Sofía & Lucas"}
                  className="w-full rounded-xl border border-[#2A121B]/18 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
                />
              </div>

              <div>
                <label className="font-ui-jost mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5A62]">
                  Nombre de un invitado (opcional)
                </label>
                <input
                  type="text"
                  value={guest}
                  onChange={(e) => setGuest(e.target.value)}
                  placeholder="Ej. Familia Pérez"
                  className="w-full rounded-xl border border-[#2A121B]/18 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none transition-colors focus:border-[#6B1E30]"
                />
              </div>

              <div className="flex items-end">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold-shimmer inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_26px_-10px_rgba(107,30,48,0.65)]"
                >
                  Generar mi prueba
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </motion.button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleCaptureAndOpen}
              className="flex-1 rounded-2xl border border-[#B78A4E]/35 bg-white/95 p-4 shadow-sm sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Prueba generada ({CATEGORY_LABELS[cat]}
                  {title.trim() ? ` · ${title.trim()}` : ""})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("event");
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A5A62] hover:text-[#2A121B]"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Editar datos
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-ui-jost mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5A62]">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ej. Carolina"
                    className="w-full rounded-xl border border-[#2A121B]/18 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none focus:border-[#6B1E30]"
                  />
                </div>
                <div>
                  <label className="font-ui-jost mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5A62]">
                    Tu WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej. 388 412 3456"
                    className="w-full rounded-xl border border-[#2A121B]/18 bg-white px-3.5 py-2.5 text-sm text-[#2A121B] outline-none focus:border-[#6B1E30]"
                  />
                </div>
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#2A121B]/10 bg-[#FAF8F5] px-3 py-2.5 text-[11px] leading-relaxed text-[#574046]">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#6B1E30]"
                />
                <span>
                  Quiero recibir también ideas, ofertas y novedades de Invita con el Alma por WhatsApp. Puedo darme de baja cuando quiera respondiendo BAJA.
                </span>
              </label>

              {errorMsg && (
                <p role="alert" className="mt-2.5 text-xs font-medium text-red-700">
                  {errorMsg}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold-shimmer inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 disabled:opacity-60"
                >
                  <WhatsAppLogoIcon className="h-4 w-4" />
                  {saving ? "Guardando prueba..." : "Guardar y abrir mi prueba"}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-[#7A5A62]">
                Guardamos el enlace de tu prueba para enviártelo por WhatsApp.
              </p>
            </form>
          )}
        </div>
      </div>
    </motion.section>
  );
}
