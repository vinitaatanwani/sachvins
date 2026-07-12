"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import type { NervousSystemState } from "@/lib/quiz-data";
import { nervousLabel } from "@/lib/companion-content";
import { JourneyTab } from "./JourneyTab";
import type { JourneyData } from "@/lib/journey";
import { loadRazorpayCheckout, type RazorpayHandlerResponse } from "@/lib/razorpay-client";

type Tab = "letters" | "journey" | "affirmations";

// Plan card order must match the SubscriptionPlan keys the checkout API expects.
const PLAN_KEYS = ["monthly", "quarterly", "yearly"] as const;

const PLANS = [
  { label: "Monthly", price: "₹499", sub: "/mo" },
  { label: "Quarterly", price: "₹1,199", sub: "≈₹400/mo" },
  { label: "Yearly", price: "₹3,999", sub: "best value", best: true },
];

export function CompanionHome({
  locked = false,
  razorpayKeyId = null,
  firstName,
  letter,
  journey,
  affirmations,
}: {
  locked?: boolean;
  razorpayKeyId?: string | null;
  firstName?: string | null;
  letter: { body: string; weekOf: string } | null;
  journey: JourneyData | null;
  affirmations: { lines: string[]; weekOf: string; nervousState: NervousSystemState | null; todayIndex: number } | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(locked ? "journey" : "letters");
  const [plan, setPlan] = useState(2);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    setError(null);

    // No keys configured yet → keep the flow usable with an instant test-unlock.
    if (!razorpayKeyId) {
      setWorking(true);
      await fetch("/api/companion/activate", { method: "POST" });
      router.refresh();
      return;
    }

    setWorking(true);
    try {
      const planKey = PLAN_KEYS[plan];
      const orderRes = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
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
        description: `Reflective Companion · ${PLANS[plan].label}`,
        theme: { color: "#6d5cc0" },
        prefill: firstName ? { name: firstName } : undefined,
        handler: async (resp: RazorpayHandlerResponse) => {
          const confirmRes = await fetch("/api/razorpay/confirm", {
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
  async function cancelMembership() {
    setWorking(true);
    await fetch("/api/companion/deactivate", { method: "POST" });
    router.refresh();
  }

  const letterParas = letter ? letter.body.split(/\n\n+/) : [];

  return (
    <div className="mx-auto max-w-md px-5 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 22px)" }}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-[26px] leading-tight text-ink">Your companion</h1>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide",
            locked ? "bg-cream text-ink-muted" : "bg-plum-50 text-plum-600"
          )}
        >
          {locked ? "Preview" : "Member"}
        </span>
      </div>

      {locked && (
        <p className="mb-4 text-[13px] leading-relaxed text-ink-light">
          {firstName ? `${firstName}, here` : "Here"}&rsquo;s a peek at what your companion has already written for you.
          Unlock to read it all.
        </p>
      )}

      {/* Segmented tabs */}
      <div className="mb-5 flex gap-1 rounded-full bg-cream p-1 text-[12px] font-medium">
        {(
          (locked
            ? [["journey", "Journey"], ["affirmations", "Affirmations"]]
            : [["letters", "Letters"], ["journey", "Journey"], ["affirmations", "Affirmations"]]) as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "flex-1 rounded-full py-1.5 transition",
              tab === key ? "bg-white text-plum-600 shadow-sm" : "text-ink-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Letters: members only — Vinita's letters are part of the paid tier ── */}
      {tab === "letters" && !locked &&
        (letter ? (
          <div className="animate-zoom-in rounded-2xl border border-plum-100 bg-white p-5">
            <span className="mb-1 block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-plum-500">
              A letter for you
            </span>
            <p className="mb-3 text-[12px] text-ink-muted">
              {new Date(letter.weekOf).toLocaleDateString("en-US", { day: "numeric", month: "long" })}
            </p>
            {locked ? (
              <>
                <p className="whitespace-pre-line font-serif text-[16px] leading-loose text-ink-light">
                  {letterParas[0]}
                </p>
                <LockedRest>
                  <p className="whitespace-pre-line font-serif text-[16px] leading-loose text-ink-light">
                    {letterParas.slice(1).join("\n\n")}
                  </p>
                </LockedRest>
              </>
            ) : (
              <>
                <p className="whitespace-pre-line font-serif text-[16px] leading-loose text-ink-light">{letter.body}</p>
                <p className="mt-4 font-serif text-[17px] italic text-plum-600">— with you, always</p>
                <div className="mt-5 flex gap-2.5">
                  <button className="flex-1 rounded-full bg-plum-50 py-2.5 text-[12.5px] font-semibold text-plum-600 transition active:scale-[0.98]">
                    Save this letter
                  </button>
                  <Link
                    href="/app/journal"
                    className="flex-1 rounded-full border border-parchment py-2.5 text-center text-[12.5px] font-semibold text-ink-light transition active:scale-[0.98]"
                  >
                    Reflect on it
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <EmptyNote>Your first letter from Vinita arrives once you begin journaling — she writes back to what you write.</EmptyNote>
        ))}

      {/* ── Journey: this month, mirrored from their real practice ── */}
      {tab === "journey" &&
        (journey ? (
          locked ? (
            <div>
              <JourneyTab data={journey} />
              <p className="mt-3 text-center text-[11.5px] text-ink-muted">
                This is your real practice — as a member it grows into your full monthly mirror.
              </p>
            </div>
          ) : (
            <JourneyTab data={journey} />
          )
        ) : (
          <EmptyNote>Your journey appears here as you practise.</EmptyNote>
        ))}

      {/* ── Affirmations ── */}
      {tab === "affirmations" &&
        (affirmations && affirmations.lines.length > 0 ? (
          <div className="animate-zoom-in">
            <div className="mb-5 rounded-3xl bg-gradient-to-b from-plum-500 to-plum-700 px-6 py-9 text-center">
              <span className="mb-3 block font-accent text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-plum-100">
                Today&rsquo;s affirmation
              </span>
              <p className="font-serif text-[24px] leading-snug text-white">{affirmations.lines[affirmations.todayIndex]}</p>
              <p className="mt-4 text-[11px] text-plum-200">Chosen for {nervousLabel(affirmations.nervousState)}</p>
            </div>

            <span className="mb-2.5 block font-accent text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">
              This week&rsquo;s set
            </span>
            {locked ? (
              <LockedRest tall>
                <div className="flex flex-col gap-2.5">
                  {affirmations.lines.map((line, i) => (
                    <div key={i} className="rounded-2xl border border-parchment bg-white p-3.5 text-[14px] leading-snug text-ink-light">
                      {line}
                    </div>
                  ))}
                </div>
              </LockedRest>
            ) : (
              <div className="flex flex-col gap-2.5">
                {affirmations.lines.map((line, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "rounded-2xl border p-3.5 text-[14px] leading-snug",
                      i === affirmations.todayIndex
                        ? "border-plum-200 bg-plum-50 font-medium text-plum-700"
                        : "border-parchment bg-white text-ink-light"
                    )}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyNote>Your weekly affirmations appear here, one surfaced each day.</EmptyNote>
        ))}

      {/* ── Unlock (locked) ── */}
      {locked ? (
        <div className="mt-6 rounded-2xl border-2 border-plum-100 bg-plum-50/60 p-4">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-plum-500 text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-serif text-[19px] text-ink">Unlock your companion</h3>
          </div>
          <p className="mb-3.5 text-[12.5px] leading-snug text-ink-muted">
            Your full weekly letters and daily affirmations — the moment your payment goes through.
          </p>
          <div className="mb-3.5 flex gap-2">
            {PLANS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPlan(i)}
                className={clsx(
                  "flex-1 rounded-xl border px-2 py-2.5 text-center transition active:scale-[0.98]",
                  plan === i ? "border-2 border-plum-500 bg-white" : "border border-plum-100 bg-white/70"
                )}
              >
                {p.best && (
                  <div className="mb-0.5 font-accent text-[8px] font-extrabold uppercase tracking-wide text-plum-600">Best value</div>
                )}
                <div className="text-[10.5px] text-ink-muted">{p.label}</div>
                <div className="font-serif text-[17px] leading-tight text-ink">{p.price}</div>
                <div className="text-[9px] text-ink-muted">{p.sub}</div>
              </button>
            ))}
          </div>
          <button
            onClick={unlock}
            disabled={working}
            className="bg-petal-soft w-full rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {working ? (razorpayKeyId ? "Opening checkout…" : "Unlocking…") : `Pay ${PLANS[plan].price} & unlock →`}
          </button>
          {error && <p className="mt-2.5 text-center text-[11.5px] font-medium text-berry-500">{error}</p>}
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-muted">
            {razorpayKeyId ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Secure payment via Razorpay · UPI, cards &amp; more. Cancel anytime.
              </>
            ) : (
              <>Payment isn&rsquo;t connected yet — this unlocks instantly for testing. Cancel anytime.</>
            )}
          </p>
        </div>
      ) : (
        <button onClick={cancelMembership} className="mx-auto mt-9 block text-[11.5px] text-ink-muted underline underline-offset-2">
          Manage membership (test: cancel)
        </button>
      )}
    </div>
  );
}

function LockedRest({ children, tall = false }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div className={clsx("relative overflow-hidden", tall ? "max-h-44" : "max-h-28")}>
      <div className="pointer-events-none select-none blur-[5px]" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent via-white/50 to-white pb-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-plum-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Unlock to keep reading
        </span>
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 text-center text-sm text-ink-muted">{children}</p>;
}
