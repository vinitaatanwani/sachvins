"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TAROT_PRICE_INR, TAROT_MINUTES, formatInr } from "@/lib/pricing";
import { loadRazorpayCheckout, type RazorpayHandlerResponse } from "@/lib/razorpay-client";

export interface PaidReading {
  id: string;
  question: string;
  paidLabel: string;
}

// Tarot Reading: ₹700 · one question · 25 minutes with Vinita on Zoom.
// Open to everyone. The question is written before paying, so Vinita sees it
// in her console ahead of the call.
export function TarotBooking({
  firstName,
  bookingUrl,
  pastReadings,
}: {
  firstName: string | null;
  bookingUrl: string | null;
  pastReadings: PaidReading[];
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState<string | null>(null); // the paid question

  async function purchase() {
    if (question.trim().length < 10) {
      setError("Write your question first — a sentence or two is perfect.");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/tarot/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Couldn't start checkout");

      const Razorpay = await loadRazorpayCheckout();
      const rzp = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Healing Hands by Vinita",
        description: "Tarot Reading · one question · 25 min",
        theme: { color: "#2b2150" },
        prefill: firstName ? { name: firstName } : undefined,
        handler: async (resp: RazorpayHandlerResponse) => {
          const confirmRes = await fetch("/api/tarot/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          setWorking(false);
          if (confirmRes.ok) {
            setJustPaid(question.trim());
            setQuestion("");
            router.refresh();
          } else {
            setError("We couldn't verify the payment. If money was deducted it will be refunded automatically.");
          }
        },
        modal: { ondismiss: () => setWorking(false) },
      });
      rzp.on("payment.failed", () => {
        setWorking(false);
        setError("The payment didn't go through. Please try again.");
      });
      rzp.open();
    } catch (e) {
      setWorking(false);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  if (justPaid) {
    return (
      <div className="px-5 pb-10 pt-6">
        <div className="text-center">
          <div className="animate-zoom-in mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-berry-50">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#398468" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-3 font-serif text-[22px] text-ink">Your reading is booked in spirit</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">Payment received · {formatInr(TAROT_PRICE_INR)}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-plum-100 bg-plum-50/60 p-4">
          <span className="mb-1.5 block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-plum-500">
            Your question
          </span>
          <p className="font-serif text-[15px] italic leading-relaxed text-ink-light">&ldquo;{justPaid}&rdquo;</p>
        </div>

        <NextStep bookingUrl={bookingUrl} />

        <ol className="mt-5 flex flex-col gap-2.5">
          {[
            "Payment done — your question is with Vinita",
            `Pick your ${TAROT_MINUTES}-minute slot — her time is blocked for you`,
            "Join the Zoom link from your invite — cards on the table",
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-ink-light">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[11px] font-bold text-indigo">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-5">
      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        Bring the one question your heart keeps returning to — love, work, a decision, a person. Vinita
        reads the cards live with you and answers that question in a {TAROT_MINUTES}-minute Zoom call.
      </p>

      <div className="mt-4 rounded-2xl border border-black/8 bg-white p-4">
        <span className="mb-2 block font-accent text-[10px] font-extrabold uppercase tracking-[0.12em] text-plum-500">
          Your one question
        </span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
          placeholder="Write it the way you'd ask a trusted friend — honest and specific."
          className="min-h-[110px] w-full resize-none rounded-xl border border-parchment bg-warm-white p-3 font-serif text-[15px] leading-relaxed text-ink-light outline-none focus:border-indigo/40"
        />
        <p className="mt-1.5 text-[10.5px] text-ink-muted">
          Vinita sees your question before the call, so the reading goes deep from minute one.
        </p>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600">{error}</p>
      )}

      <button
        onClick={purchase}
        disabled={working}
        className="mt-4 w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {working ? "Opening checkout…" : `Pay ${formatInr(TAROT_PRICE_INR)} & book your reading →`}
      </button>
      <p className="mt-2.5 text-center text-[11px] text-ink-muted">
        Secure payment via Razorpay · UPI, cards &amp; more · one question per reading
      </p>

      {pastReadings.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Your readings</h3>
          <div className="flex flex-col gap-2.5">
            {pastReadings.map((r) => (
              <div key={r.id} className="rounded-2xl border border-black/8 bg-white p-3.5">
                <p className="font-serif text-[13.5px] italic leading-relaxed text-ink-light">&ldquo;{r.question}&rdquo;</p>
                <p className="mt-1.5 text-[11px] text-ink-muted">Paid · {r.paidLabel}</p>
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[12px] font-semibold text-indigo"
                  >
                    Book / rebook your slot →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NextStep({ bookingUrl }: { bookingUrl: string | null }) {
  if (bookingUrl) {
    return (
      <div className="mt-4 rounded-2xl border border-black/8 bg-white p-5 text-center">
        <div className="text-2xl" aria-hidden="true">🗓️</div>
        <h3 className="mt-1.5 font-serif text-[17px] text-ink">Now block your {TAROT_MINUTES} minutes</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          Pick a time on Vinita&rsquo;s calendar. Your Zoom link arrives with the calendar invite.
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-full bg-indigo py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.98]"
        >
          See available times →
        </a>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-2xl border border-black/8 bg-white p-5 text-center">
      <div className="text-2xl" aria-hidden="true">🗓️</div>
      <h3 className="mt-1.5 font-serif text-[17px] text-ink">Vinita will schedule your {TAROT_MINUTES} minutes</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        She&rsquo;s received your question and will personally reach out within a day to fix your slot and
        share the Zoom link.
      </p>
    </div>
  );
}
