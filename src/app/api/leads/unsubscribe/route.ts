import { NextResponse } from "next/server";
import { optOutMarketingByPhone } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`leads-unsub:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = (await req.json()) as {
      whatsapp?: string;
      phone?: string;
      message?: string;
    };
    const phone = String(body.whatsapp || body.phone || "").trim();
    const msg = String(body.message || "BAJA").trim();

    if (!phone) {
      return NextResponse.json(
        { error: "Indicá el número de WhatsApp." },
        { status: 400 }
      );
    }

    if (!/\bbaja\b/i.test(msg)) {
      return NextResponse.json(
        { ok: true, ignored: true, message: "Mensaje sin solicitud de BAJA." },
        { status: 200 }
      );
    }

    const res = await optOutMarketingByPhone(phone, "whatsapp_baja");
    if (!res.normalizedPhone) {
      return NextResponse.json(
        { error: "Número de teléfono inválido." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        optedOut: true,
        alreadyOptedOut: res.alreadyOptedOut,
        normalizedPhone: res.normalizedPhone,
        affectedLeads: res.affectedLeads,
        message: res.alreadyOptedOut
          ? "Este número ya registraba la baja de comunicaciones promocionales."
          : "Baja de comunicaciones promocionales registrada.",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la baja." },
      { status: 500 }
    );
  }
}
