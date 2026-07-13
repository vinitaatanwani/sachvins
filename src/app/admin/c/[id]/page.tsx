import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { trialDayNumber } from "@/lib/profile";
import { FREE_WRITING_PROMPT } from "@/lib/content";
import {
  AREA_DESCRIPTIONS,
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

// Daily check-in vocabulary (mirrors the app's CheckInForm), so we can turn the
// stored { mood, bodyArea } into readable, coaching-friendly language.
const MOOD_META: Record<string, { emoji: string; label: string; tone: "pos" | "neu" | "neg" }> = {
  happy: { emoji: "😊", label: "happy", tone: "pos" },
  calm: { emoji: "😌", label: "calm", tone: "pos" },
  energetic: { emoji: "⚡", label: "energetic", tone: "pos" },
  grateful: { emoji: "🙏", label: "grateful", tone: "pos" },
  meh: { emoji: "😐", label: "meh", tone: "neu" },
  tired: { emoji: "😴", label: "tired", tone: "neu" },
  anxious: { emoji: "😰", label: "anxious", tone: "neg" },
  frustrated: { emoji: "😤", label: "frustrated", tone: "neg" },
  irritated: { emoji: "😒", label: "irritated", tone: "neg" },
  angry: { emoji: "😠", label: "angry", tone: "neg" },
  sad: { emoji: "😢", label: "sad", tone: "neg" },
  overwhelmed: { emoji: "😩", label: "overwhelmed", tone: "neg" },
};
const BODY_META: Record<string, { emoji: string; label: string }> = {
  head: { emoji: "🧠", label: "head" },
  jaw: { emoji: "😬", label: "jaw" },
  throat: { emoji: "😮‍💨", label: "throat" },
  chest: { emoji: "💗", label: "chest" },
  stomach: { emoji: "🌀", label: "stomach" },
  shoulders: { emoji: "💆", label: "shoulders" },
  legs: { emoji: "🦵", label: "legs" },
  allover: { emoji: "🌫️", label: "all over" },
  none: { emoji: "✨", label: "light — no heaviness" },
};

// Status colours so the graph reads at a glance. Bar width is the wellness
// score (higher = healthier), so short + rose = needs the most attention,
// long + green = a relative strength.
function barColor(level: string) {
  if (level === "high") return "#e0567f"; // low score → needs most attention
  if (level === "medium") return "#e8a44c"; // growing edge
  return "#5bb894"; // relative strength
}

// Concise coaching direction per area — "what can help" for the 1:1.
const COACHING_MOVES: Record<FocusAreaKey, string> = {
  focus_attention:
    "Regulate before focusing — short nervous-system resets (breath, grounding) plus one protected single-tasking window a day.",
  self_worth:
    "Inner-child / reparenting work to soften the inner critic; name the 'my worth is conditional' story and practise unconditional self-acknowledgement.",
  relationships:
    "Boundary and needs work — help them see the give-until-empty vs. stay-behind-glass pattern and practise small, honest asks.",
  career_purpose:
    "Separate fear from laziness; values clarity plus tiny low-stakes actions to close the gap between where they are and where they sense they could be.",
  emotional_world:
    "Build capacity to feel and release — permission to feel, somatic processing, steady support so held emotion can move instead of exhausting them.",
  spirituality:
    "Make room for meaning — a simple daily stillness/reflection practice to sit with the big questions instead of avoiding the silence.",
};

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
      quietSits: { orderBy: { createdAt: "desc" } },
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
  const quietSits = profile?.quietSits ?? [];
  // What most often surfaces in their Quiet Minute sits — a coaching signal.
  const arrivedCounts = new Map<string, number>();
  quietSits.forEach((s) => s.arrived && arrivedCounts.set(s.arrived, (arrivedCounts.get(s.arrived) ?? 0) + 1));
  const topArrived = [...arrivedCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const ARRIVED_LABEL: Record<string, string> = {
    restlessness: "restlessness",
    todo: "a to-do list",
    ache: "an old ache",
    sadness: "sadness",
    nothing: "almost nothing",
    other: "something of their own",
  };
  // Their own words ("Something else…") — the most precise coaching signal.
  const quietWords = quietSits.filter((s) => s.arrivedText?.trim()).slice(0, 3);

  const now = Date.now();
  const within = (d: Date, days: number) => now - +d < days * 864e5;
  const journals7 = journals.filter((j) => within(j.date, 7)).length;
  const medsTotalMin = meds.reduce((s, m) => s + m.minutes, 0);
  const isMeditating = meds.some((m) => within(m.createdAt, 14));
  const lastMed = meds[0]?.createdAt ?? null;
  const lastJournal = journals[0]?.date ?? null;

  const activeFocus = (profile?.focusArea ?? quiz?.primaryFocusArea ?? null) as FocusAreaKey | null;

  // --- Daily check-ins (mood + body) ------------------------------------------
  type MoodCheck = { at: Date; mood?: string; bodyArea?: string };
  const moodCheckIns: MoodCheck[] = checkIns
    .map((c) => ({ at: c.createdAt, ...(c.responses as { mood?: string; bodyArea?: string }) }))
    .filter((c) => c.mood && MOOD_META[c.mood]); // ignore any legacy pulse rows
  const latestMood = moodCheckIns[0] ?? null;
  const recentMoods = moodCheckIns.slice(0, 7);
  const negRecent = recentMoods.filter((c) => MOOD_META[c.mood!]?.tone === "neg").length;
  const posRecent = recentMoods.filter((c) => MOOD_META[c.mood!]?.tone === "pos").length;

  // --- Practice regularity ----------------------------------------------------
  const dayKey = (d: Date) => new Date(d).toDateString();
  const activeDays = new Set<string>();
  journals.forEach((j) => within(j.date, 7) && activeDays.add(dayKey(j.date)));
  checkIns.forEach((c) => within(c.createdAt, 7) && activeDays.add(dayKey(c.createdAt)));
  meds.forEach((m) => within(m.createdAt, 7) && activeDays.add(dayKey(m.createdAt)));
  const activeDays7 = activeDays.size;
  const totalTouches = journals.length + checkIns.length + meds.length;

  let regularity: { label: string; tone: "good" | "mid" | "low"; note: string };
  if (totalTouches === 0)
    regularity = { label: "Not started", tone: "low", note: "Hasn't begun the daily practices yet — a gentle first-session goal." };
  else if (activeDays7 >= 4)
    regularity = { label: "Consistent", tone: "good", note: `Active ${activeDays7} of the last 7 days — showing up regularly.` };
  else if (activeDays7 >= 2)
    regularity = { label: "On & off", tone: "mid", note: `Active ${activeDays7} of the last 7 days — habit is still forming.` };
  else if (activeDays7 === 1)
    regularity = { label: "Light", tone: "mid", note: "Only one active day this week — could use encouragement to build rhythm." };
  else
    regularity = { label: "Drifted", tone: "low", note: "No practice in the last 7 days — worth re-engaging warmly." };

  // --- Status line ------------------------------------------------------------
  const statusLine = profile?.membershipActive
    ? "Companion member (paid)"
    : profile?.onboardedAt
      ? `Day ${trialDayNumber(profile.trialStartedAt)} of 7 · free trial`
      : profile
        ? "Signed up · not onboarded"
        : "Lead only (took the quiz)";

  // --- "Currently going through" narrative ------------------------------------
  let currentState: string;
  if (latestMood) {
    const m = MOOD_META[latestMood.mood!];
    const b = latestMood.bodyArea ? BODY_META[latestMood.bodyArea] : undefined;
    const bodyBit =
      latestMood.bodyArea === "none"
        ? " and physically light"
        : b
          ? `, carrying it in the ${b.label}`
          : "";
    currentState = `Their last check-in: feeling ${m.emoji} ${m.label}${bodyBit}.`;
    if (recentMoods.length >= 3 && negRecent >= Math.ceil(recentMoods.length * 0.6))
      currentState += " Recent check-ins skew heavy — mostly difficult emotions lately.";
    else if (recentMoods.length >= 3 && posRecent >= Math.ceil(recentMoods.length * 0.6))
      currentState += " Recent check-ins have been mostly light and positive.";
    else if (recentMoods.length >= 3) currentState += " Their mood has been mixed this week.";
  } else {
    currentState = "No daily check-ins yet — no live read on how they're feeling day to day.";
  }

  // --- "Working through" (areas needing the most care) ------------------------
  const scoresAsc = [...scores].sort((a, b) => a.score - b.score);
  const highDomains = scoresAsc.filter((s) => s.level === "high").map((s) => s.name);
  // The areas to unpack for coaching: the ones flagged "needs most attention",
  // or — if none are that low — simply the two lowest-scoring areas.
  const supportAreas = (
    scoresAsc.some((s) => s.level === "high")
      ? scoresAsc.filter((s) => s.level === "high")
      : scoresAsc
  ).slice(0, 3);

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

        {/* Coaching snapshot — a quick, human read before a 1:1 session */}
        <section className="glass mb-6 rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-ink">Coaching snapshot</h2>
            <span
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                regularity.tone === "good"
                  ? "bg-green-500 text-white"
                  : regularity.tone === "mid"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-cream text-ink-muted"
              }`}
            >
              Practice: {regularity.label}
            </span>
          </div>

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <SnapRow label="Where they are">
              {statusLine}
              {profile?.createdAt ? ` · joined ${fmt(profile.createdAt)}` : ""}
            </SnapRow>
            <SnapRow label="Practising regularly?">
              {regularity.note}{" "}
              <span className="text-ink-muted">
                ({journals.length} journals · {moodCheckIns.length} check-ins · {medsTotalMin}m meditation)
              </span>
            </SnapRow>
            <SnapRow label="Currently going through">{currentState}</SnapRow>
            <SnapRow label="Working on">
              {activeFocus ? FOCUS_AREA_LABELS[activeFocus] : "—"}
              {highDomains.length > 0 && (
                <>
                  {" "}· needs the most care in{" "}
                  <b className="text-ink">{highDomains.slice(0, 2).join(" & ")}</b>
                </>
              )}
              {quiz?.nervousSystemState && <> · {NERVOUS_LABEL[quiz.nervousSystemState] ?? quiz.nervousSystemState}</>}
            </SnapRow>
          </div>

          <div className="mt-4 rounded-xl border-l-[3px] border-indigo bg-cream/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-light">
            <span className="font-semibold text-ink">Coaching angle: </span>
            {activeFocus
              ? `Anchor the session in their ${FOCUS_AREA_LABELS[activeFocus]} work${
                  highDomains.length
                    ? `, and the ${highDomains.slice(0, 2).join(" & ")} area${highDomains.length > 1 ? "s" : ""} scoring hardest`
                    : ""
                }. ${
                  regularity.tone === "low"
                    ? "Re-establishing one small daily practice is the first win."
                    : "They already have momentum — deepen it."
                }`
              : "Start from their quiz portrait and what surfaces live in the session."}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Questionnaire results */}
          <section className="glass rounded-2xl p-5 md:col-span-2">
            <h2 className="mb-4 font-serif text-xl text-ink">Questionnaire results</h2>
            {quiz ? (
              <>
                <div className="mb-3 flex flex-col gap-2.5">
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
                <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-muted">
                  <Legend color="#e0567f" label="Needs most attention · 0–35" />
                  <Legend color="#e8a44c" label="Growing edge · 36–64" />
                  <Legend color="#5bb894" label="Relative strength · 65–100" />
                </div>

                <div className="mb-5 flex flex-wrap gap-2 text-[12px]">
                  <Tag>Primary: {FOCUS_AREA_LABELS[quiz.primaryFocusArea as FocusAreaKey]}</Tag>
                  {quiz.secondaryFocusArea && <Tag>Secondary: {FOCUS_AREA_LABELS[quiz.secondaryFocusArea as FocusAreaKey]}</Tag>}
                  <Tag>{NERVOUS_LABEL[quiz.nervousSystemState] ?? quiz.nervousSystemState}</Tag>
                  {quiz.age != null && <Tag>Age {quiz.age}</Tag>}
                  {quiz.gender && <Tag>{quiz.gender}</Tag>}
                  {quiz.maritalStatus && <Tag>{quiz.maritalStatus}</Tag>}
                </div>

                {/* Where they need the most support — struggle + what can help */}
                {supportAreas.length > 0 && (
                  <div className="mb-5">
                    <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                      Where they need the most support
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {supportAreas.map((s) => (
                        <div key={s.key} className="rounded-xl border border-parchment bg-white/60 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-semibold text-ink">{s.icon} {s.name}</span>
                            <span
                              className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                              style={{ background: `${barColor(s.level)}22`, color: barColor(s.level) }}
                            >
                              {s.score}/100 · {getLevelLabel(s.level)}
                            </span>
                          </div>
                          <p className="text-[13px] leading-relaxed text-ink-light">
                            {AREA_DESCRIPTIONS[s.level][s.key]}
                          </p>
                          <p className="mt-2.5 rounded-lg bg-cream/70 px-3 py-2 text-[12.5px] leading-relaxed text-ink-light">
                            <span className="font-semibold text-ink">What can help: </span>
                            {COACHING_MOVES[s.key]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                    Emotional portrait
                  </h3>
                  <div className="rounded-xl border-l-[3px] border-indigo bg-cream/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-light">
                    {quiz.emotionalPortrait}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-muted">No questionnaire on file.</p>
            )}
          </section>

          {/* Daily check-ins — mood + where they feel it in the body */}
          <section className="glass rounded-2xl p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Daily check-ins</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700">
                {moodCheckIns.length} logged
              </span>
            </div>
            {moodCheckIns.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {moodCheckIns.slice(0, 16).map((c, i) => {
                  const m = MOOD_META[c.mood!];
                  const b = c.bodyArea ? BODY_META[c.bodyArea] : undefined;
                  return (
                    <div key={i} className="rounded-xl border border-parchment bg-white/60 px-3 py-2">
                      <div className="text-[10.5px] text-ink-muted">{fmt(c.at)}</div>
                      <div className="mt-0.5 text-[13px] text-ink-light">
                        {m.emoji} {cap(m.label)}
                        {b && c.bodyArea !== "none" && (
                          <span className="text-ink-muted"> · {b.emoji} {cap(b.label)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {moodCheckIns.length > 16 && (
                  <div className="self-center text-[12px] text-ink-muted">+ {moodCheckIns.length - 16} more</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No daily check-ins yet.</p>
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
                      <span>
                        {fmt(j.date)} · {FOCUS_AREA_LABELS[j.focusArea as FocusAreaKey]}
                        {j.prompt === FREE_WRITING_PROMPT && (
                          <span className="ml-1.5 rounded-full bg-plum-50 px-2 py-0.5 font-semibold text-plum-600">free writing</span>
                        )}
                      </span>
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
            <div className="mb-4 grid grid-cols-4 gap-2 text-center">
              <Metric label="Sessions" value={meds.length} />
              <Metric label="Minutes" value={medsTotalMin} />
              <Metric label="Check-ins" value={checkIns.length} />
              <Metric label="Quiet sits" value={quietSits.length} />
            </div>
            {topArrived && (
              <p className="mb-3 text-[12.5px] text-ink-muted">
                In their quiet sits, what arrives most is <b className="text-ink">{ARRIVED_LABEL[topArrived] ?? topArrived}</b>.
              </p>
            )}
            {quietWords.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {quietWords.map((s) => (
                  <p key={s.id} className="rounded-lg border-l-2 border-indigo/40 bg-cream/60 px-3 py-2 text-[12.5px] leading-relaxed text-ink-light">
                    &ldquo;{s.arrivedText}&rdquo; <span className="text-ink-muted">· {fmt(s.createdAt)}</span>
                  </p>
                ))}
              </div>
            )}
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function SnapRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-[13.5px] leading-relaxed text-ink-light">{children}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
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
