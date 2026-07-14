"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { MeditationTrack } from "@/lib/content";
import { Celebration } from "@/components/motion/Celebration";

// Player for real recorded meditations (Vinita's voice). Same calm full-screen
// visual as the self-guided timer, but driven by the audio itself — and because
// it's real media playback, it keeps playing if the phone locks mid-session,
// with lock-screen controls via the Media Session API.

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioMeditationPlayer({ track }: { track: MeditationTrack }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationMin * 60);
  const [complete, setComplete] = useState(false);

  // Record a completed session once (engagement tracking for the owner console).
  useEffect(() => {
    if (!complete || recordedRef.current) return;
    recordedRef.current = true;
    const minutes = Math.max(1, Math.round(duration / 60));
    fetch("/api/meditation/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id, title: track.title, minutes }),
    }).catch(() => {});
  }, [complete, duration, track]);

  useEffect(() => {
    const el = audioRef.current;
    return () => {
      el?.pause();
    };
  }, []);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    void el.play();
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: "Healing Hands by Vinita",
        album: "Guided meditation",
        artwork: [{ src: "/logo-mark.png", sizes: "512x512", type: "image/png" }],
      });
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
    }
  }

  function reset() {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setCurrentTime(0);
    setComplete(false);
    recordedRef.current = false;
  }

  const remaining = Math.max(0, duration - currentTime);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const notStarted = currentTime === 0 && !playing;

  return (
    <div className="flex h-full flex-col bg-indigo text-white">
      <Celebration trigger={complete ? 1 : 0} />
      <audio
        ref={audioRef}
        src={track.audioSrc}
        preload="metadata"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          setComplete(true);
        }}
      />

      <div
        className="flex items-center px-4 pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}
      >
        <button
          onClick={() => router.push("/app/meditate")}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="ml-3 text-sm font-medium text-white/80">{track.title}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {complete ? (
          <div className="text-center">
            <div className="animate-pop mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-petal">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mb-2 font-serif text-3xl">Session complete</h2>
            <p className="mb-8 text-sm text-white/60">
              Notice how you feel now compared to when you started.
            </p>
            <button
              onClick={reset}
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-white transition active:scale-95"
            >
              Start again
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-10 flex h-64 w-64 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/5" />
              <div className="absolute h-52 w-52 rounded-full bg-white/5" />
              <div className={clsx("bg-petal h-40 w-40 rounded-full", playing && "breath-ring")} />
            </div>
            <h2 className="mb-2 text-center font-serif text-2xl">In Vinita&rsquo;s voice</h2>
            <p className="mb-6 max-w-xs text-center text-sm text-white/60">
              {notStarted
                ? "Find a comfortable seat. Her voice will guide you — you can even lock your screen."
                : "Close your eyes. Let the voice carry you."}
            </p>
            <p className="font-serif text-4xl tabular-nums">{formatTime(remaining)}</p>
          </>
        )}
      </div>

      {!complete && (
        <div className="px-6 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
          <div className="mb-6 h-[3px] overflow-hidden rounded bg-white/15">
            <div className="h-full rounded bg-gold transition-[width] duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={reset}
              aria-label="Restart"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 1 0 1-9.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gold transition active:scale-95"
            >
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <rect x="4" y="3" width="4" height="14" rx="1" />
                  <rect x="12" y="3" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="20" viewBox="0 0 18 20" fill="white">
                  <path d="M0 0.9 18 10 0 19.1Z" />
                </svg>
              )}
            </button>
            <div className="h-11 w-11" />
          </div>
          {notStarted && <p className="mt-4 text-center text-xs text-white/40">Tap play to begin</p>}
        </div>
      )}
    </div>
  );
}
