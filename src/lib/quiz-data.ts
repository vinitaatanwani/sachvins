// The Clarity Method — 20-question diagnostic assessment.
// Ported from Questions/clarity-questionnaire_1.html (Rarely -> Always, 1-4 scale),
// grouped into the 6 life-area domains named in the PRD (Section 4.1).

export type FocusAreaKey =
  | "focus_attention"
  | "self_worth"
  | "relationships"
  | "career_purpose"
  | "emotional_world"
  | "spirituality";

export type NervousSystemState = "regulated" | "fight_flight" | "freeze_fawn";

export type ScoreLevel = "high" | "medium" | "low";

export interface QuizQuestion {
  id: string; // q1..q20
  text: string;
  domain: FocusAreaKey;
}

export interface DomainDef {
  key: FocusAreaKey;
  name: string;
  icon: string;
  sectionTag: string;
  intro: string;
  questionIds: string[];
}

export const DOMAINS: DomainDef[] = [
  {
    key: "focus_attention",
    name: "Focus & Attention",
    icon: "\u{1F300}",
    sectionTag: "Area 1 of 6 — Focus & Attention",
    intro: "Your mind and where it wanders",
    questionIds: ["q1", "q2", "q3", "q4", "q5", "q6"],
  },
  {
    key: "self_worth",
    name: "Self-Worth",
    icon: "\u{1F49B}",
    sectionTag: "Area 2 of 6 — Self-Worth",
    intro: "The voice inside your head",
    questionIds: ["q7", "q8", "q9", "q10", "q11", "q12"],
  },
  {
    key: "relationships",
    name: "Relationships",
    icon: "\u{1F33F}",
    sectionTag: "Area 3 of 6 — Relationships",
    intro: "How you connect with others",
    questionIds: ["q13", "q14", "q15", "q16", "q17", "q18"],
  },
  {
    key: "career_purpose",
    name: "Career & Purpose",
    icon: "\u{1F9ED}",
    sectionTag: "Area 4 of 6 — Career & Purpose",
    intro: "Your work and your calling",
    questionIds: ["q19", "q20", "q21", "q22", "q23", "q24"],
  },
  {
    key: "emotional_world",
    name: "Emotional World",
    icon: "\u{1F30A}",
    sectionTag: "Area 5 of 6 — Emotional World",
    intro: "The feelings underneath",
    questionIds: ["q25", "q26", "q27", "q28", "q29", "q30"],
  },
  {
    key: "spirituality",
    name: "Spirituality & Meaning",
    icon: "✨",
    sectionTag: "Area 6 of 6 — Spirituality & Meaning",
    intro: "Your inner world and sense of meaning",
    questionIds: ["q31", "q32", "q33", "q34", "q35", "q36"],
  },
];

export const QUESTIONS: QuizQuestion[] = [
  { id: "q1", domain: "focus_attention", text: "I get pulled away from tasks by other thoughts or distractions almost immediately" },
  { id: "q2", domain: "focus_attention", text: "I replay past conversations or worry about future ones — even when trying to rest" },
  { id: "q3", domain: "focus_attention", text: "I start projects or ideas with excitement but lose momentum before finishing them" },
  { id: "q4", domain: "focus_attention", text: "My mind feels like a browser with too many tabs open — constantly running in the background" },
  { id: "q5", domain: "focus_attention", text: "I find it hard to be fully present with people in front of me because my mind is somewhere else" },
  { id: "q6", domain: "focus_attention", text: "Even small decisions feel exhausting because my mind won't stop weighing every option" },
  { id: "q7", domain: "self_worth", text: "When I make a mistake, I beat myself up for much longer than the situation deserves" },
  { id: "q8", domain: "self_worth", text: "I deflect compliments or find it hard to truly believe them when I receive them" },
  { id: "q9", domain: "self_worth", text: "My choices are driven by fear of disappointing others rather than what I genuinely want" },
  { id: "q10", domain: "self_worth", text: "I feel a quiet sense of not being “enough” — even when things seem to be going well" },
  { id: "q11", domain: "self_worth", text: "I compare myself to other people and come away feeling like I'm falling behind" },
  { id: "q12", domain: "self_worth", text: "I hold myself to standards I would never expect from someone I love" },
  { id: "q13", domain: "relationships", text: "I give a lot in relationships and feel depleted or resentful afterwards" },
  { id: "q14", domain: "relationships", text: "I avoid conflict or shut down — then regret not expressing what I actually felt" },
  { id: "q15", domain: "relationships", text: "I wear different versions of myself depending on who I'm with, hiding parts of who I am" },
  { id: "q16", domain: "relationships", text: "I struggle to ask for help, even when I'm clearly carrying more than I can manage" },
  { id: "q17", domain: "relationships", text: "I find it hard to trust that people will still care about me once they see the real me" },
  { id: "q18", domain: "relationships", text: "I keep people at a slight distance so they can't get close enough to disappoint me" },
  { id: "q19", domain: "career_purpose", text: "I feel like I'm wasting my potential or not living the life I imagined for myself" },
  { id: "q20", domain: "career_purpose", text: "I procrastinate on things that matter most — the bigger the goal, the more I avoid it" },
  { id: "q21", domain: "career_purpose", text: "I feel confused about what I actually want from my career — or stuck in someone else's idea of success" },
  { id: "q22", domain: "career_purpose", text: "I measure my worth by how productive or accomplished I've been that day" },
  { id: "q23", domain: "career_purpose", text: "I say yes to work or commitments I don't actually want, out of obligation or fear" },
  { id: "q24", domain: "career_purpose", text: "I feel like I'm performing a role at work rather than being who I actually am" },
  { id: "q25", domain: "emotional_world", text: "I push emotions down and keep going — until they show up as exhaustion, irritability, or a breakdown" },
  { id: "q26", domain: "emotional_world", text: "I feel emotionally exhausted — even after doing nothing, or resting doesn't feel like rest" },
  { id: "q27", domain: "emotional_world", text: "I go numb or disconnect from what I'm feeling rather than sitting with difficult emotions" },
  { id: "q28", domain: "emotional_world", text: "I struggle to name what I'm actually feeling, even when something is clearly affecting me" },
  { id: "q29", domain: "emotional_world", text: "Small setbacks trigger a reaction that feels bigger than the moment itself" },
  { id: "q30", domain: "emotional_world", text: "I feel guilty or selfish when I take time to rest or care for myself" },
  { id: "q31", domain: "spirituality", text: "I feel like I'm just going through the motions — disconnected from any real sense of purpose" },
  { id: "q32", domain: "spirituality", text: "Silence or stillness feels uncomfortable — my mind fills it with noise, worry, or restlessness" },
  { id: "q33", domain: "spirituality", text: "My struggles feel random or pointless — I can't find a deeper meaning or thread connecting them" },
  { id: "q34", domain: "spirituality", text: "I feel disconnected from my body, like I'm living entirely in my head" },
  { id: "q35", domain: "spirituality", text: "I long for a sense of belonging or connection to something bigger than my daily routine" },
  { id: "q36", domain: "spirituality", text: "I've stopped doing things that used to bring me a sense of wonder or aliveness" },
];

export type QuizAnswers = Record<string, number>; // qId -> 1..4

export interface DomainScore {
  key: FocusAreaKey;
  name: string;
  icon: string;
  score: number; // 0-100
  level: ScoreLevel;
}

// Domain score is a 0-100 *wellness* score: higher = healthier/stronger in that
// area, lower = more work needed there. (The underlying questions are phrased
// as negative-pattern frequency statements, so this is 100 minus that raw
// frequency — inverted so the number reads intuitively for users.)
export function scoreDomain(domain: DomainDef, answers: QuizAnswers): number {
  const total = domain.questionIds.reduce((sum, qId) => sum + (answers[qId] ?? 0), 0);
  const frequencyScore = Math.round((total / (domain.questionIds.length * 4)) * 100);
  return 100 - frequencyScore;
}

// Thresholds operate on the wellness score above: a low score means the
// negative pattern shows up often, i.e. this area needs the most attention.
export function getLevel(score: number): ScoreLevel {
  if (score <= 35) return "high";
  if (score <= 64) return "medium";
  return "low";
}

export function scoreAllDomains(answers: QuizAnswers): DomainScore[] {
  return DOMAINS.map((d) => {
    const score = scoreDomain(d, answers);
    return { key: d.key, name: d.name, icon: d.icon, score, level: getLevel(score) };
  });
}

// Secondary scoring layer: maps answers to a nervous-system state (PRD 4.1),
// used to drive the sound-frequency recommendation. Heuristic, not diagnostic.
export function scoreNervousSystemState(answers: QuizAnswers): NervousSystemState {
  // q1/q2/q4 = focus_attention (racing/looping mind), q25/q26 = emotional_world
  // (pushing feelings down until they erupt, chronic exhaustion) — all hyperarousal signals.
  const hyperarousal =
    ((answers.q1 ?? 0) + (answers.q2 ?? 0) + (answers.q4 ?? 0) + (answers.q25 ?? 0) + (answers.q26 ?? 0)) / 5;
  // q27 = emotional_world (going numb), q14 = relationships (shutting down) — hypoarousal signals.
  const hypoarousal = ((answers.q27 ?? 0) + (answers.q14 ?? 0)) / 2;

  const activation = Math.max(hyperarousal, hypoarousal);
  if (activation < 2.25) return "regulated"; // roughly "rarely/sometimes" on average
  return hyperarousal >= hypoarousal ? "fight_flight" : "freeze_fawn";
}

export function primaryAndSecondaryFocus(scores: DomainScore[]): {
  primary: FocusAreaKey;
  secondary: FocusAreaKey;
} {
  // Scores are now wellness scores (higher = healthier), so the area that needs
  // the most work is the LOWEST-scoring one. Sort ascending and take the first.
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  return { primary: sorted[0].key, secondary: sorted[1].key };
}

export const AREA_DESCRIPTIONS: Record<ScoreLevel, Record<FocusAreaKey, string>> = {
  high: {
    focus_attention:
      "Your mind is working overtime — switching, spiralling, never quite landing. This isn't laziness or lack of willpower. Your nervous system is in a chronic state of alert, and your brain is doing its best to protect you. The work here isn't about forcing focus. It's about creating enough inner safety that stillness becomes possible.",
    self_worth:
      "A significant part of your energy goes toward managing how others see you — because somewhere along the way, you learned that your value was conditional. The inner critic is loud. This is usually the wound that sits at the root of almost everything else. It is also the one that responds most deeply to the right kind of healing.",
    relationships:
      "You carry the weight of your relationships differently. Either you give until you're empty, or you protect yourself by staying behind glass. Both are survival strategies — and both are keeping you from the deep connection you actually want and deserve.",
    career_purpose:
      "There's a real gap between where you are and where you sense you could be — and that gap is painful. The procrastination isn't laziness. It's often fear wearing a very convincing disguise. Something in you knows you're capable of more. That knowing makes the distance harder to sit with.",
    emotional_world:
      "Your emotional body is exhausted. You've been holding a lot — possibly for a very long time — without adequate support or release. The fatigue isn't just tiredness. It's the cost of carrying unprocessed feeling. Healing here begins with one thing: permission to feel what you feel, without rushing to fix it.",
    spirituality:
      "You're searching. Something inside you knows there's more — more meaning, more depth, more connection to something larger than the daily grind. But that knowing lives right next to a deep disconnection. The silence feels uncomfortable because it's where all the unanswered questions live.",
  },
  medium: {
    focus_attention:
      "You have a functional relationship with focus, but it costs you more than it should. There are conditions where you thrive — and others where everything falls apart. Understanding those patterns is the key to working with your mind, rather than against it.",
    self_worth:
      "Your relationship with yourself is a work in progress. There are moments of genuine self-trust — and moments where the doubt rushes back in. You're more aware of your patterns than most, which is actually the hardest and most important step.",
    relationships:
      "You navigate relationships with care — sometimes too much care. The desire to be understood is there, alongside a caution about being too much or not enough. Some of this is wisdom. Some of it is protection. Learning to tell the difference is the work.",
    career_purpose:
      "You have a sense of direction but it feels more like a negotiation than a calling. There's alignment in some areas and friction in others. The question of “is this really what I want” visits you more often than you'd like — and that question deserves a real answer.",
    emotional_world:
      "You feel things deeply and have some tools for it — but the emotional world can still catch you off guard. Some feelings move through easily. Others get stuck. The work is building a more fluent, trusting relationship with the full range of what you carry.",
    spirituality:
      "There are glimpses of something real for you — moments of presence, of meaning, of connection. They're just not consistent yet. Building a deeper, more stable inner life is the work, and you're closer to it than you might think.",
  },
  low: {
    focus_attention:
      "Your capacity for focus is relatively stable — a genuine strength. The goal now is protecting and deepening that, especially in a world designed to fragment attention at every turn.",
    self_worth:
      "You have a fairly grounded sense of who you are. This is genuinely rare and worth acknowledging. There may still be specific relationships or situations where old patterns surface — healing is always a layer deeper than it looks.",
    relationships:
      "You have the capacity for real connection and navigate relationships with some grace. The work here is likely about depth and specificity rather than fundamental repair.",
    career_purpose:
      "You have a meaningful sense of alignment in your work and life direction. The journey now is about refinement — going deeper into what already feels true and clearing what still doesn't.",
    emotional_world:
      "Your emotional intelligence is a real asset. You move through feelings without being ruled by them. This doesn't mean there's nothing to heal — just that you have strong ground to build on.",
    spirituality:
      "You have a living, working inner life. The sense of meaning and presence is real for you. The invitation now is to go deeper — and to let that inner knowing inform every other area of your life.",
  },
};

export function getLevelLabel(level: ScoreLevel): string {
  if (level === "high") return "Needs most attention";
  if (level === "medium") return "Growing edge";
  return "Relative strength";
}

export function buildEmotionalPortrait(scores: DomainScore[]): string {
  // Lowest wellness scores = the areas that need the most care — those are the
  // "challenges" to name here.
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  const top2 = sorted.slice(0, 2).map((s) => s.name.toLowerCase());
  return `You are someone who feels things at a frequency most people can't hear. The challenges you face in ${top2[0]} and ${top2[1]} aren't character flaws — they are signals from a system that has been trying to cope, adapt, and survive in a world that wasn't built for the way your mind and heart work. You've probably been told to try harder, be more consistent, or be less sensitive. None of that advice touched the root. The root is usually older, quieter, and more tender than anyone around you has acknowledged. What you're about to embark on isn't about becoming a better-functioning version of who you are right now. It's about coming home to who you were before the world told you that you were too much — or not enough.`;
}

export const FOCUS_AREA_LABELS: Record<FocusAreaKey, string> = {
  focus_attention: "Focus & Attention",
  self_worth: "Self-Worth",
  relationships: "Relationships",
  career_purpose: "Career & Purpose",
  emotional_world: "Emotional World",
  spirituality: "Spirituality & Meaning",
};
