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

  const coachingPackage = await prisma.coachingPackage.findFirst({
    where: { profileId: deviceId, razorpayOrderId: razorpay_order_id },
  });
  if (!coachingPackage) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await prisma.coachingPackage.update({
    where: { id: coachingPackage.id },
    data: { status: "active", razorpayPaymentId: razorpay_payment_id, purchasedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
