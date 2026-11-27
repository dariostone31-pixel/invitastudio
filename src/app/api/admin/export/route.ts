import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import {
  isVerifiedPaidOrder,
  listEvents,
  listFunnelEvents,
  listLeads,
  listRsvpsForSlug,
  recordAdminAuditLog,
} from "@/lib/db";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { PRICING_PLANS } from "@/config/business";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

function safeCell(val: string | number | boolean): string | number {
  if (typeof val === "number") return val;
  let raw = String(val ?? "");
  if (/^[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  return raw;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-export:${ip}`, 15, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas descargas seguidas." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason === "unconfigured" ? "Admin no configurado" : "No autorizado" },
      { status: auth.reason === "unconfigured" ? 503 : 401 }
    );
  }

  const [events, leads, funnelEvents] = await Promise.all([
    listEvents(),
    listLeads(),
    listFunnelEvents(),
  ]);
  const rsvpCounts = new Map<string, number>();
  await Promise.all(
    events.map(async (ev) => {
      const rsvps = await listRsvpsForSlug(ev.slug);
      rsvpCounts.set(ev.slug, rsvps.length);
    })
  );

  const verifiedPaidEvents = events.filter(isVerifiedPaidOrder);
  const pendingEvents = events.filter((e) => !isVerifiedPaidOrder(e));
  const totalRevenue = verifiedPaidEvents.reduce((acc, ev) => {
    const plan = PRICING_PLANS.find((p) => p.id === ev.planId);
    return acc + (ev.paidAmount || plan?.transferPriceNum || 0);
  }, 0);
  const pendingPotential = pendingEvents.reduce((acc, ev) => {
    const plan = PRICING_PLANS.find((p) => p.id === ev.planId);
    return acc + (plan?.transferPriceNum || 0);
  }, 0);
  const unconvertedLeads = leads.filter(
    (l) =>
      l.stage === "prueba_iniciada" ||
      l.stage === "prueba_capturada" ||
      l.stage === "encargar_borrador"
  );

  const countStage = (st: string) => leads.filter((l) => l.stage === st).length;

  const summarySheet: (string | number)[][] = [
    ["Métrica", "Valor"],
    ["Fecha de exportación", new Date().toLocaleString("es-AR")],
    ["Pedidos totales", events.length],
    ["Pedidos pagos verificados (MP approved / Transf. verificada)", verifiedPaidEvents.length],
    ["Pedidos pendientes de verificación", pendingEvents.length],
    ["Ingresos confirmados verificados (ARS)", totalRevenue],
    ["Monto pendiente por cobrar (ARS)", pendingPotential],
    ["Leads capturados totales", leads.length],
    ["Leads sin terminar pedido (oportunidades)", unconvertedLeads.length],
    ["Etapa: prueba_capturada", countStage("prueba_capturada")],
    ["Etapa: encargar_borrador", countStage("encargar_borrador")],
    ["Etapa: pedido_creado", countStage("pedido_creado")],
    ["Etapa: entregado", countStage("entregado")],
    ["Etapa: testimonio_pedido", countStage("testimonio_pedido")],
    ["Etapa: testimonio_recibido", countStage("testimonio_recibido")],
    ["Etapa: recompra_ofrecida", countStage("recompra_ofrecida")],
    ["Eventos MiniTester registrados", funnelEvents.length],
  ];

  const ordersSheet: (string | number)[][] = [
    [
      "Código",
      "Fecha Creación",
      "Evento",
      "Cliente",
      "WhatsApp",
      "Email",
      "Plan",
      "Diseño",
      "Estado Pedido",
      "Estado Pago",
      "Método Pago",
      "Verificado Por",
      "Verificado En",
      "Monto (ARS)",
      "utm_source",
      "Confirmaciones RSVP",
    ],
    ...events.map((ev) => {
      const plan = PRICING_PLANS.find((p) => p.id === ev.planId);
      const amount = ev.paidAmount || plan?.transferPriceNum || 0;
      return [
        safeCell(ev.orderCode),
        new Date(ev.createdAt).toLocaleString("es-AR"),
        safeCell(ev.eventTitle),
        safeCell(ev.contactName),
        safeCell(ev.whatsapp),
        safeCell(ev.email),
        ev.planId.toUpperCase(),
        safeCell(ev.skinId),
        ev.status,
        ev.paymentStatus || "pendiente",
        ev.paymentMethod || "transferencia",
        safeCell(ev.verifiedBy || ""),
        ev.verifiedAt ? new Date(ev.verifiedAt).toLocaleString("es-AR") : "",
        amount,
        safeCell(ev.utmSource || ""),
        rsvpCounts.get(ev.slug) ?? 0,
      ];
    }),
  ];

  const leadsSheet: (string | number)[][] = [
    [
      "ID",
      "Última Actividad",
      "Etapa Embudo",
      "Origen",
      "Nombre",
      "WhatsApp",
      "Teléfono E.164",
      "Email",
      "Categoría",
      "Modelo",
      "Plan",
      "Título Prueba",
      "Pedido Asociado",
      "consent_service",
      "consent_marketing",
      "consent_at",
      "consent_text_version",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "BAJA en",
    ],
    ...leads.map((l) => [
      safeCell(l.id),
      new Date(l.updatedAt).toLocaleString("es-AR"),
      l.stage,
      l.source,
      safeCell(l.contactName),
      safeCell(l.whatsapp),
      safeCell(l.normalizedPhone || ""),
      safeCell(l.email || ""),
      safeCell(l.category || ""),
      safeCell(l.skinId || ""),
      safeCell(l.planId || ""),
      safeCell(l.eventTitle || ""),
      safeCell(l.convertedOrderCode || ""),
      l.consentService ? "SI" : "NO",
      l.consentMarketing ? "SI" : "NO",
      l.consentAt ? new Date(l.consentAt).toLocaleString("es-AR") : "",
      safeCell(l.consentTextVersion || ""),
      safeCell(l.utmSource || ""),
      safeCell(l.utmMedium || ""),
      safeCell(l.utmCampaign || ""),
      safeCell(l.utmContent || ""),
      l.optedOutAt ? new Date(l.optedOutAt).toLocaleString("es-AR") : "",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
  wsSummary["!cols"] = [{ wch: 48 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

  const wsOrders = XLSX.utils.aoa_to_sheet(ordersSheet);
  XLSX.utils.book_append_sheet(wb, wsOrders, "Pedidos y Pagos");

  const wsLeads = XLSX.utils.aoa_to_sheet(leadsSheet);
  XLSX.utils.book_append_sheet(wb, wsLeads, "Leads y Embudo");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  await recordAdminAuditLog({
    actor: "admin",
    action: "export_xlsx",
    rowCount: events.length + leads.length,
    meta: `orders=${events.length}, leads=${leads.length}, ip=${ip}`,
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="metricas-invita-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
