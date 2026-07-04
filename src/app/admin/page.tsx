import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { FOCUS_AREA_LABELS, type FocusAreaKey, type DomainScore } from "@/lib/quiz-data";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from "@/lib/pricing";
import { AdminDashboard, type CustomerRow } from "@/components/admin/AdminDashboard";

// Always fresh — this is an owner console over live data.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await requireAdmin();
  if (!email) notFound();

  const [leads, profiles, quizCount] = await Promise.all([
    prisma.lead.findMany({ include: { quizResult: true }, orderBy: { createdAt: "desc" } }),
    prisma.profile.findMany({
      include: { subscription: true, _count: { select: { journalEntries: true, checkIns: true } } },
    }),
    prisma.quizResult.count(),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const referenced = new Set(leads.map((l) => l.quizResult?.profileId).filter(Boolean));

  // Format the date on the server so it renders identically on the client
  // (avoids a locale hydration mismatch).
  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const fromLeads: CustomerRow[] = leads.map((lead) => {
    const qr = lead.quizResult;
    const scores = (qr?.domainScores as unknown as DomainScore[] | undefined) ?? [];
    const focusKey = (qr?.primaryFocusArea ?? null) as FocusAreaKey | null;
    const focusEntry = focusKey ? scores.find((s) => s.key === focusKey) : undefined;
    const profile = qr?.profileId ? profileMap.get(qr.profileId) : undefined;
    return {
      id: lead.id,
      detailId: profile?.id ?? lead.id,
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
      journalCount: profile?._count.journalEntries ?? 0,
      checkInCount: profile?._count.checkIns ?? 0,
      plan: profile?.subscription?.plan ?? null,
    };
  });

  // App users who never came through a lead (e.g. the owner's own account).
  const fromProfiles: CustomerRow[] = profiles
    .filter((p) => !referenced.has(p.id))
    .map((p) => ({
      id: p.id,
      detailId: p.id,
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
      journalCount: p._count.journalEntries,
      checkInCount: p._count.checkIns,
      plan: p.subscription?.plan ?? null,
    }));

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
    revenue,
  };

  return <AdminDashboard email={email} stats={stats} customers={customers} focusList={focusList} />;
}
