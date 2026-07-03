import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import {
  SAMPLE_LETTER_BODY,
  SAMPLE_REPORT,
  SAMPLE_AFFIRMATIONS,
  startOfThisWeek,
} from "@/lib/companion-content";

// Simulates a successful membership purchase: flips the flag and, on first
// activation, seeds one of each content piece so the Companion screens are real.
// (Real payment via Razorpay + real generation via the content engine come later.)
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { id: deviceId } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const now = new Date();
  await prisma.profile.update({
    where: { id: deviceId },
    data: { membershipActive: true, membershipSince: profile.membershipSince ?? now },
  });

  const existingLetter = await prisma.reflectiveLetter.findFirst({ where: { profileId: deviceId } });
  if (!existingLetter) {
    const weekOf = startOfThisWeek();
    const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.reflectiveLetter.create({
        data: { profileId: deviceId, weekOf, body: SAMPLE_LETTER_BODY, focusArea: profile.focusArea },
      }),
      prisma.clarityReport.create({
        data: {
          profileId: deviceId,
          periodStart,
          periodEnd: now,
          scoreDeltas: SAMPLE_REPORT.scoreDeltas as unknown as object,
          themes: SAMPLE_REPORT.themes as unknown as object,
          quote: SAMPLE_REPORT.quote,
          thenVsNow: SAMPLE_REPORT.thenVsNow,
          focusNext: SAMPLE_REPORT.focusNext,
          suggestSession: SAMPLE_REPORT.suggestSession,
        },
      }),
      prisma.affirmationSet.create({
        data: {
          profileId: deviceId,
          weekOf,
          lines: SAMPLE_AFFIRMATIONS as unknown as object,
          nervousSystemState: profile.nervousSystemState,
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
