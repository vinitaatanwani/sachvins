import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { CountUp } from "@/components/motion/CountUp";
import { CheckInForm } from "@/components/app/CheckInForm";
import { FocusAreaSwitcher } from "@/components/app/FocusAreaSwitcher";
import Link from "next/link";
import { ResetTestDataButton } from "@/components/app/ResetTestDataButton";
import { SignOutButton } from "@/components/app/SignOutButton";
import { requireAdmin } from "@/lib/admin";
import { FOCUS_AREA_LABELS, type DomainScore } from "@/lib/quiz-data";
import { SUBSCRIPTION_PLANS, formatInr } from "@/lib/pricing";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const admin = await requireAdmin();

  const [latestQuizResult, journalEntryCount, checkInCount, recentCheckIns] = await Promise.all([
    prisma.quizResult.findFirst({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" } }),
    prisma.journalEntry.count({ where: { profileId: profile.id } }),
    prisma.weeklyCheckIn.count({ where: { profileId: profile.id } }),
    prisma.weeklyCheckIn.findMany({ where: { profileId: profile.id }, orderBy: { weekOf: "desc" }, take: 1 }),
  ]);

  const domainScores = (latestQuizResult?.domainScores as unknown as DomainScore[] | undefined) ?? [];
  const todayStart = startOfDay(new Date());
  const alreadyCheckedInToday = recentCheckIns.some((c) => startOfDay(c.weekOf).getTime() === todayStart.getTime());
  const initial = (profile.name ?? "Friend").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-md px-5 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo font-serif text-xl text-white">
          {initial}
        </div>
        <div>
          <h1 className="font-serif text-xl text-ink">{profile.name ?? "Friend"}</h1>
          {profile.focusArea && (
            <p className="text-[13px] text-ink-muted">Focused on {FOCUS_AREA_LABELS[profile.focusArea]}</p>
          )}
        </div>
      </div>

      <div className="stagger mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-black/8 bg-white p-4">
          <CountUp value={journalEntryCount} className="font-serif text-3xl text-ink" />
          <p className="text-[12px] text-ink-muted">journal entries</p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white p-4">
          <CountUp value={checkInCount} className="font-serif text-3xl text-ink" />
          <p className="text-[12px] text-ink-muted">daily check-ins</p>
        </div>
      </div>

      {domainScores.length > 0 && (
        <div className="mb-5 rounded-2xl border border-black/8 bg-white p-4">
          <h3 className="mb-3 text-[13px] font-medium text-ink">Your baseline scores</h3>
          <div className="flex flex-col gap-2.5">
            {domainScores.map((s) => (
              <div key={s.key}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span className="text-ink-light">
                    {s.icon} {s.name}
                  </span>
                  <CountUp value={s.score} className="text-ink-muted" />
                </div>
                <div className="h-[3px] overflow-hidden rounded bg-cream">
                  <div
                    className="animate-grow h-full rounded bg-gold"
                    style={{ width: `${s.score}%`, ["--w" as string]: `${s.score}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <CheckInForm alreadyCheckedInToday={alreadyCheckedInToday} />
      </div>

      {profile.focusArea && (
        <div className="mb-5">
          <FocusAreaSwitcher currentFocusArea={profile.focusArea} />
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-black/8 bg-white p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-ink">1:1 Coaching</h3>
          <span className="rounded-full bg-indigo/12 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo">
            Free intro
          </span>
        </div>
        <p className="mb-3 text-[12.5px] text-ink-muted">
          A free 20-minute Clarity Session with Vinita over Zoom, plus optional coaching packages.
        </p>
        <Link
          href="/app/book"
          className="mb-2.5 block rounded-full bg-indigo py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.98]"
        >
          Book your free 20-min session →
        </Link>
        <Link
          href="/app/coaching"
          className="block rounded-full border border-indigo/40 py-3 text-center text-[13px] font-semibold text-indigo transition active:scale-[0.98]"
        >
          Explore 1-hour coaching packages →
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-black/8 bg-white p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-ink">Subscription</h3>
          <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium uppercase text-ink-muted">
            Coming soon
          </span>
        </div>
        <p className="mb-3 text-[12.5px] text-ink-muted">Keep your practice going after the free trial.</p>
        <div className="flex gap-2 text-[11.5px] text-ink-light">
          <span className="rounded-lg bg-cream px-2.5 py-1">
            Monthly {formatInr(SUBSCRIPTION_PLANS.monthly.priceInr)}
          </span>
          <span className="rounded-lg bg-cream px-2.5 py-1">
            Yearly {formatInr(SUBSCRIPTION_PLANS.yearly.priceInr)}
          </span>
        </div>
      </div>

      <div className="mt-1 space-y-2.5">
        {admin && (
          <Link
            href="/admin"
            className="block w-full rounded-2xl bg-green-500 py-3.5 text-center text-sm font-semibold text-white shadow-clay-teal transition active:scale-[0.98]"
          >
            Owner console →
          </Link>
        )}
        <SignOutButton />
        <ResetTestDataButton />
      </div>
    </div>
  );
}
