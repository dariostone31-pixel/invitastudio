import { NextResponse } from "next/server";
import {
  getEventById,
  getEventByOrderCode,
  getEventByPanelToken,
} from "@/lib/db";
import { applyMpPaymentToOrder, fetchMpPaymentById } from "@/lib/mpOrders";

/**
 * Verificación server-side al volver desde Mercado Pago Checkout Pro.
 * Nunca confía en parámetros del navegador: consulta directamente a Mercado Pago API
 * con MP_ACCESS_TOKEN, valida referencia + monto exacto del plan, y si figura "approved"
 * desbloquea de inmediato paymentStatus="pagado" + status="publicada".
 */
export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      return NextResponse.json({ ok: false, configured: false }, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentId = String(body.paymentId || "").trim();
    const orderCode = String(body.orderCode || "").trim();
    const panelToken = String(body.panelToken || "").trim();

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(paymentId)) {
      return NextResponse.json({ ok: false, invalidPaymentId: true }, { status: 400 });
    }

    const paymentRes = await fetchMpPaymentById(paymentId, accessToken);
    if (!paymentRes.ok) {
      if (paymentRes.notFound) {
        return NextResponse.json({ ok: false, paymentNotFound: true }, { status: 404 });
      }
      return NextResponse.json(
        { ok: false, error: "Error consultando Mercado Pago" },
        { status: 500 }
      );
    }

    const payment = paymentRes.payment;
    const externalRef = String(payment.external_reference || "").trim();
    const fallbackEvent =
      (externalRef ? await getEventById(externalRef) : undefined) ||
      (externalRef ? await getEventByOrderCode(externalRef) : undefined) ||
      (panelToken ? await getEventByPanelToken(panelToken) : undefined) ||
      (orderCode ? await getEventByOrderCode(orderCode) : undefined);

    if (!fallbackEvent) {
      return NextResponse.json({ ok: false, eventNotFound: true }, { status: 404 });
    }

    if (
      externalRef &&
      externalRef !== fallbackEvent.id &&
      externalRef !== fallbackEvent.orderCode
    ) {
      return NextResponse.json({ ok: false, referenceMismatch: true }, { status: 403 });
    }

    const outcome = await applyMpPaymentToOrder({
      payment,
      fallbackPaymentId: paymentId,
      source: "mercadopago_return_verified",
      fallbackEvent,
    });

    if (outcome.resultado === "activada" || outcome.resultado === "duplicado") {
      return NextResponse.json({
        ok: true,
        approved: true,
        unlocked: true,
        slug: fallbackEvent.slug,
        panelToken: fallbackEvent.panelToken,
      });
    }

    return NextResponse.json({
      ok: true,
      approved: false,
      resultado: outcome.resultado,
      status: outcome.status || "pending",
    });
  } catch (err) {
    console.error("Mercado Pago verify-return error:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo verificar el pago" },
      { status: 500 }
    );
  }
}
