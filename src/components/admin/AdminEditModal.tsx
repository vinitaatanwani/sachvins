"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { FOCUS_AREA_LABELS, type FocusAreaKey } from "@/lib/quiz-data";
import { COACHING_PACKAGES, type CoachingPackageKey } from "@/lib/pricing";
import type { CustomerRow } from "./AdminDashboard";

const FOCUS_KEYS = Object.keys(FOCUS_AREA_LABELS) as FocusAreaKey[];
const COACHING_KEYS = Object.keys(COACHING_PACKAGES) as CoachingPackageKey[];

// Owner-only editor: fix a person's details, grant/revoke paid Companion access,
// or delete a duplicate row. Talks to /api/admin/person (PATCH + DELETE).
export function AdminEditModal({ row, onClose }: { row: CustomerRow; onClose: () => void }) {
  const router = useRouter();
  const hasProfile = !!row.profileId;

  const [name, setName] = useState(row.name === "—" ? "" : row.name);
  const [email, setEmail] = useState(row.email === "—" ? "" : row.email);
  const [phone, setPhone] = useState(row.phone === "—" ? "" : row.phone);
  const [focusArea, setFocusArea] = useState<FocusAreaKey | "">((row.focusArea as FocusAreaKey) ?? "");
  const [member, setMember] = useState(row.membershipActive);

  const initialPkg = (row.coachingPackageType as CoachingPackageKey) ?? "seven_session";
  const [coaching, setCoaching] = useState(row.coachingActive);
  const [coachingPkg, setCoachingPkg] = useState<CoachingPackageKey>(initialPkg);
  // Re-grant when access is toggled on/off, or when an active client's package
  // is switched (which resets their 180-day booking window).
  const coachingChanged =
    coaching !== row.coachingActive || (coaching && coachingPkg !== initialPkg);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/person", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: row.profileId ?? undefined,
          leadId: row.leadId ?? undefined,
          name,
          email,
          phone,
          ...(hasProfile ? { focusArea: focusArea || null } : {}),
          ...(hasProfile && member !== row.membershipActive ? { membershipActive: member } : {}),
          ...(hasProfile && coachingChanged
            ? { coachingActive: coaching, ...(coaching ? { coachingPackageType: coachingPkg } : {}) }
            : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Save failed");
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/person", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: row.profileId ?? undefined,
          leadId: row.leadId ?? undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Delete failed");
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  // What a delete actually removes, spelled out for the confirm step.
  const deleteTarget =
    row.profileId && row.leadId
      ? "this person's account, all their app data, and their lead record"
      : row.profileId
        ? "this account and all their app data (journals, check-ins, meditations, membership)"
        : "this lead and their quiz attempt";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-plum/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lift"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">Edit person</h2>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              {hasProfile ? "App account" : "Lead only — no account yet"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-full px-2 text-lg text-ink-muted transition hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} type="email" />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </Field>

          {hasProfile && (
            <Field label="Focus area">
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value as FocusAreaKey | "")}
                className={inputCls}
              >
                <option value="">— none —</option>
                {FOCUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {FOCUS_AREA_LABELS[k]}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Paid access */}
        {hasProfile ? (
          <button
            type="button"
            onClick={() => setMember((m) => !m)}
            className={clsx(
              "mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
              member ? "border-green-400 bg-green-50" : "border-parchment bg-cream/50"
            )}
          >
            <div>
              <div className="text-[13.5px] font-semibold text-ink">Paid Companion access</div>
              <div className="text-[11.5px] text-ink-muted">
                {member ? "Member — Companion unlocked" : "Not a member"}
              </div>
            </div>
            <span
              className={clsx(
                "relative h-6 w-11 shrink-0 rounded-full transition",
                member ? "bg-green-500" : "bg-parchment"
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                  member ? "left-[22px]" : "left-0.5"
                )}
              />
            </span>
          </button>
        ) : (
          <p className="mt-4 rounded-2xl bg-cream/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
            Paid access needs an account. Once they sign in with Google and appear here as a user, you
            can grant Companion access.
          </p>
        )}

        {/* Paid 1:1 coaching — unlocks the 1-hour calendar booking */}
        {hasProfile && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setCoaching((c) => !c)}
              className={clsx(
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                coaching ? "border-plum-400 bg-plum-50" : "border-parchment bg-cream/50"
              )}
            >
              <div>
                <div className="text-[13.5px] font-semibold text-ink">1:1 coaching (paid sessions)</div>
                <div className="text-[11.5px] text-ink-muted">
                  {coaching
                    ? row.coachingActive && row.coachingUntil
                      ? `Can book your calendar until ${row.coachingUntil}`
                      : "Unlocks the 1-hour session booking"
                    : "No 1:1 booking access"}
                </div>
              </div>
              <span
                className={clsx(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  coaching ? "bg-plum-500" : "bg-parchment"
                )}
              >
                <span
                  className={clsx(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    coaching ? "left-[22px]" : "left-0.5"
                  )}
                />
              </span>
            </button>

            {coaching && (
              <div className="mt-2 flex gap-2">
                {COACHING_KEYS.map((key) => {
                  const p = COACHING_PACKAGES[key];
                  const isSel = coachingPkg === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCoachingPkg(key)}
                      className={clsx(
                        "flex-1 rounded-xl border px-3 py-2 text-left transition",
                        isSel ? "border-plum-400 bg-plum-50 ring-1 ring-plum-300" : "border-parchment bg-white"
                      )}
                    >
                      <div className="text-[12.5px] font-semibold text-ink">{p.sessions} sessions</div>
                      <div className="text-[11px] text-ink-muted">{p.label.replace(" Package", "")}</div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
              Grant this to people who&rsquo;ve paid for 1:1 sessions — it opens your booking calendar to
              them for 6 months. Switching the package resets that window.
            </p>
          </div>
        )}

        {error && <p className="mt-3 text-[12.5px] text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 rounded-full bg-green-500 py-3 text-[13.5px] font-semibold text-white shadow-clay-teal transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-parchment bg-white px-5 py-3 text-[13.5px] font-medium text-ink-muted transition hover:bg-cream disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-4 border-t border-parchment pt-4">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="text-[12.5px] font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60"
            >
              Delete this entry…
            </button>
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
              <p className="mb-2.5 text-[12.5px] leading-relaxed text-red-700">
                This permanently deletes {deleteTarget}. This can&rsquo;t be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={remove}
                  disabled={busy}
                  className="rounded-full bg-red-600 px-4 py-2 text-[12.5px] font-semibold text-white transition active:scale-95 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="rounded-full border border-parchment bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted transition hover:bg-cream disabled:opacity-60"
                >
                  Keep
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-parchment bg-white px-3 text-[14px] text-ink outline-none focus:border-green-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
