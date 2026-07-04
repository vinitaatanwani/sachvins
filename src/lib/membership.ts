import { prisma } from "@/lib/prisma";
import {
  SAMPLE_LETTER_BODY,
  SAMPLE_REPORT,
  SAMPLE_AFFIRMATIONS,
  startOfThisWeek,
} from "@/lib/companion-content";

// Turns on the Reflective Companion for a profile and, on first activation,
// seeds one of each content piece so the screens are real from day one. Called
// after a verified Razorpay payment (src/app/api/razorpay/confirm) and by the
// dev-only test-unlock endpoint (src/app/api/companion/activate). Idempotent:
// re-running never duplicates seeded content or resets membershipSince.
// (Real per-member generation via the content engine comes later.)
export async function activateMembership(deviceId: string): Promise<boolean> {
  const profile = await prisma.profile.findUnique({ where: { id: deviceId } });
  if (!profile) return false;

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

  return true;
}
