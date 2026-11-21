import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getEventById, updateEventRecord } from "@/lib/db";
import { PRICING_PLANS, BUSINESS_CONFIG } from "@/config/business";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId || "");
    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    const event = await getEventById(orderId);
    if (!event) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === event.planId) ?? PRICING_PLANS[1];
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

    if (!accessToken) {
      return NextResponse.json({
        ok: true,
        mode: "unconfigured",
        message:
          "Mercado Pago Checkout Pro está listo para activarse: solo falta configurar MP_ACCESS_TOKEN en las variables de entorno (.env.local o Vercel).",
        amount: plan.listPriceNum,
        orderCode: event.orderCode,
      });
    }

    const originHeader = req.headers.get("origin");
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null) ||
      originHeader ||
      "https://invitastudio-vert.vercel.app"
    ).replace(/\/$/, "");

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: event.planId,
            title: `${BUSINESS_CONFIG.brandName} · ${plan.name} (${event.eventTitle})`,
            description: `Invitación digital interactiva — Pedido ${event.orderCode}`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: plan.listPriceNum,
          },
        ],
        payer: {
          name: event.contactName,
          email: event.email,
        },
        external_reference: event.id,
        statement_descriptor: "INVITASTUDIO",
        back_urls: {
          success: `${baseUrl}/encargar?mp_status=success&order=${encodeURIComponent(event.orderCode)}&panel=${encodeURIComponent(event.panelToken)}&slug=${encodeURIComponent(event.slug)}`,
          pending: `${baseUrl}/encargar?mp_status=pending&order=${encodeURIComponent(event.orderCode)}&panel=${encodeURIComponent(event.panelToken)}&slug=${encodeURIComponent(event.slug)}`,
          failure: `${baseUrl}/encargar?mp_status=failure&order=${encodeURIComponent(event.orderCode)}&panel=${encodeURIComponent(event.panelToken)}&slug=${encodeURIComponent(event.slug)}`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
      },
    });

    await updateEventRecord(event.id, {
      mpPreferenceId: response.id,
      paymentMethod: "mercadopago",
    });

    return NextResponse.json({
      ok: true,
      mode: "live",
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });
  } catch (err) {
    console.error("Mercado Pago checkout error:", err);
    return NextResponse.json(
      { error: "No se pudo inicializar el pago en Mercado Pago" },
      { status: 500 }
    );
  }
}
