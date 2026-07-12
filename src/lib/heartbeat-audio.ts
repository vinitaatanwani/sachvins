"use client";

// A soft synthesized heartbeat for the Quiet Minute: one exactly-1-second WAV
// holding a gentle "lub… dub" (60 BPM), looped through an <audio> element so
// it plays reliably on phones (including with the iPhone silent switch on).
// Same render-once-and-loop technique as lib/tone-player.

let cachedUrl: string | null = null;

export function heartbeatWavUrl(): string {
  if (cachedUrl) return cachedUrl;

  const rate = 44100;
  const samples = rate; // exactly 1s → seamless 60 BPM loop
  const data = new Float64Array(samples);

  // A heart sound is a low, damped thump: a decaying sine with a soft attack.
  const thump = (startSec: number, freq: number, amp: number, tau: number) => {
    const start = Math.round(startSec * rate);
    const len = Math.round(0.28 * rate);
    for (let i = 0; i < len && start + i < samples; i++) {
      const t = i / rate;
      const attack = Math.min(1, t / 0.012); // 12ms fade-in, no click
      data[start + i] += amp * attack * Math.exp(-t / tau) * Math.sin(2 * Math.PI * freq * t);
    }
  };
  thump(0.0, 52, 0.5, 0.065); // "lub" — lower, longer
  thump(0.35, 66, 0.36, 0.045); // "dub" — softer, quicker

  const pcm = new Int16Array(samples);
  for (let i = 0; i < samples; i++) pcm[i] = Math.round(Math.max(-1, Math.min(1, data[i])) * 0x7fff * 0.6);

  const bytes = new Uint8Array(44 + pcm.byteLength);
  const view = new DataView(bytes.buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[off + i] = s.charCodeAt(i);
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, pcm.byteLength, true);
  bytes.set(new Uint8Array(pcm.buffer), 44);

  cachedUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  return cachedUrl;
}
