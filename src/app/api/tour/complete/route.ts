import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

// Marks the in-app joyride as seen so it never shows again for this device.
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  await prisma.profile.update({
    where: { id: deviceId },
    data: { hasSeenAppTour: true },
  });

  return NextResponse.json({ ok: true });
}
