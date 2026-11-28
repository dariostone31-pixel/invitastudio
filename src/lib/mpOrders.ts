import { PRICING_PLANS } from "@/config/business";
import {
  type EventRecord,
  getEventById,
  getEventByOrderCode,
  markLeadConverted,
  updateEventRecord,
} from "@/lib/db";

export interface MpPaymentPayload {
  id?: string | number;
  status?: string;
  transaction_amount?: number;
  external_reference?: string;
}

export function getExpectedPlanPrice(planId: string): number | null {
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  return plan ? plan.listPriceNum : null;
}

export function isExactPlanAmount(planId: string, amount: unknown): boolean {
  const expected = getExpectedPlanPrice(planId);
  if (expected === null) return false;
  const num = Number(amount);
  if (!Number.isFinite(num)) return false;
  return Math.round(num) === expected;
}

export async function resolvePaymentIdFromMerchantOrder(
  merchantOrderId: string,
  accessToken: string
): Promise<{ ok: true; paymentId?: string; notFound?: boolean } | { ok: false; status: number }> {
  const res = await fetch(
    `https://api.mercadopago.com/merchant_orders/${encodeURIComponent(merchantOrderId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  if (res.status === 404) {
    return { ok: true, notFound: true };
  }
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const order = (await res.json()) as {
    payments?: Array<{ id?: string | number; status?: string }>;
  };
  const payments = Array.isArray(order.payments) ? order.payments : [];
  if (payments.length === 0) {
    return { ok: true, paymentId: undefined };
  }
  const approved = payments.find((p) => p.status === "approved" && p.id !== undefined);
  const chosen = approved || payments[payments.length - 1];
  return {
    ok: true,
    paymentId: chosen?.id !== undefined ? String(chosen.id) : undefined,
  };
}

export async function fetchMpPaymentById(
  paymentId: string,
  accessToken: string
): Promise<
  | { ok: true; payment: MpPaymentPayload }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false; status: number }
> {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  if (res.status === 404) {
    return { ok: false, notFound: true };
  }
  if (!res.ok) {
    return { ok: false, notFound: false, status: res.status };
  }
  const payment = (await res.json()) as MpPaymentPayload;
  return { ok: true, payment };
}

export async function applyMpPaymentToOrder(params: {
  payment: MpPaymentPayload;
  fallbackPaymentId?: string;
  source: "mercadopago_webhook" | "mercadopago_reconcile" | "mercadopago_return_verified";
  fallbackEvent?: EventRecord;
}): Promise<{
  resultado:
    | "activada"
    | "duplicado"
    | "reverso_desactivado"
    | "ignorado_estado"
    | "monto_invalido"
    | "pedido_inexistente"
    | "sin_referencia";
  event?: EventRecord;
  resolvedPaymentId: string;
  montoOk: boolean;
  amount?: number;
  status: string;
  externalReference: string;
}> {
  const { payment, fallbackPaymentId, source, fallbackEvent } = params;
  const resolvedPaymentId = String(payment.id ?? fallbackPaymentId ?? "").trim();
  const status = String(payment.status || "").trim();
  const externalReference = String(payment.external_reference || "").trim();
  const amount =
    typeof payment.transaction_amount === "number"
      ? Math.round(payment.transaction_amount)
      : undefined;

  let event = fallbackEvent;
  if (externalReference) {
    event =
      (await getEventById(externalReference)) ||
      (await getEventByOrderCode(externalReference)) ||
      fallbackEvent;
  }

  if (!externalReference && !event) {
    return {
      resultado: "sin_referencia",
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  if (!event) {
    return {
      resultado: "pedido_inexistente",
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  // Seguridad: si el pago trae external_reference, debe coincidir con el pedido
  if (
    externalReference &&
    externalReference !== event.id &&
    externalReference !== event.orderCode
  ) {
    return {
      resultado: "pedido_inexistente",
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  // Reversos / contracargos / cancelaciones / rechazos
  if (
    status === "refunded" ||
    status === "charged_back" ||
    status === "cancelled" ||
    status === "rejected"
  ) {
    const shouldDeactivate =
      event.mpPaymentId === resolvedPaymentId ||
      event.paymentMethod === "mercadopago" ||
      event.paymentStatus === "pagado";

    if (shouldDeactivate) {
      await updateEventRecord(event.id, {
        paymentStatus: "rechazado",
        status: "pendiente",
        mpPaymentId: resolvedPaymentId,
        verifiedBy: `${source}_reverso`,
        verifiedAt: new Date().toISOString(),
      });
    }
    return {
      resultado: "reverso_desactivado",
      event,
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  if (status !== "approved") {
    return {
      resultado: "ignorado_estado",
      event,
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  // Regla 3: validar monto exacto del plan antes de activar
  const montoOk = isExactPlanAmount(event.planId, payment.transaction_amount);
  if (!montoOk) {
    return {
      resultado: "monto_invalido",
      event,
      resolvedPaymentId,
      montoOk: false,
      amount,
      status,
      externalReference,
    };
  }

  // Idempotencia: ya estaba pagada y publicada por este mismo pago
  if (
    event.paymentStatus === "pagado" &&
    event.status === "publicada" &&
    event.mpPaymentId === resolvedPaymentId
  ) {
    return {
      resultado: "duplicado",
      event,
      resolvedPaymentId,
      montoOk: true,
      amount,
      status,
      externalReference,
    };
  }

  const updated = await updateEventRecord(event.id, {
    paymentStatus: "pagado",
    paymentMethod: "mercadopago",
    mpPaymentId: resolvedPaymentId,
    paidAmount: amount,
    verifiedBy: source,
    verifiedAt: new Date().toISOString(),
    status: "publicada",
  });

  await markLeadConverted({
    leadId: event.leadId,
    whatsapp: event.whatsapp,
    orderCode: event.orderCode,
  }).catch(() => {});

  return {
    resultado: "activada",
    event: updated || event,
    resolvedPaymentId,
    montoOk: true,
    amount,
    status,
    externalReference,
  };
}
