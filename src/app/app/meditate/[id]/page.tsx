import { notFound } from "next/navigation";
import { MEDITATIONS } from "@/lib/content";
import { FullScreenMeditationPlayer } from "@/components/app/FullScreenMeditationPlayer";
import { AudioMeditationPlayer } from "@/components/app/AudioMeditationPlayer";

export default async function MeditationPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = MEDITATIONS.find((m) => m.id === id);
  if (!track) notFound();

  // Real recordings play through the audio player; the rest keep the timer.
  return track.audioSrc ? <AudioMeditationPlayer track={track} /> : <FullScreenMeditationPlayer track={track} />;
}
