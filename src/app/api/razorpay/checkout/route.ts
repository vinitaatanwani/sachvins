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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Razorpay is not configured" },
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
