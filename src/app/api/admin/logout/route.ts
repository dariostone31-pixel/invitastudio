import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

export async function POST(req: Request) {
  const proto = req.headers.get("x-forwarded-proto") || "";
  const isHttps = proto.includes("https") || req.url.startsWith("https://");

  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps || process.env.VERCEL === "1",
    path: "/",
    maxAge: 0,
  });
  return res;
}
