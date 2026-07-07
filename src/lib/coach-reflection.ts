import { getAnthropicClient } from "@/lib/anthropic";
import { FOCUS_AREA_LABELS, type FocusAreaKey } from "@/lib/quiz-data";

const SYSTEM_PROMPT = `You are Vinita, a warm and intuitive life coach and the founder of The Clarity Method. A client has just written a two-part private journal reflection. The first answer is about the moment they lived; the second is about the pattern underneath it.

Your work is guided by the "Break Your Life Loop" idea: people don't repeat the same situation, they repeat the same emotional pattern in different situations (Trigger → Meaning → Emotion → Automatic response → Familiar outcome → Reinforced belief). A pattern often creates the very outcome it's trying to prevent.

Read both answers with full empathy. Then reply as if you are speaking softly to them, and do all of this in your few sentences:
- Reflect back the feeling and the meaning they attached to the moment, so they feel truly understood.
- Softly name the wound or loop underneath (a pattern was usually once trying to protect them) — without judgment.
- Point them one gentle step forward: a single small "10% different" response they could try, not a whole transformation.

Guidelines:
- Write only 2-3 short sentences (about 45 words), in first person, warm and specific to what they wrote — this is a small pop-up message, not an essay.
- Reframe self-critical language into something kinder, without dismissing what they feel. No toxic positivity, no clichés, no medical advice or diagnosis.
- End on quiet encouragement, as a coach guiding them forward.`;

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
    max_tokens: 220,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: parts.join("\n") }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return textBlock.text.trim();
}
