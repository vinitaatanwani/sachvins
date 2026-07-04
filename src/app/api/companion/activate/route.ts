import { NextResponse } from "next/server";
import { getDeviceId } from "@/lib/profile";
import { activateMembership } from "@/lib/membership";

// DEV / test-unlock: flips membership on without a payment so the Companion
// screens can be exercised before Razorpay keys are live. The real path is a
// verified Razorpay payment (src/app/api/razorpay/confirm), which calls the
// same activateMembership() helper.
export async function POST() {
  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const ok = await activateMembership(deviceId);
  if (!ok) return NextResponse.json({ error: "No profile" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
