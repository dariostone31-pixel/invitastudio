import { NextResponse } from "next/server";
import { getEventByOrderCode, getEventBySlug } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = String(url.searchParams.get("slug") || "").trim();
  const orderCode = String(url.searchParams.get("orderCode") || "").trim();

  if (!slug && !orderCode) {
    return NextResponse.json(
      { ok: false, error: "Indicá slug u orderCode" },
      { status: 400 }
    );
  }

  const event = slug
    ? await getEventBySlug(slug)
    : await getEventByOrderCode(orderCode);

  if (!event) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
  }

  const pagado = event.paymentStatus === "pagado" && event.status === "publicada";

  return NextResponse.json(
    {
      ok: true,
      pagado,
      paymentStatus: event.paymentStatus,
      status: event.status,
      slug: event.slug,
      orderCode: event.orderCode,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
