import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

const bodySchema = z.object({
  responses: z.record(z.string(), z.number().int().min(1).max(4)),
});

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // week starts Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const values = Object.values(parsed.data.responses);
  const focusScore = Math.round((values.reduce((s, v) => s + v, 0) / (values.length * 4)) * 100);

  const checkIn = await prisma.weeklyCheckIn.create({
    data: {
      profileId: deviceId,
      weekOf: startOfWeek(new Date()),
      responses: parsed.data.responses,
      focusScore,
    },
  });

  return NextResponse.json({ checkInId: checkIn.id, focusScore });
}
