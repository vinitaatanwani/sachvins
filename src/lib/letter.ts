import { prisma } from "@/lib/prisma";
import { getAnthropicClient } from "@/lib/anthropic";
import { startOfThisWeek } from "@/lib/companion-content";
import { FOCUS_AREA_LABELS, type FocusAreaKey } from "@/lib/quiz-data";
import type { JournalEntry, Profile, ReflectiveLetter } from "@prisma/client";

// Weekly letters from Vinita, written from the member's own journaling — never
// sample data. Rules:
//   • No journal entries ever → no letter (the tab explains it arrives once
//     they begin journaling).
//   • At most one letter per week, and only when there's at least one journal
//     entry the previous letter hasn't already spoken to.
//   • With ANTHROPIC_API_KEY the letter is written by Claude from their last
//     1–2 real entries; without it, a warm fallback that uses only true facts
//     (name, entry count, focus area, when they last wrote).

const LETTER_SYSTEM = `You are Vinita, a warm and intuitive life coach and the founder of The Clarity Method, writing your weekly letter to a member of your healing app. You have read their recent private journal entries (each has two answers: the moment they lived, and the pattern underneath it).

Your coaching is guided by the "Break Your Life Loop" idea: people repeat the same emotional pattern in different situations (Trigger → Meaning → Emotion → Automatic response → Familiar outcome → Reinforced belief), and a pattern often creates the very outcome it fears.

Write the letter:
- 3 short paragraphs, no more than ~150 words total. Address them by first name if given.
- Speak directly to what THEY wrote — reflect one specific feeling or moment from their entries so they feel truly seen. Never invent events they didn't write about.
- Softly name the pattern underneath, without judgment (it was once protecting them).
- End with one small, gentle "10% different" invitation for the week ahead, and quiet encouragement.
- First person, tender, plain language. No headings, no bullet lists, no sign-off (the app adds it). No medical advice or diagnosis.`;

function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

async function writeLetterWithAI(profile: Profile, entries: JournalEntry[], totalEntries: number): Promise<string> {
  const client = getAnthropicClient();
  const firstName = profile.name?.split(" ")[0] ?? null;
  const focus = profile.focusArea ? FOCUS_AREA_LABELS[profile.focusArea as FocusAreaKey] : null;

  const parts = [
    `Member first name: ${firstName ?? "(unknown)"}`,
    `Focus area: ${focus ?? "(not set)"}`,
    `Total journal entries so far: ${totalEntries}`,
    ``,
    ...entries.map((e, i) =>
      [
        `--- Journal entry ${i + 1} (${fmtDay(e.date)}) ---`,
        `Q1: ${e.prompt}`,
        `Their answer: """${e.content ?? ""}"""`,
        ...(e.prompt2 ? [`Q2: ${e.prompt2}`, `Their answer: """${e.content2 ?? ""}"""`] : []),
      ].join("\n")
    ),
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 600,
    system: LETTER_SYSTEM,
    messages: [{ role: "user", content: parts.join("\n") }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("no text");
  return text.text.trim();
}

// Fallback when the AI key isn't configured: only true, checkable facts —
// their name, how often they wrote, their focus area — never invented events.
function fallbackLetter(profile: Profile, entries: JournalEntry[], totalEntries: number): string {
  const firstName = profile.name?.split(" ")[0];
  const focus = profile.focusArea ? FOCUS_AREA_LABELS[profile.focusArea as FocusAreaKey] : null;
  const last = entries[0];
  const opener = firstName ? `Dear ${firstName},` : `Dear one,`;
  const times =
    totalEntries === 1 ? "you sat down with yourself and wrote" : `you've now sat down with yourself ${totalEntries} times`;

  return [
    `${opener}`,
    `Since you joined, ${times} — most recently on ${fmtDay(last.date)}. I want you to know that quiet act matters more than it may seem. Answering two honest questions, naming the moment and then looking underneath it for the pattern — that is the real work. Most people never look underneath. You keep looking.`,
    focus
      ? `You're working on ${focus}, and that part of life doesn't shift through force. It shifts through exactly this kind of gentle, repeated attention — the kind you're already giving it.`
      : `Whatever you wrote about, let it be information rather than a verdict. Old patterns were once protection; they soften when they're seen.`,
    `This week, if one small moment invites your old reaction, try a response that's just ten percent gentler — once is enough. I'm proud of the person who keeps returning to the page.`,
  ].join("\n\n");
}

// Returns the letter to show on the Letters tab (or null if they've never
// journaled). Generates and stores a new one at most once per week, and only
// when there's fresh journaling since the last letter.
export async function ensureWeeklyLetter(profile: Profile): Promise<ReflectiveLetter | null> {
  const [latest, entries, totalEntries] = await Promise.all([
    prisma.reflectiveLetter.findFirst({ where: { profileId: profile.id }, orderBy: { weekOf: "desc" } }),
    prisma.journalEntry.findMany({ where: { profileId: profile.id }, orderBy: { date: "desc" }, take: 2 }),
    prisma.journalEntry.count({ where: { profileId: profile.id } }),
  ]);

  if (entries.length === 0) return latest; // never journaled → null unless a real letter already exists

  const weekOf = startOfThisWeek();
  const hasFresh = !latest || entries.some((e) => e.createdAt > latest.createdAt);
  if (latest && (+latest.weekOf === +weekOf || !hasFresh)) return latest;

  let body: string;
  try {
    body = await writeLetterWithAI(profile, entries, totalEntries);
  } catch {
    body = fallbackLetter(profile, entries, totalEntries);
  }

  return prisma.reflectiveLetter.create({
    data: { profileId: profile.id, weekOf, body, focusArea: profile.focusArea },
  });
}
