"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ARRIVED_OPTIONS,
  ARRIVED_REFLECTIONS,
  formatSeconds,
  type ArrivedKey,
  type QuietProgress,
} from "@/lib/quiet";

type Phase = "ready" | "sitting" | "after";

// The Quiet Minute: a stillness practice for people who avoid stillness.
// The only goal is to stay for the whole countdown — leaving early is allowed
// (and never logged as failure; it simply isn't logged).
export function QuietMinute({ initial }: { initial: QuietProgress }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [remaining, setRemaining] = useState(initial.seconds);
  const [progress, setProgress] = useState<QuietProgress & { sitsThisWeek?: number }>(initial);
  const [arrived, setArrived] = useState<ArrivedKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const seconds = initial.seconds;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function begin() {
    setRemaining(seconds);
    setPhase("sitting");
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("after");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function leave() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("ready");
    setRemaining(seconds);
  }

  async function saveSit(choice: ArrivedKey) {
    if (saving || saved) return;
    setArrived(choice);
    setSaving(true);
    try {
      const res = await fetch("/api/quiet-sit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds, arrived: choice }),
      });
      if (res.ok) {
        setProgress(await res.json());
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  if (phase === "sitting") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center bg-plum-700 px-6 text-center" style={{ paddingTop: "calc(env(safe-area-inset-top) + 28px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)" }}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-plum-200">The quiet minute</p>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <span className="breath-ring absolute inset-0 rounded-full bg-plum-300/20" />
            <span className="breath-ring absolute inset-4 rounded-full bg-plum-300/25" style={{ animationDelay: "-2s" }} />
            <span className="breathing-circle absolute inset-9 rounded-full bg-plum-400/90" />
            <span className="relative font-serif text-4xl text-white">
              {mm}:{ss}
            </span>
          </div>
          <div>
            <p className="font-serif text-xl leading-snug text-plum-50">
              You don&rsquo;t have to relax.
              <br />
              You just have to stay.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-plum-200">
              The urge to check something will visit.
              <br />
              Let it pass through. Breathe with the circle.
            </p>
          </div>
        </div>

        <button onClick={leave} className="rounded-full bg-white/10 px-6 py-2.5 text-[12.5px] font-medium text-plum-100 transition active:scale-95">
          I need to leave
        </button>
        <p className="mt-2 text-[11px] text-plum-300">Leaving is allowed. Staying is the practice.</p>
      </div>
    );
  }

  if (phase === "after") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}>
        <div className="text-center">
          <div className="animate-zoom-in mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-berry-50">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#398468" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-3 font-serif text-2xl text-ink">You stayed.</h1>
          <p className="mt-1 text-[13px] text-ink-muted">That was the whole practice.</p>
        </div>

        <div className="mt-5 rounded-2xl border border-black/8 bg-white p-4">
          <p className="mb-3 text-[13px] font-medium text-ink">What arrived in the quiet?</p>
          <div className="flex flex-wrap gap-2">
            {ARRIVED_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => saveSit(o.key)}
                disabled={saving || (saved && arrived !== o.key)}
                className={clsx(
                  "rounded-full border px-3.5 py-2 text-[12.5px] transition active:scale-95",
                  arrived === o.key
                    ? "border-indigo bg-indigo/10 font-medium text-indigo"
                    : "border-parchment bg-white text-ink-light disabled:opacity-40"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          {arrived && (
            <div className="mt-3 rounded-xl bg-indigo/5 px-3.5 py-3">
              <p className="font-serif text-[14px] leading-relaxed text-ink-light">
                {ARRIVED_REFLECTIONS[arrived]} <span className="text-ink-muted">— Vinita</span>
              </p>
            </div>
          )}
        </div>

        {saved && (
          <div className="mt-3 rounded-2xl border border-black/8 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink">Your quiet is growing</p>
              {progress.sitsThisWeek != null && (
                <span className="text-[11.5px] font-medium text-indigo">
                  {progress.sitsThisWeek} sit{progress.sitsThisWeek === 1 ? "" : "s"} this week
                </span>
              )}
            </div>
            {progress.nextSeconds ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11.5px] text-ink-muted">{formatSeconds(progress.seconds)}</span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-indigo"
                      style={{ width: `${((5 - (progress.sitsUntilGrowth ?? 5)) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] text-ink-muted">{formatSeconds(progress.nextSeconds)}</span>
                </div>
                <p className="mt-2 text-[11.5px] text-ink-muted">
                  {progress.sitsUntilGrowth === 1
                    ? `One more sit and your quiet gently grows to ${formatSeconds(progress.nextSeconds)}.`
                    : `${progress.sitsUntilGrowth} more sits and your quiet gently grows to ${formatSeconds(progress.nextSeconds)}.`}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-ink-muted">
                You&rsquo;re at a full five minutes of quiet — a capacity most people never build. Keep returning to it.
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-6 text-center">
          <Link href="/app/journal" className="text-[12.5px] text-ink-muted">
            Want to give the feeling words? <span className="font-medium text-indigo">Open your journal →</span>
          </Link>
          <Link
            href="/app/dashboard"
            className="mt-3 block w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  // ready
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-indigo">The quiet minute</p>
      <h1 className="mt-2 font-serif text-[26px] leading-tight text-ink">
        {formatSeconds(seconds)} of nothing at all
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
        The pull to stay busy is usually a feeling asking not to be felt. You don&rsquo;t have to fix it,
        name it, or even relax — just sit with it until the circle finishes.
      </p>

      <div className="my-auto flex flex-col items-center py-10">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span className="breath-ring absolute inset-0 rounded-full bg-indigo/10" />
          <span className="breath-ring absolute inset-4 rounded-full bg-indigo/15" style={{ animationDelay: "-2s" }} />
          <span className="breathing-circle absolute inset-9 rounded-full bg-indigo/80" />
          <span className="relative font-serif text-3xl text-white">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-muted">No music. No goal. Just staying.</p>
      </div>

      <button
        onClick={begin}
        className="w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
      >
        Begin
      </button>
    </div>
  );
}
