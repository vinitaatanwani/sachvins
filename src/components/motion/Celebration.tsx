"use client";

import { useEffect, useState } from "react";

const COLORS = ["#2f7d43", "#e0b62f", "#57a747", "#82abac", "#eccb4a"];
const PARTICLE_COUNT = 14;

function Burst() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
    const dist = 70 + Math.random() * 40;
    return {
      dx: `${Math.round(Math.cos(angle) * dist)}px`,
      dy: `${Math.round(Math.sin(angle) * dist)}px`,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div className="relative">
        {particles.map((p, i) => (
          <span
            key={i}
            className="celebrate-particle"
            style={{
              left: "-5px",
              top: "-5px",
              background: p.color,
              // @ts-expect-error CSS custom properties
              "--dx": p.dx,
              "--dy": p.dy,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Fires a one-shot particle burst whenever `trigger` increments (skip 0 so it
// doesn't fire on first render). Reduced-motion users get nothing.
export function Celebration({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => {
    if (trigger <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = Date.now();
    setBursts((b) => [...b, id]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 900);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <>
      {bursts.map((id) => (
        <Burst key={id} />
      ))}
    </>
  );
}
