import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { MembershipPaywall } from "@/components/app/MembershipPaywall";
import { CompanionHome } from "@/components/app/CompanionHome";
import { affirmationIndexForToday, type SampleScoreDelta } from "@/lib/companion-content";

export default async function CompanionPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (!profile.membershipActive) {
    const firstName = profile.name?.split(" ")[0] ?? null;
    return <MembershipPaywall firstName={firstName} />;
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
