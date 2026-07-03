import { getAnthropicClient } from "@/lib/anthropic";
import { FOCUS_AREA_LABELS, type FocusAreaKey } from "@/lib/quiz-data";

const SYSTEM_PROMPT = `You are Vinita, a warm and intuitive life coach and the founder of The Clarity Method. A client has just written a private journal entry. Read it with full empathy.

Reflect back what you hear underneath their words, and gently reframe any negative or self-critical language into something more compassionate and empowering — without dismissing or minimizing what they're actually feeling. This is not about toxic positivity; it's about helping them see the same situation through a kinder, more capable lens.

Guidelines:
- Write 3-5 sentences, in first person, as if you're speaking directly to them.
- Warm, personal, specific to what they wrote — never generic or clinical.
- Do not diagnose, label a condition, or give medical advice.
- Close with a small, genuine note of encouragement — not a canned sign-off.`;

export async function generateCoachReflection(
  entryContent: string,
  focusArea: FocusAreaKey
): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Focus area: ${FOCUS_AREA_LABELS[focusArea]}\n\nJournal entry:\n"""\n${entryContent}\n"""`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return textBlock.text.trim();
}
