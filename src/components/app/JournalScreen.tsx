"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { FocusAreaKey } from "@/lib/quiz-data";
import type { SpeechRecognitionLike } from "@/types/speech-recognition";
import { Celebration } from "@/components/motion/Celebration";
import { COACH_FALLBACKS } from "@/lib/content";

interface PastEntry {
  id: string;
  date: string;
  prompt: string;
  content: string | null;
  prompt2: string | null;
  content2: string | null;
}

type Field = "q1" | "q2";

export function JournalScreen({
  prompt,
  prompt2,
  focusArea,
  initialContent,
  initialContent2,
  initialEntryId,
  initialReflection,
  pastEntries,
}: {
  prompt: string;
  prompt2: string;
  focusArea: FocusAreaKey;
  initialContent: string;
  initialContent2: string;
  initialEntryId: string | null;
  initialReflection: string | null;
  pastEntries: PastEntry[];
}) {
  const [tab, setTab] = useState<"write" | "history">("write");
  const [content, setContent] = useState(initialContent);
  const [content2, setContent2] = useState(initialContent2);
  const [entryId, setEntryId] = useState(initialEntryId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(initialContent && initialContent2));

  const [reflection, setReflection] = useState(initialReflection);
  const [showReply, setShowReply] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  const [recordingField, setRecordingField] = useState<Field | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseContentRef = useRef("");
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(Ctor));
    return () => recognitionRef.current?.stop();
  }, []);

  const bothAnswered = content.trim().length > 0 && content2.trim().length > 0;

  function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecordingField(null);
  }

  function startRecording(field: Field) {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const current = field === "q1" ? content : content2;
    const setter = field === "q1" ? setContent : setContent2;
    baseContentRef.current = current.trim().length > 0 ? current.trim() + " " : "";
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscriptRef.current += result[0].transcript + " ";
        else interim += result[0].transcript;
      }
      setter(baseContentRef.current + finalTranscriptRef.current + interim);
      setSaved(false);
      setReflection(null);
    };
    recognition.onerror = () => setRecordingField(null);
    recognition.onend = () => setRecordingField(null);

    recognitionRef.current = recognition;
    recognition.start();
    setRecordingField(field);
  }

  function changeField(field: Field, value: string) {
    (field === "q1" ? setContent : setContent2)(value);
    setSaved(false);
    setReflection(null);
  }

  function randomFallback() {
    return COACH_FALLBACKS[Math.floor(Math.random() * COACH_FALLBACKS.length)];
  }

  // Save both answers, then immediately fetch a short coaching reply and show it
  // in a pop-up. If the live reflection isn't available, fall back to a warm
  // method-aligned line so the person always hears something back.
  async function handleSave() {
    setSaving(true);
    let id = entryId;
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, content, prompt2, content2, focusArea }),
      });
      const data = await res.json();
      id = data.entryId;
      setEntryId(id);
      setSaved(true);
      setCelebrate((c) => c + 1);
    } finally {
      setSaving(false);
    }
    if (id) await openReply(id, reflection);
  }

  async function openReply(id: string, existing: string | null) {
    setShowReply(true);
    if (existing) {
      setReflection(existing);
      return;
    }
    setReplyLoading(true);
    try {
      const res = await fetch("/api/journal/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: id }),
      });
      const data = await res.json();
      setReflection(res.ok && data.reflection ? data.reflection : randomFallback());
    } catch {
      setReflection(randomFallback());
    } finally {
      setReplyLoading(false);
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
          <button onClick={() => setTab("write")} className={clsx("rounded-full px-3.5 py-1.5 transition", tab === "write" ? "bg-white text-ink shadow-sm" : "text-ink-muted")}>Write</button>
          <button onClick={() => setTab("history")} className={clsx("rounded-full px-3.5 py-1.5 transition", tab === "history" ? "bg-white text-ink shadow-sm" : "text-ink-muted")}>Past</button>
        </div>
      </div>

      {tab === "write" ? (
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
          <p className="mb-4 text-[12.5px] leading-relaxed text-ink-muted">
            Two gentle questions today — the first to notice the moment, the second to see the pattern underneath it.
          </p>

          <QuestionBlock
            step={1}
            label="The moment"
            question={prompt}
            value={content}
            onChange={(v) => changeField("q1", v)}
            recording={recordingField === "q1"}
            onMic={() => (recordingField === "q1" ? stopRecording() : startRecording("q1"))}
            speechSupported={speechSupported}
            placeholder="Write freely, or tap the mic to talk instead."
          />

          <QuestionBlock
            step={2}
            label="The pattern"
            question={prompt2}
            value={content2}
            onChange={(v) => changeField("q2", v)}
            recording={recordingField === "q2"}
            onMic={() => (recordingField === "q2" ? stopRecording() : startRecording("q2"))}
            speechSupported={speechSupported}
            placeholder="There's no wrong answer here — just notice what comes up."
          />

          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !bothAnswered}
              className="w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save & hear from Vinita"}
            </button>
            {!bothAnswered && (
              <p className="mt-2 text-center text-[11.5px] text-ink-muted">Answer both questions to save.</p>
            )}
          </div>

          {saved && reflection && !showReply && (
            <button
              onClick={() => setShowReply(true)}
              className="mt-3 w-full rounded-full border border-gold/40 bg-cream py-2.5 text-[13px] font-medium text-ink transition active:scale-[0.98]"
            >
              See Vinita&rsquo;s note again
            </button>
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
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">{entry.date}</p>
                  <p className="mb-1 font-serif text-[14.5px] text-ink">&ldquo;{entry.prompt}&rdquo;</p>
                  <p className="mb-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-light">{entry.content}</p>
                  {entry.prompt2 && (
                    <>
                      <p className="mb-1 font-serif text-[14.5px] text-ink">&ldquo;{entry.prompt2}&rdquo;</p>
                      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-light">{entry.content2}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showReply && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-plum/30 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !replyLoading && setShowReply(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-zoom-in w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift"
          >
            <div className="mb-3 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="Vinita" className="h-10 w-10 rounded-full bg-white p-0.5 shadow-soft ring-1 ring-black/5" />
              <div>
                <div className="font-serif text-[17px] leading-none text-ink">A word from Vinita</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">Your coach</div>
              </div>
            </div>
            {replyLoading ? (
              <p className="animate-pulse py-5 text-center text-[14px] text-ink-muted">Vinita is reading your words…</p>
            ) : (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-light">{reflection}</p>
            )}
            <button
              onClick={() => setShowReply(false)}
              disabled={replyLoading}
              className="mt-5 w-full rounded-full bg-indigo py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              Thank you
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
  step,
  label,
  question,
  value,
  onChange,
  recording,
  onMic,
  speechSupported,
  placeholder,
}: {
  step: number;
  label: string;
  question: string;
  value: string;
  onChange: (v: string) => void;
  recording: boolean;
  onMic: () => void;
  speechSupported: boolean;
  placeholder: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo/12 text-[11px] font-bold text-indigo">{step}</span>
        <span className="font-accent text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold">{label}</span>
      </div>
      <p className="mb-3 font-serif text-[19px] leading-snug text-ink">&ldquo;{question}&rdquo;</p>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[19vh] w-full resize-none rounded-2xl border border-black/8 bg-white p-4 pb-14 text-[15px] leading-relaxed text-ink-light outline-none focus:border-indigo/40"
        />
        {speechSupported && (
          <button
            onClick={onMic}
            aria-label={recording ? "Stop recording" : "Record this answer"}
            className={clsx(
              "absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition active:scale-95",
              recording ? "bg-gold" : "bg-indigo"
            )}
          >
            {recording ? (
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute h-4 w-4 animate-ping rounded-full bg-white/50" />
                <span className="relative h-3 w-3 rounded-sm bg-white" />
              </span>
            ) : (
              <svg width="15" height="19" viewBox="0 0 16 20" fill="none">
                <rect x="4.5" y="0.5" width="7" height="11" rx="3.5" stroke="white" strokeWidth="1.4" />
                <path d="M1 9.5c0 3.6 3.1 6.5 7 6.5s7-2.9 7-6.5M8 16v3.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>
      {recording && <p className="mt-1.5 text-center text-xs text-gold">Listening… tap to stop</p>}
    </div>
  );
}
