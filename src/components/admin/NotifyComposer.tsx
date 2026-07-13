"use client";

import { useState } from "react";
import clsx from "clsx";

// Owner console: compose and send a push note to everyone (or members only)
// who has notifications enabled. {name} becomes each person's first name.
export function NotifyComposer() {
  const [title, setTitle] = useState("A note from Vinita");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"everyone" | "members">("everyone");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    if (!message.trim() || sending) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setResult(
        data.devices === 0
          ? "No one has notifications turned on yet — the card on their profile is where they enable it."
          : `Sent to ${data.sent} of ${data.devices} device${data.devices === 1 ? "" : "s"}.`
      );
      if (data.devices > 0) setMessage("");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass mb-7 rounded-2xl p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Send today&rsquo;s note</h2>
        <div className="flex gap-1 rounded-full bg-cream p-1 text-[12px] font-medium">
          {([["everyone", "Everyone"], ["members", "Members only"]] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setAudience(k)}
              className={clsx("rounded-full px-3 py-1.5 transition", audience === k ? "bg-white text-green-700 shadow-sm" : "text-ink-muted")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-[12px] text-ink-muted">
        A push notification to every device with &ldquo;Notes from Vinita&rdquo; turned on. Write{" "}
        <code className="rounded bg-cream px-1 py-0.5 text-[11px]">{"{name}"}</code> and it becomes each
        person&rsquo;s first name.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 80))}
        placeholder="Title"
        className="mb-2 h-10 w-full rounded-xl border border-parchment bg-white px-3 text-[14px] text-ink outline-none focus:border-green-400"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
        placeholder="Good morning {name} — before the day takes over, take one slow breath. Today, be a little gentler with yourself."
        className="min-h-[84px] w-full resize-none rounded-xl border border-parchment bg-white p-3 text-[14px] leading-relaxed text-ink outline-none focus:border-green-400"
      />
      <div className="mt-2.5 flex items-center gap-3">
        <button
          onClick={send}
          disabled={sending || !message.trim()}
          className="rounded-full bg-green-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-clay-teal transition active:scale-95 disabled:opacity-50"
        >
          {sending ? "Sending…" : `Send to ${audience === "everyone" ? "everyone" : "members"} →`}
        </button>
        {result && <span className="text-[12.5px] text-ink-light">{result}</span>}
      </div>
    </div>
  );
}
