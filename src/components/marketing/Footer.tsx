export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-muted">
        <p className="max-w-2xl">
          The Clarity Method is a wellness and self-reflection tool, not a substitute for therapy or
          medical care. If you are in crisis or experiencing a mental health emergency, please contact
          your local emergency services or a crisis helpline in your area.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} The Clarity Method. All rights reserved.</p>
      </div>
    </footer>
  );
}
