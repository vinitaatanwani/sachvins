import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

// Dev-only: turn membership back off (and clear seeded content) so the locked
// paywall/teaser state can be tested again. Not exposed to real users.
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  await prisma.$transaction([
    prisma.reflectiveLetter.deleteMany({ where: { profileId: deviceId } }),
    prisma.clarityReport.deleteMany({ where: { profileId: deviceId } }),
    prisma.affirmationSet.deleteMany({ where: { profileId: deviceId } }),
    prisma.profile.update({ where: { id: deviceId }, data: { membershipActive: false, membershipSince: null } }),
  ]);

  return NextResponse.json({ ok: true });
}
