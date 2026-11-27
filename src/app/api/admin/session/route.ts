import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: auth.reason === "unconfigured" ? 503 : 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
  return NextResponse.json(
    { authenticated: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
