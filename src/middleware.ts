import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
  verifyAdminTokenStructure,
} from "@/lib/adminSession";

function requiresAdminApiSession(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return false;
  }
  if (pathname.startsWith("/api/admin/")) {
    return true;
  }
  if (pathname === "/api/upload-audio") {
    return true;
  }
  if (pathname === "/api/leads" && method === "GET") {
    return true;
  }
  if (pathname.startsWith("/api/leads/") && pathname !== "/api/leads/unsubscribe") {
    return true;
  }
  if (pathname === "/api/orders" && method === "GET") {
    return true;
  }
  if (pathname.startsWith("/api/orders/")) {
    return true;
  }
  if (pathname === "/api/funnel-events" && method === "GET") {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (requiresAdminApiSession(req)) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    // Si Edge tiene la clave configurada, verifica firma HMAC completa; si no, valida estructura/expiración y el Route Handler Node valida HMAC completo.
    const hmacSession = await verifyAdminSessionToken(token);
    const structuralSession = hmacSession || verifyAdminTokenStructure(token);
    if (!structuralSession) {
      return NextResponse.json(
        { error: "No autorizado" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }
      );
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/leads/:path*",
    "/api/orders/:path*",
    "/api/upload-audio",
    "/api/funnel-events",
  ],
};
