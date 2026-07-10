import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/profile";

// Members mark "I was kind to myself" for today. Idempotent — one row per day,
// so tapping again (or from both the popup and the profile card) is a no-op.
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!profile.membershipActive) return NextResponse.json({ error: "Members only" }, { status: 403 });

  const date = startOfToday();
  await prisma.kindnessLog.upsert({
    where: { profileId_date: { profileId: profile.id, date } },
    create: { profileId: profile.id, date },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
