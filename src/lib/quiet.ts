// The Quiet Minute — a members-only stillness practice designed for people who
// avoid stillness by staying busy. The win is *staying*, not relaxing, so the
// sit starts tiny (60s) and grows gently as capacity builds.

export const QUIET_LEVELS = [60, 90, 120, 180, 300] as const; // capped at 5 min
const SITS_PER_LEVEL = 5;

export interface QuietProgress {
  seconds: number; // today's sit length
  nextSeconds: number | null; // null once at the cap
  sitsUntilGrowth: number | null;
  totalSits: number;
}

export function quietProgress(totalSits: number): QuietProgress {
  const level = Math.min(Math.floor(totalSits / SITS_PER_LEVEL), QUIET_LEVELS.length - 1);
  const atCap = level >= QUIET_LEVELS.length - 1;
  return {
    seconds: QUIET_LEVELS[level],
    nextSeconds: atCap ? null : QUIET_LEVELS[level + 1],
    sitsUntilGrowth: atCap ? null : SITS_PER_LEVEL - (totalSits % SITS_PER_LEVEL),
    totalSits,
  };
}

export function formatSeconds(s: number): string {
  if (s < 120) return `${s} seconds`;
  return `${Math.round(s / 60)} minutes`;
}

// What surfaced in the quiet — one tap after the sit. Each gets a short
// reflection in Vinita's voice; the choice is saved for her coaching view.
export const ARRIVED_OPTIONS = [
  { key: "restlessness", label: "Restlessness" },
  { key: "todo", label: "A to-do list" },
  { key: "ache", label: "An old ache" },
  { key: "sadness", label: "Sadness" },
  { key: "nothing", label: "Almost nothing" },
  // "other" opens a small text box — their own words are saved (arrivedText)
  // and shown in the owner console, so Vinita can meet them more precisely.
  { key: "other", label: "Something else…" },
] as const;

export type ArrivedKey = (typeof ARRIVED_OPTIONS)[number]["key"];

export const ARRIVED_REFLECTIONS: Record<ArrivedKey, string> = {
  restlessness:
    "Restlessness is not failure — it's the busyness asking where it should go. You met it and stayed anyway.",
  todo: "The list will still be there. What matters is that for one minute, it didn't get to decide who you are.",
  ache: "An old ache only visits when it finally feels safe enough to be felt. Something in you is ready.",
  sadness: "Sadness that gets a minute of company is softer than sadness that gets silence. You gave it that.",
  nothing: "“Almost nothing” is the sound of a nervous system settling. Quiet like this is earned.",
  other:
    "Thank you for giving it your own words — naming what visits is how it begins to soften. I've kept them safe, and we'll meet them together.",
};
