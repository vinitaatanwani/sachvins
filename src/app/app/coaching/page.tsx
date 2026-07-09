import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { COACHING_ACCESS_DAYS } from "@/lib/pricing";
import { CoachingPurchase } from "@/components/app/CoachingPurchase";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default async function CoachingPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // Most recent paid package. Access lasts COACHING_ACCESS_DAYS from purchase.
  const pkg = await prisma.coachingPackage.findFirst({
    where: { profileId: profile.id, status: "active" },
    orderBy: { purchasedAt: "desc" },
  });

  let access: {
    packageType: string;
    sessionsTotal: number;
    sessionsCompleted: number;
    accessUntil: string;
  } | null = null;

  if (pkg?.purchasedAt) {
    const expiresAt = new Date(pkg.purchasedAt.getTime() + COACHING_ACCESS_DAYS * 86_400_000);
    if (expiresAt > new Date()) {
      access = {
        packageType: pkg.packageType,
        sessionsTotal: pkg.sessionsTotal,
        sessionsCompleted: pkg.sessionsCompleted,
        accessUntil: fmt(expiresAt),
      };
    }
  }

  return <CoachingPurchase access={access} firstName={profile.name?.split(" ")[0] ?? null} />;
}
