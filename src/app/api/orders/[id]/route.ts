import { NextResponse } from "next/server";
import { recordAdminAuditLog, updateEventRecord } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, pickAllowedAdminPatch } from "@/lib/security";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-patch:${ip}`, 60, 10 * 60_000);
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

  const { id } = await context.params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const safePatch = pickAllowedAdminPatch(body);
    if (safePatch.paymentStatus === "pagado") {
      safePatch.verifiedBy = "admin";
      safePatch.verifiedAt = new Date().toISOString();
    }
    const updated = await updateEventRecord(id, safePatch);
    if (!updated) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    if (safePatch.paymentStatus === "pagado") {
      await recordAdminAuditLog({
        actor: "admin",
        action: "verify_payment",
        rowCount: 1,
        meta: `order=${updated.orderCode}`,
      }).catch(() => {});
    }
    return NextResponse.json(
      { ok: true, order: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Error actualizando pedido" }, { status: 500 });
  }
}
