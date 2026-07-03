import type { FocusAreaKey, NervousSystemState } from "@/lib/quiz-data";

// Sample content for the seeded "reflective companion" demo. In production these
// rows are written by the Reflective Content Engine (see the plan doc); until the
// generation pipeline is wired, activating membership seeds one of each so the
// screens show real, believable content.

export const SAMPLE_LETTER_BODY = `This week you wrote about saying yes to your sister's request even after telling yourself you'd pause before agreeing to things. I noticed that same pattern show up twice — a moment of hesitation, followed by the old habit of agreeing anyway.

That pause is new, though. A few months ago it wasn't there at all; the yes came before you'd even registered the cost. Now there's a breath in between, a small space where you notice the pull before you follow it. That space is where change actually lives.

You don't have to fill it with a different answer yet. Noticing it at all is the work. I'll be here next week to see what it becomes.`;

export interface SampleScoreDelta {
  key: FocusAreaKey;
  name: string;
  start: number;
  end: number;
}

export const SAMPLE_REPORT = {
  scoreDeltas: [
    { key: "relationships", name: "Boundaries & Relationships", start: 41, end: 63 },
    { key: "self_worth", name: "Self-Worth", start: 55, end: 55 },
    { key: "emotional_world", name: "Emotional World", start: 48, end: 58 },
    { key: "focus_attention", name: "Focus & Attention", start: 60, end: 64 },
  ] as SampleScoreDelta[],
  themes: ["Pausing before you say yes", "Guilt after resting", "Wanting to be understood"],
  quote: "I paused before I answered, and it felt like mine.",
  thenVsNow:
    "A month ago your entries circled the same worry again and again, looking for permission. Lately they sound different — you're still unsure, but you're deciding for yourself first and checking with others second. That's a real shift in where your center of gravity sits.",
  focusNext:
    "Your Boundaries score moved from 41 to 63 this month — the biggest shift of any area you've worked on. Self-Worth held steady. Given how much ground you've covered here, this could be a good moment to either deepen boundaries work in specific relationships, or shift primary focus to Self-Worth, which hasn't moved much yet. Either is a reasonable next step.",
  suggestSession: true,
};

// Ordered by the week — one surfaced per day. Written for a fight/flight (grounding) state.
export const SAMPLE_AFFIRMATIONS = [
  "The pause between the ask and my yes is mine to keep.",
  "I can be kind and still say not right now.",
  "My body knows the difference between calm and quiet fear.",
  "I am allowed to take up the room I already stand in.",
  "Rest is not something I have to earn today.",
  "The people who are for me can hold my honest no.",
  "I am becoming someone who chooses before she agrees.",
];

// Which affirmation to surface "today", from the set's own start-of-week anchor.
export function affirmationIndexForToday(weekOf: Date, lines: string[]): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((Date.now() - weekOf.getTime()) / msPerDay);
  return ((days % lines.length) + lines.length) % lines.length;
}

export function startOfThisWeek(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

// Human label for the nervous-system state used to calibrate affirmations.
export function nervousLabel(state: NervousSystemState | null | undefined): string {
  if (state === "fight_flight") return "Fight / Flight · grounding";
  if (state === "freeze_fawn") return "Freeze / Fawn · gentle activation";
  if (state === "regulated") return "Settled · expansive";
  return "Tuned to you";
}
