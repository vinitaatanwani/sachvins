import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { BottomTabBar } from "@/components/app/BottomTabBar";
import { AppTour } from "@/components/app/AppTour";
import { PageTransition } from "@/components/motion/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile?.onboardedAt) redirect("/onboarding");

  return (
    <div className="flex h-[100dvh] flex-col bg-warm-white">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomTabBar />
      <AppTour active={!profile.hasSeenAppTour} />
    </div>
  );
}
