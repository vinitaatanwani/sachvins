import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook for recurring billing lifecycle events (payment failures,
// subscription cancellations). Configure this URL + RAZORPAY_WEBHOOK_SECRET
// in the Razorpay dashboard before relying on auto-renewal in production.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const orderId: string | undefined = event.payload?.payment?.entity?.order_id;

  if (orderId) {
    const subscription = await prisma.subscription.findFirst({ where: { razorpayOrderId: orderId } });
    if (subscription) {
      if (event.event === "payment.failed") {
        await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "past_due" } });
      } else if (event.event === "subscription.cancelled") {
        await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "canceled" } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
