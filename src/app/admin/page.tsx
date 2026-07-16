import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { FOCUS_AREA_LABELS, type FocusAreaKey, type DomainScore } from "@/lib/quiz-data";
import { SUBSCRIPTION_PLANS, COACHING_ACCESS_DAYS, type SubscriptionPlanKey } from "@/lib/pricing";
import { AdminDashboard, type CustomerRow } from "@/components/admin/AdminDashboard";

// Always fresh — this is an owner console over live data.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await requireAdmin();
  if (!email) notFound();

  const [leads, profiles, quizCount, tarot] = await Promise.all([
    prisma.lead.findMany({ include: { quizResult: true }, orderBy: { createdAt: "desc" } }),
    prisma.profile.findMany({
      include: {
        subscription: true,
        coachingPackages: { where: { status: "active" }, orderBy: { purchasedAt: "desc" }, take: 1 },
        _count: { select: { journalEntries: true, checkIns: true } },
      },
    }),
    prisma.quizResult.count(),
    prisma.tarotReading.findMany({
      where: { status: { in: ["pending_payment", "paid", "completed"] } },
      include: { profile: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // One row per person: leads also match a profile by email (case-insensitive),
  // not only via the quiz link — so the same address never appears as two
  // people. Where two profiles share an email (legacy data), prefer the
  // onboarded/newest one.
  const profileByEmail = new Map<string, (typeof profiles)[number]>();
  for (const p of profiles) {
    if (!p.email) continue;
    const key = p.email.toLowerCase();
    const cur = profileByEmail.get(key);
    if (!cur || (!cur.onboardedAt && p.onboardedAt) || (+p.createdAt > +cur.createdAt && !!p.onboardedAt === !!cur.onboardedAt)) {
      profileByEmail.set(key, p);
    }
  }

  // Keep only the newest lead per email (repeat quiz attempts collapse to one).
  const seenLeadEmails = new Set<string>();
  const dedupedLeads = leads.filter((l) => {
    const key = l.email.toLowerCase();
    if (seenLeadEmails.has(key)) return false;
    seenLeadEmails.add(key);
    return true;
  });

  const referenced = new Set<string>();

  // Format the date on the server so it renders identically on the client
  // (avoids a locale hydration mismatch).
  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // Paid 1:1 coaching access: the most recent active package still inside its
  // 180-day booking window. Returns the package key + how long access lasts.
  type ProfileWithPkgs = (typeof profiles)[number];
  function coachingAccessOf(profile: ProfileWithPkgs | undefined) {
    const pkg = profile?.coachingPackages?.[0];
    if (!pkg?.purchasedAt) return { active: false, packageType: null as string | null, until: null as string | null };
    const expiresAt = new Date(pkg.purchasedAt.getTime() + COACHING_ACCESS_DAYS * 86_400_000);
    if (expiresAt <= new Date()) return { active: false, packageType: null, until: null };
    return { active: true, packageType: pkg.packageType as string, until: fmtDate(expiresAt) };
  }

  const fromLeads: CustomerRow[] = dedupedLeads.map((lead) => {
    const qr = lead.quizResult;
    const scores = (qr?.domainScores as unknown as DomainScore[] | undefined) ?? [];
    const focusKey = (qr?.primaryFocusArea ?? null) as FocusAreaKey | null;
    const focusEntry = focusKey ? scores.find((s) => s.key === focusKey) : undefined;
    const profile =
      (qr?.profileId ? profileMap.get(qr.profileId) : undefined) ?? profileByEmail.get(lead.email.toLowerCase());
    if (profile) referenced.add(profile.id);
    const coaching = coachingAccessOf(profile);
    return {
      id: lead.id,
      detailId: profile?.id ?? lead.id,
      leadId: lead.id,
      profileId: profile?.id ?? null,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      createdAt: lead.createdAt.toISOString(),
      joinedLabel: fmtDate(lead.createdAt),
      focusArea: focusKey,
      focusLabel: focusKey ? FOCUS_AREA_LABELS[focusKey] : null,
      focusScore: focusEntry?.score ?? null,
      avgScore: scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : null,
      nervousState: qr?.nervousSystemState ?? null,
      age: qr?.age ?? null,
      gender: qr?.gender ?? null,
      tookQuiz: !!qr,
      isUser: !!profile,
      onboarded: !!profile?.onboardedAt,
      membershipActive: !!profile?.membershipActive,
      coachingActive: coaching.active,
      coachingPackageType: coaching.packageType,
      coachingUntil: coaching.until,
      journalCount: profile?._count.journalEntries ?? 0,
      checkInCount: profile?._count.checkIns ?? 0,
      plan: profile?.subscription?.plan ?? null,
    };
  });

  // App users who never came through a lead (e.g. the owner's own account).
  const fromProfiles: CustomerRow[] = profiles
    .filter((p) => !referenced.has(p.id))
    .map((p) => {
      const coaching = coachingAccessOf(p);
      return {
      id: p.id,
      detailId: p.id,
      leadId: null,
      profileId: p.id,
      name: p.name ?? "—",
      email: p.email ?? "—",
      phone: p.phone ?? "—",
      createdAt: p.createdAt.toISOString(),
      joinedLabel: fmtDate(p.createdAt),
      focusArea: (p.focusArea ?? null) as FocusAreaKey | null,
      focusLabel: p.focusArea ? FOCUS_AREA_LABELS[p.focusArea as FocusAreaKey] : null,
      focusScore: null,
      avgScore: null,
      nervousState: p.nervousSystemState ?? null,
      age: null,
      gender: null,
      tookQuiz: false,
      isUser: true,
      onboarded: !!p.onboardedAt,
      membershipActive: !!p.membershipActive,
      coachingActive: coaching.active,
      coachingPackageType: coaching.packageType,
      coachingUntil: coaching.until,
      journalCount: p._count.journalEntries,
      checkInCount: p._count.checkIns,
      plan: p.subscription?.plan ?? null,
      };
    });

  const customers = [...fromLeads, ...fromProfiles].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  const activeSubs = profiles.map((p) => p.subscription).filter((s) => s?.status === "active");
  const revenue = activeSubs.reduce(
    (sum, s) => sum + (SUBSCRIPTION_PLANS[s!.plan as SubscriptionPlanKey]?.priceInr ?? 0),
    0
  );

  const focusCounts: Record<string, number> = {};
  for (const c of customers) if (c.focusArea) focusCounts[c.focusArea] = (focusCounts[c.focusArea] ?? 0) + 1;
  const focusList = Object.entries(focusCounts)
    .map(([key, count]) => ({ key, label: FOCUS_AREA_LABELS[key as FocusAreaKey] ?? key, count }))
    .sort((a, b) => b.count - a.count);

  const stats = {
    totalLeads: leads.length,
    quizCount,
    appUsers: profiles.filter((p) => p.onboardedAt).length,
    activeMembers: profiles.filter((p) => p.membershipActive).length,
    oneToOneClients: profiles.filter((p) => coachingAccessOf(p).active).length,
    revenue,
  };

  const tarotRows = tarot.map((t) => ({
    id: t.id,
    profileId: t.profile.id,
    name: t.profile.name ?? "—",
    question: t.question,
    status: t.status as string,
    dateLabel: fmtDate(t.paidAt ?? t.createdAt),
  }));

  return (
    <AdminDashboard email={email} stats={stats} customers={customers} focusList={focusList} tarot={tarotRows} />
  );
}
