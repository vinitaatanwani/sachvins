"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS, type FocusAreaKey } from "@/lib/quiz-data";

export function FocusAreaSwitcher({ currentFocusArea }: { currentFocusArea: FocusAreaKey }) {
  const router = useRouter();
  const [focusArea, setFocusArea] = useState<FocusAreaKey>(currentFocusArea);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/profile/focus-area", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focusArea }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6">
      <h3 className="mb-1 font-serif text-xl text-ink">Deepen or switch focus</h3>
      <p className="mb-4 text-sm text-ink-muted">
        Feeling steadier in your current area? Continue deepening it, or move to the next one that needs
        attention.
      </p>
      <div className="flex flex-wrap gap-3">
        <select
          value={focusArea}
          onChange={(e) => setFocusArea(e.target.value as FocusAreaKey)}
          className="rounded-lg border border-parchment bg-warm-white px-4 py-2 text-sm outline-none focus:border-gold"
        >
          {DOMAINS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.icon} {d.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || focusArea === currentFocusArea}
          className="rounded-lg bg-indigo px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Update focus area"}
        </button>
      </div>
    </div>
  );
}
