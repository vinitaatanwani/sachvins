import { NextResponse } from "next/server";
import { getDeviceId } from "@/lib/profile";
import { requireAdmin } from "@/lib/admin";
import { activateMembership } from "@/lib/membership";

// Owner-only test-unlock: flips membership on without a payment so the owner
// can exercise the Companion screens. Real members must pay — the live path is
// a verified Razorpay payment (src/app/api/razorpay/confirm). Gated to admin so
// a signed-in user can't grant themselves the paid tier for free.
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const deviceId = await getDeviceId();
  if (!deviceId) return NextResponse.json({ error: "No device id" }, { status: 401 });

  const ok = await activateMembership(deviceId);
  if (!ok) return NextResponse.json({ error: "No profile" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
