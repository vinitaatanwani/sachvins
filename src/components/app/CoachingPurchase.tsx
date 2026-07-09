"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COACHING_PACKAGES, formatInr, type CoachingPackageKey } from "@/lib/pricing";
import { loadRazorpayCheckout, type RazorpayHandlerResponse } from "@/lib/razorpay-client";

// Set NEXT_PUBLIC_COACHING_BOOKING_URL to Vinita's 60-minute paid Calendly link.
// Until it's set, purchasing is held back (no point charging before someone can
// book), and any existing member sees a "booking opens soon" note.
const BOOKING_URL = process.env.NEXT_PUBLIC_COACHING_BOOKING_URL;

type Access = {
  packageType: string;
  sessionsTotal: number;
  sessionsCompleted: number;
  accessUntil: string;
} | null;

const PACKAGE_KEYS: CoachingPackageKey[] = ["seven_session", "eleven_session"];

export function CoachingPurchase({ access, firstName }: { access: Access; firstName: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState<CoachingPackageKey>("seven_session");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function purchase() {
    setWorking(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/coaching-package/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType: selected }),
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
        description: `1:1 Coaching · ${COACHING_PACKAGES[selected].label}`,
        theme: { color: "#6d5cc0" },
        prefill: firstName ? { name: firstName } : undefined,
        handler: async (resp: RazorpayHandlerResponse) => {
          const confirmRes = await fetch("/api/coaching-package/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          if (confirmRes.ok) {
            router.refresh();
          } else {
            setWorking(false);
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

  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}
    >
      <h1 className="font-serif text-2xl text-ink">1:1 Coaching</h1>

      {access ? (
        /* ---- Already purchased: booking access ---- */
        <>
          <div className="mt-4 rounded-2xl border border-indigo/20 bg-indigo/5 p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-indigo/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-indigo">
                Active
              </span>
              <span className="font-serif text-lg text-ink">
                {COACHING_PACKAGES[access.packageType as CoachingPackageKey]?.label ?? "Coaching package"}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-muted">
              You have <b className="text-ink-light">{access.sessionsTotal} one-hour sessions</b> in your
              package. Booking access is open until <b className="text-ink-light">{access.accessUntil}</b>.
            </p>
          </div>

          <div className="mt-4 flex-1 rounded-2xl border border-black/8 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo/12 text-2xl">
              🗓️
            </div>
            <h2 className="font-serif text-lg text-ink">Book a 1-hour session</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              Pick a time that suits you — you&rsquo;ll get a calendar invite with your Zoom link.
            </p>
            {BOOKING_URL ? (
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-full bg-indigo py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                See available times →
              </a>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-parchment bg-cream/50 px-4 py-3 text-[12.5px] text-ink-muted">
                Booking opens shortly — Vinita is finishing her session calendar.
              </p>
            )}
          </div>
        </>
      ) : !BOOKING_URL ? (
        /* ---- Not open for purchase yet (no session calendar configured) ---- */
        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-[13.5px] leading-relaxed text-ink-muted">
            Deeper, ongoing 1:1 coaching with Vinita — <b className="text-ink-light">one-hour sessions</b>,
            sold as focused packages. The best place to start is a free intro call.
          </p>
          <div className="mt-5 rounded-2xl border border-dashed border-parchment bg-white/60 p-6 text-center">
            <div className="text-3xl">🌿</div>
            <h2 className="mt-2 font-serif text-lg text-ink">Coaching packages open soon</h2>
            <p className="mx-auto mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-ink-muted">
              Start with a free 20-minute call — if it feels right, you can pick a package from here.
            </p>
            <Link
              href="/app/book"
              className="mt-5 block rounded-full bg-indigo py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.98]"
            >
              Book your free intro call →
            </Link>
          </div>
        </div>
      ) : (
        /* ---- Purchase a package ---- */
        <>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
            After your free intro call, go deeper with a coaching package — one-hour 1:1 sessions with
            Vinita over Zoom. Choose the package that fits, and your booking calendar opens right away.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {PACKAGE_KEYS.map((key) => {
              const p = COACHING_PACKAGES[key];
              const isSel = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSel ? "border-indigo bg-indigo/5 ring-1 ring-indigo/30" : "border-black/8 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[17px] text-ink">{p.label}</span>
                    <span className="font-serif text-[17px] text-ink">{formatInr(p.defaultPriceInr)}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-ink-muted">
                    {p.sessions} sessions · {p.description}
                  </p>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600">
              {error}
            </p>
          )}

          <button
            onClick={purchase}
            disabled={working}
            className="mt-5 w-full rounded-full bg-indigo py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {working ? "Opening checkout…" : `Pay ${formatInr(COACHING_PACKAGES[selected].defaultPriceInr)} & unlock booking →`}
          </button>
          <p className="mt-2.5 text-center text-[11.5px] text-ink-muted">
            Secure payment via Razorpay · UPI, cards &amp; more. After paying, your 1-hour session
            calendar opens for 6 months.
          </p>
        </>
      )}
    </div>
  );
}
