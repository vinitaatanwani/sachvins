import { prisma } from "@/lib/prisma";
import { ARRIVED_OPTIONS } from "@/lib/quiet";

// The Journey tab: a mirror of what the member actually did this month.
// Every number comes from real rows — no sample content, no invented trends.
// The one "pattern sentence" is plain arithmetic over their check-ins and only
// speaks when there's enough data (≥8 check-ins) to mean anything.

export type WeatherStatus = "light" | "mixed" | "heavy" | "none";

export interface JourneyData {
  monthLabel: string;
  stats: {
    journals: number;
    checkIns: number;
    quietSits: number;
    kindnessDays: number;
    meditationMin: number;
    activeDays: number;
  };
  weather: {
    // Days 1..today of the current month; future days aren't rendered.
    days: { day: number; status: WeatherStatus }[];
    leadingBlanks: number; // weekday of the 1st (0 = Sunday), for grid alignment
    checkInCount: number;
    sentence: string | null;
  };
  quiet: {
    total: number;
    arrived: { label: string; count: number }[];
    words: { text: string; dateLabel: string } | null;
  };
}

// Mood → weather tone (mirrors the check-in vocabulary in CheckInForm).
const MOOD_TONE: Record<string, "pos" | "neu" | "neg"> = {
  happy: "pos",
  calm: "pos",
  energetic: "pos",
  grateful: "pos",
  meh: "neu",
  tired: "neu",
  anxious: "neg",
  frustrated: "neg",
  irritated: "neg",
  angry: "neg",
  sad: "neg",
  overwhelmed: "neg",
};

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ARRIVED_LABEL = new Map(ARRIVED_OPTIONS.map((o) => [o.key as string, o.label.replace("…", "")]));

function statusOfTone(tone: "pos" | "neu" | "neg"): WeatherStatus {
  return tone === "pos" ? "light" : tone === "neu" ? "mixed" : "heavy";
}

// One gentle sentence, only when the data actually supports it.
function weatherSentence(days: { day: number; status: WeatherStatus; dow: number }[], checkInCount: number, today: number): string | null {
  if (checkInCount < 8) return null;
  const parts: string[] = [];

  const heavy = days.filter((d) => d.status === "heavy");
  if (heavy.length >= 2) {
    const byDow = new Map<number, number>();
    for (const d of heavy) byDow.set(d.dow, (byDow.get(d.dow) ?? 0) + 1);
    const [dow, n] = [...byDow.entries()].sort((a, b) => b[1] - a[1])[0];
    if (n >= 2 && n / heavy.length >= 0.5) {
      parts.push(`your heavier days this month fell mostly on ${DOW_NAMES[dow]}s`);
    }
  }

  const score = (s: WeatherStatus) => (s === "light" ? 2 : s === "mixed" ? 1 : 0);
  const scored = days.filter((d) => d.status !== "none");
  const mid = Math.ceil(today / 2);
  const first = scored.filter((d) => d.day <= mid);
  const second = scored.filter((d) => d.day > mid);
  if (first.length >= 3 && second.length >= 3) {
    const avg = (arr: typeof scored) => arr.reduce((s, d) => s + score(d.status), 0) / arr.length;
    const diff = avg(second) - avg(first);
    if (diff >= 0.5) parts.push("the recent days have run noticeably lighter than earlier in the month");
    else if (diff <= -0.5) parts.push("the recent days have felt heavier than earlier in the month — extra gentleness is allowed");
  }

  if (parts.length === 0) return null;
  const joined = parts.join(", and ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

export async function loadJourney(profileId: string): Promise<JourneyData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.getDate();

  const [journals, checkIns, sits, kindness, meds] = await Promise.all([
    prisma.journalEntry.findMany({ where: { profileId, createdAt: { gte: monthStart } }, select: { createdAt: true } }),
    prisma.weeklyCheckIn.findMany({ where: { profileId, createdAt: { gte: monthStart } }, select: { createdAt: true, responses: true } }),
    prisma.quietSit.findMany({
      where: { profileId, createdAt: { gte: monthStart } },
      select: { arrived: true, arrivedText: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.kindnessLog.findMany({ where: { profileId, date: { gte: monthStart } }, select: { date: true } }),
    prisma.meditationSession.findMany({ where: { profileId, createdAt: { gte: monthStart } }, select: { createdAt: true, minutes: true } }),
  ]);

  // Weather: one status per day from that day's check-in mood (last one wins).
  const dayStatus = new Map<number, WeatherStatus>();
  let moodCheckIns = 0;
  for (const c of [...checkIns].sort((a, b) => +a.createdAt - +b.createdAt)) {
    const mood = (c.responses as { mood?: string } | null)?.mood;
    const tone = mood ? MOOD_TONE[mood] : undefined;
    if (!tone) continue; // ignore legacy pulse rows
    moodCheckIns++;
    dayStatus.set(c.createdAt.getDate(), statusOfTone(tone));
  }
  const days = Array.from({ length: today }, (_, i) => {
    const day = i + 1;
    const dow = new Date(now.getFullYear(), now.getMonth(), day).getDay();
    return { day, status: dayStatus.get(day) ?? ("none" as WeatherStatus), dow };
  });

  // Active days: any practice counts as showing up.
  const active = new Set<number>();
  for (const j of journals) active.add(j.createdAt.getDate());
  for (const c of checkIns) active.add(c.createdAt.getDate());
  for (const s of sits) active.add(s.createdAt.getDate());
  for (const k of kindness) active.add(k.date.getDate());
  for (const m of meds) active.add(m.createdAt.getDate());

  // Quiet sits: tally what arrived + surface their latest own words.
  const arrivedCounts = new Map<string, number>();
  for (const s of sits) {
    if (s.arrived) arrivedCounts.set(s.arrived, (arrivedCounts.get(s.arrived) ?? 0) + 1);
  }
  const arrived = [...arrivedCounts.entries()]
    .map(([key, count]) => ({ label: ARRIVED_LABEL.get(key) ?? key, count }))
    .sort((a, b) => b.count - a.count);
  const withWords = sits.find((s) => s.arrivedText?.trim());
  const words = withWords
    ? {
        text: withWords.arrivedText!.trim(),
        dateLabel: withWords.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
      }
    : null;

  return {
    monthLabel: now.toLocaleDateString("en-US", { month: "long" }),
    stats: {
      journals: journals.length,
      checkIns: moodCheckIns,
      quietSits: sits.length,
      kindnessDays: kindness.length,
      meditationMin: meds.reduce((s, m) => s + m.minutes, 0),
      activeDays: active.size,
    },
    weather: {
      days: days.map(({ day, status }) => ({ day, status })),
      leadingBlanks: new Date(now.getFullYear(), now.getMonth(), 1).getDay(),
      checkInCount: moodCheckIns,
      sentence: weatherSentence(days, moodCheckIns, today),
    },
    quiet: { total: sits.length, arrived, words },
  };
}
