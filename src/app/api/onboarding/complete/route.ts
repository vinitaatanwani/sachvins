import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

const bodySchema = z.object({
  focusArea: z.enum([
    "focus_attention",
    "self_worth",
    "relationships",
    "career_purpose",
    "emotional_world",
    "spirituality",
  ]),
  notificationTimeAm: z.string().optional(),
  notificationTimePm: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.profile.upsert({
    where: { id: deviceId },
    create: {
      id: deviceId,
      focusArea: parsed.data.focusArea,
      notificationTimeAm: parsed.data.notificationTimeAm,
      notificationTimePm: parsed.data.notificationTimePm,
      daysPerWeek: parsed.data.daysPerWeek,
      onboardedAt: now,
      trialStartedAt: now,
      trialEndsAt,
    },
    update: {
      focusArea: parsed.data.focusArea,
      notificationTimeAm: parsed.data.notificationTimeAm,
      notificationTimePm: parsed.data.notificationTimePm,
      daysPerWeek: parsed.data.daysPerWeek,
      onboardedAt: now,
      trialStartedAt: now,
      trialEndsAt,
    },
  });

  return NextResponse.json({ ok: true });
}
