import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-black/10 bg-warm-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="font-serif text-lg text-ink sm:text-xl">
          The Clarity Method
        </Link>
        <nav className="flex items-center gap-3 text-sm text-ink-light sm:gap-6">
          <Link href="/#how-it-works" className="hidden hover:text-ink md:inline">
            How it works
          </Link>
          <Link href="/#pricing" className="hidden hover:text-ink md:inline">
            Pricing
          </Link>
          <Link href="/app/dashboard" className="hidden hover:text-ink sm:inline">
            Open the app
          </Link>
          <Link
            href="/quiz"
            className="rounded-lg bg-indigo px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-dark sm:px-4 sm:text-sm"
          >
            Take the free quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}
