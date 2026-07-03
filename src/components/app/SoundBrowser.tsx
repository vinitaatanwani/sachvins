"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SOUND_TRACKS } from "@/lib/content";

export function SoundBrowser({ recommendedId }: { recommendedId: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function stop() {
    if (oscRef.current && gainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
      gainRef.current.gain.linearRampToValueAtTime(0, now + 0.4);
      oscRef.current.stop(now + 0.45);
    }
    oscRef.current = null;
    gainRef.current = null;
    setPlayingId(null);
  }

  function play(hz: number, id: string) {
    stop();
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextCtor();
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
    setPlayingId(id);
  }

  useEffect(() => {
    return () => {
      stop();
      audioCtxRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stagger flex flex-col gap-3">
      {SOUND_TRACKS.map((t) => {
        const isPlaying = playingId === t.id;
        return (
          <div
            key={t.id}
            className={clsx(
              "pressable flex items-center gap-4 rounded-2xl border p-4 transition",
              isPlaying
                ? "border-indigo bg-indigo text-white"
                : t.id === recommendedId
                  ? "border-gold bg-cream"
                  : "border-black/8 bg-white"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className={clsx("font-medium", isPlaying ? "text-white" : "text-ink")}>{t.title}</h3>
                {t.id === recommendedId && !isPlaying && (
                  <span className="flex-shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[9.5px] font-medium uppercase text-amber-700">
                    For you
                  </span>
                )}
              </div>
              <p className={clsx("mt-0.5 truncate text-[13px]", isPlaying ? "text-white/70" : "text-ink-muted")}>
                {isPlaying ? "Now playing…" : t.theme}
              </p>
            </div>
            <button
              onClick={() => (isPlaying ? stop() : play(t.hz, t.id))}
              aria-label={isPlaying ? "Stop" : "Play"}
              className={clsx(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition active:scale-95",
                isPlaying ? "bg-gold text-white" : "bg-indigo text-white"
              )}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="3.5" height="12" rx="1" />
                  <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                  <path d="M0 0.7 14 8 0 15.3Z" />
                </svg>
              )}
            </button>
          </div>
        );
      })}
      <p className="mt-1 text-center text-[11.5px] text-ink-muted">
        Tones are generated live for relaxation and nervous-system support — not a clinical or medical
        treatment.
      </p>
    </div>
  );
}
