"use client";

import { useState } from "react";

export function ResetTestDataButton() {
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!confirm("Reset all test data and start over as a brand new visitor?")) return;
    setResetting(true);
    await fetch("/api/dev/reset", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleReset}
      disabled={resetting}
      className="w-full rounded-2xl border border-black/8 bg-white py-3.5 text-sm font-medium text-ink-muted transition active:scale-[0.98] disabled:opacity-60"
    >
      {resetting ? "Resetting…" : "Reset test data"}
    </button>
  );
}
