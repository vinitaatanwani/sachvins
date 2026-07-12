"use client";

// Singleton tone player that keeps playing through screen lock and while
// moving around the app. Web Audio oscillators are suspended when a phone
// locks, so instead each frequency is rendered once into a seamlessly-looping
// WAV file and played through a hidden <audio> element — real media playback
// that iOS/Android keep alive in the background (and that plays even with the
// iPhone silent switch on), with lock-screen controls via the Media Session
// API. Module-level state means navigating tabs never unmounts the sound.

export interface ToneMeta {
  id: string;
  hz: number;
  title: string;
}

type Listener = (playingId: string | null) => void;

let audioEl: HTMLAudioElement | null = null;
let current: ToneMeta | null = null; // what's audibly playing now
let last: ToneMeta | null = null; // survives a lock-screen pause so play resumes it
const listeners = new Set<Listener>();
const wavCache = new Map<number, string>();

function emit() {
  const id = current?.id ?? null;
  listeners.forEach((l) => l(id));
}

export function subscribeTone(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function playingToneId(): string | null {
  return current?.id ?? null;
}

// 16-bit mono WAV holding a whole number of sine cycles (~10s), so loop=true is
// click-free. The loop frequency deviates from nominal by <0.01 Hz — inaudible.
function toneWavUrl(hz: number): string {
  const cached = wavCache.get(hz);
  if (cached) return cached;

  const rate = 44100;
  const cycles = Math.max(1, Math.round(hz * 10));
  const samples = Math.round((cycles * rate) / hz);
  const f = (cycles * rate) / samples;
  const data = new Int16Array(samples);
  const amp = 0.18 * 0x7fff; // matches the old oscillator's 0.2 gain, gently
  for (let n = 0; n < samples; n++) data[n] = Math.round(amp * Math.sin((2 * Math.PI * f * n) / rate));

  const bytes = new Uint8Array(44 + data.byteLength);
  const view = new DataView(bytes.buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[off + i] = s.charCodeAt(i);
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + data.byteLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, data.byteLength, true);
  bytes.set(new Uint8Array(data.buffer), 44);

  const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  wavCache.set(hz, url);
  return url;
}

function ensureAudio(): HTMLAudioElement {
  if (audioEl) return audioEl;
  audioEl = new Audio();
  audioEl.loop = true;
  audioEl.setAttribute("playsinline", "");
  // Keep UI + lock-screen state honest whatever triggers play/pause (our
  // buttons, the lock-screen controls, or interruptions like a phone call).
  audioEl.addEventListener("play", () => {
    if (last) {
      current = last;
      emit();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    }
  });
  audioEl.addEventListener("pause", () => {
    current = null;
    emit();
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
  });
  return audioEl;
}

export async function playTone(meta: ToneMeta): Promise<void> {
  const el = ensureAudio();
  last = meta;
  const url = toneWavUrl(meta.hz);
  if (el.src !== url) el.src = url;

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: "Healing Hands by Vinita",
      album: "Sound healing",
      artwork: [{ src: "/logo-mark.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      el.play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      el.pause();
    });
    try {
      navigator.mediaSession.setActionHandler("stop", () => stopTone());
    } catch {
      /* "stop" unsupported on some browsers */
    }
  }

  await el.play();
  current = meta;
  emit();
}

export function stopTone(): void {
  if (!audioEl) return;
  audioEl.pause();
  audioEl.removeAttribute("src");
  audioEl.load();
  current = null;
  last = null;
  emit();
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
}
