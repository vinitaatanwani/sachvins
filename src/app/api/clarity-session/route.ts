import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";

// Records that the user booked a Clarity Session through the embedded
// Calendly widget. A Calendly webhook (calendly.com/integrations/webhooks)
// would let this capture the exact scheduled time automatically; until that's
// wired up, we log the booking when the user confirms they've scheduled it.
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const session = await prisma.claritySession.create({
    data: { profileId: deviceId },
  });

  return NextResponse.json({ claritySessionId: session.id });
}
