import { getCurrentProfile, trialDayNumber } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getDailyPromptSet } from "@/lib/content";
import { JournalScreen } from "@/components/app/JournalScreen";

export default async function JournalPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const focusArea = profile.focusArea ?? "self_worth";
  const dayNumber = trialDayNumber(profile.trialStartedAt);
  const { q1, q2 } = getDailyPromptSet(focusArea, dayNumber - 1);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayEntry, pastEntries] = await Promise.all([
    prisma.journalEntry.findFirst({ where: { profileId: profile.id, date: { gte: startOfToday } } }),
    prisma.journalEntry.findMany({
      where: { profileId: profile.id, date: { lt: startOfToday } },
      orderBy: { date: "desc" },
      take: 14,
    }),
  ]);

  return (
    <JournalScreen
      prompt={todayEntry?.prompt ?? q1}
      prompt2={todayEntry?.prompt2 ?? q2}
      focusArea={focusArea}
      initialContent={todayEntry?.content ?? ""}
      initialContent2={todayEntry?.content2 ?? ""}
      initialEntryId={todayEntry?.id ?? null}
      initialReflection={todayEntry?.reflection ?? null}
      pastEntries={pastEntries.map((e) => ({
        id: e.id,
        date: e.date.toDateString(),
        prompt: e.prompt,
        content: e.content,
        prompt2: e.prompt2,
        content2: e.content2,
      }))}
    />
  );
}
