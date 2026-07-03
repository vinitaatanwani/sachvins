"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS } from "@/lib/quiz-data";

export function LeadGate({ quizResultId }: { quizResultId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, quizResultId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none grid select-none gap-3.5 blur-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        {DOMAINS.map((d) => (
          <div key={d.key} className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ink-muted">
              {d.icon} {d.name}
            </div>
            <div className="font-serif text-4xl leading-none text-ink">••</div>
            <div className="mt-1 text-[11.5px] text-ink-muted">·········</div>
            <div className="mt-2.5 h-[3px] overflow-hidden rounded bg-cream">
              <div className="h-full w-2/3 rounded bg-gold" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-7 shadow-xl"
        >
          <h3 className="mb-1 font-serif text-xl text-ink">Your Clarity Map is ready</h3>
          <p className="mb-5 text-sm text-ink-muted">
            Enter your details to unlock your personalized scores, emotional portrait, and 7-day trial.
          </p>
          <div className="grid gap-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-indigo px-8 py-3.5 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-60"
          >
            {submitting ? "Unlocking…" : "Reveal my Clarity Map"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Completely private · We&rsquo;ll email you a copy of your results
          </p>
        </form>
      </div>
    </div>
  );
}
