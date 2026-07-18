import Link from "next/link";
import { getCurrentProfile } from "@/lib/profile";
import { MEDITATIONS, recommendedMeditation } from "@/lib/content";

export default async function MeditatePage() {
  const profile = await getCurrentProfile();
  const hour = new Date().getHours();
  const timeOfDay = hour < 15 ? "morning" : "evening";
  const recommended = recommendedMeditation(profile?.focusArea, profile?.nervousSystemState, timeOfDay);

  const isMember = !!profile?.membershipActive;

  return (
    <div className="mx-auto max-w-md px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <h1 className="mb-6 font-serif text-[26px] text-ink">Meditate</h1>

      {[{ label: "With Vinita", tracks: MEDITATIONS }].map((group) => (
        <div key={group.label} className="mb-7">
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {group.label}
          </h2>
          <div className="flex flex-col gap-3">
            {group.tracks.map((m) => (
              <Link
                key={m.id}
                href={`/app/meditate/${m.id}`}
                className="flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-4 transition active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-cream">
                  <div className="h-6 w-6 rounded-full bg-gold/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-ink">{m.title}</h3>
                    {m.audioSrc && (
                      <span className="flex-shrink-0 rounded-full bg-indigo/12 px-2 py-0.5 text-[9.5px] font-medium uppercase text-indigo">
                        Her voice
                      </span>
                    )}
                    {m.membersOnly && !isMember && (
                      <span className="flex-shrink-0 rounded-full bg-cream px-2 py-0.5 text-[9.5px] font-medium uppercase text-ink-muted">
                        Members
                      </span>
                    )}
                    {m.id === recommended.id && (
                      <span className="flex-shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[9.5px] font-medium uppercase text-amber-700">
                        For you
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                    {m.durationMin} min · {m.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
