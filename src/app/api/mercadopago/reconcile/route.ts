import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import {
  listEvents,
  recordAdminAuditLog,
  recordMpWebhookLog,
} from "@/lib/db";
import { applyMpPaymentToOrder, type MpPaymentPayload } from "@/lib/mpOrders";

async function searchPaymentsForReference(
  ref: string,
  accessToken: string
): Promise<MpPaymentPayload[]> {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(ref)}&sort=date_created&criteria=desc&limit=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: MpPaymentPayload[] };
  return Array.isArray(data.results) ? data.results : [];
}

export async function POST(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, error: "MP_ACCESS_TOKEN no configurado en el servidor." },
      { status: 400 }
    );
  }

  const events = await listEvents();
  const pending = events.filter((ev) => ev.paymentStatus !== "pagado");

  let checked = 0;
  let activated = 0;
  const activatedCodes: string[] = [];

  for (const ev of pending.slice(0, 40)) {
    checked += 1;
    let results = await searchPaymentsForReference(ev.id, accessToken);
    if (results.length === 0 && ev.orderCode) {
      results = await searchPaymentsForReference(ev.orderCode, accessToken);
    }
    const approved = results.find((p) => p.status === "approved");
    if (!approved) continue;

    const outcome = await applyMpPaymentToOrder({
      payment: approved,
      source: "mercadopago_reconcile",
      fallbackEvent: ev,
    });

    await recordMpWebhookLog({
      topic: "reconcile",
      dataId: String(approved.id || ev.id),
      paymentId: outcome.resolvedPaymentId || undefined,
      externalReference: ev.id,
      status: outcome.status,
      amount: outcome.amount,
      firmaOk: true,
      manifestUsed: "reconcile",
      montoOk: outcome.montoOk,
      resultado: outcome.resultado,
      detalle: `Reconciliación manual admin (${ev.orderCode})`,
    }).catch(() => {});

    if (outcome.resultado === "activada") {
      activated += 1;
      activatedCodes.push(ev.orderCode);
    }
  }

  await recordAdminAuditLog({
    action: "mp_reconcile",
    rowCount: activated,
    meta: `Revisados=${checked}, Activados=${activated} (${activatedCodes.join(", ") || "ninguno"})`,
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    checked,
    activated,
    activatedCodes,
  });
}
