import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/profile";
import { createOrder } from "@/lib/razorpay";
import { COACHING_PACKAGES, type CoachingPackageKey } from "@/lib/pricing";

const bodySchema = z.object({
  packageType: z.enum(["seven_session", "eleven_session"]),
});

export async function POST(req: NextRequest) {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid package" }, { status: 400 });

  const packageType: CoachingPackageKey = parsed.data.packageType;
  const def = COACHING_PACKAGES[packageType];

  const coachingPackage = await prisma.coachingPackage.create({
    data: {
      profileId: deviceId,
      packageType,
      priceInr: def.defaultPriceInr,
      sessionsTotal: def.sessions,
    },
  });

  let order;
  try {
    order = await createOrder(def.defaultPriceInr, `pkg_${coachingPackage.id}`, {
      profileId: deviceId,
      packageType,
      coachingPackageId: coachingPackage.id,
      kind: "coaching_package",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Razorpay is not configured" },
      { status: 500 }
    );
  }

  await prisma.coachingPackage.update({
    where: { id: coachingPackage.id },
    data: { razorpayOrderId: order.id },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    coachingPackageId: coachingPackage.id,
  });
}
