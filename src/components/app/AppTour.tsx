"use client";

import { useState } from "react";
import clsx from "clsx";

type TabIcon = (active: boolean) => React.ReactNode;

const TOUR: { label: string; title: string; body: string; icon: TabIcon }[] = [
  {
    label: "Today",
    title: "Your home base",
    body: "Each day I set out one thing for you — a session, a prompt, a sound — so you always know where to begin.",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} />
        <circle cx="12" cy="12" r="2.5" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Journal",
    title: "Write or speak to me",
    body: "Put down whatever you're carrying — type it or tap the mic to speak. I read every entry and reply with a reflection made just for you.",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 4.5h9.5L19 8v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinejoin="round" />
        <path d="M9 11h6M9 14.5h6" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Meditate",
    title: "Sit with me a while",
    body: "Guided meditations tuned to your nervous system — grounding in the morning, release at night.",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4a3 3 0 0 1 3 3c0 1.2-.7 2.2-1.7 2.7C15.8 10.4 18 12.9 18 16v1H6v-1c0-3.1 2.2-5.6 4.7-6.3A3 3 0 0 1 9 7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinejoin="round" />
        <path d="M3 19.5c1.8-1.3 3.8-1.3 4.5 0M9.5 19.5c1.8-1.3 3.2-1.3 5 0M16.5 19.5c1.8-1.3 3.7-1.3 4.5 0" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Sound",
    title: "Shift how you feel",
    body: "Healing frequencies for calm, focus, or sleep. Press play and let them do their quiet work.",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 12v1M8 9v7M12 5v15M16 9v7M20 12v1" stroke="currentColor" strokeWidth={a ? 2.4 : 1.8} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Profile",
    title: "See how far you've come",
    body: "Track your progress, adjust your focus, and book time with me when you're ready to go deeper.",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} />
        <path d="M5 19c1.2-3.2 4-4.5 7-4.5s5.8 1.3 7 4.5" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function AppTour({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(active);
  const [stepIndex, setStepIndex] = useState(0);

  if (!visible) return null;

  const step = TOUR[stepIndex];
  const isLast = stepIndex === TOUR.length - 1;

  async function finish() {
    setVisible(false);
    try {
      await fetch("/api/tour/complete", { method: "POST" });
    } catch {
      // If this fails the tour may reappear next load — acceptable, not worth blocking on.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-ink/60" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Caption card */}
      <div className="mx-auto w-full max-w-md px-5 pb-3">
        <div className="rounded-2xl bg-white p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt="Vinita" className="h-[18px] w-[18px] object-contain" />
              </div>
              <span className="text-[13px] font-semibold text-ink">{step.title}</span>
            </div>
            <span className="font-accent text-[11px] font-bold text-ink-muted">
              {stepIndex + 1}/{TOUR.length}
            </span>
          </div>
          <p className="mb-3.5 text-[13.5px] leading-relaxed text-ink-light">{step.body}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TOUR.map((_, i) => (
                <span
                  key={i}
                  className={clsx("h-1.5 w-1.5 rounded-full", i === stepIndex ? "bg-indigo" : "bg-parchment")}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {!isLast && (
                <button onClick={finish} className="text-[13px] font-medium text-ink-muted">
                  Skip
                </button>
              )}
              <button
                onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}
                className="rounded-full bg-indigo px-5 py-2 text-[13px] font-semibold text-white transition active:scale-[0.97]"
              >
                {isLast ? "Got it" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight replica of the tab bar — active tab lifted & highlighted */}
      <nav className="border-t border-black/8 bg-warm-white">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {TOUR.map((tab, i) => {
            const on = i === stepIndex;
            return (
              <div
                key={tab.label}
                className={clsx(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-all",
                  on ? "-translate-y-1 text-indigo" : "text-ink-muted opacity-40"
                )}
              >
                <div className={clsx("rounded-full p-1.5", on && "bg-green-50")}>{tab.icon(on)}</div>
                {tab.label}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
