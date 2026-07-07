import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { generateCoachReflection } from "@/lib/coach-reflection";
import { getCoachFallback } from "@/lib/content";

const bodySchema = z.object({ entryId: z.string().uuid() });

// Stable per-entry index so an entry always maps to the same fallback message
// (and different entries tend to get different ones).
function entrySeed(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return sum;
}

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const entry = await prisma.journalEntry.findUnique({ where: { id: parsed.data.entryId } });
  if (!entry || entry.profileId !== deviceId) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  if (!entry.content || entry.content.trim().length === 0) {
    return NextResponse.json({ error: "Entry has no content yet" }, { status: 400 });
  }

  if (entry.reflection) {
    return NextResponse.json({ reflection: entry.reflection });
  }

  // Always end up with a note we can persist, so every entry keeps a message
  // from Vinita that's viewable later in Past — even when the live AI reflection
  // isn't available (e.g. ANTHROPIC_API_KEY unset). A stored fallback beats a
  // 500 that would leave the entry note-less.
  let reflection: string;
  try {
    reflection = await generateCoachReflection(
      { prompt: entry.prompt, content: entry.content, prompt2: entry.prompt2, content2: entry.content2 },
      entry.focusArea
    );
  } catch {
    reflection = getCoachFallback(entrySeed(entry.id));
  }

  await prisma.journalEntry.update({ where: { id: entry.id }, data: { reflection } });
  return NextResponse.json({ reflection });
}
