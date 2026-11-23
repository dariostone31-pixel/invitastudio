import { NextResponse } from "next/server";
import { getEventByOrderCode } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderCode, email } = await req.json();
    const cleanCode = String(orderCode || "").trim().toUpperCase();
    const cleanEmail = String(email || "").trim().toLowerCase();

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
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      panelToken: event.panelToken,
      eventTitle: event.eventTitle,
      orderCode: event.orderCode,
      slug: event.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo verificar tu pedido. Intentá nuevamente." },
      { status: 500 }
    );
  }
}
