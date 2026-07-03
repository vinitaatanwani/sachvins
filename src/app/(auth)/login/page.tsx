"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Signup only creates the Profile row when a session comes back immediately.
    // If this Supabase project requires email confirmation, that step was
    // skipped — make sure the Profile exists now that the user has a session.
    // Idempotent (upsert), so safe to call on every login.
    const name = (signInData.user.user_metadata?.name as string | undefined) ?? email;
    await fetch("/api/onboarding/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, quizResultId: null }),
    });

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm rounded-xl border border-black/10 bg-white p-8">
      <h2 className="mb-6 font-serif text-2xl text-ink">Welcome back</h2>
      <div className="grid gap-4">
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
        {loading ? "Logging in…" : "Log in"}
      </button>
      <p className="mt-4 text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/quiz" className="text-indigo underline">
          Take the free assessment
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
