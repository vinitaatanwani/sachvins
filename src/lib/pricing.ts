// PRD 5.2 — Pricing (India market, INR). Amounts are in whole rupees; Razorpay
// order creation converts to paise (x100).
export const SUBSCRIPTION_PLANS = {
  monthly: { label: "Monthly", priceInr: 499, cadence: "month", note: "Full price, no commitment" },
  quarterly: { label: "Quarterly", priceInr: 1199, cadence: "quarter", note: "~₹400/mo equivalent (≈20% off monthly)" },
  yearly: { label: "Yearly", priceInr: 3999, cadence: "year", note: "~₹333/mo equivalent (≈33% off monthly)" },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

// PRD 4.7 / 5.2 — Coaching packages, sold only as bundles.
export const COACHING_PACKAGES = {
  seven_session: {
    label: "7-Session Package",
    sessions: 7,
    priceMinInr: 18000,
    priceMaxInr: 25000,
    defaultPriceInr: 21000,
    description: "Focused healing · 1 hour each",
  },
  eleven_session: {
    label: "11-Session Package",
    sessions: 11,
    priceMinInr: 28000,
    priceMaxInr: 38000,
    defaultPriceInr: 32000,
    description: "Deep transformation · 1 hour each",
  },
} as const;

export type CoachingPackageKey = keyof typeof COACHING_PACKAGES;

// How long a purchased coaching package keeps its 1-hour booking access open,
// measured from the purchase date. Derived at read-time from purchasedAt, so no
// separate expiry column is needed.
export const COACHING_ACCESS_DAYS = 180; // 6 months

// Tarot Reading: one question, 25 minutes with Vinita on Zoom. Open to all.
export const TAROT_PRICE_INR = 700;
export const TAROT_MINUTES = 25;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
