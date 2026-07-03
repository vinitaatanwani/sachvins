import { redirect } from "next/navigation";
import { getCurrentProfile, getDeviceId } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import type { DomainScore, FocusAreaKey, NervousSystemState } from "@/lib/quiz-data";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;
  const deviceId = await getDeviceId();
  if (!deviceId) redirect("/quiz");

  let profile = await getCurrentProfile();
  if (profile?.onboardedAt) redirect("/app/dashboard");

  // First time reaching onboarding from a quiz result: pull the lead's
  // contact details and the quiz's focus area into this device's profile.
  if (rid && !profile?.focusArea) {
    const quizResult = await prisma.quizResult.findUnique({ where: { id: rid }, include: { lead: true } });
    if (quizResult) {
      profile = await prisma.profile.update({
        where: { id: deviceId },
        data: {
          name: quizResult.lead?.name ?? profile?.name,
          email: quizResult.lead?.email ?? profile?.email,
          phone: quizResult.lead?.phone ?? profile?.phone,
          focusArea: quizResult.primaryFocusArea,
          nervousSystemState: quizResult.nervousSystemState,
        },
      });
      await prisma.quizResult.update({ where: { id: quizResult.id }, data: { profileId: deviceId } });
    }
  }

  // Load the quiz result behind this onboarding so we can reflect the person's
  // own numbers back to them on the second screen.
  const quizResult = rid
    ? await prisma.quizResult.findUnique({ where: { id: rid } })
    : await prisma.quizResult.findFirst({
        where: { profileId: deviceId },
        orderBy: { createdAt: "desc" },
      });

  const focusArea = (profile?.focusArea ?? null) as FocusAreaKey | null;
  const domainScores = (quizResult?.domainScores as unknown as DomainScore[] | undefined) ?? [];
  const focusScore = domainScores.find((d) => d.key === focusArea) ?? null;

  return (
    <OnboardingForm
      firstName={profile?.name?.split(" ")[0] ?? null}
      detectedFocusArea={focusArea}
      focusScore={focusScore?.score ?? null}
      focusLevel={focusScore?.level ?? null}
      nervousState={(quizResult?.nervousSystemState ?? profile?.nervousSystemState ?? null) as NervousSystemState | null}
    />
  );
}
