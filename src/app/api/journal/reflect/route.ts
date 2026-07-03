import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { generateCoachReflection } from "@/lib/coach-reflection";

const bodySchema = z.object({ entryId: z.string().uuid() });

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

  let reflection: string;
  try {
    reflection = await generateCoachReflection(entry.content, entry.focusArea);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not generate a reflection right now" },
      { status: 500 }
    );
  }

  await prisma.journalEntry.update({ where: { id: entry.id }, data: { reflection } });
  return NextResponse.json({ reflection });
}
