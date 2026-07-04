"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { DOMAINS, QUESTIONS, type QuizAnswers } from "@/lib/quiz-data";

const SCALE_OPTIONS = [
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" },
];

// Brief in-between acknowledgments after every answer — keeps the
// conversation feeling live without a big pause on each of the 20 questions.
const MICRO_FILLERS = [
  "Mm, thank you for sharing that.",
  "I hear you.",
  "Noted — that matters.",
  "Thank you for your honesty.",
  "I'm listening.",
  "That tells me a lot.",
  "Okay, I'm taking that in.",
];

// Bigger encouragement shown between the 6 life areas.
const SECTION_FILLERS = [
  "Keep going — this helps me understand you better, so I can give you guidance that's truly personal to you.",
  "You're doing beautifully. The more you share, the more precisely I can meet you where you are.",
  "Thank you for staying with this. Every answer helps me see you more clearly.",
  "We're building a real picture together. A little further to go.",
  "I know this takes something out of you to answer honestly. I see that, and it matters.",
];

type Phase = "intro" | "question" | "micro" | "section" | "demographics" | "outro";

const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const MARITAL_OPTIONS = ["Single", "In a relationship", "Married", "Divorced / Separated", "Widowed", "Prefer not to say"];

function VinitaAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-white/80 shadow-soft ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="Vinita" className="object-contain" style={{ width: size * 0.66, height: size * 0.66 }} />
    </div>
  );
}

export function QuizFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [microMessage, setMicroMessage] = useState("");
  const [sectionMessage, setSectionMessage] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const microTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (microTimerRef.current) clearTimeout(microTimerRef.current);
    };
  }, []);

  const question = QUESTIONS[questionIndex];
  const domain = DOMAINS.find((d) => d.key === question?.domain);
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const nextDomainKey = QUESTIONS[questionIndex + 1]?.domain;
  const isDomainBoundary = !isLastQuestion && nextDomainKey !== question?.domain;
  const progressPct = (questionIndex / QUESTIONS.length) * 100;

  function selectAnswer(value: number) {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);

    if (isLastQuestion) {
      setPhase("outro");
      return;
    }

    if (isDomainBoundary) {
      if (domain?.key === "relationships") {
        setPhase("demographics");
        return;
      }
      setSectionMessage(SECTION_FILLERS[Math.floor(Math.random() * SECTION_FILLERS.length)]);
      setPhase("section");
      return;
    }

    setMicroMessage(MICRO_FILLERS[Math.floor(Math.random() * MICRO_FILLERS.length)]);
    setPhase("micro");
    microTimerRef.current = setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setPhase("question");
    }, 850);
  }

  function continueFromSection() {
    setQuestionIndex((i) => i + 1);
    setPhase("question");
  }

  const demographicsComplete = age.trim().length > 0 && gender.length > 0 && maritalStatus.length > 0;

  function continueFromDemographics() {
    setQuestionIndex((i) => i + 1);
    setPhase("question");
  }

  function handleBack() {
    if (questionIndex === 0) return;
    setQuestionIndex((i) => i - 1);
    setPhase("question");
  }

  async function submitQuiz() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const parsedAge = parseInt(age, 10);
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          demographics: {
            ...(Number.isFinite(parsedAge) ? { age: parsedAge } : {}),
            ...(gender ? { gender } : {}),
            ...(maritalStatus ? { maritalStatus } : {}),
          },
        }),
      });
      if (!res.ok) throw new Error("Something went wrong scoring your assessment. Please try again.");
      const data = await res.json();
      router.push(`/quiz/results?rid=${data.quizResultId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 text-center">
        <div className="mx-auto max-w-md">
          <VinitaAvatar size={64} />
          <div className="h-6" />
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-gold">
            The Clarity Method
          </span>
          <h1 className="mb-4 font-serif text-3xl leading-tight text-ink">
            Hi, I&rsquo;m Vinita. Let&rsquo;s find out where your mind needs healing most.
          </h1>
          <p className="mb-2 text-ink-light">
            I&rsquo;m going to ask you a few questions, one at a time — the same way I would in a real
            session. There&rsquo;s no right or wrong answer, just what&rsquo;s true for you right now.
          </p>
          <p className="mb-8 text-xs text-ink-muted">
            {QUESTIONS.length} questions · 8–10 minutes · Completely private
          </p>
          <button
            onClick={() => setPhase("question")}
            className="w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
          >
            Let&rsquo;s begin →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "outro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 text-center">
        <div className="mx-auto max-w-md">
          <VinitaAvatar size={64} />
          <div className="h-6" />
          <h2 className="mb-3 font-serif text-2xl text-ink">That&rsquo;s everything I need.</h2>
          <p className="mb-8 text-ink-light">
            Thank you for being honest with me. Give me just a moment to reflect on what you&rsquo;ve
            shared, and I&rsquo;ll show you what I&rsquo;m seeing.
          </p>
          {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Reading what you shared…" : "Reveal my results →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <div className="border-b border-black/10 bg-cream px-6">
        <div className="mx-auto flex h-[50px] max-w-xl items-center gap-4">
          <div className="h-[3px] flex-1 overflow-hidden rounded bg-parchment">
            <div
              className="h-full rounded bg-indigo transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="min-w-[80px] text-right text-xs text-ink-muted">
            {questionIndex + 1} of {QUESTIONS.length}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
        {phase === "question" && domain && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <VinitaAvatar />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
                {domain.sectionTag}
              </span>
            </div>
            <h2 className="mb-8 font-serif text-2xl leading-snug text-ink sm:text-3xl">
              {question.text}
            </h2>
            <div className="flex flex-col gap-3">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(opt.value)}
                  className={clsx(
                    "rounded-2xl border-2 px-5 py-4 text-left text-[15px] font-medium text-ink transition active:scale-[0.98]",
                    "border-parchment bg-white hover:border-indigo"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {questionIndex > 0 && (
              <button
                onClick={handleBack}
                className="mt-6 text-sm text-ink-muted transition hover:text-ink"
              >
                ← Back
              </button>
            )}
          </div>
        )}

        {phase === "micro" && (
          <div className="flex items-center gap-3 text-ink-light">
            <VinitaAvatar />
            <p className="font-serif text-lg italic">{microMessage}</p>
          </div>
        )}

        {phase === "section" && (
          <div className="text-center">
            <VinitaAvatar size={56} />
            <div className="h-5" />
            <p className="mx-auto mb-8 max-w-sm font-serif text-xl leading-snug text-ink">
              {sectionMessage}
            </p>
            <button
              onClick={continueFromSection}
              className="rounded-full bg-indigo px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        )}

        {phase === "demographics" && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <VinitaAvatar />
              <p className="font-serif text-xl leading-snug text-ink">
                Before we go further, I&rsquo;d love to know a little more about you — it helps me
                tailor everything even more precisely to you.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Age
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 29"
                  className="w-full rounded-2xl border-2 border-parchment bg-white px-5 py-3.5 text-[15px] text-ink outline-none focus:border-indigo"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Gender
                </span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-2xl border-2 border-parchment bg-white px-5 py-3.5 text-[15px] text-ink outline-none focus:border-indigo"
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Marital status
                </span>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full rounded-2xl border-2 border-parchment bg-white px-5 py-3.5 text-[15px] text-ink outline-none focus:border-indigo"
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  {MARITAL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={continueFromDemographics}
              disabled={!demographicsComplete}
              className="mt-7 w-full rounded-full bg-indigo py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
