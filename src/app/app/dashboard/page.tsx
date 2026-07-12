import Link from "next/link";
import { getCurrentProfile, trialDayNumber } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getDailyPrompt, recommendedMeditation, recommendedSoundTrack } from "@/lib/content";

// A warm, time-independent greeting. We deliberately avoid "Good morning/
// afternoon/evening" because the hour is computed on the server (UTC/Tokyo),
// which doesn't match the person's local time — it used to say "afternoon" at
// night. This greets them the same way at any hour.
function firstNameOf(name: string | null) {
  return name ? name.split(" ")[0] : null;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const subscription = await prisma.subscription.findUnique({ where: { profileId: profile.id } });
  const dayNumber = trialDayNumber(profile.trialStartedAt);
  const focusArea = profile.focusArea ?? "self_worth";
  const prompt = getDailyPrompt(focusArea, dayNumber - 1);
  const hour = new Date().getHours();
  const timeOfDay = hour < 15 ? "morning" : "evening";
  const meditation = recommendedMeditation(focusArea, profile.nervousSystemState, timeOfDay);
  const soundTrack = recommendedSoundTrack(focusArea, profile.nervousSystemState);

  // "Subscribed" covers both paid paths: an active Companion membership
  // (profile.membershipActive) or an active plan on the Subscription table.
  // Subscribed people are past the trial, so they never see the trial pill/banner.
  const isSubscribed = profile.membershipActive || subscription?.status === "active";
  const trialActive = !isSubscribed && (!subscription || subscription.status === "trialing");
  const daysLeft = profile.trialEndsAt
    ? Math.max(0, Math.ceil((profile.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;

  return (
    <div className="stagger mx-auto max-w-md px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-[26px] leading-tight text-ink">
            {firstNameOf(profile.name) ? `Hi, ${firstNameOf(profile.name)}` : "Hi there"}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-muted">How are you feeling today?</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-cream px-3 py-1.5 text-[11px] font-medium text-ink-light">
          {trialActive ? `Day ${dayNumber} of 7` : "Subscribed"}
        </span>
      </div>

      {trialActive && daysLeft <= 2 && (
        <Link
          href="/app/profile"
          className="mb-5 block rounded-2xl bg-indigo px-5 py-4 text-white transition active:scale-[0.98]"
        >
          <p className="text-sm font-medium">Your trial ends in {daysLeft} day{daysLeft === 1 ? "" : "s"}</p>
          <p className="mt-0.5 text-xs text-white/70">Tap to keep your daily practice going →</p>
        </Link>
      )}

      {/* Hero: today's recommended session */}
      <Link
        href="/app/meditate"
        className="relative mb-4 block overflow-hidden rounded-3xl bg-indigo px-6 pb-7 pt-8 text-white transition active:scale-[0.98]"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-14 h-24 w-24 rounded-full bg-gold/20" />
        <span className="relative mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-gold-light">
          {timeOfDay === "morning" ? "This morning" : "This evening"}
        </span>
        <h2 className="relative mb-1.5 font-serif text-2xl leading-snug">{meditation.title}</h2>
        <p className="relative mb-6 max-w-[220px] text-sm text-white/70">{meditation.description}</p>
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-white">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
              <path d="M0 0.8 16 9 0 17.2Z" />
            </svg>
          </span>
          <span className="text-sm font-medium">{meditation.durationMin} min session</span>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/app/journal"
          className="rounded-2xl border border-black/8 bg-white p-4 transition active:scale-[0.98]"
        >
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-base">
            ✍️
          </span>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gold">
            Journal
          </span>
          <p className="text-[13px] leading-snug text-ink-light line-clamp-3">&ldquo;{prompt}&rdquo;</p>
        </Link>

        <Link
          href="/app/sound"
          className="rounded-2xl border border-black/8 bg-white p-4 transition active:scale-[0.98]"
        >
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-base">
            〰️
          </span>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gold">
            Sound
          </span>
          <h3 className="mb-0.5 text-sm font-medium text-ink">{soundTrack.title}</h3>
          <p className="text-[13px] leading-snug text-ink-muted">{soundTrack.theme}</p>
        </Link>
      </div>
    </div>
  );
}
