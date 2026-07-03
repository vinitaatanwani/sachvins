import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { DEVICE_ID_COOKIE } from "@/lib/device-id";

// Dev/test-only: wipes this device's profile (journal entries, check-ins,
// etc. cascade with it) and clears the device cookie so the next request
// starts completely fresh, as if this were a brand new visitor.
export async function POST() {
  const deviceId = await getDeviceId();
  if (deviceId) {
    await prisma.profile.deleteMany({ where: { id: deviceId } });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DEVICE_ID_COOKIE);
  return res;
}
