"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { FocusAreaKey } from "@/lib/quiz-data";
import type { SpeechRecognitionLike } from "@/types/speech-recognition";
import { Celebration } from "@/components/motion/Celebration";

interface PastEntry {
  id: string;
  date: string;
  prompt: string;
  content: string | null;
}

export function JournalScreen({
  prompt,
  focusArea,
  initialContent,
  initialEntryId,
  initialReflection,
  pastEntries,
}: {
  prompt: string;
  focusArea: FocusAreaKey;
  initialContent: string;
  initialEntryId: string | null;
  initialReflection: string | null;
  pastEntries: PastEntry[];
}) {
  const [tab, setTab] = useState<"write" | "history">("write");
  const [content, setContent] = useState(initialContent);
  const [entryId, setEntryId] = useState(initialEntryId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(initialContent));

  const [reflection, setReflection] = useState(initialReflection);
  const [reflecting, setReflecting] = useState(false);
  const [reflectError, setReflectError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);

  const [recording, setRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseContentRef = useRef("");
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognitionCtor));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
  }

  function startRecording() {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    baseContentRef.current = content.trim().length > 0 ? content.trim() + " " : "";
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setContent(baseContentRef.current + finalTranscriptRef.current + interim);
      setSaved(false);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function handleContentChange(value: string) {
    setContent(value);
    setSaved(false);
    setReflection(null);
    setReflectError(null);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, content, focusArea }),
    });
    const data = await res.json();
    setEntryId(data.entryId);
    setReflection(data.reflection ?? null);
    setSaving(false);
    setSaved(true);
    setCelebrate((c) => c + 1);
  }

  async function handleReflect() {
    if (!entryId) return;
    setReflecting(true);
    setReflectError(null);
    try {
      const res = await fetch("/api/journal/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate a reflection right now.");
      setReflection(data.reflection);
    } catch (err) {
      setReflectError(err instanceof Error ? err.message : "Could not generate a reflection right now.");
    } finally {
      setReflecting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Celebration trigger={celebrate} />
      <div
        className="flex items-center justify-between px-5 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}
      >
        <h1 className="font-serif text-2xl text-ink">Journal</h1>
        <div className="flex rounded-full bg-cream p-1 text-[12.5px] font-medium">
          <button
            onClick={() => setTab("write")}
            className={clsx(
              "rounded-full px-3.5 py-1.5 transition",
              tab === "write" ? "bg-white text-ink shadow-sm" : "text-ink-muted"
            )}
          >
            Write
          </button>
          <button
            onClick={() => setTab("history")}
            className={clsx(
              "rounded-full px-3.5 py-1.5 transition",
              tab === "history" ? "bg-white text-ink shadow-sm" : "text-ink-muted"
            )}
          >
            Past
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
          <p className="mb-4 font-serif text-[21px] leading-snug text-ink">&ldquo;{prompt}&rdquo;</p>
          <div className="relative min-h-[38vh]">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write freely, or tap the mic to talk instead."
              className="h-full min-h-[38vh] w-full resize-none rounded-2xl border border-black/8 bg-white p-4 pb-16 text-[15px] leading-relaxed text-ink-light outline-none"
            />
            {speechSupported && (
              <button
                onClick={recording ? stopRecording : startRecording}
                aria-label={recording ? "Stop recording" : "Record journal entry"}
                className={clsx(
                  "absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition active:scale-95",
                  recording ? "bg-gold" : "bg-indigo"
                )}
              >
                {recording ? (
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute h-4 w-4 animate-ping rounded-full bg-white/50" />
                    <span className="relative h-3 w-3 rounded-sm bg-white" />
                  </span>
                ) : (
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <rect x="4.5" y="0.5" width="7" height="11" rx="3.5" stroke="white" strokeWidth="1.4" />
                    <path
                      d="M1 9.5c0 3.6 3.1 6.5 7 6.5s7-2.9 7-6.5M8 16v3.2"
                      stroke="white"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
          {recording && <p className="mt-2 text-center text-xs text-gold">Listening… tap to stop</p>}

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving || content.trim().length === 0}
              className="w-full rounded-full bg-indigo py-3.5 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save entry"}
            </button>
          </div>

          {saved && entryId && !reflection && (
            <button
              onClick={handleReflect}
              disabled={reflecting}
              className="mt-3 w-full rounded-full border border-gold/40 bg-cream py-3 text-sm font-medium text-ink transition active:scale-[0.98] disabled:opacity-60"
            >
              {reflecting ? "Vinita is reading…" : "Get a reflection from Vinita"}
            </button>
          )}

          {reflectError && <p className="mt-2 text-center text-xs text-red-600">{reflectError}</p>}

          {reflection && (
            <div className="mt-4 rounded-2xl border border-gold/30 bg-cream p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo text-[11px] font-medium text-white">
                  V
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wide text-gold">
                  A reflection from Vinita
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-light">{reflection}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {pastEntries.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">
              Past entries will show up here once you&rsquo;ve journaled on a few different days.
            </p>
          ) : (
            <div className="stagger flex flex-col gap-3">
              {pastEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-black/8 bg-white p-4">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    {entry.date}
                  </p>
                  <p className="mb-2 font-serif text-[15px] text-ink">&ldquo;{entry.prompt}&rdquo;</p>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-light">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
