import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { DOMAINS } from "@/lib/quiz-data";
import { SUBSCRIPTION_PLANS, formatInr } from "@/lib/pricing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-indigo px-6 py-24 text-center text-white">
        <div className="relative mx-auto max-w-2xl">
          <span className="mb-5 block text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
            The Clarity Method
          </span>
          <h1 className="mb-5 font-serif text-4xl font-normal leading-tight sm:text-5xl">
            Where does your mind <em className="text-gold-light not-italic italic">need healing most?</em>
          </h1>
          <p className="mx-auto max-w-md text-white/70">
            Take a 5-minute assessment to find out what&rsquo;s really going on underneath — then get a
            personalized daily practice built around it, with real human support when you want it.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/quiz"
              className="rounded-lg bg-indigo px-9 py-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-dark"
            >
              Take the free assessment
            </Link>
            <p className="text-xs text-white/40">
              5–8 minutes · Completely private · No credit card needed
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
          The problem
        </span>
        <h2 className="mb-6 font-serif text-3xl text-ink">
          Something feels off — but where do you even start?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <p className="text-ink-light">
            Generic meditation and journaling apps give everyone the same content, regardless of what
            they&rsquo;re actually struggling with.
          </p>
          <p className="text-ink-light">
            Therapy and 1:1 coaching work, but they&rsquo;re expensive and require a time commitment many
            people aren&rsquo;t ready for yet.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
            How it works
          </span>
          <h2 className="mb-10 font-serif text-3xl text-ink">
            Discovery &rarr; trial &rarr; personalized daily practice
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Take the free quiz", body: "20 questions across 6 life areas — 5–8 minutes." },
              { step: "2", title: "Get your Clarity Map", body: "Personalized scores plus an emotional portrait." },
              { step: "3", title: "7-day free trial", body: "Journaling, guided meditation, and sound frequencies, tailored to you." },
              { step: "4", title: "Keep healing", body: "Subscribe, and add 1:1 coaching whenever you're ready." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-black/10 bg-white p-6">
                <div className="mb-3 font-serif text-2xl text-gold">{s.step}</div>
                <h3 className="mb-2 font-medium text-ink">{s.title}</h3>
                <p className="text-sm text-ink-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 domains */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
          What we assess
        </span>
        <h2 className="mb-10 font-serif text-3xl text-ink">Six life-area domains</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d) => (
            <div key={d.key} className="rounded-xl border border-black/10 bg-white p-5">
              <div className="mb-2 text-2xl">{d.icon}</div>
              <h3 className="font-medium text-ink">{d.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{d.intro}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
            Pricing
          </span>
          <h2 className="mb-10 font-serif text-3xl text-ink">Start free. Subscribe when you&rsquo;re ready.</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div key={key} className="rounded-xl border border-black/10 bg-white p-6">
                <h3 className="font-medium text-ink">{plan.label}</h3>
                <p className="mt-2 font-serif text-3xl text-ink">{formatInr(plan.priceInr)}</p>
                <p className="text-sm text-ink-muted">/{plan.cadence}</p>
                <p className="mt-3 text-xs text-ink-muted">{plan.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            Prefer deeper 1:1 support? Book a free 20-minute Clarity Session with a coach any time, in the
            app, and ask about our 7- or 11-session coaching packages.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h2 className="mb-4 font-serif text-3xl text-ink">
          This is just the <em>beginning.</em>
        </h2>
        <Link
          href="/quiz"
          className="inline-block rounded-lg bg-indigo px-9 py-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-indigo-dark"
        >
          Take the free assessment
        </Link>
      </section>

      <Footer />
    </div>
  );
}
