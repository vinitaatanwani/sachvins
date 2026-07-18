// EFT (Emotional Freedom Technique / "tapping") sessions — a text/timer-guided
// tapping flow, no audio needed. Each session: a setup statement (tapped on the
// side of the hand), then a round through the tapping points, each with a short
// reminder phrase. The player rates distress 0–10 before and after.

export interface EftPoint {
  key: string;
  label: string; // where to tap
  where: string; // one-line hint on locating it
  phrase: string; // what to say while tapping there
  x: number; // face-diagram coords (viewBox 0 0 200 224)
  y: number;
}

export interface EftSession {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  membersOnly?: boolean;
  // What they name at the start ("this anger", woven into the phrases).
  feelingLabel: string;
  setup: string; // repeated 3× on the side of the hand
  points: EftPoint[];
  secondsPerPoint: number;
  closing: string;
}

export const EFT_SESSIONS: EftSession[] = [
  {
    id: "let-go-of-anger",
    title: "Let go of anger",
    description: "Tap through a hot, stuck feeling until it softens.",
    durationMin: 5,
    feelingLabel: "this anger",
    setup: "Even though I feel this anger burning in me, I deeply and completely accept myself.",
    secondsPerPoint: 13,
    points: [
      { key: "eyebrow", label: "Eyebrow", where: "inner edge of the brow", phrase: "This anger I'm carrying", x: 74, y: 92 },
      { key: "side_eye", label: "Side of the eye", where: "the bone beside your eye", phrase: "It has every reason to be here", x: 58, y: 104 },
      { key: "under_eye", label: "Under the eye", where: "the bone under your eye", phrase: "This heat in my body", x: 80, y: 120 },
      { key: "under_nose", label: "Under the nose", where: "above your lip", phrase: "I don't have to push it down", x: 100, y: 134 },
      { key: "chin", label: "Chin", where: "the crease below your lip", phrase: "And I don't have to act on it", x: 100, y: 168 },
      { key: "collarbone", label: "Collarbone", where: "just below where a necklace sits", phrase: "It's safe to feel this anger", x: 100, y: 206 },
      { key: "under_arm", label: "Under the arm", where: "a hand's width below the armpit", phrase: "Safe to let it move through me", x: 170, y: 150 },
      { key: "top_head", label: "Top of the head", where: "the crown of your head", phrase: "I'm allowed to come back to calm", x: 100, y: 30 },
    ],
    closing:
      "Notice what's shifted. Anger was never the enemy — it was energy asking to be heard. You heard it, and let some of it move on.",
  },
];

export function eftById(id: string): EftSession | undefined {
  return EFT_SESSIONS.find((s) => s.id === id);
}
