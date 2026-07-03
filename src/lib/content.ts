import { FocusAreaKey, NervousSystemState } from "./quiz-data";

// PRD 4.3 — Journaling module. Prompts are organized into content "tracks"
// per focus area so new tracks can be added without rebuilding the app.
export const JOURNAL_PROMPTS: Record<FocusAreaKey, string[]> = {
  focus_attention: [
    "Before you write anything else — name three things pulling at your attention right now, without judging them.",
    "What does your mind do the moment it's given a quiet minute? Describe it like you're watching from the outside.",
    "Think of the last thing you started with excitement and put down unfinished. What happened right before you stopped?",
    "If your focus had a weather forecast today, what would it say?",
    "What's one task you're avoiding by staying \"busy\" with everything else?",
  ],
  self_worth: [
    "Finish this sentence five times: \"I am enough, even when...\"",
    "What's something you did well this week that you brushed off instead of acknowledging?",
    "Whose voice is loudest when you're being hard on yourself? Whose voice would you rather hear?",
    "Write about a compliment you received recently. What made it hard (or easy) to accept?",
    "If a close friend felt exactly what you're feeling about yourself right now, what would you say to them?",
  ],
  relationships: [
    "Where in your life are you giving more than feels sustainable? What would it cost to give a little less?",
    "Describe a moment recently when you wanted to say something and didn't. What stopped you?",
    "Which version of yourself shows up around the people you feel safest with?",
    "What does being truly seen by someone else feel like in your body?",
    "Write a boundary you've been meaning to set, exactly as you'd want to say it out loud.",
  ],
  career_purpose: [
    "If fear weren't part of the equation, what would you be doing differently in your work right now?",
    "What does \"wasting your potential\" mean to you — and whose definition of potential is it?",
    "Describe the version of your career that would feel like coming home rather than performing.",
    "What's the smallest possible step toward the goal you keep avoiding?",
    "Whose idea of success have you been chasing? Is it still yours?",
  ],
  emotional_world: [
    "What feeling have you been pushing down today so you could keep going?",
    "Where do you feel emotional exhaustion in your body right now?",
    "Try naming — without fixing — three emotions present for you at this exact moment.",
    "What would it look like to let yourself feel something fully, just for two minutes?",
    "When did you last feel truly at rest? What made that possible?",
  ],
  spirituality: [
    "What gives your days a sense of thread or meaning, even on ordinary ones?",
    "Sit in silence for sixty seconds before writing. What surfaced?",
    "What would it mean to trust that your struggles are part of a longer story rather than random noise?",
    "Describe a moment recently when you felt connected to something larger than yourself.",
    "What practice, however small, makes you feel most like yourself?",
  ],
};

export function getDailyPrompt(focusArea: FocusAreaKey, dayIndex: number): string {
  const prompts = JOURNAL_PROMPTS[focusArea];
  return prompts[dayIndex % prompts.length];
}

// PRD 4.4 — Guided meditation module. No audio narration asset yet, so each
// track is a self-guided sequence of timed steps with a breathing pacer.
export interface MeditationStep {
  label: string;
  seconds: number;
  cue?: string;
}

export interface MeditationTrack {
  id: string;
  title: string;
  timeOfDay: "morning" | "evening";
  durationMin: number;
  focusAreas: FocusAreaKey[];
  nervousSystemStates: NervousSystemState[];
  description: string;
  steps: MeditationStep[];
}

export const MEDITATIONS: MeditationTrack[] = [
  {
    id: "morning-grounding",
    title: "Morning Grounding",
    timeOfDay: "morning",
    durationMin: 7,
    focusAreas: ["focus_attention", "emotional_world"],
    nervousSystemStates: ["fight_flight", "regulated"],
    description: "Grounding, nervous-system regulation, and intention-setting to open the day.",
    steps: [
      { label: "Settle in", seconds: 60, cue: "Find a comfortable seat. Let your eyes close or soften." },
      { label: "Breathe: 4 in · 4 hold · 6 out", seconds: 180, cue: "Follow the circle. In for 4, hold for 4, out for 6." },
      { label: "Body scan", seconds: 90, cue: "Notice your feet, your hands, your jaw. Let each one soften." },
      { label: "Set an intention", seconds: 90, cue: "Choose one word for how you want to move through today." },
    ],
  },
  {
    id: "morning-clarity",
    title: "Morning Clarity",
    timeOfDay: "morning",
    durationMin: 5,
    focusAreas: ["career_purpose", "self_worth"],
    nervousSystemStates: ["regulated", "freeze_fawn"],
    description: "A shorter grounding practice for mornings that call for gentle momentum.",
    steps: [
      { label: "Arrive", seconds: 45, cue: "Notice you're here. Nothing to fix yet." },
      { label: "Breathe: 4 in · 4 hold · 6 out", seconds: 150, cue: "Let the breath slow, one cycle at a time." },
      { label: "One true thing", seconds: 105, cue: "Silently name one true, kind thing about yourself." },
    ],
  },
  {
    id: "evening-release",
    title: "Evening Release",
    timeOfDay: "evening",
    durationMin: 10,
    focusAreas: ["emotional_world", "relationships"],
    nervousSystemStates: ["fight_flight", "freeze_fawn"],
    description: "Release, processing, and sleep wind-down for the end of the day.",
    steps: [
      { label: "Arrive", seconds: 60, cue: "Let the day begin to loosen its grip." },
      { label: "Release breath: 4 in · 7 hold · 8 out", seconds: 240, cue: "A longer exhale to signal safety to your body." },
      { label: "Name what you're carrying", seconds: 120, cue: "Silently name anything from today you're still holding." },
      { label: "Let go, one layer at a time", seconds: 180, cue: "With each exhale, imagine setting one thing down." },
    ],
  },
  {
    id: "evening-winddown",
    title: "Evening Wind-Down",
    timeOfDay: "evening",
    durationMin: 12,
    focusAreas: ["spirituality", "focus_attention"],
    nervousSystemStates: ["regulated", "fight_flight"],
    description: "A slower descent into rest for a busy or overstimulated mind.",
    steps: [
      { label: "Dim the noise", seconds: 90, cue: "Let the sounds of the day fade to the background." },
      { label: "Release breath: 4 in · 7 hold · 8 out", seconds: 300, cue: "Slow the exhale further with every round." },
      { label: "Body scan to sleep", seconds: 180, cue: "Move attention slowly from head to feet, releasing tension." },
      { label: "Rest", seconds: 150, cue: "No more instructions. Just rest here." },
    ],
  },
];

// PRD 4.5 — Sound frequency module. Generated live via the Web Audio API
// (oscillator tones) rather than static audio files. Framed as relaxation /
// nervous-system support, not a clinical or medical claim (PRD Section 8).
export interface SoundTrack {
  id: string;
  hz: number;
  title: string;
  theme: string;
  nervousSystemStates: NervousSystemState[];
}

export const SOUND_TRACKS: SoundTrack[] = [
  { id: "hz-174", hz: 174, title: "174 Hz — Grounding", theme: "Tension release, a felt sense of safety", nervousSystemStates: ["fight_flight"] },
  { id: "hz-396", hz: 396, title: "396 Hz — Letting Go", theme: "Releasing fear and guilt", nervousSystemStates: ["freeze_fawn", "fight_flight"] },
  { id: "hz-417", hz: 417, title: "417 Hz — Clearing", theme: "Undoing situations, facilitating change", nervousSystemStates: ["freeze_fawn"] },
  { id: "hz-528", hz: 528, title: "528 Hz — Calm & Repair", theme: "Calm, balance, transformation", nervousSystemStates: ["regulated", "fight_flight", "freeze_fawn"] },
  { id: "hz-639", hz: 639, title: "639 Hz — Connection", theme: "Relationships and reconnecting", nervousSystemStates: ["regulated"] },
  { id: "hz-741", hz: 741, title: "741 Hz — Focus", theme: "Clarity, problem-solving, focus", nervousSystemStates: ["regulated"] },
  { id: "hz-852", hz: 852, title: "852 Hz — Stillness", theme: "Quieting the mind, returning to spirit", nervousSystemStates: ["regulated", "freeze_fawn"] },
];

export function recommendedSoundTrack(state: NervousSystemState | null | undefined): SoundTrack {
  const fallback = SOUND_TRACKS.find((t) => t.id === "hz-528")!;
  if (!state) return fallback;
  return SOUND_TRACKS.find((t) => t.nervousSystemStates.includes(state)) ?? fallback;
}

export function recommendedMeditation(
  focusArea: FocusAreaKey | null | undefined,
  state: NervousSystemState | null | undefined,
  timeOfDay: "morning" | "evening"
): MeditationTrack {
  const candidates = MEDITATIONS.filter((m) => m.timeOfDay === timeOfDay);
  const withFocus = focusArea ? candidates.filter((m) => m.focusAreas.includes(focusArea)) : candidates;
  const pool = withFocus.length ? withFocus : candidates;
  const withState = state ? pool.filter((m) => m.nervousSystemStates.includes(state)) : pool;
  return (withState.length ? withState : pool)[0];
}
