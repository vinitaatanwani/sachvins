import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { CompanionHome } from "@/components/app/CompanionHome";
import {
  affirmationIndexForToday,
  startOfThisWeek,
  SAMPLE_LETTER_BODY,
  SAMPLE_REPORT,
  SAMPLE_AFFIRMATIONS,
  type SampleScoreDelta,
} from "@/lib/companion-content";

export default async function CompanionPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const firstName = profile.name?.split(" ")[0] ?? null;
  const locked = !profile.membershipActive;
  // When Razorpay keys are present the unlock button runs a real checkout;
  // otherwise it falls back to an instant test-unlock so the flow stays usable.
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? null;

  // Members see their own generated content; everyone else previews the sample
  // (a readable opening, the rest blurred) until they unlock with payment.
  if (locked) {
    const weekOf = startOfThisWeek();
    return (
      <CompanionHome
        locked
        razorpayKeyId={razorpayKeyId}
        firstName={firstName}
        letter={{ body: SAMPLE_LETTER_BODY, weekOf: weekOf.toISOString() }}
        report={{
          periodStart: new Date(Date.now() - 30 * 864e5).toISOString(),
          periodEnd: new Date().toISOString(),
          scoreDeltas: SAMPLE_REPORT.scoreDeltas as SampleScoreDelta[],
          themes: SAMPLE_REPORT.themes,
          quote: SAMPLE_REPORT.quote,
          thenVsNow: SAMPLE_REPORT.thenVsNow,
          focusNext: SAMPLE_REPORT.focusNext,
          suggestSession: SAMPLE_REPORT.suggestSession,
        }}
        affirmations={{
          lines: SAMPLE_AFFIRMATIONS,
          weekOf: weekOf.toISOString(),
          nervousState: profile.nervousSystemState,
          todayIndex: affirmationIndexForToday(weekOf, SAMPLE_AFFIRMATIONS),
        }}
      />
    );
  }

  const [letter, report, affSet] = await Promise.all([
    prisma.reflectiveLetter.findFirst({ where: { profileId: profile.id }, orderBy: { weekOf: "desc" } }),
    prisma.clarityReport.findFirst({ where: { profileId: profile.id }, orderBy: { periodEnd: "desc" } }),
    prisma.affirmationSet.findFirst({ where: { profileId: profile.id }, orderBy: { weekOf: "desc" } }),
  ]);

  const lines = (affSet?.lines as unknown as string[] | undefined) ?? [];
  const todayIndex = affSet ? affirmationIndexForToday(affSet.weekOf, lines) : 0;

  return (
    <CompanionHome
      firstName={firstName}
      letter={letter ? { body: letter.body, weekOf: letter.weekOf.toISOString() } : null}
      report={
        report
          ? {
              periodStart: report.periodStart.toISOString(),
              periodEnd: report.periodEnd.toISOString(),
              scoreDeltas: report.scoreDeltas as unknown as SampleScoreDelta[],
              themes: report.themes as unknown as string[],
              quote: report.quote,
              thenVsNow: report.thenVsNow,
              focusNext: report.focusNext,
              suggestSession: report.suggestSession,
            }
          : null
      }
      affirmations={
        affSet
          ? { lines, weekOf: affSet.weekOf.toISOString(), nervousState: affSet.nervousSystemState, todayIndex }
          : null
      }
    />
  );
}
