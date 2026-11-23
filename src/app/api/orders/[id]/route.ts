import { NextResponse } from "next/server";
import { updateEventRecord } from "@/lib/db";
import { verifyAdminPass } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
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
