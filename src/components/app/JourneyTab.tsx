"use client";

import Link from "next/link";
import clsx from "clsx";
import type { JourneyData, WeatherStatus } from "@/lib/journey";

// Weather colours: light = settled green, mixed = warm amber, heavy = tender rose.
const WEATHER_BG: Record<Exclude<WeatherStatus, "none">, { bg: string; fg: string }> = {
  light: { bg: "#5bb894", fg: "#164e39" },
  mixed: { bg: "#e8a44c", fg: "#6f4710" },
  heavy: { bg: "#dd7ba6", fg: "#6d2848" },
};

const STATS: { key: keyof JourneyData["stats"]; emoji: string; label: string }[] = [
  { key: "journals", emoji: "📓", label: "journal entries" },
  { key: "checkIns", emoji: "🌤️", label: "check-ins" },
  { key: "quietSits", emoji: "💗", label: "quiet sits" },
  { key: "kindnessDays", emoji: "🤲", label: "kindness days" },
  { key: "meditationMin", emoji: "🧘", label: "min meditated" },
  { key: "activeDays", emoji: "📆", label: "active days" },
];

export function JourneyTab({ data }: { data: JourneyData }) {
  const { stats, weather, quiet } = data;
  const nothingYet = Object.values(stats).every((v) => v === 0);

  return (
    <div className="animate-zoom-in">
      <span className="block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-plum-500">
        Your journey · {data.monthLabel}
      </span>
      <h2 className="mt-0.5 font-serif text-2xl text-ink">You kept showing up</h2>
      <p className="mt-1 text-[12px] text-ink-muted">
        Everything below is from your own practice — nothing is made up.
      </p>

      {nothingYet ? (
        <p className="mt-10 text-center text-sm text-ink-muted">
          Your journey fills in as you practise — a check-in, a journal entry, or a quiet minute is all it
          takes to begin.
        </p>
      ) : (
        <>
          {/* ── Practice counts ── */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {STATS.map((s) => (
              <div key={s.key} className="rounded-2xl border border-parchment bg-white px-1.5 py-2.5 text-center">
                <div className="text-[15px]" aria-hidden="true">{s.emoji}</div>
                <div className="mt-0.5 font-serif text-[20px] leading-none text-ink">{stats[s.key]}</div>
                <div className="mt-1 text-[10px] leading-tight text-ink-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Emotional weather ── */}
          <div className="mt-4 rounded-2xl border border-parchment bg-white p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="font-serif text-[16px] text-ink">Your emotional weather</h3>
              <span className="text-[10.5px] text-ink-muted">from your check-ins</span>
            </div>

            {weather.checkInCount === 0 ? (
              <p className="py-3 text-center text-[12.5px] text-ink-muted">
                Your weather map fills in as you check in each day on your profile.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-center text-[9.5px] text-ink-muted">{d}</div>
                  ))}
                  {Array.from({ length: weather.leadingBlanks }).map((_, i) => (
                    <span key={`b${i}`} />
                  ))}
                  {weather.days.map((d) => {
                    const c = d.status === "none" ? null : WEATHER_BG[d.status];
                    return (
                      <span
                        key={d.day}
                        className={clsx(
                          "flex aspect-square items-center justify-center rounded-full text-[10px]",
                          !c && "border border-dashed border-plum-100 text-sand-400"
                        )}
                        style={c ? { background: c.bg, color: c.fg } : undefined}
                      >
                        {d.day}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-ink-light">
                  <Legend color="#5bb894" label="Light" />
                  <Legend color="#e8a44c" label="Mixed" />
                  <Legend color="#dd7ba6" label="Heavy" />
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full border border-dashed border-plum-200" />
                    No check-in
                  </span>
                </div>

                {weather.sentence ? (
                  <p className="mt-3 rounded-r-lg border-l-[3px] border-indigo bg-indigo/5 px-3 py-2 text-[12px] leading-relaxed text-ink-light">
                    {weather.sentence}
                  </p>
                ) : (
                  weather.checkInCount < 8 && (
                    <p className="mt-3 text-[11px] text-ink-muted">
                      Keep checking in — your month&rsquo;s gentle patterns appear once there&rsquo;s enough weather to read.
                    </p>
                  )
                )}
              </>
            )}
          </div>

          {/* ── What arrived in the quiet ── */}
          {quiet.total > 0 && (
            <div className="mt-3 rounded-2xl border border-parchment bg-white p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="font-serif text-[16px] text-ink">What arrived in your quiet</h3>
                <span className="text-[10.5px] text-ink-muted">
                  {quiet.total} sit{quiet.total === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quiet.arrived.map((a, i) => (
                  <span
                    key={a.label}
                    className={clsx(
                      "rounded-full px-3 py-1.5 text-[11.5px]",
                      i === 0 ? "bg-indigo/10 font-medium text-plum-700" : "bg-cream text-ink-light"
                    )}
                  >
                    {a.label} × {a.count}
                  </span>
                ))}
              </div>
              {quiet.words && (
                <div className="mt-3 rounded-xl border border-parchment bg-warm-white px-3.5 py-3">
                  <span className="mb-1 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-plum-500">
                    In your own words
                  </span>
                  <p className="font-serif text-[14px] italic leading-relaxed text-ink-light">&ldquo;{quiet.words.text}&rdquo;</p>
                  <p className="mt-1 text-[10.5px] text-ink-muted">{quiet.words.dateLabel}, after a quiet sit</p>
                </div>
              )}
            </div>
          )}

          <Link
            href="/app/journal"
            className="mt-4 block rounded-full bg-indigo py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.98]"
          >
            Reflect on your month in the journal
          </Link>
        </>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
