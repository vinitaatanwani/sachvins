// Free 20-minute 1:1 booking. The scheduling engine (Calendly / Cal.com) is
// where Vinita's calendar availability and Zoom link generation live; the app
// just embeds her booking page. Set NEXT_PUBLIC_BOOKING_URL to her scheduler
// link (e.g. https://calendly.com/vinita/20min) to switch this on.
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export default function BookPage() {
  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}
    >
      <h1 className="font-serif text-2xl text-ink">Book your free session</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        A free <b className="text-ink-light">20-minute 1:1 with Vinita</b> over Zoom — a calm space to
        look at what&rsquo;s coming up for you and where healing can begin. No pressure, no cost.
      </p>

      <div className="mt-3 mb-4 flex flex-wrap gap-2 text-[11.5px] text-ink-light">
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">🕊️ Free</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">⏱️ 20 minutes</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">🎥 On Zoom</span>
      </div>

      {BOOKING_URL ? (
        <>
          <div className="flex-1 overflow-hidden rounded-2xl border border-black/8 bg-white">
            <iframe
              src={BOOKING_URL}
              title="Book a free 20-minute session with Vinita"
              className="h-full min-h-[62vh] w-full"
              loading="lazy"
            />
          </div>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-full bg-indigo py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Open the booking page ↗
          </a>
        </>
      ) : (
        <div className="mt-2 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-parchment bg-white/60 p-8 text-center">
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
