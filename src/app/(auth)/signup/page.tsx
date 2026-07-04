import { redirect } from "next/navigation";

// Google OAuth covers both sign-up and sign-in, so there's no separate signup
// screen. Preserve a funnel rid by routing through /onboarding as the post-login
// destination; otherwise just send people to the single login page.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;
  const next = rid ? `/onboarding?rid=${encodeURIComponent(rid)}` : "/onboarding";
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
