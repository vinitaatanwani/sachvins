"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { FocusAreaKey } from "@/lib/quiz-data";
import type { SpeechRecognitionLike } from "@/types/speech-recognition";
import { Celebration } from "@/components/motion/Celebration";
import { COACH_FALLBACKS } from "@/lib/content";

interface PastEntry {
  id: string;
  date: string;
  // Only Vinita's note is surfaced in Past — the person's own answers are never
  // sent to the client here, so revisiting can't re-open the wound.
  reflection: string | null;
}

type Field = "q1" | "q2";

export function JournalScreen({
  prompt,
  prompt2,
  focusArea,
  pastEntries,
}: {
  prompt: string;
  prompt2: string;
  focusArea: FocusAreaKey;
  pastEntries: PastEntry[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"write" | "history">("write");
  const [content, setContent] = useState("");
  const [content2, setContent2] = useState("");
  const [saving, setSaving] = useState(false);
  // Once a session is saved we swap the writing form for a calm confirmation +
  // Vinita's note, so the person can pause — or start a fresh entry with a new
  // question — without their words changing under them.
  const [justSaved, setJustSaved] = useState(false);

  const [reflection, setReflection] = useState<string | null>(null);
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
    };
    recognition.onerror = () => setRecordingField(null);
    recognition.onend = () => setRecordingField(null);

    recognitionRef.current = recognition;
    recognition.start();
    setRecordingField(field);
  }

  function changeField(field: Field, value: string) {
    (field === "q1" ? setContent : setContent2)(value);
  }

  function randomFallback() {
    return COACH_FALLBACKS[Math.floor(Math.random() * COACH_FALLBACKS.length)];
  }

  // Save this session as a brand-new entry, then immediately fetch a short
  // coaching reply and show it in a pop-up. router.refresh() pulls the saved
  // entry into the Past list and loads the *next* question for another round.
  async function handleSave() {
    setSaving(true);
    let id: string | null = null;
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, content, prompt2, content2, focusArea }),
      });
      const data = await res.json();
      id = data.entryId ?? null;
      setJustSaved(true);
      setCelebrate((c) => c + 1);
    } finally {
      setSaving(false);
    }
    router.refresh();
    if (id) await openReply(id);
  }

  // Clear the form and adopt the freshly-loaded next question for another entry.
  function writeAnother() {
    setContent("");
    setContent2("");
    setReflection(null);
    setShowReply(false);
    setJustSaved(false);
    setTab("write");
    router.refresh();
  }

  async function openReply(id: string) {
    setShowReply(true);
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
        justSaved ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
            <div className="animate-zoom-in flex h-16 w-16 items-center justify-center rounded-full bg-indigo/12">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--indigo, #6d5cc0)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-5 font-serif text-[22px] text-ink">Your reflection is saved</h2>
            <p className="mt-2 max-w-[16rem] text-[13.5px] leading-relaxed text-ink-muted">
              Vinita has read your words and left you a note. It&rsquo;s saved with this entry — you can revisit it anytime under Past.
            </p>
            <button
              onClick={() => setShowReply(true)}
              className="mt-6 w-full max-w-xs rounded-full border border-gold/40 bg-cream py-3 text-[13.5px] font-medium text-ink transition active:scale-[0.98]"
            >
              See Vinita&rsquo;s note
            </button>
            <button
              onClick={writeAnother}
              className="mt-3 w-full max-w-xs rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              Write another entry
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
            <p className="mb-4 text-[12.5px] leading-relaxed text-ink-muted">
              Two gentle questions — the first to notice the moment, the second to see the pattern underneath it.
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
          </div>
        )
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {pastEntries.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">
              Your entries will show up here once you&rsquo;ve journaled — each one with Vinita&rsquo;s note.
            </p>
          ) : (
            <div className="stagger flex flex-col gap-3">
              {/* Past shows only Vinita's note, never the person's own answers —
                  re-reading the raw entry can re-open the wound. */}
              {pastEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-black/8 bg-white p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">{entry.date}</p>
                  <div className="rounded-xl border border-gold/30 bg-cream p-3">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-mark.png" alt="Vinita" className="h-5 w-5 rounded-full bg-white p-0.5 ring-1 ring-black/5" />
                      <span className="font-accent text-[10px] font-extrabold uppercase tracking-[0.12em] text-gold">Vinita&rsquo;s note</span>
                    </div>
                    {entry.reflection ? (
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-light">{entry.reflection}</p>
                    ) : (
                      <p className="text-[13px] leading-relaxed text-ink-muted">Vinita&rsquo;s note for this reflection is on its way.</p>
                    )}
                  </div>
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
