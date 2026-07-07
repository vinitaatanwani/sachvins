"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Q1 — how are you feeling right now (emoji mood).
const MOODS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "calm", emoji: "😌", label: "Calm" },
  { key: "energetic", emoji: "⚡", label: "Energetic" },
  { key: "grateful", emoji: "🙏", label: "Grateful" },
  { key: "meh", emoji: "😐", label: "Meh" },
  { key: "tired", emoji: "😴", label: "Tired" },
  { key: "anxious", emoji: "😰", label: "Anxious" },
  { key: "frustrated", emoji: "😤", label: "Frustrated" },
  { key: "irritated", emoji: "😒", label: "Irritated" },
  { key: "angry", emoji: "😠", label: "Angry" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "overwhelmed", emoji: "😩", label: "Overwhelmed" },
];

// Q2 — where in the body it feels heaviest right now.
const BODY_AREAS = [
  { key: "head", emoji: "🧠", label: "Head" },
  { key: "jaw", emoji: "😬", label: "Jaw" },
  { key: "throat", emoji: "😮‍💨", label: "Throat" },
  { key: "chest", emoji: "💗", label: "Chest" },
  { key: "stomach", emoji: "🌀", label: "Stomach" },
  { key: "shoulders", emoji: "💆", label: "Shoulders" },
  { key: "legs", emoji: "🦵", label: "Legs" },
  { key: "allover", emoji: "🌫️", label: "All over" },
  { key: "none", emoji: "✨", label: "I feel light" },
];

export function CheckInForm({ alreadyCheckedInToday }: { alreadyCheckedInToday: boolean }) {
  const router = useRouter();
  const [mood, setMood] = useState<string | null>(null);
  const [bodyArea, setBodyArea] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const complete = mood !== null && bodyArea !== null;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, bodyArea }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white p-6 text-center">
        <div className="mb-2 text-3xl">{MOODS.find((m) => m.key === mood)?.emoji ?? "🌿"}</div>
        <h3 className="mb-1 font-serif text-xl text-ink">Thank you for checking in</h3>
        <p className="text-sm text-ink-muted">Noticing how you feel is the first, kindest step.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white p-6">
      <h3 className="mb-1 font-serif text-xl text-ink">Daily check-in</h3>
      <p className="mb-5 text-sm text-ink-muted">
        {alreadyCheckedInToday
          ? "You've already checked in today — feel free to update it."
          : "Two quick taps to notice where you are right now."}
      </p>

      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-ink-light">How are you feeling right now?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMood(m.key)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm transition active:scale-[0.98] ${
                mood === m.key
                  ? "border-indigo bg-indigo/10 text-ink"
                  : "border-parchment bg-warm-white text-ink-muted hover:border-indigo/40"
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-ink-light">Where in your body does it feel heavy?</p>
        <div className="grid grid-cols-3 gap-2.5">
          {BODY_AREAS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBodyArea(b.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition active:scale-[0.98] ${
                bodyArea === b.key
                  ? "border-indigo bg-indigo/10 text-ink"
                  : "border-parchment bg-warm-white text-ink-muted hover:border-indigo/40"
              }`}
            >
              <span className="text-xl">{b.emoji}</span>
              <span className="text-[11.5px] font-medium leading-tight">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!complete || submitting}
        className="mt-6 w-full rounded-full bg-indigo px-6 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save check-in"}
      </button>
    </div>
  );
}
