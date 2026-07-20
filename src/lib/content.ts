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

// Marker prompt for free-writing entries — "just write" mode, no questions.
export const FREE_WRITING_PROMPT = "Free writing";

export interface JournalPromptSet {
  q1: string;
  q2: string;
}

// Two connected questions, drawn from Vinita's Break Your Life Loop method.
// Q1 gently surfaces the wound — a lived moment and the feeling inside it.
// Q2 builds directly on that same feeling to reveal the pattern and belief
// underneath (locate → meaning → protection → a 10%-different next step), so
// the person moves from "what happened" to "what's really going on in me."
export const JOURNAL_PAIRS: JournalPromptSet[] = [
  {
    q1: "Bring to mind a moment recently that quietly stung — something that made you shrink, react, or overthink. What happened, and what did you feel underneath it?",
    q2: "Sit with that feeling. Where have you felt it before? What does a younger part of you believe that moment says about you — and is that belief truly a fact, or an old story?",
  },
  {
    q1: "When did you last feel not quite enough, unseen, or too much? Describe the moment, and name the feeling as honestly as you can.",
    q2: "What did you do right after — reach out, go quiet, over-give, prove yourself, pull away? What is that reaction trying to protect you from?",
  },
  {
    q1: "Think of something you keep replaying in your mind. What is the moment, and what emotion sits at the very centre of it?",
    q2: "If that emotion could speak, what old fear would it name? And what might soften if you knew that fear wasn't the whole truth about you?",
  },
  {
    q1: "Recall a moment you felt an urge to react strongly — to chase, defend, fix, or disappear. What set it off, and what did you feel first?",
    q2: "That urge has visited before. What does following it quietly cost you each time — and what would a calmer version of you choose instead, even 10% different?",
  },
  {
    q1: "What situation lately left you feeling a way you've felt many times before? Name the moment, and the feeling it stirred.",
    q2: "Trace it gently backwards — what's the earliest time you remember this feeling? What did you need back then that you may still be reaching for now?",
  },
  {
    q1: "Where in your life right now do you feel most tender, stuck, or on repeat? Describe one recent moment that captures it.",
    q2: "What story does your mind tell about why it keeps happening? Whose voice does that story sound like — and is it really yours to keep carrying?",
  },
];

// A daily two-part reflection. focusArea is kept for context (used by the coach
// reflection); the connected pair itself rotates by day.
export function getDailyPromptSet(_focusArea: FocusAreaKey, dayIndex: number): JournalPromptSet {
  return JOURNAL_PAIRS[((dayIndex % JOURNAL_PAIRS.length) + JOURNAL_PAIRS.length) % JOURNAL_PAIRS.length];
}

// Replies shown after journaling when the live AI reflection isn't available
// (e.g. ANTHROPIC_API_KEY unset). Composed from Vinita's own "Heartfelt
// Messages" — each acknowledges the sharing, validates the feeling, then
// offers one gentle step forward, in her voice.
export const COACH_FALLBACKS: string[] = [
  "Thank you for trusting me with something so precious. I know it wasn't easy to share. Your feelings make sense — you don't need to apologize for them. You don't have to carry all of this by yourself anymore.",
  "I want you to know that I hear you. Every word. Every emotion. You are not too much — your heart has simply been carrying too much. Healing doesn't ask you to rush; it simply asks you to keep showing up.",
  "I'm really glad you told me instead of keeping it all inside. There is nothing wrong with you for feeling this way. Breathe — you've carried enough for one day.",
  "I can feel how heavy this has been for you. You don't have to pretend to be okay with me. Be patient with yourself — you're rebuilding from the inside.",
  "Thank you for choosing honesty over pretending. You are allowed to feel broken and hopeful at the same time. Let yourself feel — feelings are meant to move.",
  "Thank you for letting me witness your truth. You are not weak because something hurt you deeply. You have permission to begin again.",
  "There is courage in simply saying, 'I'm not okay.' Nothing about your emotions makes you difficult to love. I hope today is a little softer than yesterday.",
  "Thank you for letting me walk beside you. You don't have to prove your pain for it to be real. One small step is still a step — and you've just taken one.",
  "I hope you know how incredibly brave you are. Even in this moment, I see your strength. You have survived every difficult day before this one.",
  "Your story deserves compassion, not judgment — especially from yourself. Please don't carry blame that was never yours. Your heart deserves peace, not punishment.",
  "I'm holding space for everything you're feeling. It's okay if today feels hard — it doesn't mean tomorrow will. Some days surviving is enough, and it counts.",
  "You are doing better than your inner critic wants you to believe. This chapter does not define your entire story. Please celebrate yourself for making it this far.",
  "Every word you wrote matters, and so do you. You don't need to have all the answers today. Your healing is not behind anyone else's.",
  "I see someone who has not given up. Your light hasn't disappeared — it's just resting. There is hope, even if you can't see it clearly yet.",
  "What you shared tells me your heart is tired. Let's be gentle with it. You don't have to be strong every minute — you have permission to slow down.",
  "I know it may not feel like it today, but you are growing. You are becoming someone who won't abandon themselves anymore. That is quiet, powerful work.",
  "Sometimes tears are the body's way of making space for healing. It's okay to grieve the life you thought you would have. There are still beautiful moments waiting to find you.",
  "You matter more than you realize. You are enough without proving anything. May today remind you that hope can return quietly.",
  "Not every ending is a failure — some endings are protection. You are allowed to let go of what keeps hurting you. Your peace is worth protecting.",
  "Every scar tells me you kept going. One day this pain will no longer introduce you. I believe your heart will smile again.",
  "You are not behind in life — it is unfolding differently, not incorrectly. The version of you that kept going deserves gratitude. I'm grateful our paths crossed.",
  "You are becoming someone your younger self needed. Your softness is not your weakness. You deserve the same compassion you offer everyone else.",
  "You are not invisible — I see you. Even if you feel lost, you are not alone. Whatever happens next, remember that you never have to walk alone.",
  "Thank you for trusting your heart enough to let it speak. Your existence matters, your story matters. I truly believe brighter days are finding their way to you.",
];

export function getCoachFallback(dayIndex: number): string {
  return COACH_FALLBACKS[((dayIndex % COACH_FALLBACKS.length) + COACH_FALLBACKS.length) % COACH_FALLBACKS.length];
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
  timeOfDay: "morning" | "evening" | "any";
  durationMin: number;
  focusAreas: FocusAreaKey[];
  nervousSystemStates: NervousSystemState[];
  description: string;
  // A real recorded meditation (Vinita's voice). When set, the player plays the
  // audio instead of the silent self-guided step timer, and steps stays empty.
  audioSrc?: string;
  // Paid tier: when true, only Companion members can play this track. The
  // Grounding recording stays free for everyone; future uploads set this.
  membersOnly?: boolean;
  steps: MeditationStep[];
}

export const MEDITATIONS: MeditationTrack[] = [
  {
    id: "grounding-with-vinita",
    title: "Grounding with Vinita",
    timeOfDay: "any",
    durationMin: 9,
    focusAreas: ["focus_attention", "self_worth", "relationships", "career_purpose", "emotional_world", "spirituality"],
    nervousSystemStates: ["regulated", "fight_flight", "freeze_fawn"],
    description: "A guided grounding meditation in Vinita's own voice — settle, root, and come home to your body.",
    audioSrc: "/meditations/grounding-with-vinita.m4a",
    steps: [],
  },
  {
    id: "calm-repair-balance",
    title: "Calm, Repair & Balance",
    timeOfDay: "any",
    durationMin: 10,
    focusAreas: ["self_worth", "emotional_world", "relationships", "focus_attention", "career_purpose", "spirituality"],
    nervousSystemStates: ["regulated", "fight_flight", "freeze_fawn"],
    description: "Vinita guides you into calm, gentle repair, and inner balance — a members' session for heavier days.",
    audioSrc: "/meditations/calm-repair-balance.m4a",
    membersOnly: true,
    steps: [],
  },
  {
    id: "clearing-making-space",
    title: "Clearing — Making Space",
    timeOfDay: "any",
    durationMin: 11,
    focusAreas: ["emotional_world", "spirituality", "self_worth", "relationships", "focus_attention", "career_purpose"],
    nervousSystemStates: ["regulated", "fight_flight", "freeze_fawn"],
    description: "Let go of what you've been carrying and make room inside — a clearing meditation in Vinita's voice.",
    audioSrc: "/meditations/clearing-making-space.m4a",
    membersOnly: true,
    steps: [],
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

// Each focus area has a natural home frequency, so the recommended session
// changes with the person's current focus (switching focus → a new sound).
const FOCUS_SOUND: Record<FocusAreaKey, string> = {
  focus_attention: "hz-741", // clarity, problem-solving, focus
  self_worth: "hz-528", // calm, balance, transformation (the "love" frequency)
  relationships: "hz-639", // relationships and reconnecting
  career_purpose: "hz-417", // facilitating change, undoing stuck situations
  emotional_world: "hz-396", // releasing fear and guilt
  spirituality: "hz-852", // quieting the mind, returning to spirit
};

export function recommendedSoundTrack(
  focusArea: FocusAreaKey | null | undefined,
  state: NervousSystemState | null | undefined
): SoundTrack {
  const fallback = SOUND_TRACKS.find((t) => t.id === "hz-528")!;
  if (focusArea) return SOUND_TRACKS.find((t) => t.id === FOCUS_SOUND[focusArea]) ?? fallback;
  if (state) return SOUND_TRACKS.find((t) => t.nervousSystemStates.includes(state)) ?? fallback;
  return fallback;
}

export function recommendedMeditation(
  focusArea: FocusAreaKey | null | undefined,
  state: NervousSystemState | null | undefined,
  timeOfDay: "morning" | "evening"
): MeditationTrack {
  const candidates = MEDITATIONS.filter((m) => m.timeOfDay === timeOfDay || m.timeOfDay === "any");
  const withFocus = focusArea ? candidates.filter((m) => m.focusAreas.includes(focusArea)) : candidates;
  const pool = withFocus.length ? withFocus : candidates;
  const withState = state ? pool.filter((m) => m.nervousSystemStates.includes(state)) : pool;
  return (withState.length ? withState : pool)[0];
}
