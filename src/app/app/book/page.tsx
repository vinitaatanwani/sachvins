// Free 20-minute Clarity Session booking. The scheduling engine (Vinita's
// Calendly) holds her real availability and generates the meeting link; we open
// it in a new tab. The free session is a one-time welcome — once an account has
// booked it, the button is replaced with an "already booked" state (enforced via
// a ClaritySession record). Set NEXT_PUBLIC_BOOKING_URL to switch booking on.
import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { FreeSessionBooking } from "@/components/app/FreeSessionBooking";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const claimed = await prisma.claritySession.findFirst({ where: { profileId: profile.id } });

  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}
    >
      <h1 className="font-serif text-2xl text-ink">Book your free session</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        A free <b className="text-ink-light">20-minute 1:1 with Vinita</b> — a calm space to look at
        what&rsquo;s coming up for you and where healing can begin. No pressure, no cost.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] text-ink-light">
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">🕊️ Free</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">⏱️ 20 minutes</span>
        <span className="rounded-full bg-cream px-3 py-1.5 font-medium">💻 Online video call</span>
      </div>

      <FreeSessionBooking alreadyBooked={!!claimed} />
    </div>
  );
}
