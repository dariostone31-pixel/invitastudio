import { NextResponse } from "next/server";
import {
  deleteLeadById,
  getLeadById,
  optOutMarketingByPhone,
  recordAdminAuditLog,
  updateLeadStage,
  type LeadStage,
} from "@/lib/db";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leads-patch:${ip}`, 60, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as {
    stage?: string;
    optOut?: boolean;
  };

  if (body.optOut === true) {
    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }
    await optOutMarketingByPhone(lead.whatsapp, "admin_baja");
    const updated = await getLeadById(id);
    return NextResponse.json(
      { ok: true, lead: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (typeof body.stage === "string" && VALID_STAGES.has(body.stage as LeadStage)) {
    const updated = await updateLeadStage(id, body.stage as LeadStage);
    if (!updated) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }
    return NextResponse.json(
      { ok: true, lead: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
}

/**
 * Derecho de supresión de datos personales (Ley 25.326, art. 16 — Argentina).
 * Elimina definitivamente el registro del lead y deja constancia en admin_audit_log.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leads-del:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
  }

  const { id } = await context.params;
  const deleted = await deleteLeadById(id);
  if (!deleted) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  await recordAdminAuditLog({
    actor: "admin",
    action: "delete_lead",
    rowCount: 1,
    meta: `Supresión de datos personales (Ley 25.326, art. 16) leadId=${id}`,
  });

  return NextResponse.json(
    {
      ok: true,
      deletedId: id,
      message: "Supresión de datos personales completada (Ley 25.326, art. 16).",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
