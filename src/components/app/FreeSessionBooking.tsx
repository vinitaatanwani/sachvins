"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export function FreeSessionBooking({ alreadyBooked }: { alreadyBooked: boolean }) {
  const router = useRouter();
  const [booked, setBooked] = useState(alreadyBooked);
  const [opening, setOpening] = useState(false);

  async function claimAndOpen() {
    if (!BOOKING_URL) return;
    setOpening(true);
    // Open in the same click gesture so the browser doesn't block the popup,
    // then record that this account has used its one free session.
    window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    try {
      await fetch("/api/clarity-session/claim", { method: "POST" });
    } catch {
      /* best-effort — booking already opened */
    }
    setBooked(true);
    setOpening(false);
    router.refresh();
  }

  if (!BOOKING_URL) {
    return (
      <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-parchment bg-white/60 p-8 text-center">
        <div className="text-3xl">🗓️</div>
        <h2 className="mt-3 font-serif text-lg text-ink">Booking opens soon</h2>
        <p className="mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-ink-muted">
          Vinita is finishing setting up her calendar. Check back shortly to grab a free 20-minute slot.
        </p>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="mt-6 flex flex-1 flex-col">
        <div className="rounded-2xl border border-black/8 bg-white p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo/12 text-2xl">
            🕊️
          </div>
          <h2 className="font-serif text-lg text-ink">You&rsquo;ve booked your free session</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            The 20-minute Clarity Session is a one-time welcome, so it can only be booked once. If you
            couldn&rsquo;t pick a time, reach out to Vinita and she&rsquo;ll help.
          </p>
          <Link
            href="/app/coaching"
            className="mt-5 block rounded-full bg-indigo py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Explore 1-hour coaching packages →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-1 flex-col">
      <div className="rounded-2xl border border-black/8 bg-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo/12 text-2xl">
          🗓️
        </div>
        <h2 className="font-serif text-lg text-ink">Pick a time that works for you</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
          You&rsquo;ll see Vinita&rsquo;s open slots and get a calendar invite with the video link.
        </p>
        <button
          onClick={claimAndOpen}
          disabled={opening}
          className="mt-5 block w-full rounded-full bg-indigo py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {opening ? "Opening…" : "See available times →"}
        </button>
      </div>
      <p className="mt-3 text-center text-[11.5px] text-ink-muted">
        Your free Clarity Session can be booked once · opens in a new tab.
      </p>
    </div>
  );
}
