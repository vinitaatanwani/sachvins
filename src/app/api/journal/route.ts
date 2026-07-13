import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

const bodySchema = z.object({
  // When present, this save edits an in-progress draft (the same journaling
  // session) instead of starting a new one. Absent → a brand-new entry, so a
  // person can journal as many times a day as they like, each one its own
  // entry with its own prompts and its own note from Vinita.
  entryId: z.string().uuid().optional(),
  prompt: z.string().min(1),
  content: z.string().min(1),
  // Absent in "just write" (free-flow) entries — present and required together
  // for the guided two-question reflection.
  prompt2: z.string().min(1).optional(),
  content2: z.string().min(1).optional(),
  focusArea: z.enum([
    "focus_attention",
    "self_worth",
    "relationships",
    "career_purpose",
    "emotional_world",
    "spirituality",
  ]),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { entryId, prompt, content, prompt2, content2, focusArea } = parsed.data;

  let entry;
  if (entryId) {
    // Editing an existing draft — verify ownership before touching it.
    const existing = await prisma.journalEntry.findUnique({ where: { id: entryId } });
    if (!existing || existing.profileId !== deviceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const contentChanged =
      existing.content !== content || (existing.content2 ?? null) !== (content2 ?? null);
    entry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        content,
        content2: content2 ?? null,
        // A stale reflection would no longer match edited content — clear it so
        // the next request regenerates a fresh note instead of showing old advice.
        ...(contentChanged ? { reflection: null } : {}),
      },
    });
  } else {
    // A fresh journaling session — always a new entry.
    entry = await prisma.journalEntry.create({
      data: { profileId: deviceId, prompt, content, prompt2: prompt2 ?? null, content2: content2 ?? null, focusArea },
    });
  }

  return NextResponse.json({ entryId: entry.id, reflection: entry.reflection });
}
