import { getCurrentProfile, trialDayNumber } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getDailyPrompt } from "@/lib/content";
import { JournalScreen } from "@/components/app/JournalScreen";

export default async function JournalPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const focusArea = profile.focusArea ?? "self_worth";
  const dayNumber = trialDayNumber(profile.trialStartedAt);
  const prompt = getDailyPrompt(focusArea, dayNumber - 1);

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
      prompt={prompt}
      focusArea={focusArea}
      initialContent={todayEntry?.content ?? ""}
      initialEntryId={todayEntry?.id ?? null}
      initialReflection={todayEntry?.reflection ?? null}
      pastEntries={pastEntries.map((e) => ({
        id: e.id,
        date: e.date.toDateString(),
        prompt: e.prompt,
        content: e.content,
      }))}
    />
  );
}
