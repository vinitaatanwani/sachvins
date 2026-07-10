import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

// Marks the free 20-minute Clarity Session as claimed for this account. The free
// session is a one-time welcome, so we record a ClaritySession row the first
// time someone proceeds to book, and the booking page hides the button after.
// Idempotent: never creates a second row for the same profile.
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const existing = await prisma.claritySession.findFirst({ where: { profileId: deviceId } });
  if (!existing) {
    await prisma.claritySession.create({ data: { profileId: deviceId } });
  }

  return NextResponse.json({ ok: true });
}
