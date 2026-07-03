"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_LETTER_BODY } from "@/lib/companion-content";

const PILLARS = [
  { icon: "✉️", title: "Weekly reflective letter", body: "A letter that notices your patterns, waiting every Monday." },
  { icon: "📄", title: "Monthly clarity report", body: "Your month, measured and mirrored — with a PDF to keep." },
  { icon: "✦", title: "Daily affirmations", body: "One line a day, tuned to your nervous-system state." },
];

const PLANS = [
  { label: "Monthly", price: "₹499", sub: "/mo" },
  { label: "Quarterly", price: "₹1,199", sub: "≈₹400/mo" },
  { label: "Yearly", price: "₹3,999", sub: "≈₹333/mo", best: true },
];

export function MembershipPaywall({ firstName }: { firstName: string | null }) {
  const router = useRouter();
  const [plan, setPlan] = useState(2);
  const [activating, setActivating] = useState(false);

  async function begin() {
    setActivating(true);
    await fetch("/api/companion/activate", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 22px)" }}>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-serif text-[26px] leading-tight text-ink">Your companion</h1>
        <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
          Free trial
        </span>
      </div>

      {/* Locked teaser — a real letter, blurred */}
      <div className="relative mb-7 overflow-hidden rounded-2xl border border-plum-100 bg-white">
        <div className="p-4">
          <span className="mb-1.5 block font-accent text-[9px] font-extrabold uppercase tracking-[0.14em] text-plum-500">
            This week&rsquo;s letter
          </span>
          <p className="select-none whitespace-pre-line text-[14px] leading-relaxed text-ink-light blur-[4px]">
            {SAMPLE_LETTER_BODY.slice(0, 240)}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-12 flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent pb-5">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-plum-50 text-plum-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="px-8 text-center text-[13.5px] font-semibold text-ink">
            {firstName ? `${firstName}, a` : "A"} letter was written for you this week.
          </p>
          <p className="text-[11.5px] text-ink-muted">Unlock it with membership.</p>
        </div>
      </div>

      {/* What membership unlocks */}
      <span className="mb-3 block font-accent text-[10px] font-extrabold uppercase tracking-[0.14em] text-plum-500">
        What membership unlocks
      </span>
      <div className="mb-6 flex flex-col gap-3.5">
        {PILLARS.map((p) => (
          <div key={p.title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plum-50 text-base">
              {p.icon}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-ink">{p.title}</h3>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="mb-5 flex gap-2.5">
        {PLANS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPlan(i)}
            className={`flex-1 rounded-2xl border px-2 py-3 text-center transition active:scale-[0.98] ${
              plan === i ? "border-2 border-plum-500 bg-plum-50" : "border border-parchment bg-white"
            }`}
          >
            {p.best && (
              <div className="mb-0.5 font-accent text-[8px] font-extrabold uppercase tracking-wide text-plum-600">
                Best value
              </div>
            )}
            <div className="text-[11px] text-ink-muted">{p.label}</div>
            <div className="font-serif text-[19px] leading-tight text-ink">{p.price}</div>
            <div className="text-[9.5px] text-ink-muted">{p.sub}</div>
          </button>
        ))}
      </div>

      <button
        onClick={begin}
        disabled={activating}
        className="bg-petal-soft w-full rounded-full py-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {activating ? "Opening your space…" : "Begin membership →"}
      </button>
      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Test activation — no real payment is taken yet. Cancel anytime.
      </p>
    </div>
  );
}
