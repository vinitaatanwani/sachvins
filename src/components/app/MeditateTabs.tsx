"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface MeditateItem {
  id: string;
  title: string;
  durationMin: number;
  description: string;
  hasAudio: boolean;
  membersOnly: boolean;
  recommended: boolean;
}
export interface EftItem {
  id: string;
  title: string;
  durationMin: number;
  description: string;
  membersOnly: boolean;
}

type Tab = "guided" | "eft";

export function MeditateTabs({
  meditations,
  eft,
  isMember,
}: {
  meditations: MeditateItem[];
  eft: EftItem[];
  isMember: boolean;
}) {
  const [tab, setTab] = useState<Tab>("guided");

  return (
    <>
      <div className="mb-6 flex gap-1 rounded-full bg-cream p-1 text-[12.5px] font-medium">
        {(
          [
            ["guided", "Guided Meditation"],
            ["eft", "EFT"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "flex-1 rounded-full py-2 transition",
              tab === key ? "bg-white text-indigo shadow-sm" : "text-ink-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "guided" ? (
        <div className="flex flex-col gap-3">
          {meditations.map((m) => (
            <Link
              key={m.id}
              href={`/app/meditate/${m.id}`}
              className="flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-4 transition active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-cream">
                <div className="h-6 w-6 rounded-full bg-gold/70" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium text-ink">{m.title}</h3>
                  {m.hasAudio && (
                    <span className="flex-shrink-0 rounded-full bg-indigo/12 px-2 py-0.5 text-[9.5px] font-medium uppercase text-indigo">
                      Her voice
                    </span>
                  )}
                  {m.membersOnly && !isMember && (
                    <span className="flex-shrink-0 rounded-full bg-cream px-2 py-0.5 text-[9.5px] font-medium uppercase text-ink-muted">
                      Members
                    </span>
                  )}
                  {m.recommended && (
                    <span className="flex-shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[9.5px] font-medium uppercase text-amber-700">
                      For you
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                  {m.durationMin} min · {m.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4 rounded-2xl border border-indigo/15 bg-indigo/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[15px]" aria-hidden="true">🤲</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-indigo">Tapping · EFT</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Tap gently on calming pressure points while you name what you feel. It settles the body&rsquo;s
              alarm in a few minutes — the app guides every tap.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {eft.map((e) => (
              <Link
                key={e.id}
                href={`/app/eft/${e.id}`}
                className="flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-4 transition active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo/10 text-xl">
                  🔥
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-ink">{e.title}</h3>
                    {e.membersOnly && !isMember && (
                      <span className="flex-shrink-0 rounded-full bg-cream px-2 py-0.5 text-[9.5px] font-medium uppercase text-ink-muted">
                        Members
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                    {e.durationMin} min · {e.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
