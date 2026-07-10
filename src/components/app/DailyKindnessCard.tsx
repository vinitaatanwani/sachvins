"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export interface KindnessDay {
  label: string;
  done: boolean;
  isToday: boolean;
  future: boolean;
}

// Today's kindness, kept on the profile screen all day, with a gentle "days you
// were kind to yourself" strip for the current week.
export function DailyKindnessCard({
  reminder,
  doneToday,
  week,
  count,
}: {
  reminder: string;
  doneToday: boolean;
  week: KindnessDay[];
  count: number;
}) {
  const router = useRouter();
  const [done, setDone] = useState(doneToday);
  const [saving, setSaving] = useState(false);

  async function markDone() {
    if (done || saving) return;
    setSaving(true);
    setDone(true);
    try {
      await fetch("/api/kindness/done", { method: "POST" });
      router.refresh();
    } catch {
      setDone(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-indigo/15 bg-indigo/5">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Vinita" className="h-5 w-5 rounded-full bg-white p-0.5 ring-1 ring-black/5" />
            <span className="font-accent text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo">
              Today&rsquo;s kindness
            </span>
          </div>
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[10.5px] font-semibold text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Done
            </span>
          ) : (
            <button
              onClick={markDone}
              disabled={saving}
              className="rounded-full bg-indigo px-3 py-1 text-[11px] font-semibold text-white transition active:scale-95 disabled:opacity-60"
            >
              I did this
            </button>
          )}
        </div>
        <p className="font-serif text-[16px] leading-relaxed text-ink">{reminder}</p>
        <p className="mt-1.5 text-[11.5px] text-ink-muted">— Vinita</p>
      </div>

      <div className="flex items-center justify-between border-t border-indigo/12 bg-white/50 px-4 py-2.5">
        <span className="text-[11px] text-ink-muted">
          Kind to yourself · <span className="font-semibold text-ink-light">{count} this week</span>
        </span>
        <span className="flex items-center gap-1.5">
          {week.map((d, i) => (
            <span key={i} className="flex flex-col items-center gap-0.5">
              <span
                className={clsx(
                  "flex h-[18px] w-[18px] items-center justify-center rounded-full",
                  d.done
                    ? "bg-indigo/15 text-indigo"
                    : d.isToday
                      ? "border-[1.5px] border-indigo/50"
                      : d.future
                        ? "border border-dashed border-indigo/25"
                        : "border border-black/8"
                )}
              >
                {d.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 21s-6.7-4.3-9.3-8.1C.9 10.2 1.6 6.6 4.6 5.4c2-.8 3.9.1 4.9 1.6l.5.8.5-.8c1-1.5 2.9-2.4 4.9-1.6 3 1.2 3.7 4.8 1.9 7.5C18.7 16.7 12 21 12 21z" />
                  </svg>
                )}
              </span>
              <span className={clsx("text-[8.5px]", d.isToday ? "font-semibold text-ink-light" : "text-ink-muted")}>
                {d.label}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
