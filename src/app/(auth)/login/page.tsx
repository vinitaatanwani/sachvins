import { Suspense } from "react";
import { LoginActions } from "@/components/auth/LoginActions";

// Static shell — ?next= and ?error= are read client-side in LoginActions so
// this page prerenders and serves instantly from the edge cache.
export default function LoginPage() {
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

        <Suspense>
          <LoginActions />
        </Suspense>

        <p className="mt-8 text-[11.5px] leading-relaxed text-ink-muted">
          By continuing you agree to our care-first approach. We only use your account to save your
          journey — never to message you without asking.
        </p>
      </div>
    </div>
  );
}
