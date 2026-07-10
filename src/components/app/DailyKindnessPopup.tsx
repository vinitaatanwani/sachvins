"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The daily note from Vinita. It appears once on the first app open of the day
// (tracked per-device in localStorage keyed by dayKey), then stays available all
// day on the profile screen. Shown only to members (the layout gates rendering).
export function DailyKindnessPopup({ reminder, dayKey }: { reminder: string; dayKey: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("clarity.kindness.seen") === dayKey) return;
    } catch {
      // Private mode / storage blocked — better to show than to swallow it.
    }
    const t = setTimeout(() => setOpen(true), 550);
    return () => clearTimeout(t);
  }, [dayKey]);

  function markSeen() {
    try {
      localStorage.setItem("clarity.kindness.seen", dayKey);
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    markSeen();
    setOpen(false);
  }

  async function acceptAndClose() {
    markSeen();
    setSaving(true);
    try {
      await fetch("/api/kindness/done", { method: "POST" });
    } catch {
      /* the note still counts as seen; the streak can be marked later */
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-plum/30 p-5 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-zoom-in w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-lift"
      >
        <div className="flex flex-col items-center bg-indigo px-6 pb-5 pt-6 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Vinita" className="h-7 w-7 object-contain" />
          </div>
          <div className="font-serif text-[19px] leading-none text-white">A kindness for today</div>
          <div className="mt-1 text-[11px] text-white/70">from Vinita</div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="font-serif text-[18px] leading-relaxed text-ink">{reminder}</p>
          <button
            onClick={acceptAndClose}
            disabled={saving}
            className="mt-5 w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "…" : "I'll be gentle with myself"}
          </button>
          <button
            onClick={dismiss}
            className="mt-2 w-full py-1.5 text-center text-[12px] text-ink-muted transition hover:text-ink-light"
          >
            It&rsquo;ll wait for me in my profile
          </button>
        </div>
      </div>
    </div>
  );
}
