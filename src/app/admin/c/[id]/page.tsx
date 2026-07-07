import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  FOCUS_AREA_LABELS,
  getLevelLabel,
  type DomainScore,
  type FocusAreaKey,
} from "@/lib/quiz-data";

export const dynamic = "force-dynamic";

const NERVOUS_LABEL: Record<string, string> = {
  regulated: "Settled / regulated",
  fight_flight: "Fight / Flight",
  freeze_fawn: "Freeze / Fawn",
};

function barColor(level: string) {
  if (level === "high") return "#8171d4"; // needs the most care
  if (level === "medium") return "#e07ba0";
  return "#6d5cc0";
}

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) notFound();
  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      quizResults: { orderBy: { createdAt: "desc" }, take: 1 },
      journalEntries: { orderBy: { date: "desc" } },
      meditationSessions: { orderBy: { createdAt: "desc" } },
      checkIns: { orderBy: { createdAt: "desc" } },
      subscription: true,
    },
  });

  let name: string;
  let email: string | null;
  let phone: string | null;
  let quiz: { domainScores: unknown; primaryFocusArea: string; secondaryFocusArea: string | null; nervousSystemState: string; emotionalPortrait: string; age: number | null; gender: string | null; maritalStatus: string | null } | null = null;

  if (profile) {
    name = profile.name ?? "—";
    email = profile.email;
    phone = profile.phone;
    quiz = profile.quizResults[0] ?? null;
  } else {
    const lead = await prisma.lead.findUnique({ where: { id }, include: { quizResult: true } });
    if (!lead) notFound();
    name = lead.name;
    email = lead.email;
    phone = lead.phone;
    quiz = lead.quizResult;
  }

  const scores = (quiz?.domainScores as unknown as DomainScore[] | undefined) ?? [];
  const journals = profile?.journalEntries ?? [];
  const meds = profile?.meditationSessions ?? [];
  const checkIns = profile?.checkIns ?? [];

  const now = Date.now();
  const within = (d: Date, days: number) => now - +d < days * 864e5;
  const journals7 = journals.filter((j) => within(j.date, 7)).length;
  const medsTotalMin = meds.reduce((s, m) => s + m.minutes, 0);
  const isMeditating = meds.some((m) => within(m.createdAt, 14));
  const lastMed = meds[0]?.createdAt ?? null;
  const lastJournal = journals[0]?.date ?? null;

  const activeFocus = (profile?.focusArea ?? quiz?.primaryFocusArea ?? null) as FocusAreaKey | null;

  return (
    <div className="min-h-[100dvh] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-green-700">
          ‹ Back to console
        </Link>

        {/* Header */}
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <h1 className="font-serif text-[28px] leading-none text-ink">{name}</h1>
            <p className="mt-1 text-[13px] text-ink-light">{email ?? "—"} · {phone ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[12px]">
            {activeFocus && (
              <span className="rounded-full bg-green-50 px-3 py-1.5 font-semibold text-green-700">
                Focusing on: {FOCUS_AREA_LABELS[activeFocus]}
              </span>
            )}
            <span className={`rounded-full px-3 py-1.5 font-semibold ${profile?.membershipActive ? "bg-green-500 text-white" : profile?.onboardedAt ? "bg-amber-100 text-amber-700" : "bg-cream text-ink-muted"}`}>
              {profile?.membershipActive ? "Member" : profile?.onboardedAt ? "Trial user" : profile ? "Signed up" : "Lead only"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Questionnaire results */}
          <section className="glass rounded-2xl p-5 md:col-span-2">
            <h2 className="mb-4 font-serif text-xl text-ink">Questionnaire results</h2>
            {quiz ? (
              <>
                <div className="mb-5 flex flex-col gap-2.5">
                  {scores.map((s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex justify-between text-[13px]">
                        <span className="text-ink-light">{s.icon} {s.name}</span>
                        <span className="font-semibold text-ink">{s.score}/100 · {getLevelLabel(s.level)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-cream">
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: barColor(s.level) }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
                  <Tag>Primary: {FOCUS_AREA_LABELS[quiz.primaryFocusArea as FocusAreaKey]}</Tag>
                  {quiz.secondaryFocusArea && <Tag>Secondary: {FOCUS_AREA_LABELS[quiz.secondaryFocusArea as FocusAreaKey]}</Tag>}
                  <Tag>{NERVOUS_LABEL[quiz.nervousSystemState] ?? quiz.nervousSystemState}</Tag>
                  {quiz.age != null && <Tag>Age {quiz.age}</Tag>}
                  {quiz.gender && <Tag>{quiz.gender}</Tag>}
                  {quiz.maritalStatus && <Tag>{quiz.maritalStatus}</Tag>}
                </div>
                <div className="rounded-xl border-l-[3px] border-green-400 bg-cream/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-light">
                  {quiz.emotionalPortrait}
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-muted">No questionnaire on file.</p>
            )}
          </section>

          {/* Journaling summary */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Journaling</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700">{journals.length} entries</span>
            </div>
            <div className="mb-4 flex gap-3 text-[12.5px] text-ink-muted">
              <span>This week: <b className="text-ink">{journals7}</b></span>
              <span>Last: <b className="text-ink">{lastJournal ? fmt(lastJournal) : "—"}</b></span>
            </div>
            {journals.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {journals.slice(0, 5).map((j) => (
                  <div key={j.id} className="rounded-xl border border-parchment bg-white/60 p-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-ink-muted">
                      <span>{fmt(j.date)} · {FOCUS_AREA_LABELS[j.focusArea as FocusAreaKey]}</span>
                      {j.reflection && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">replied</span>}
                    </div>
                    <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-light">
                      {j.content?.trim() || <span className="text-ink-muted">— (voice / empty)</span>}
                    </p>
                    {j.content2?.trim() && (
                      <p className="mt-1.5 line-clamp-2 border-t border-parchment pt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                        {j.content2}
                      </p>
                    )}
                  </div>
                ))}
                {journals.length > 5 && <p className="text-center text-[12px] text-ink-muted">+ {journals.length - 5} more</p>}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No journal entries yet.</p>
            )}
          </section>

          {/* Meditation + engagement */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Meditation</h2>
              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${isMeditating ? "bg-green-500 text-white" : "bg-cream text-ink-muted"}`}>
                {isMeditating ? "Active" : "Not lately"}
              </span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <Metric label="Sessions" value={meds.length} />
              <Metric label="Minutes" value={medsTotalMin} />
              <Metric label="Check-ins" value={checkIns.length} />
            </div>
            <p className="mb-3 text-[12.5px] text-ink-muted">Last session: <b className="text-ink">{lastMed ? fmt(lastMed) : "—"}</b></p>
            {meds.length > 0 ? (
              <div className="flex flex-col gap-2">
                {meds.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border border-parchment bg-white/60 px-3 py-2 text-[13px]">
                    <span className="text-ink-light">{m.title}</span>
                    <span className="text-[11px] text-ink-muted">{fmt(m.createdAt)} · {m.minutes}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Hasn&rsquo;t completed a meditation yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-cream px-3 py-1.5 font-medium text-ink-light">{children}</span>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cream/70 py-2.5">
      <div className="font-serif text-[22px] leading-none text-ink">{value}</div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wide text-ink-muted">{label}</div>
    </div>
  );
}
