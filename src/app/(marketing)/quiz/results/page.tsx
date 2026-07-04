import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadGate } from "@/components/quiz/LeadGate";
import { StartTrialCta } from "@/components/quiz/StartTrialCta";
import {
  AREA_DESCRIPTIONS,
  getLevelLabel,
  type DomainScore,
  type ScoreLevel,
} from "@/lib/quiz-data";

function levelBarColor(level: ScoreLevel) {
  if (level === "high") return "#5e8e90"; // magenta — needs the most care
  if (level === "medium") return "#e0b62f"; // orange — growing edge
  return "#2f7d43"; // teal — relative strength
}

function levelPillClasses(level: ScoreLevel) {
  if (level === "high") return "bg-berry-50 text-berry-700";
  if (level === "medium") return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
}

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;
  if (!rid) notFound();

  const quizResult = await prisma.quizResult.findUnique({
    where: { id: rid },
    include: { lead: true },
  });
  if (!quizResult) notFound();

  const domainScores = quizResult.domainScores as unknown as DomainScore[];
  const unlocked = Boolean(quizResult.leadId);

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="bg-indigo px-6 py-16 text-center text-white">
        <h1 className="mb-2 font-serif text-4xl">
          Your <em className="text-gold-light">Clarity Map</em>
        </h1>
        <p className="mx-auto max-w-md text-white/70">
          {unlocked
            ? "Here is what your answers reveal — not a diagnosis, but a mirror. Read it slowly."
            : "Your personalized results are ready — just one step to unlock them."}
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-11">
        {!unlocked ? (
          <LeadGate quizResultId={quizResult.id} />
        ) : (
          <>
            <p className="mb-4 text-[13px] text-ink-muted">
              Each area is scored out of 100. The lower the score, the more that area could use your
              attention right now.
            </p>
            <div className="mb-11 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {domainScores.map((s) => (
                <div key={s.key} className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ink-muted">
                    {s.icon} {s.name}
                  </div>
                  <div className="font-serif text-4xl leading-none text-ink">
                    {s.score}
                    <span className="text-lg text-ink-muted">/100</span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-ink-muted">{getLevelLabel(s.level)}</div>
                  <div className="mt-2.5 h-[3px] overflow-hidden rounded bg-cream">
                    <div
                      className="h-full rounded"
                      style={{ width: `${s.score}%`, background: levelBarColor(s.level) }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-11">
              <span className="mb-2.5 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
                Your emotional portrait
              </span>
              <h3 className="mb-3.5 font-serif text-2xl text-ink">What you&rsquo;re carrying right now</h3>
              <div className="rounded-r-lg border-l-[3px] border-gold bg-cream px-6 py-5 text-[14.5px] leading-loose text-ink-light">
                {quizResult.emotionalPortrait}
              </div>
            </div>

            <div className="mb-11">
              <span className="mb-2.5 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
                Area by area
              </span>
              <h3 className="mb-3.5 font-serif text-2xl text-ink">Where your energy is going</h3>
              <div className="flex flex-col gap-4">
                {domainScores.map((s) => (
                  <div key={s.key} className="rounded-xl border border-black/10 bg-white p-5">
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-lg">
                        {s.icon}
                      </div>
                      <div className="text-sm font-medium text-ink">{s.name}</div>
                      <span
                        className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium ${levelPillClasses(
                          s.level
                        )}`}
                      >
                        {getLevelLabel(s.level)}
                      </span>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-ink-muted">
                      {AREA_DESCRIPTIONS[s.level][s.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <StartTrialCta quizResultId={quizResult.id} />
          </>
        )}
      </div>
    </div>
  );
}
