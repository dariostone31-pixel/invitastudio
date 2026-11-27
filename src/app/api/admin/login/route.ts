import { NextResponse } from "next/server";
import { isAdminConfigured, verifyAdminPass } from "@/lib/adminAuth";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SEC,
  createAdminSessionToken,
} from "@/lib/adminSession";
import {
  clearAdminLoginFailures,
  getAdminLoginStatus,
  recordAdminLoginFailure,
} from "@/lib/rateLimit";
import { getClientIp } from "@/lib/security";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const status = getAdminLoginStatus(ip);
  if (!status.allowed) {
    return NextResponse.json(
      {
        error: `Demasiados intentos fallidos. Esperá ${Math.ceil(
          status.retryAfterSec / 60
        )} minuto(s) antes de volver a intentar.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(status.retryAfterSec),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Panel de administración no configurado en este entorno." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let passcode = "";
  try {
    const body = (await req.json()) as { passcode?: unknown };
    passcode = typeof body.passcode === "string" ? body.passcode : "";
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const check = verifyAdminPass(passcode);
  if (!check.ok) {
    const fail = recordAdminLoginFailure(ip);
    if (fail.blocked) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos fallidos. Acceso bloqueado temporalmente por seguridad.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(fail.retryAfterSec),
            "Cache-Control": "no-store",
          },
        }
      );
    }
    return NextResponse.json(
      { error: "Clave incorrecta. Verificá tu clave de administrador." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  clearAdminLoginFailures(ip);
  const token = await createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "No se pudo iniciar la sesión de administrador." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const proto = req.headers.get("x-forwarded-proto") || "";
  const isHttps = proto.includes("https") || req.url.startsWith("https://");

  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps || process.env.VERCEL === "1",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SEC,
  });
  return res;
}
