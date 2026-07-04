"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className="w-full rounded-2xl border border-black/8 bg-white py-3.5 text-sm font-medium text-ink-muted transition active:scale-[0.98] disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
