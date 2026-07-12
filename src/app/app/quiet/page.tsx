import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { quietProgress } from "@/lib/quiet";
import { QuietMinute } from "@/components/app/QuietMinute";

export const dynamic = "force-dynamic";

// The Quiet Minute is part of the paid Companion tier.
export default async function QuietPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (!profile.membershipActive) redirect("/app/dashboard");

  const totalSits = await prisma.quietSit.count({ where: { profileId: profile.id } });
  return <QuietMinute initial={quietProgress(totalSits)} />;
}
