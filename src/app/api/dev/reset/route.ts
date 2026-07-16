import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { requireAdmin } from "@/lib/admin";
import { DEVICE_ID_COOKIE } from "@/lib/device-id";

// Owner-only test tool: wipes the owner's own profile (journal entries,
// check-ins, etc. cascade) for a fresh test run. Gated to admin so it can't be
// probed in production, though it only ever affects the caller's own account.
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const deviceId = await getDeviceId();
  if (deviceId) {
    await prisma.profile.deleteMany({ where: { id: deviceId } });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DEVICE_ID_COOKIE);
  return res;
}
