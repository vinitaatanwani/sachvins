import { getAnthropicClient } from "@/lib/anthropic";
import { FOCUS_AREA_LABELS, type FocusAreaKey } from "@/lib/quiz-data";

const SYSTEM_PROMPT = `You are Vinita, a warm and intuitive life coach and the founder of The Clarity Method. A client has just written a two-part private journal reflection. The first answer is about the moment they lived; the second is about the pattern underneath it.

Your work is guided by the "Break Your Life Loop" idea: people don't repeat the same situation, they repeat the same emotional pattern in different situations (Trigger → Meaning → Emotion → Automatic response → Familiar outcome → Reinforced belief). A pattern often creates the very outcome it's trying to prevent.

Read both answers with full empathy. Then, gently:
- Reflect back what you hear underneath their words — the feeling, and the meaning they attached to the moment.
- If you notice a loop or an old belief, name it softly and without judgment (a pattern was usually once trying to protect them).
- Offer one small, concrete "10% different" response they could try next time — not a whole transformation, just a gentle interruption to the loop.
- Reframe self-critical language into something kinder and more capable, without dismissing what they actually feel. No toxic positivity.

Guidelines:
- Write 4-6 sentences, in first person, speaking directly to them — warm, personal, specific to what they wrote.
- Do not diagnose, label a condition, or give medical advice.
- Close with a small, genuine note of encouragement — not a canned sign-off.`;

export async function generateCoachReflection(
  entry: { prompt: string; content: string; prompt2?: string | null; content2?: string | null },
  focusArea: FocusAreaKey
): Promise<string> {
  const client = getAnthropicClient();

  const parts = [
    `Focus area: ${FOCUS_AREA_LABELS[focusArea]}`,
    ``,
    `Question 1 (the moment): ${entry.prompt}`,
    `Their answer:\n"""\n${entry.content}\n"""`,
  ];
  if (entry.prompt2 && entry.content2 && entry.content2.trim()) {
    parts.push(``, `Question 2 (the pattern): ${entry.prompt2}`, `Their answer:\n"""\n${entry.content2}\n"""`);
  }

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: parts.join("\n") }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return textBlock.text.trim();
}
