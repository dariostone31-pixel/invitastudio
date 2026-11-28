import { NextResponse } from "next/server";
import { recordMpWebhookLog } from "@/lib/db";
import {
  applyMpPaymentToOrder,
  fetchMpPaymentById,
  resolvePaymentIdFromMerchantOrder,
} from "@/lib/mpOrders";
import { cleanMpSecret, verifyMpSignature } from "@/lib/mpSignature";

export async function GET() {
  const tokenCargado = Boolean(process.env.MP_ACCESS_TOKEN?.trim());
  const secretoCargado = cleanMpSecret(process.env.MP_WEBHOOK_SECRET).length > 0;
  return NextResponse.json({
    ok: true,
    endpoint: "mercadopago-webhook",
    tokenCargado,
    secretoCargado,
  });
}

export async function POST(req: Request) {
  let topic = "";
  let dataId = "";

  try {
    const url = new URL(req.url);
    const queryTopic = url.searchParams.get("topic") || url.searchParams.get("type");
    const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      // query-only notification
    }

    topic = String(body.type || body.topic || queryTopic || "").trim();
    const dataObj = body.data as Record<string, unknown> | undefined;
    dataId = String(queryId || dataObj?.id || "").trim();

    // Control 1: SIEMPRE verificar firma HMAC antes de procesar o consultar MP.
    // Si falta MP_WEBHOOK_SECRET, x-signature, data.id o la firma no coincide -> 401.
    const sigCheck = verifyMpSignature({
      signature: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET,
    });

    if (!sigCheck.ok) {
      await recordMpWebhookLog({
        topic: topic || "desconocido",
        dataId: dataId || "sin_id",
        firmaOk: false,
        montoOk: false,
        resultado: "firma_invalida",
        detalle: sigCheck.reason,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Firma inválida", reason: sigCheck.reason },
        { status: 401 }
      );
    }

    if (
      (topic !== "payment" && topic !== "merchant_order") ||
      !/^[a-zA-Z0-9_-]{1,64}$/.test(dataId)
    ) {
      await recordMpWebhookLog({
        topic: topic || "vacio",
        dataId: dataId || "sin_id",
        firmaOk: true,
        manifestUsed: sigCheck.manifest,
        montoOk: false,
        resultado: "ignorado_topic",
      }).catch(() => {});
      return NextResponse.json({ ok: true, ignored: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    if (!accessToken) {
      await recordMpWebhookLog({
        topic,
        dataId,
        firmaOk: true,
        manifestUsed: sigCheck.manifest,
        montoOk: false,
        resultado: "error_token_faltante",
        detalle: "MP_ACCESS_TOKEN no configurado",
      }).catch(() => {});
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN no configurado" },
        { status: 500 }
      );
    }

    // Pozo 5: merchant_order -> resolver paymentId consultando /merchant_orders/{id}
    let paymentId = dataId;
    if (topic === "merchant_order") {
      const orderLookup = await resolvePaymentIdFromMerchantOrder(dataId, accessToken);
      if (!orderLookup.ok) {
        await recordMpWebhookLog({
          topic,
          dataId,
          firmaOk: true,
          manifestUsed: sigCheck.manifest,
          montoOk: false,
          resultado: "error_mp_merchant_order",
          detalle: `HTTP ${orderLookup.status}`,
        }).catch(() => {});
        return NextResponse.json(
          { error: "Error consultando merchant_order" },
          { status: 500 }
        );
      }
      if (orderLookup.notFound || !orderLookup.paymentId) {
        await recordMpWebhookLog({
          topic,
          dataId,
          firmaOk: true,
          manifestUsed: sigCheck.manifest,
          montoOk: false,
          resultado: orderLookup.notFound ? "pago_inexistente" : "merchant_order_sin_pagos",
        }).catch(() => {});
        return NextResponse.json({
          ok: true,
          ignored: true,
          reason: orderLookup.notFound ? "pago_inexistente" : "merchant_order_sin_pagos",
        });
      }
      paymentId = orderLookup.paymentId;
    }

    // Control 2: releer el pago real en GET /v1/payments/{id}
    const paymentRes = await fetchMpPaymentById(paymentId, accessToken);
    if (!paymentRes.ok) {
      if (paymentRes.notFound) {
        // Pozo 4: MP devuelve 404 en "Simular notificación" del panel -> responder 200
        await recordMpWebhookLog({
          topic,
          dataId,
          paymentId,
          firmaOk: true,
          manifestUsed: sigCheck.manifest,
          montoOk: false,
          resultado: "pago_inexistente",
          detalle: "GET /v1/payments devolvió 404 (simulación o pago inexistente)",
        }).catch(() => {});
        return NextResponse.json({ ok: true, resultado: "pago_inexistente" });
      }

      await recordMpWebhookLog({
        topic,
        dataId,
        paymentId,
        firmaOk: true,
        manifestUsed: sigCheck.manifest,
        montoOk: false,
        resultado: "error_mp_api",
        detalle: `HTTP ${paymentRes.status}`,
      }).catch(() => {});
      return NextResponse.json({ error: "Error consultando MP" }, { status: 500 });
    }

    // Control 3: aplicar reglas de negocio (referencia, monto exacto, reversos, idempotencia)
    const outcome = await applyMpPaymentToOrder({
      payment: paymentRes.payment,
      fallbackPaymentId: paymentId,
      source: "mercadopago_webhook",
    });

    await recordMpWebhookLog({
      topic,
      dataId,
      paymentId: outcome.resolvedPaymentId || paymentId,
      externalReference: outcome.externalReference || undefined,
      status: outcome.status || undefined,
      amount: outcome.amount,
      firmaOk: true,
      manifestUsed: sigCheck.manifest,
      montoOk: outcome.montoOk,
      resultado: outcome.resultado,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      resultado: outcome.resultado,
      processed: outcome.resolvedPaymentId || paymentId,
      status: outcome.status,
      unlocked:
        outcome.resultado === "activada" || outcome.resultado === "duplicado",
    });
  } catch (err) {
    console.error("Mercado Pago webhook error:", err);
    await recordMpWebhookLog({
      topic: topic || "error",
      dataId: dataId || "sin_id",
      firmaOk: false,
      montoOk: false,
      resultado: "error_interno",
      detalle: err instanceof Error ? err.message : "Error inesperado",
    }).catch(() => {});
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
