import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getDailyPromptSet } from "@/lib/content";
import { JournalScreen } from "@/components/app/JournalScreen";

// Never serve a cached copy of this page. Every time it's opened it re-reads the
// entry count (for a fresh question) and the full history from the database, so
// a blank writing area and the newest Past list are always what the person sees.
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const focusArea = profile.focusArea ?? "self_worth";

  // Every visit begins a fresh journaling session. The question rotates by how
  // many entries the person has ever written, so journaling again — even twice
  // in one day — always surfaces a different pair than the last time.
  const [entryCount, pastEntries] = await Promise.all([
    prisma.journalEntry.count({ where: { profileId: profile.id } }),
    prisma.journalEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  const { q1, q2 } = getDailyPromptSet(focusArea, entryCount);

  return (
    <JournalScreen
      prompt={q1}
      prompt2={q2}
      focusArea={focusArea}
      pastEntries={pastEntries.map((e) => ({
        id: e.id,
        date: e.date.toDateString(),
        // Past surfaces only Vinita's note — the raw answers are intentionally
        // not sent to the client so revisiting can't re-trigger the wound.
        reflection: e.reflection,
      }))}
    />
  );
}
