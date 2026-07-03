# SachVins — The Clarity Method

A guided-healing, nervous-system-regulation web app for **Healing Hands by Vinita**. A diagnostic survey routes each person into a personalized daily practice — journaling (with an AI reflection from Vinita), guided meditations, and sound frequencies — built around their assessed focus area and nervous-system state.

## Stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS**
- **Prisma** ORM → **PostgreSQL** (Supabase in production)
- **Supabase** (Postgres + email auth)
- **Anthropic Claude** for the journal reflections (`@anthropic-ai/sdk`)
- Mobile-first, PWA-ready, SachVins brand system

## Getting started

```bash
npm install
cp .env.example .env      # fill in the values below
npx prisma migrate deploy # create the tables
npm run dev               # http://localhost:3000
```

## Environment variables

See `.env.example`. In short:

- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres (pooler for the app, direct/session for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase auth
- `ANTHROPIC_API_KEY` — powers "a reflection from Vinita" on the Journal screen
- `NEXT_PUBLIC_APP_URL` — base URL for emailed links

Razorpay and Calendly keys are optional and currently disconnected (see `.env.example`).

## Structure

- `src/app/(marketing)` — public funnel: quiz, results/lead-gate
- `src/app/onboarding` — 6-step app onboarding
- `src/app/app` — the app itself (Today, Journal, Meditate, Sound, Profile) + joyride
- `src/lib` — quiz scoring, content, Prisma, Supabase, Anthropic helpers
- `prisma/` — schema + migrations
