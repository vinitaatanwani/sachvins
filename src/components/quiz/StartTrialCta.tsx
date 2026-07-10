"use client";

import { useRouter } from "next/navigation";

export function StartTrialCta({ quizResultId }: { quizResultId: string }) {
  const router = useRouter();

  return (
    <div className="rounded-xl bg-indigo p-9 text-center text-white">
      <h3 className="mb-2 font-serif text-2xl">
        This is just the <em className="text-gold-light">beginning.</em>
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-sm text-white/70">
        Your 7-day personalized healing journey — journaling, guided meditations, and sound frequencies —
        is waiting.
      </p>
      <button
        onClick={() => router.push(`/onboarding?rid=${quizResultId}`)}
        className="rounded-lg bg-white px-9 py-3.5 text-sm font-semibold text-indigo shadow-lg transition hover:-translate-y-0.5"
      >
        Start my free 7-day trial
      </button>
      <p className="mt-3 text-xs text-white/40">7 days free · No credit card needed</p>
    </div>
  );
}
