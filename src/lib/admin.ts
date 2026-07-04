import { createClient } from "@/lib/supabase/server";

// Owner/admin access is by Google email allowlist — no separate password. Set
// ADMIN_EMAILS (comma-separated) to override; defaults to Vinita's account.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "vinitaatanwani@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// The current signed-in email (or null), for admin checks in server components.
export async function getCurrentEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// Returns the signed-in email only if it's an admin; otherwise null.
export async function requireAdmin(): Promise<string | null> {
  const email = await getCurrentEmail();
  return isAdminEmail(email) ? email : null;
}
