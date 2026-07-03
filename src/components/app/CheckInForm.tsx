"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PULSE_QUESTIONS = [
  { id: "pulse1", text: "This week, how often did this focus area feel present for you?" },
  { id: "pulse2", text: "How often did your daily practice feel helpful?" },
  { id: "pulse3", text: "How often did you notice yourself handling this area differently than before?" },
];

export function CheckInForm({ alreadyCheckedInThisWeek }: { alreadyCheckedInThisWeek: boolean }) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const complete = PULSE_QUESTIONS.every((q) => responses[q.id] !== undefined);

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses }),
    });
    const data = await res.json();
    setResult(data.focusScore);
    setSubmitting(false);
    router.refresh();
  }

  if (result !== null) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6 text-center">
        <h3 className="mb-1 font-serif text-xl text-ink">Check-in saved</h3>
        <p className="text-sm text-ink-muted">This week&rsquo;s pulse score: {result}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6">
      <h3 className="mb-1 font-serif text-xl text-ink">Weekly check-in</h3>
      <p className="mb-5 text-sm text-ink-muted">
        {alreadyCheckedInThisWeek
          ? "You've already checked in this week — feel free to update it."
          : "A handful of questions to track how this focus area is moving."}
      </p>
      <div className="flex flex-col gap-5">
        {PULSE_QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-sm text-ink-light">{q.text}</p>
            <div className="flex gap-2">
              {["Rarely", "Sometimes", "Often", "Always"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setResponses((r) => ({ ...r, [q.id]: i + 1 }))}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    responses[q.id] === i + 1
                      ? "border-gold bg-gold text-white"
                      : "border-parchment bg-warm-white text-ink-muted hover:border-gold-light"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!complete || submitting}
        className="mt-6 rounded-lg bg-indigo px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save check-in"}
      </button>
    </div>
  );
}
