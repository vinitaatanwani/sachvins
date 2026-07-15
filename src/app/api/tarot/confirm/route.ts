import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { verifyPaymentSignature } from "@/lib/razorpay";

const bodySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });

  const reading = await prisma.tarotReading.findFirst({
    where: { profileId: deviceId, razorpayOrderId: razorpay_order_id },
  });
  if (!reading) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await prisma.tarotReading.update({
    where: { id: reading.id },
    data: { status: "paid", razorpayPaymentId: razorpay_payment_id, paidAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
