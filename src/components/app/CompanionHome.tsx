"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import type { NervousSystemState } from "@/lib/quiz-data";
import { nervousLabel, type SampleScoreDelta } from "@/lib/companion-content";

type Tab = "letters" | "report" | "affirmations";

interface Report {
  periodStart: string;
  periodEnd: string;
  scoreDeltas: SampleScoreDelta[];
  themes: string[];
  quote: string;
  thenVsNow: string;
  focusNext: string;
  suggestSession: boolean;
}

export function CompanionHome({
  letter,
  report,
  affirmations,
}: {
  letter: { body: string; weekOf: string } | null;
  report: Report | null;
  affirmations: { lines: string[]; weekOf: string; nervousState: NervousSystemState | null; todayIndex: number } | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("letters");

  async function cancelMembership() {
    await fetch("/api/companion/deactivate", { method: "POST" });
    router.refresh();
  }

  const monthLabel = report
    ? new Date(report.periodEnd).toLocaleDateString("en-US", { month: "long" })
    : "";

  return (
    <div className="mx-auto max-w-md px-5 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 22px)" }}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-[26px] leading-tight text-ink">Your companion</h1>
        <span className="rounded-full bg-plum-50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-plum-600">
          Member
        </span>
      </div>

      {/* Segmented tabs */}
      <div className="mb-5 flex gap-1 rounded-full bg-cream p-1 text-[12px] font-medium">
        {([["letters", "Letters"], ["report", "Report"], ["affirmations", "Affirmations"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "flex-1 rounded-full py-1.5 transition",
              tab === key ? "bg-white text-plum-600 shadow-sm" : "text-ink-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Letters ── */}
      {tab === "letters" &&
        (letter ? (
          <div className="animate-zoom-in rounded-2xl border border-plum-100 bg-white p-5">
            <span className="mb-1 block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-plum-500">
              A letter for you
            </span>
            <p className="mb-3 text-[12px] text-ink-muted">
              {new Date(letter.weekOf).toLocaleDateString("en-US", { day: "numeric", month: "long" })}
            </p>
            <p className="whitespace-pre-line font-serif text-[16px] leading-loose text-ink-light">{letter.body}</p>
            <p className="mt-4 font-serif text-[17px] italic text-plum-600">— with you, always</p>
            <div className="mt-5 flex gap-2.5">
              <button className="flex-1 rounded-full bg-plum-50 py-2.5 text-[12.5px] font-semibold text-plum-600 transition active:scale-[0.98]">
                Save this letter
              </button>
              <Link
                href="/app/journal"
                className="flex-1 rounded-full border border-parchment py-2.5 text-center text-[12.5px] font-semibold text-ink-light transition active:scale-[0.98]"
              >
                Reflect on it
              </Link>
            </div>
          </div>
        ) : (
          <EmptyNote>Your first letter arrives after a few days of journaling.</EmptyNote>
        ))}

      {/* ── Report ── */}
      {tab === "report" &&
        (report ? (
          <div className="animate-zoom-in">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                Clarity report
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
                {monthLabel}
              </span>
            </div>
            <h2 className="mb-4 font-serif text-2xl text-ink">Your month, mirrored</h2>

            <span className="mb-2 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              Your month at a glance
            </span>
            <div className="mb-5 flex flex-col gap-2.5">
              {report.scoreDeltas.map((d) => {
                const up = d.end > d.start;
                const flat = d.end === d.start;
                return (
                  <div key={d.key}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="text-ink-light">{d.name}</span>
                      <span className={clsx("font-semibold", up ? "text-green-600" : flat ? "text-ink-muted" : "text-berry-500")}>
                        {d.start} → {d.end} {up ? "▲" : flat ? "•" : "▼"}
                      </span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-cream">
                      <div
                        className="animate-grow h-full rounded-full"
                        style={{ width: `${d.end}%`, background: up ? "#00a855" : flat ? "#f0a830" : "#c21a6f", ["--w" as string]: `${d.end}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="mb-2 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              What kept showing up
            </span>
            <div className="mb-5 flex flex-wrap gap-2">
              {report.themes.map((t) => (
                <span key={t} className="rounded-full bg-plum-50 px-3 py-1.5 text-[12px] text-plum-600">
                  {t}
                </span>
              ))}
            </div>

            <div className="mb-5 rounded-2xl bg-plum-50 p-4">
              <span className="mb-1.5 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-plum-500">
                In your own words
              </span>
              <p className="font-serif text-[16px] italic leading-snug text-plum-700">&ldquo;{report.quote}&rdquo;</p>
            </div>

            <span className="mb-2 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              Then vs now
            </span>
            <p className="mb-5 text-[13.5px] leading-relaxed text-ink-light">{report.thenVsNow}</p>

            <span className="mb-2 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              Where to focus next
            </span>
            <p className="mb-6 text-[13.5px] leading-relaxed text-ink-light">{report.focusNext}</p>

            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-full bg-plum-500 py-3 text-[12.5px] font-semibold text-white transition active:scale-[0.98]"
              >
                Download PDF
              </button>
              {report.suggestSession && (
                <Link
                  href="/app/profile"
                  className="flex-1 rounded-full bg-green-50 py-3 text-center text-[12.5px] font-semibold text-green-700 transition active:scale-[0.98]"
                >
                  Book a session
                </Link>
              )}
            </div>
          </div>
        ) : (
          <EmptyNote>Your first clarity report arrives after your first membership month.</EmptyNote>
        ))}

      {/* ── Affirmations ── */}
      {tab === "affirmations" &&
        (affirmations && affirmations.lines.length > 0 ? (
          <div className="animate-zoom-in">
            <div className="mb-5 rounded-3xl bg-gradient-to-b from-plum-500 to-plum-700 px-6 py-9 text-center">
              <span className="mb-3 block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-plum-100">
                Today&rsquo;s affirmation
              </span>
              <p className="font-serif text-[24px] leading-snug text-white">
                {affirmations.lines[affirmations.todayIndex]}
              </p>
              <p className="mt-4 text-[11px] text-plum-200">Chosen for {nervousLabel(affirmations.nervousState)}</p>
            </div>

            <span className="mb-2.5 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              This week&rsquo;s set
            </span>
            <div className="flex flex-col gap-2.5">
              {affirmations.lines.map((line, i) => (
                <div
                  key={i}
                  className={clsx(
                    "rounded-2xl border p-3.5 text-[14px] leading-snug",
                    i === affirmations.todayIndex
                      ? "border-plum-200 bg-plum-50 font-medium text-plum-700"
                      : "border-parchment bg-white text-ink-light"
                  )}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyNote>Your weekly affirmations appear here, one surfaced each day.</EmptyNote>
        ))}

      <button
        onClick={cancelMembership}
        className="mx-auto mt-9 block text-[11.5px] text-ink-muted underline underline-offset-2"
      >
        Manage membership (test: cancel)
      </button>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 text-center text-sm text-ink-muted">{children}</p>;
}
