import { notFound } from "next/navigation";
import { MEDITATIONS } from "@/lib/content";
import { FullScreenMeditationPlayer } from "@/components/app/FullScreenMeditationPlayer";

export default async function MeditationPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = MEDITATIONS.find((m) => m.id === id);
  if (!track) notFound();

  return <FullScreenMeditationPlayer track={track} />;
}
