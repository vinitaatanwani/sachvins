// Free 20-minute 1:1 booking. The scheduling engine (Vinita's Google Calendar
// appointment page / Calendly / Cal.com) holds her real availability and
// generates the meeting link. Set NEXT_PUBLIC_BOOKING_URL to that link to switch
// this on. We open it in a new tab rather than embed it, because Google's
// booking pages block being shown in an iframe (X-Frame-Options: SAMEORIGIN).
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export default function BookPage() {
  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}
    >
      <h1 className="font-serif text-2xl text-ink">Book your free session</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        A free <b className="text-ink-light">20-minute 1:1 with Vinita</b> — a calm space to look at
        what&rsquo;s coming up for you and where healing can begin. No pressure, no cost.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] text-ink-light">
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">🕊️ Free</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">⏱️ 20 minutes</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">💻 Online video call</span>
      </div>

      {BOOKING_URL ? (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="rounded-2xl border border-black/8 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo/12 text-2xl">
              🗓️
            </div>
            <h2 className="font-serif text-lg text-ink">Pick a time that works for you</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              You&rsquo;ll see Vinita&rsquo;s open slots and get a calendar invite with the video link.
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-full bg-indigo py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              See available times →
            </a>
          </div>
          <p className="mt-3 text-center text-[11.5px] text-ink-muted">
            Opens Vinita&rsquo;s secure booking page in a new tab.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-parchment bg-white/60 p-8 text-center">
          <div className="text-3xl">🗓️</div>
          <h2 className="mt-3 font-serif text-lg text-ink">Booking opens soon</h2>
          <p className="mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-ink-muted">
            Vinita is finishing setting up her calendar. Check back shortly to grab a free 20-minute slot.
          </p>
        </div>
      )}
    </div>
  );
}
