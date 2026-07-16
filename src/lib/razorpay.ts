import Razorpay from "razorpay";
import crypto from "crypto";

// Requires RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (test-mode keys during dev —
// see .env.example). Payments via Razorpay (UPI, cards, net banking, EMI) per PRD 3.2 / 9.
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createOrder(amountInr: number, receipt: string, notes?: Record<string, string>) {
  const client = getRazorpayClient();
  try {
    return await client.orders.create({
      amount: Math.round(amountInr * 100), // paise
      currency: "INR",
      receipt,
      notes,
    });
  } catch (err) {
    // The Razorpay SDK throws plain objects, not Errors — without this, callers'
    // `err instanceof Error` checks fall through to a misleading generic message.
    const e = err as { statusCode?: number; error?: { description?: string; code?: string } };
    const detail = e?.error?.description ?? (err instanceof Error ? err.message : null);
    throw new Error(detail ? `Payment setup failed: ${detail}` : "Payment setup failed at Razorpay");
  }
}

// Verifies the checkout.js payment handler payload:
// HMAC_SHA256(order_id + "|" + payment_id, key_secret) === signature
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not configured");
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, params.signature);
}

// Verifies the async webhook payload (used for subscription lifecycle events).
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return safeEqualHex(expected, signature);
}

// Constant-time compare of two hex strings. crypto.timingSafeEqual throws on a
// length mismatch, so guard first — a wrong-length signature is simply invalid,
// not a 500.
function safeEqualHex(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided ?? "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
