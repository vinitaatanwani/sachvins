import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_ID_COOKIE } from "@/lib/device-id";

// Auth is disconnected for now (see lib/supabase/middleware.ts for the real-auth
// version this replaces, kept intact for when accounts come back). Every
// visitor gets a stable anonymous device id instead, so /app/* just works
// without a login step.
export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!request.cookies.get(DEVICE_ID_COOKIE)) {
    response.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
