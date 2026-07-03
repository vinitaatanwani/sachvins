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
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await prisma.profile.update({ where: { id: deviceId }, data: { focusArea: parsed.data.focusArea } });
  return NextResponse.json({ ok: true });
}
