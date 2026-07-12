import { getCurrentProfile } from "@/lib/profile";
import { requireAdmin } from "@/lib/admin";
import { activateMembership } from "@/lib/membership";
import { prisma } from "@/lib/prisma";
import { CompanionHome } from "@/components/app/CompanionHome";
import { loadJourney } from "@/lib/journey";
import { ensureWeeklyLetter } from "@/lib/letter";
import { affirmationIndexForToday, startOfThisWeek, SAMPLE_AFFIRMATIONS } from "@/lib/companion-content";

export default async function CompanionPage() {
  let profile = await getCurrentProfile();
  if (!profile) return null;

  // Owner/admin gets the full paid Companion, so they can use and review it.
  if (!profile.membershipActive && (await requireAdmin())) {
    await activateMembership(profile.id);
    profile = (await getCurrentProfile()) ?? profile;
  }

  const firstName = profile.name?.split(" ")[0] ?? null;
  const locked = !profile.membershipActive;
  // When Razorpay keys are present the unlock button runs a real checkout;
  // otherwise it falls back to an instant test-unlock so the flow stays usable.
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? null;

  // Members see their own generated content; everyone else previews the sample
  // (a readable opening, the rest blurred) until they unlock with payment.
  const journey = await loadJourney(profile.id);

  if (locked) {
    const weekOf = startOfThisWeek();
    return (
      <CompanionHome
        locked
        razorpayKeyId={razorpayKeyId}
        firstName={firstName}
        letter={null}
        journey={journey}
        affirmations={{
          lines: SAMPLE_AFFIRMATIONS,
          weekOf: weekOf.toISOString(),
          nervousState: profile.nervousSystemState,
          todayIndex: affirmationIndexForToday(weekOf, SAMPLE_AFFIRMATIONS),
        }}
      />
    );
  }

  const [letter, affSet] = await Promise.all([
    ensureWeeklyLetter(profile),
    prisma.affirmationSet.findFirst({ where: { profileId: profile.id }, orderBy: { weekOf: "desc" } }),
  ]);

  const lines = (affSet?.lines as unknown as string[] | undefined) ?? [];
  const todayIndex = affSet ? affirmationIndexForToday(affSet.weekOf, lines) : 0;

  return (
    <CompanionHome
      firstName={firstName}
      letter={letter ? { body: letter.body, weekOf: letter.weekOf.toISOString() } : null}
      journey={journey}
      affirmations={
        affSet
          ? { lines, weekOf: affSet.weekOf.toISOString(), nervousState: affSet.nervousSystemState, todayIndex }
          : null
      }
    />
  );
}
