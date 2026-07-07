import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Identity is the Supabase-authenticated user (Google OAuth). Every /app page
// and protected API route resolves the current person through these helpers, so
// keying them to the auth user id makes the whole app per-account. Public
// marketing/quiz routes don't call these — they stay anonymous (leads).

// supabase.auth.getUser() is a network call to Supabase Auth (Tokyo). A single
// request often resolves identity several times (page + layout + helpers), so
// cache() dedupes it to ONE round-trip per request instead of many.
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

// The current signed-in user's id, or null if not authenticated. Named
// getDeviceId for historical reasons (it used to read an anonymous cookie);
// callers treat the returned value as the Profile id, which still holds.
export async function getDeviceId(): Promise<string | null> {
  return (await getAuthUser())?.id ?? null;
}

// Pull a display name out of the Google identity (falls back gracefully).
function nameFromUser(user: User): string | null {
  const m = user.user_metadata ?? {};
  return (m.full_name as string) || (m.name as string) || null;
}

// Ensure a Profile row exists for a freshly-authenticated user (called from the
// OAuth callback). Idempotent; backfills name/email from Google on first create.
export async function provisionProfileForUser(user: User) {
  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;
  try {
    return await prisma.profile.create({
      data: { id: user.id, email: user.email ?? null, name: nameFromUser(user) },
    });
  } catch {
    // A concurrent request won the create — return whatever now exists.
    return prisma.profile.findUnique({ where: { id: user.id } });
  }
}

// Cached per request — the app layout and the page both resolve the profile, so
// this collapses two identical DB reads into one.
export const getCurrentProfile = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;
  return provisionProfileForUser(user);
});

export function trialDayNumber(trialStartedAt: Date | null): number {
  if (!trialStartedAt) return 1;
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.floor((Date.now() - trialStartedAt.getTime()) / msPerDay);
  return Math.min(7, Math.max(1, elapsed + 1));
}
