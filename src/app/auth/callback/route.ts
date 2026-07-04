import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { provisionProfileForUser } from "@/lib/profile";

// Where Supabase sends the user back after Google sign-in (PKCE). We exchange
// the code for a session, make sure a Profile exists, then continue to `next`
// (the original destination, e.g. /onboarding?rid=… from the funnel).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/app/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await provisionProfileForUser(user);

  // `next` is app-relative (built by us); resolve against origin defensively so
  // it can never become an open redirect to another host.
  const dest = new URL(next.startsWith("/") ? next : "/app/dashboard", origin);
  return NextResponse.redirect(dest);
}
