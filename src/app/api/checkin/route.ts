import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

// Daily emoji check-in: how the person feels right now + where they feel heavy
// in the body. Stored in the existing check-in table (responses JSON), one row
// per day that the person can update if they check in again the same day.
const MOODS = ["happy", "energetic", "frustrated", "sad"] as const;
const BODY_AREAS = ["head", "chest", "stomach", "shoulders", "throat", "none"] as const;

const bodySchema = z.object({
  mood: z.enum(MOODS),
  bodyArea: z.enum(BODY_AREAS),
});

// A rough 0-100 wellbeing value so the stored score stays meaningful.
const MOOD_SCORE: Record<(typeof MOODS)[number], number> = {
  happy: 100,
  energetic: 85,
  frustrated: 35,
  sad: 20,
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { mood, bodyArea } = parsed.data;
  const focusScore = MOOD_SCORE[mood];
  const today = startOfDay(new Date());

  // One check-in per day: update today's if it exists, otherwise create it.
  const existing = await prisma.weeklyCheckIn.findFirst({
    where: { profileId: deviceId, weekOf: { gte: today } },
  });

  const checkIn = existing
    ? await prisma.weeklyCheckIn.update({
        where: { id: existing.id },
        data: { responses: { mood, bodyArea }, focusScore },
      })
    : await prisma.weeklyCheckIn.create({
        data: { profileId: deviceId, weekOf: today, responses: { mood, bodyArea }, focusScore },
      });

  return NextResponse.json({ checkInId: checkIn.id, mood, bodyArea });
}
