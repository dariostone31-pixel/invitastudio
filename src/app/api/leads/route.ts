import { NextResponse } from "next/server";
import {
  listLeads,
  optOutMarketingByPhone,
  upsertLead,
  type LeadStage,
} from "@/lib/db";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { normalizePhone } from "@/lib/phone";
import { getClientIp } from "@/lib/security";

const VALID_STAGES = new Set<LeadStage>([
  "prueba_iniciada",
  "prueba_capturada",
  "encargar_borrador",
  "pedido_creado",
  "entregado",
  "testimonio_pedido",
  "testimonio_recibido",
  "recompra_ofrecida",
]);

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leads-get:${ip}`, 60, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      {
        error:
          auth.reason === "unconfigured"
            ? "Panel de administración no configurado en este entorno."
            : "No autorizado",
      },
      {
        status: auth.reason === "unconfigured" ? 503 : 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const leads = await listLeads();
  return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leads-post:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos seguidos. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const whatsapp = String(body.whatsapp || "").trim();
    const normalized = normalizePhone(whatsapp);
    if (!normalized) {
      return NextResponse.json(
        { error: "Ingresá un número de WhatsApp válido (con código de área)." },
        { status: 400 }
      );
    }

    // Si el usuario envía palabra BAJA, dar de baja marketing inmediatamente
    const rawMsg = String(body.message || body.action || "").trim();
    if (/\bbaja\b/i.test(rawMsg)) {
      const opt = await optOutMarketingByPhone(whatsapp, "leads_post_baja");
      return NextResponse.json(
        { ok: true, optedOut: true, normalizedPhone: opt.normalizedPhone },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const rawStage = String(body.stage || "prueba_capturada") as LeadStage;
    const stage: LeadStage = VALID_STAGES.has(rawStage) ? rawStage : "prueba_capturada";
    const source: "minitester" | "encargar" | "demo" =
      body.source === "encargar" || body.source === "demo" ? body.source : "minitester";

    const contactName = String(body.contactName || "").trim();
    const consentService = body.consentService !== false;
    const consentMarketing = body.consentMarketing === true;

    const lead = await upsertLead({
      id: typeof body.leadId === "string" ? body.leadId : undefined,
      stage,
      source,
      contactName: contactName || "Visitante",
      whatsapp,
      email: typeof body.email === "string" ? body.email : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      skinId: typeof body.skinId === "string" ? body.skinId : undefined,
      planId: typeof body.planId === "string" ? body.planId : undefined,
      eventTitle: typeof body.eventTitle === "string" ? body.eventTitle : undefined,
      guestSample: typeof body.guestSample === "string" ? body.guestSample : undefined,
      consentService,
      consentMarketing,
      consentTextVersion:
        typeof body.consentTextVersion === "string" ? body.consentTextVersion : "v1-2026",
      consentSource:
        typeof body.consentSource === "string" ? body.consentSource : source,
      clientIp: ip,
      utmSource: typeof body.utmSource === "string" ? body.utmSource : undefined,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : undefined,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : undefined,
      utmContent: typeof body.utmContent === "string" ? body.utmContent : undefined,
      testerStep: typeof body.testerStep === "string" ? body.testerStep : undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        normalizedPhone: lead.normalizedPhone,
        consentMarketing: lead.consentMarketing,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("POST /api/leads error:", err);
    return NextResponse.json(
      { error: "No se pudo guardar tu contacto. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
