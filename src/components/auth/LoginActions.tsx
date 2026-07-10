"use client";

import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "We couldn't complete Google sign-in. Please try again.",
  missing_code: "Sign-in didn't finish. Please try again.",
};

// Reads ?next= and ?error= on the client so the login page itself can be
// statically prerendered and served from the edge — it's the first app page a
// converting visitor hits, so its load time matters most.
export function LoginActions() {
  const params = useSearchParams();
  const next = params.get("next");
  const error = params.get("error");

  // Only allow app-relative destinations (guards against open redirects).
  const safeNext = next && next.startsWith("/") ? next : "/app/dashboard";
  const errorMessage = error ? ERROR_MESSAGES[error] ?? "Something went wrong. Please try again." : null;

  return (
    <>
      <div className="mt-8">
        <GoogleSignInButton next={safeNext} />
      </div>
      {errorMessage && <p className="mt-4 text-[12.5px] text-berry-500">{errorMessage}</p>}
    </>
  );
}
