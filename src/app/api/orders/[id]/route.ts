import { NextResponse } from "next/server";
import { updateEventRecord } from "@/lib/db";
import { BUSINESS_CONFIG } from "@/config/business";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const pass = req.headers.get("x-admin-pass");
  if (pass !== BUSINESS_CONFIG.adminPasscode) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = await updateEventRecord(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Error actualizando pedido" }, { status: 500 });
  }
}
