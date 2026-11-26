import { NextResponse } from "next/server";
import { getEventByOrderCode } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`recover:${ip}`, 8, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá unos minutos antes de volver a consultar." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const { orderCode, email } = await req.json();
    const cleanCode = String(orderCode || "").trim().toUpperCase().slice(0, 30);
    const cleanEmail = String(email || "").trim().toLowerCase().slice(0, 140);

    if (!cleanCode || !cleanEmail) {
      return NextResponse.json(
        { error: "Ingresá tu código de pedido (ej. INV-1008) y tu email." },
        { status: 400 }
      );
    }

    const event = await getEventByOrderCode(cleanCode);
    if (!event || event.email.trim().toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { error: "No encontramos un pedido que coincida con ese código y email." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        panelToken: event.panelToken,
        eventTitle: event.eventTitle,
        orderCode: event.orderCode,
        slug: event.slug,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo verificar tu pedido. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
