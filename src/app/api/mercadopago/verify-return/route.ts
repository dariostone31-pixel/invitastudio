import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  getEventById,
  getEventByOrderCode,
  getEventByPanelToken,
  markLeadConverted,
  updateEventRecord,
} from "@/lib/db";

/**
 * Verificación server-side al volver desde Mercado Pago Checkout Pro.
 * Nunca confía en parámetros del navegador: consulta directamente a Mercado Pago API
 * con MP_ACCESS_TOKEN y, si el pago figura "approved", desbloquea de inmediato
 * paymentStatus="pagado" + status="publicada" sin esperar al webhook.
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

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    const externalRef = String(payment.external_reference || "").trim();
    const event =
      (externalRef ? await getEventById(externalRef) : undefined) ||
      (externalRef ? await getEventByOrderCode(externalRef) : undefined) ||
      (panelToken ? await getEventByPanelToken(panelToken) : undefined) ||
      (orderCode ? await getEventByOrderCode(orderCode) : undefined);

    if (!event) {
      return NextResponse.json({ ok: false, eventNotFound: true }, { status: 404 });
    }

    // Seguridad: exigir coincidencia con external_reference cuando está presente
    if (
      externalRef &&
      externalRef !== event.id &&
      externalRef !== event.orderCode
    ) {
      return NextResponse.json({ ok: false, referenceMismatch: true }, { status: 403 });
    }

    const resolvedPaymentId = String(payment.id ?? paymentId);

    if (payment.status === "approved") {
      if (
        event.paymentStatus !== "pagado" ||
        event.status !== "publicada" ||
        event.mpPaymentId !== resolvedPaymentId
      ) {
        await updateEventRecord(event.id, {
          paymentStatus: "pagado",
          paymentMethod: "mercadopago",
          mpPaymentId: resolvedPaymentId,
          paidAmount:
            typeof payment.transaction_amount === "number"
              ? Math.round(payment.transaction_amount)
              : undefined,
          verifiedBy: "mercadopago_return_verified",
          verifiedAt: new Date().toISOString(),
          status: "publicada",
        });

        await markLeadConverted({
          leadId: event.leadId,
          whatsapp: event.whatsapp,
          orderCode: event.orderCode,
        }).catch(() => {});
      }

      return NextResponse.json({
        ok: true,
        approved: true,
        unlocked: true,
        slug: event.slug,
        panelToken: event.panelToken,
      });
    }

    return NextResponse.json({
      ok: true,
      approved: false,
      status: payment.status || "pending",
    });
  } catch (err) {
    console.error("Mercado Pago verify-return error:", err);
    return NextResponse.json({ ok: false, error: "No se pudo verificar el pago" }, { status: 500 });
  }
}
