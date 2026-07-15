import { getCurrentProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { TAROT_MINUTES, TAROT_PRICE_INR, formatInr } from "@/lib/pricing";
import { TarotBooking } from "@/components/app/TarotBooking";

export const dynamic = "force-dynamic";

// Set NEXT_PUBLIC_TAROT_BOOKING_URL to Vinita's 25-minute tarot Calendly link.
// Until it's set, paid readings show "Vinita will reach out to schedule".
export default async function TarotPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const readings = await prisma.tarotReading.findMany({
    where: { profileId: profile.id, status: { in: ["paid", "completed"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-md pb-4">
      {/* Header — a touch of night sky, still in the app's palette */}
      <div
        className="relative overflow-hidden bg-plum-700 px-6 pb-7 text-center text-white"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 30px)" }}
      >
        <span className="absolute left-7 top-9 text-[10px] text-white/50" aria-hidden="true">✦</span>
        <span className="absolute right-9 top-14 text-[13px] text-white/35" aria-hidden="true">✦</span>
        <span className="absolute bottom-5 left-14 text-[9px] text-white/35" aria-hidden="true">✦</span>
        <div className="text-3xl" aria-hidden="true">🔮</div>
        <h1 className="mt-1.5 font-serif text-[26px] leading-tight">Tarot Reading</h1>
        <p className="mt-1 text-[12.5px] text-plum-200">
          One question · {TAROT_MINUTES} minutes · with Vinita
        </p>
        <div className="mt-3.5 flex justify-center gap-2 text-[10.5px] font-medium">
          <span className="rounded-full bg-white/12 px-3 py-1">{formatInr(TAROT_PRICE_INR)}</span>
          <span className="rounded-full bg-white/12 px-3 py-1">Live on Zoom</span>
          <span className="rounded-full bg-white/12 px-3 py-1">Open to all</span>
        </div>
      </div>

      <TarotBooking
        firstName={profile.name?.split(" ")[0] ?? null}
        bookingUrl={process.env.NEXT_PUBLIC_TAROT_BOOKING_URL ?? null}
        pastReadings={readings.map((r) => ({
          id: r.id,
          question: r.question,
          paidLabel: fmt(r.paidAt ?? r.createdAt),
        }))}
      />
    </div>
  );
}
