"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rid = searchParams.get("rid");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required by this Supabase project's settings.
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    await fetch("/api/onboarding/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, quizResultId: rid }),
    });

    router.push("/onboarding");
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-black/10 bg-white p-8 text-center">
        <h2 className="mb-2 font-serif text-2xl text-ink">Check your email</h2>
        <p className="text-sm text-ink-muted">
          We&rsquo;ve sent a confirmation link to <strong>{email}</strong>. Confirm your email, then log
          in to start your trial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm rounded-xl border border-black/10 bg-white p-8">
      <h2 className="mb-1 font-serif text-2xl text-ink">Start your free trial</h2>
      <p className="mb-6 text-sm text-ink-muted">7 days free · No credit card needed</p>
      <div className="grid gap-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-parchment bg-warm-white px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-indigo px-8 py-3.5 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-60"
      >
        {loading ? "Creating your account…" : "Create my account"}
      </button>
      <p className="mt-4 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6 py-16">
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  );
}
