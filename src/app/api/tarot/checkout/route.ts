import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { createOrder } from "@/lib/razorpay";
import { TAROT_PRICE_INR } from "@/lib/pricing";

// Start a Tarot Reading purchase: ₹700 for one question, 25 minutes with
// Vinita on Zoom. Open to every signed-in person — no subscription required.
const bodySchema = z.object({
  question: z.string().trim().min(10, "Please write your question").max(1000),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid question" }, { status: 400 });
  }

  const reading = await prisma.tarotReading.create({
    data: { profileId: deviceId, question: parsed.data.question, priceInr: TAROT_PRICE_INR },
  });

  let order;
  try {
    order = await createOrder(TAROT_PRICE_INR, `tarot_${reading.id}`, {
      profileId: deviceId,
      tarotReadingId: reading.id,
      kind: "tarot_reading",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Razorpay is not configured" },
      { status: 500 }
    );
  }

  await prisma.tarotReading.update({ where: { id: reading.id }, data: { razorpayOrderId: order.id } });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    tarotReadingId: reading.id,
  });
}
