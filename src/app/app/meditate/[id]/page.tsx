import { notFound, redirect } from "next/navigation";
import { MEDITATIONS } from "@/lib/content";
import { getCurrentProfile } from "@/lib/profile";
import { FullScreenMeditationPlayer } from "@/components/app/FullScreenMeditationPlayer";
import { AudioMeditationPlayer } from "@/components/app/AudioMeditationPlayer";

export default async function MeditationPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = MEDITATIONS.find((m) => m.id === id);
  if (!track) notFound();

  // Members-only recordings: non-members are guided to the Companion unlock.
  if (track.membersOnly) {
    const profile = await getCurrentProfile();
    if (!profile?.membershipActive) redirect("/app/companion");
  }

  // Real recordings play through the audio player; the rest keep the timer.
  return track.audioSrc ? <AudioMeditationPlayer track={track} /> : <FullScreenMeditationPlayer track={track} />;
}
