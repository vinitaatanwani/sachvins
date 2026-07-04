import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

const bodySchema = z.object({
  trackId: z.string().min(1),
  title: z.string().min(1),
  minutes: z.number().int().min(0).max(120),
});

// Records a completed meditation session (powers engagement tracking in the
// owner console).
export async function POST(req: NextRequest) {
  const profileId = await getDeviceId();
  if (!profileId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.meditationSession.create({
    data: { profileId, ...parsed.data },
  });

  return NextResponse.json({ ok: true });
}
