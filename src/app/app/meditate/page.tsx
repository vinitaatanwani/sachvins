import { getCurrentProfile } from "@/lib/profile";
import { MEDITATIONS, recommendedMeditation } from "@/lib/content";
import { EFT_SESSIONS } from "@/lib/eft";
import { MeditateTabs } from "@/components/app/MeditateTabs";

export default async function MeditatePage() {
  const profile = await getCurrentProfile();
  const hour = new Date().getHours();
  const timeOfDay = hour < 15 ? "morning" : "evening";
  const recommended = recommendedMeditation(profile?.focusArea, profile?.nervousSystemState, timeOfDay);
  const isMember = !!profile?.membershipActive;

  return (
    <div className="mx-auto max-w-md px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <h1 className="mb-6 font-serif text-[26px] text-ink">Meditate</h1>

      <MeditateTabs
        isMember={isMember}
        meditations={MEDITATIONS.map((m) => ({
          id: m.id,
          title: m.title,
          durationMin: m.durationMin,
          description: m.description,
          hasAudio: !!m.audioSrc,
          membersOnly: !!m.membersOnly,
          recommended: m.id === recommended.id,
        }))}
        eft={EFT_SESSIONS.map((e) => ({
          id: e.id,
          title: e.title,
          durationMin: e.durationMin,
          description: e.description,
          membersOnly: !!e.membersOnly,
        }))}
      />
    </div>
  );
}
