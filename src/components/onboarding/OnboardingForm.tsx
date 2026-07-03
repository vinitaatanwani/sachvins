"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  DOMAINS,
  FOCUS_AREA_LABELS,
  getLevelLabel,
  type FocusAreaKey,
  type NervousSystemState,
  type ScoreLevel,
} from "@/lib/quiz-data";

const STEPS = ["arrival", "reflect", "pillars", "journey", "commitment", "breath"] as const;
type Step = (typeof STEPS)[number];

const NERVOUS_LABELS: Record<NervousSystemState, string> = {
  regulated: "Settled / regulated",
  fight_flight: "Fight / Flight",
  freeze_fawn: "Freeze / Fawn",
};

const PILLARS = [
  {
    icon: "pencil",
    tint: "bg-amber-50 text-amber-600",
    title: "Journaling",
    body: "Write or speak your reflections. I read every one and reply personally.",
  },
  {
    icon: "flower",
    tint: "bg-green-50 text-green-600",
    title: "Guided meditations",
    body: "Morning grounding and evening release, tuned to your nervous system.",
  },
  {
    icon: "wave",
    tint: "bg-berry-50 text-berry-500",
    title: "Sound frequencies",
    body: "Tones to gently shift you toward calm, focus, or sleep.",
  },
] as const;

const JOURNEY = [
  "Meet your patterns",
  "Quiet the inner critic",
  "Come back to your body",
  "Feel what you buried",
  "Reconnect with others",
  "Find your ground",
  "Reassess & see your shift",
];

function levelAccent(level: ScoreLevel) {
  if (level === "high") return "#c21a6f";
  if (level === "medium") return "#f0a830";
  return "#00a855";
}

function VinitaAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-petal font-serif text-white"
      style={{ width: size, height: size, fontSize: size * 0.44 }}
    >
      V
    </div>
  );
}

function PillarIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (name === "pencil")
    return (
      <svg {...common} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="M13.5 6.5l3 3" />
      </svg>
    );
  if (name === "flower")
    return (
      <svg {...common} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2.4" />
        <path d="M12 9.6C12 6 13.6 4 12 4S12 6 12 9.6ZM14.4 12c3.6 0 5.6-1.6 5.6 0s-2 0-5.6 0ZM12 14.4c0 3.6-1.6 5.6 0 5.6s0-2 0-5.6ZM9.6 12c-3.6 0-5.6 1.6-5.6 0s2 0 5.6 0Z" />
      </svg>
    );
  return (
    <svg {...common} viewBox="0 0 24 24" strokeLinecap="round">
      <path d="M2 12h2.5l2-6 3 14 3-19 3 15 2-4H22" />
    </svg>
  );
}

export function OnboardingForm({
  firstName,
  detectedFocusArea,
  focusScore,
  focusLevel,
  nervousState,
}: {
  firstName: string | null;
  detectedFocusArea: FocusAreaKey | null;
  focusScore: number | null;
  focusLevel: ScoreLevel | null;
  nervousState: NervousSystemState | null;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [focusArea, setFocusArea] = useState<FocusAreaKey | null>(detectedFocusArea);
  const [showFocusPicker, setShowFocusPicker] = useState(!detectedFocusArea);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [am, setAm] = useState("07:30");
  const [pm, setPm] = useState("20:00");
  const [breathIn, setBreathIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const step: Step = STEPS[stepIndex];

  useEffect(() => {
    if (step !== "breath") return;
    const id = setInterval(() => setBreathIn((v) => !v), 4500);
    return () => clearInterval(id);
  }, [step]);

  function next() {
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleFinish() {
    setSubmitting(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        focusArea,
        notificationTimeAm: am,
        notificationTimePm: pm,
        daysPerWeek,
      }),
    });
    router.push("/app/dashboard");
    router.refresh();
  }

  const focusLabel = focusArea ? FOCUS_AREA_LABELS[focusArea] : null;
  const focusIcon = DOMAINS.find((d) => d.key === focusArea)?.icon;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-warm-white">
      {/* Header: back + progress dots */}
      <div
        className="flex items-center gap-3 px-5 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 18px)" }}
      >
        {stepIndex > 0 ? (
          <button
            onClick={back}
            aria-label="Back"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={clsx("h-1 flex-1 rounded-full transition-colors", i <= stepIndex ? "bg-indigo" : "bg-parchment")}
            />
          ))}
        </div>
      </div>

      {/* ── Step 1: Arrival ── */}
      {step === "arrival" && (
        <div className="flex flex-1 flex-col items-center px-6 text-center">
          <div className="flex-1" />
          <VinitaAvatar size={64} />
          <span className="mb-3 mt-5 block font-accent text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold">
            Healing Hands by Vinita
          </span>
          <h1 className="mb-3 font-serif text-[30px] leading-tight text-ink">
            Welcome{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="max-w-xs text-[15px] leading-relaxed text-ink-light">
            You just did the thing most people avoid — you looked honestly at what you carry. Now
            let&rsquo;s turn it into a practice.
          </p>
          <div className="flex-1" />
          <button onClick={next} className="mb-8 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white transition active:scale-[0.98]">
            Begin
          </button>
        </div>
      )}

      {/* ── Step 2: Reflect the quiz back ── */}
      {step === "reflect" && (
        <div className="flex flex-1 flex-col overflow-y-auto px-6">
          <span className="mb-3 block font-accent text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold">
            What you told me
          </span>

          {focusArea && !showFocusPicker ? (
            <>
              <div className="rounded-2xl border border-parchment bg-white p-5">
                <p className="text-[13px] text-ink-muted">
                  {focusLevel ? getLevelLabel(focusLevel) : "Your starting focus"}
                </p>
                <div className="mb-1 mt-0.5 flex items-center gap-2">
                  <span className="text-lg">{focusIcon}</span>
                  <h1 className="font-serif text-[24px] leading-tight text-ink">{focusLabel}</h1>
                </div>
                {focusScore !== null && focusLevel && (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-[30px] leading-none text-ink">{focusScore}</span>
                      <span className="text-[13px] text-ink-muted">/100</span>
                    </div>
                    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-parchment">
                      <div className="h-full rounded-full" style={{ width: `${focusScore}%`, background: levelAccent(focusLevel) }} />
                    </div>
                  </>
                )}
              </div>

              {nervousState && (
                <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-sky-light px-4 py-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-plum-500">
                    <path d="M3 12h3l2-5 3 11 3-13 2 7h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[12.5px] text-plum-600">
                    Your system reads as <span className="font-semibold">{NERVOUS_LABELS[nervousState]}</span>
                  </p>
                </div>
              )}

              <p className="mt-4 text-[14px] leading-relaxed text-ink-light">
                Everything in your next 7 days — prompts, meditations, and sound — is built around this.
              </p>

              <button
                onClick={() => setShowFocusPicker(true)}
                className="mt-3 self-start text-[13px] font-medium text-indigo underline-offset-2 hover:underline"
              >
                Actually, I&rsquo;d like to focus somewhere else →
              </button>
            </>
          ) : (
            <>
              <h1 className="mb-1.5 font-serif text-[26px] leading-tight text-ink">Where would you like to begin?</h1>
              <p className="mb-4 text-sm text-ink-muted">Choose the area you&rsquo;d like your daily practice to center on.</p>
              <div className="flex flex-col gap-2.5">
                {DOMAINS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => {
                      setFocusArea(d.key);
                      setShowFocusPicker(false);
                    }}
                    className={clsx(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.98]",
                      focusArea === d.key ? "border-indigo bg-green-50" : "border-parchment bg-white"
                    )}
                  >
                    <span className="text-lg">{d.icon}</span>
                    <span className="text-[15px] font-medium text-ink">{d.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex-1" />
          {!showFocusPicker && (
            <button
              onClick={next}
              disabled={!focusArea}
              className="mb-8 mt-6 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* ── Step 3: Three pillars ── */}
      {step === "pillars" && (
        <div className="flex flex-1 flex-col px-6">
          <h1 className="mb-1.5 mt-2 font-serif text-[26px] leading-tight text-ink">Three ways we&rsquo;ll work together</h1>
          <p className="mb-6 text-sm text-ink-muted">Your whole practice, shaped around {focusLabel ?? "you"}.</p>
          <div className="flex flex-col gap-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="flex items-start gap-3.5">
                <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", p.tint)}>
                  <PillarIcon name={p.icon} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={next} className="mb-8 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white transition active:scale-[0.98]">
            Continue
          </button>
        </div>
      )}

      {/* ── Step 4: 7-day journey ── */}
      {step === "journey" && (
        <div className="flex flex-1 flex-col overflow-y-auto px-6">
          <h1 className="mb-1 mt-2 font-serif text-[26px] leading-tight text-ink">Your 7-day journey</h1>
          <p className="mb-5 text-sm text-ink-muted">A designed arc, not just access.</p>
          <div className="flex flex-col gap-3">
            {JOURNEY.map((label, i) => {
              const isLast = i === JOURNEY.length - 1;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                      i === 0 ? "bg-indigo text-white" : isLast ? "bg-plum-500 text-white" : "bg-sand-300 text-ink-light"
                    )}
                  >
                    {isLast ? "✦" : i + 1}
                  </span>
                  <span className="text-[14px] text-ink-light">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex-1" />
          <button onClick={next} className="mb-8 mt-6 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white transition active:scale-[0.98]">
            Continue
          </button>
        </div>
      )}

      {/* ── Step 5: Commitment ── */}
      {step === "commitment" && (
        <div className="flex flex-1 flex-col px-6">
          <h1 className="mb-1.5 mt-2 font-serif text-[26px] leading-tight text-ink">How often will you show up for you?</h1>
          <p className="mb-6 text-sm text-ink-muted">A gentle commitment — you can change it anytime.</p>
          <div className="mb-7 flex gap-2.5">
            {[3, 5, 7].map((n) => (
              <button
                key={n}
                onClick={() => setDaysPerWeek(n)}
                className={clsx(
                  "flex-1 rounded-2xl border py-4 text-center transition active:scale-[0.98]",
                  daysPerWeek === n ? "border-2 border-indigo bg-green-50" : "border border-parchment bg-white"
                )}
              >
                <div className="font-serif text-[22px] text-ink">{n}</div>
                <div className={clsx("text-[11px]", daysPerWeek === n ? "font-semibold text-indigo" : "text-ink-muted")}>
                  days a week
                </div>
              </button>
            ))}
          </div>
          <label className="mb-3 flex items-center gap-3 rounded-2xl border border-parchment bg-white px-4 py-3">
            <span className="text-lg">🌅</span>
            <span className="flex-1 text-[14px] text-ink-light">Morning nudge</span>
            <input type="time" value={am} onChange={(e) => setAm(e.target.value)} className="bg-transparent text-[14px] font-medium text-ink outline-none" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-parchment bg-white px-4 py-3">
            <span className="text-lg">🌙</span>
            <span className="flex-1 text-[14px] text-ink-light">Evening nudge</span>
            <input type="time" value={pm} onChange={(e) => setPm(e.target.value)} className="bg-transparent text-[14px] font-medium text-ink outline-none" />
          </label>
          <div className="flex-1" />
          <button onClick={next} className="mb-8 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white transition active:scale-[0.98]">
            Set my rhythm
          </button>
        </div>
      )}

      {/* ── Step 6: One breath ── */}
      {step === "breath" && (
        <div className="flex flex-1 flex-col items-center px-6 text-center">
          <h1 className="mb-1.5 mt-4 font-serif text-[26px] leading-tight text-ink">One breath before you begin</h1>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="bg-petal flex h-40 w-40 items-center justify-center rounded-full p-[5px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-warm-white">
                <div
                  className="flex items-center justify-center rounded-full bg-indigo text-[13px] font-medium text-white transition-all duration-[4000ms] ease-in-out"
                  style={{ width: breathIn ? 104 : 74, height: breathIn ? 104 : 74 }}
                >
                  {breathIn ? "Breathe in…" : "Breathe out…"}
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-[240px] text-[13px] text-ink-muted">
              Let your shoulders drop. You&rsquo;re safe here. This space is yours.
            </p>
          </div>
          <button
            onClick={handleFinish}
            disabled={submitting || !focusArea}
            className="bg-petal-soft mb-8 w-full rounded-full py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Preparing your space…" : "Enter my space →"}
          </button>
        </div>
      )}
    </div>
  );
}
