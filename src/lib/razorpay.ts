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
  return client.orders.create({
    amount: Math.round(amountInr * 100), // paise
    currency: "INR",
    receipt,
    notes,
  });
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
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
}

// Verifies the async webhook payload (used for subscription lifecycle events).
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
