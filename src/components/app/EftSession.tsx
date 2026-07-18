"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { EftSession as EftSessionType, EftPoint } from "@/lib/eft";
import { Celebration } from "@/components/motion/Celebration";

type Phase = "intro" | "setup" | "tapping" | "breathe" | "rate" | "done";

// A tapping-point head diagram; the active point pulses.
function TapDiagram({ active }: { active: EftPoint | null }) {
  return (
    <svg width="176" height="196" viewBox="0 0 200 224" aria-hidden="true">
      <ellipse cx="100" cy="112" rx="66" ry="82" fill="#3a2f63" stroke="#5a4b93" strokeWidth="1.5" />
      <path d="M40 70 Q100 20 160 70" fill="none" stroke="#5a4b93" strokeWidth="8" strokeLinecap="round" opacity=".7" />
      <path d="M74 96 q10 -6 20 0" fill="none" stroke="#6a5ba3" strokeWidth="3" strokeLinecap="round" />
      <path d="M106 96 q10 -6 20 0" fill="none" stroke="#6a5ba3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="82" cy="108" r="3.4" fill="#b7a9ea" />
      <circle cx="118" cy="108" r="3.4" fill="#b7a9ea" />
      <path d="M96 118 q4 8 8 0" fill="none" stroke="#6a5ba3" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M88 150 q12 10 24 0" fill="none" stroke="#6a5ba3" strokeWidth="2.5" strokeLinecap="round" />
      {active && (
        <>
          <circle cx={active.x} cy={active.y} r="9" fill="#f2a1c0" opacity=".4" className="tap-ring" />
          <circle cx={active.x} cy={active.y} r="6" fill="#f2a1c0" />
          <circle cx={active.x} cy={active.y} r="6" fill="none" stroke="#fff" strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}

function Scale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {Array.from({ length: 11 }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={clsx(
            "h-9 w-9 rounded-full text-[13px] font-semibold transition",
            value === i ? "bg-pink-400 text-white" : "bg-white/10 text-plum-100"
          )}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

export function EftSession({ session }: { session: EftSessionType }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [before, setBefore] = useState(6);
  const [after, setAfter] = useState(3);
  const [pointIdx, setPointIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(session.secondsPerPoint);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedRef = useRef(false);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  // Auto-advance through the tapping points on a gentle timer.
  useEffect(() => {
    if (phase !== "tapping") return;
    setSecondsLeft(session.secondsPerPoint);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          nextPoint();
          return session.secondsPerPoint;
        }
        return s - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pointIdx]);

  useEffect(() => clearTimer, []);

  function nextPoint() {
    clearTimer();
    setPointIdx((i) => {
      if (i + 1 >= session.points.length) {
        setPhase("breathe");
        setTimeout(() => setPhase("rate"), 4200);
        return i;
      }
      return i + 1;
    });
  }

  // Log a completed session (counts toward practice minutes / Journey).
  useEffect(() => {
    if (phase !== "done" || recordedRef.current) return;
    recordedRef.current = true;
    fetch("/api/meditation/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: `eft-${session.id}`, title: `EFT · ${session.title}`, minutes: session.durationMin }),
    }).catch(() => {});
  }, [phase, session]);

  const point = session.points[pointIdx];

  return (
    <div className="flex h-full flex-col bg-plum-700 text-plum-100" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
      <Celebration trigger={phase === "done" ? 1 : 0} />
      <div className="flex items-center px-4 pb-1">
        <button
          onClick={() => router.push("/app/meditate")}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="ml-3 text-[13px] font-medium text-plum-200">EFT · {session.title}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
        {phase === "intro" && (
          <>
            <span className="text-3xl" aria-hidden="true">🤲</span>
            <h1 className="mt-3 font-serif text-[26px] text-white">{session.title}</h1>
            <p className="mt-2 max-w-[17rem] text-[13px] leading-relaxed text-plum-200">
              We&rsquo;ll tap gently on a few calming points while naming the feeling. Find a private moment
              — you&rsquo;ll say the words softly out loud.
            </p>
            <p className="mt-6 text-[13px] font-medium text-plum-100">How strong is the anger right now?</p>
            <div className="mt-3">
              <Scale value={before} onChange={setBefore} />
            </div>
            <button
              onClick={() => setPhase("setup")}
              className="mt-7 rounded-full bg-white px-8 py-3 text-sm font-semibold text-plum-700 transition active:scale-[0.98]"
            >
              Begin tapping
            </button>
          </>
        )}

        {phase === "setup" && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-plum-300">The setup</span>
            <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/8 text-4xl" aria-hidden="true">✋</div>
            <p className="mt-4 max-w-[16rem] text-[12.5px] text-plum-200">
              Tap the fleshy side of one hand with the other, and repeat this <b className="text-plum-100">three times</b>:
            </p>
            <p className="mt-4 max-w-[19rem] font-serif text-[17px] leading-relaxed text-white">&ldquo;{session.setup}&rdquo;</p>
            <button
              onClick={() => {
                setPointIdx(0);
                setPhase("tapping");
              }}
              className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold text-plum-700 transition active:scale-[0.98]"
            >
              Done — start the round
            </button>
          </>
        )}

        {phase === "tapping" && (
          <>
            <TapDiagram active={point} />
            <div className="mt-1 text-[11px] text-plum-300">
              Point {pointIdx + 1} of {session.points.length}
            </div>
            <h2 className="mt-1 font-serif text-[22px] text-white">{point.label}</h2>
            <p className="mt-0.5 text-[11.5px] text-plum-300">{point.where} · tap softly, about twice a second</p>
            <div className="mt-4 max-w-[18rem] rounded-2xl bg-white/8 px-5 py-4">
              <p className="font-serif text-[16px] leading-relaxed text-plum-50">&ldquo;{point.phrase}&rdquo;</p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-pink-400 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${((session.secondsPerPoint - secondsLeft) / session.secondsPerPoint) * 100}%` }}
                />
              </div>
              <button onClick={nextPoint} className="text-[12.5px] font-medium text-plum-200">
                Next →
              </button>
            </div>
          </>
        )}

        {phase === "breathe" && (
          <>
            <div className="breath-ring h-32 w-32 rounded-full bg-pink-400/50" />
            <p className="mt-8 font-serif text-[20px] text-white">Take one slow breath.</p>
            <p className="mt-1 text-[13px] text-plum-200">Let the round settle.</p>
          </>
        )}

        {phase === "rate" && (
          <>
            <p className="text-[13px] font-medium text-plum-100">And now — how strong is the anger?</p>
            <div className="mt-4">
              <Scale value={after} onChange={setAfter} />
            </div>
            <p className="mt-5 text-[12.5px] text-plum-200">
              {after < before
                ? `From ${before} down to ${after}. That shift is the point — you moved it.`
                : after === before
                  ? "Still here — that's okay. Another round often loosens it further."
                  : "Sometimes naming it brings more up first. Be gentle; you can tap again."}
            </p>
            <div className="mt-7 flex gap-2.5">
              {after >= before ? (
                <button
                  onClick={() => {
                    setPointIdx(0);
                    setPhase("setup");
                  }}
                  className="rounded-full bg-white/12 px-6 py-3 text-[13px] font-semibold text-plum-100 transition active:scale-95"
                >
                  Tap another round
                </button>
              ) : null}
              <button
                onClick={() => setPhase("done")}
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-plum-700 transition active:scale-[0.98]"
              >
                {after < before ? "Finish" : "I'm complete for now"}
              </button>
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-pink-400">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-5 font-serif text-[24px] text-white">Well done.</h2>
            <p className="mt-3 max-w-[18rem] text-[13.5px] leading-relaxed text-plum-200">{session.closing}</p>
            <button
              onClick={() => router.push("/app/meditate")}
              className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold text-plum-700 transition active:scale-[0.98]"
            >
              Back to Meditate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
