"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  {
    href: "/app/dashboard",
    label: "Today",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} />
        <circle cx="12" cy="12" r="2.5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    href: "/app/journal",
    label: "Journal",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 4.5h9.5L19 8v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
        <path d="M9 11h6M9 14.5h6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/app/meditate",
    label: "Meditate",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4a3 3 0 0 1 3 3c0 1.2-.7 2.2-1.7 2.7C15.8 10.4 18 12.9 18 16v1H6v-1c0-3.1 2.2-5.6 4.7-6.3A3 3 0 0 1 9 7a3 3 0 0 1 3-3Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
        <path d="M3 19.5c1.8-1.3 3.8-1.3 4.5 0M9.5 19.5c1.8-1.3 3.2-1.3 5 0M16.5 19.5c1.8-1.3 3.7-1.3 4.5 0" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/app/sound",
    label: "Sound",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 12v1M8 9v7M12 5v15M16 9v7M20 12v1" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/app/companion",
    label: "Companion",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 5.5h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
        <path d="M4.4 6.2 12 12l7.6-5.8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/app/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} />
        <path d="M5 19c1.2-3.2 4-4.5 7-4.5s5.8 1.3 7 4.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  // Immersive full-screen views (e.g. the meditation player) hide the tab bar.
  if (/^\/app\/meditate\/.+/.test(pathname)) return null;

  return (
    <nav
      className="z-30 flex-shrink-0 border-t border-white/60 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", background: "rgba(255,253,248,0.72)", boxShadow: "0 -6px 24px rgba(75,23,79,0.06)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] font-medium tracking-tight transition-colors",
                active ? "text-indigo" : "text-ink-muted"
              )}
            >
              <span className="[&>svg]:h-[22px] [&>svg]:w-[22px]">{tab.icon(active)}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
