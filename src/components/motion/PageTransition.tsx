"use client";

import { usePathname } from "next/navigation";

// Re-keying by pathname remounts the subtree on navigation, replaying the
// zoom-in animation so every app screen "blooms" open. (Reduced-motion users
// get a plain mount — the animation is disabled in globals.css.)
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-zoom-in h-full">
      {children}
    </div>
  );
}
