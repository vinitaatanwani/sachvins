import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/profile";
import { quietProgress, ARRIVED_OPTIONS } from "@/lib/quiet";

const bodySchema = z.object({
  seconds: z.number().int().min(30).max(600),
  arrived: z.enum(ARRIVED_OPTIONS.map((o) => o.key) as [string, ...string[]]).optional(),
});

// Records a completed Quiet Minute sit (members only) and returns the updated
// capacity progress so the after-screen can show growth immediately.
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!profile.membershipActive) return NextResponse.json({ error: "Members only" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.quietSit.create({
    data: { profileId: profile.id, seconds: parsed.data.seconds, arrived: parsed.data.arrived ?? null },
  });

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [totalSits, sitsThisWeek] = await Promise.all([
    prisma.quietSit.count({ where: { profileId: profile.id } }),
    prisma.quietSit.count({ where: { profileId: profile.id, createdAt: { gte: weekAgo } } }),
  ]);

  return NextResponse.json({ ...quietProgress(totalSits), sitsThisWeek });
}
