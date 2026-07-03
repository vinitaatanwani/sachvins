import { getCurrentProfile } from "@/lib/profile";
import { recommendedSoundTrack } from "@/lib/content";
import { SoundBrowser } from "@/components/app/SoundBrowser";

export default async function SoundPage() {
  const profile = await getCurrentProfile();
  const recommended = recommendedSoundTrack(profile?.nervousSystemState);

  return (
    <div className="mx-auto max-w-md px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <h1 className="mb-6 font-serif text-[26px] text-ink">Sound</h1>
      <SoundBrowser recommendedId={recommended.id} />
    </div>
  );
}
