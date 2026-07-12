import { prisma } from "@/lib/prisma";
import { SAMPLE_AFFIRMATIONS, startOfThisWeek } from "@/lib/companion-content";

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

  const existingAff = await prisma.affirmationSet.findFirst({ where: { profileId: deviceId } });
  if (!existingAff) {
    const weekOf = startOfThisWeek();

    await prisma.$transaction([
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
