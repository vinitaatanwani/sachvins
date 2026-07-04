import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { createOrder } from "@/lib/razorpay";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from "@/lib/pricing";

const bodySchema = z.object({
  plan: z.enum(["monthly", "quarterly", "yearly"]),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan: SubscriptionPlanKey = parsed.data.plan;
  const priceInr = SUBSCRIPTION_PLANS[plan].priceInr;

  let order;
  try {
    order = await createOrder(priceInr, `sub_${deviceId}_${Date.now()}`, {
      profileId: deviceId,
      plan,
      kind: "subscription",
    });
  } catch (err) {
    // The Razorpay SDK rejects API failures with a plain object
    // ({ statusCode, error: { code, description } }), not an Error — surface the
    // real status/description so misconfigured keys or account issues are visible.
    const e = err as { statusCode?: number; error?: { description?: string; code?: string }; message?: string };
    const detail = e?.error?.description || e?.message || "Razorpay is not configured";
    console.error("[razorpay/checkout] order creation failed", e?.statusCode, JSON.stringify(e?.error ?? e?.message));
    return NextResponse.json(
      { error: e?.statusCode ? `Razorpay error ${e.statusCode}: ${detail}` : detail },
      { status: 500 }
    );
  }

  await prisma.subscription.upsert({
    where: { profileId: deviceId },
    create: { profileId: deviceId, plan, razorpayOrderId: order.id },
    update: { plan, razorpayOrderId: order.id },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
