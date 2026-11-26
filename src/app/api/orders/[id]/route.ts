import { NextResponse } from "next/server";
import { updateEventRecord } from "@/lib/db";
import { verifyAdminPass } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, pickAllowedAdminPatch } from "@/lib/security";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-patch:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Esperá unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const pass = req.headers.get("x-admin-pass");
  const auth = verifyAdminPass(pass);
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
    const updated = await updateEventRecord(id, safePatch);
    if (!updated) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json(
      { ok: true, order: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Error actualizando pedido" }, { status: 500 });
  }
}
