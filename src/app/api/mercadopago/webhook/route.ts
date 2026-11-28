import crypto from "crypto";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  getEventById,
  getEventByOrderCode,
  markLeadConverted,
  updateEventRecord,
} from "@/lib/db";

function verifyMercadoPagoSignature(
  req: Request,
  paymentId: string,
  secret: string
): boolean {
  const sigHeader = req.headers.get("x-signature") || "";
  const reqId = req.headers.get("x-request-id") || "";
  if (!sigHeader || !reqId) return false;

  const parts = Object.fromEntries(
    sigHeader.split(",").map((part) => {
      const [k, v] = part.split("=").map((s) => s.trim());
      return [k, v];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${paymentId};request-id:${reqId};ts:${ts};`;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(v1, "hex")
    );
  } catch {
    return false;
  }
}

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
    const paymentId = String(dataObj?.id || queryId || "").trim();

    if (topic !== "payment" || !/^[a-zA-Z0-9_-]{1,64}$/.test(paymentId)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const webhookSecret = process.env.MP_WEBHOOK_SECRET?.trim();
    if (webhookSecret && !verifyMercadoPagoSignature(req, paymentId, webhookSecret)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    const eventId = String(payment.external_reference || "").trim();
    if (!eventId) {
      return NextResponse.json({ ok: true, missingReference: true });
    }

    const event =
      (await getEventById(eventId)) || (await getEventByOrderCode(eventId));
    if (!event) {
      return NextResponse.json({ ok: true, eventNotFound: true });
    }

    const resolvedPaymentId = String(payment.id ?? paymentId);

    // Idempotencia: si este mismo pago ya dejó pago acreditado y publicación activa, no duplicar escritura
    if (
      payment.status === "approved" &&
      event.paymentStatus === "pagado" &&
      event.status === "publicada" &&
      event.mpPaymentId === resolvedPaymentId
    ) {
      return NextResponse.json({
        ok: true,
        idempotent: true,
        processed: resolvedPaymentId,
        unlocked: true,
      });
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
        verifiedBy: "mercadopago_webhook",
        verifiedAt: new Date().toISOString(),
        // Activación automática 24/7 sin intervención humana: desbloquea /i/[slug] y panel completo
        status: "publicada",
      });

      await markLeadConverted({
        leadId: event.leadId,
        whatsapp: event.whatsapp,
        orderCode: event.orderCode,
      }).catch(() => {});
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await updateEventRecord(event.id, {
        paymentStatus: "rechazado",
        mpPaymentId: resolvedPaymentId,
      });
    }

    return NextResponse.json({
      ok: true,
      processed: resolvedPaymentId,
      status: payment.status,
      unlocked: payment.status === "approved",
    });
  } catch (err) {
    console.error("Mercado Pago webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
