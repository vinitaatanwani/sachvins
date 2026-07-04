import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

const bodySchema = z.object({
  prompt: z.string().min(1),
  content: z.string().min(1),
  prompt2: z.string().min(1),
  content2: z.string().min(1),
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

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const existing = await prisma.journalEntry.findFirst({
    where: { profileId: deviceId, date: { gte: startOfToday } },
  });

  const contentChanged =
    existing &&
    (existing.content !== parsed.data.content || existing.content2 !== parsed.data.content2);

  const entry = existing
    ? await prisma.journalEntry.update({
        where: { id: existing.id },
        data: {
          content: parsed.data.content,
          content2: parsed.data.content2,
          prompt2: parsed.data.prompt2,
          // A stale reflection would no longer match edited content — clear
          // it so the next request regenerates one instead of showing old advice.
          ...(contentChanged ? { reflection: null } : {}),
        },
      })
    : await prisma.journalEntry.create({
        data: {
          profileId: deviceId,
          prompt: parsed.data.prompt,
          content: parsed.data.content,
          prompt2: parsed.data.prompt2,
          content2: parsed.data.content2,
          focusArea: parsed.data.focusArea,
        },
      });

  return NextResponse.json({ entryId: entry.id, reflection: entry.reflection });
}
