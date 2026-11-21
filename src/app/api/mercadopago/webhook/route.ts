import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getEventById, updateEventRecord } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "mercadopago-webhook" });
}

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      return NextResponse.json({ ok: true, ignored: "MP_ACCESS_TOKEN not configured" });
    }

    const url = new URL(req.url);
    const queryTopic = url.searchParams.get("topic") || url.searchParams.get("type");
    const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      // query-only notification
    }

    const topic = String(body.type || body.topic || queryTopic || "");
    const dataObj = body.data as Record<string, unknown> | undefined;
    const paymentId = String(dataObj?.id || queryId || "");

    if (topic !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    const eventId = payment.external_reference;
    if (!eventId) {
      return NextResponse.json({ ok: true, missingReference: true });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ ok: true, eventNotFound: true });
    }

    const resolvedPaymentId = String(payment.id ?? paymentId);

    // Idempotencia: si este mismo pago ya acreditó el pedido, no duplicar escritura
    if (
      payment.status === "approved" &&
      event.paymentStatus === "pagado" &&
      event.mpPaymentId === resolvedPaymentId
    ) {
      return NextResponse.json({ ok: true, idempotent: true, processed: resolvedPaymentId });
    }

    if (payment.status === "approved") {
      await updateEventRecord(event.id, {
        paymentStatus: "pagado",
        paymentMethod: "mercadopago",
        mpPaymentId: resolvedPaymentId,
        paidAmount:
          typeof payment.transaction_amount === "number"
            ? Math.round(payment.transaction_amount)
            : undefined,
        status: event.status === "pendiente" ? "en_edicion" : event.status,
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await updateEventRecord(event.id, {
        paymentStatus: "rechazado",
        mpPaymentId: resolvedPaymentId,
      });
    }

    return NextResponse.json({ ok: true, processed: resolvedPaymentId, status: payment.status });
  } catch (err) {
    console.error("Mercado Pago webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
