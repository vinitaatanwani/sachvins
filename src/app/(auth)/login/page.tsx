import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "We couldn't complete Google sign-in. Please try again.",
  missing_code: "Sign-in didn't finish. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // Only allow app-relative destinations (guards against open redirects).
  const safeNext = next && next.startsWith("/") ? next : "/app/dashboard";
  const errorMessage = error ? ERROR_MESSAGES[error] ?? "Something went wrong. Please try again." : null;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-warm-white px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="animate-floaty mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-soft ring-1 ring-black/5 backdrop-blur">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="SachVins" className="h-16 w-16 object-contain" />
        </div>
        <p className="font-accent text-[10px] font-extrabold uppercase tracking-[0.16em] text-plum-500">
          Healing Hands by Vinita
        </p>
        <h1 className="mt-2 font-serif text-[28px] leading-tight text-ink">Welcome to your space</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-light">
          Sign in to begin — your reflections, progress, and companion stay with you on every device.
        </p>

        <div className="mt-8">
          <Suspense>
            <GoogleSignInButton next={safeNext} />
          </Suspense>
        </div>

        {errorMessage && <p className="mt-4 text-[12.5px] text-berry-500">{errorMessage}</p>}

        <p className="mt-8 text-[11.5px] leading-relaxed text-ink-muted">
          By continuing you agree to our care-first approach. We only use your account to save your
          journey — never to message you without asking.
        </p>
      </div>
    </div>
  );
}
