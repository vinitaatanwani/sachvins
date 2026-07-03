import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEVICE_ID_COOKIE } from "@/lib/device-id";

// Anonymous per-device identity (see lib/device-id.ts / middleware.ts). Swap
// this for a real auth lookup (lib/supabase/server.ts) when accounts come back.
export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DEVICE_ID_COOKIE)?.value ?? null;
}

export async function getCurrentProfile() {
  const deviceId = await getDeviceId();
  if (!deviceId) return null;

  // Read-first, create-if-missing. Avoids the upsert race where two concurrent
  // requests (e.g. the layout and a page both resolving this device for the
  // first time) each try to create the row and one fails with P2002.
  const existing = await prisma.profile.findUnique({ where: { id: deviceId } });
  if (existing) return existing;
  try {
    return await prisma.profile.create({ data: { id: deviceId } });
  } catch {
    // A concurrent request won the create — return whatever now exists.
    return prisma.profile.findUnique({ where: { id: deviceId } });
  }
}

export function trialDayNumber(trialStartedAt: Date | null): number {
  if (!trialStartedAt) return 1;
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.floor((Date.now() - trialStartedAt.getTime()) / msPerDay);
  return Math.min(7, Math.max(1, elapsed + 1));
}
