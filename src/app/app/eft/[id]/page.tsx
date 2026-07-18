import { notFound, redirect } from "next/navigation";
import { eftById } from "@/lib/eft";
import { getCurrentProfile } from "@/lib/profile";
import { EftSession } from "@/components/app/EftSession";

export default async function EftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = eftById(id);
  if (!session) notFound();

  if (session.membersOnly) {
    const profile = await getCurrentProfile();
    if (!profile?.membershipActive) redirect("/app/companion");
  }

  return <EftSession session={session} />;
}
