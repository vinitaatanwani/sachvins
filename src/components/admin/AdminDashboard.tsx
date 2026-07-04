"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { formatInr } from "@/lib/pricing";

export interface CustomerRow {
  id: string;
  detailId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  joinedLabel: string;
  focusArea: string | null;
  focusLabel: string | null;
  focusScore: number | null;
  avgScore: number | null;
  nervousState: string | null;
  age: number | null;
  gender: string | null;
  tookQuiz: boolean;
  isUser: boolean;
  onboarded: boolean;
  membershipActive: boolean;
  journalCount: number;
  checkInCount: number;
  plan: string | null;
}

interface Stats {
  totalLeads: number;
  quizCount: number;
  appUsers: number;
  activeMembers: number;
  revenue: number;
}

type Filter = "all" | "members" | "users" | "leads";

const NERVOUS_LABEL: Record<string, string> = {
  regulated: "Settled",
  fight_flight: "Fight / Flight",
  freeze_fawn: "Freeze / Fawn",
};

function statusOf(c: CustomerRow) {
  if (c.membershipActive) return { label: "Member", cls: "bg-green-500 text-white" };
  if (c.onboarded) return { label: "Trial", cls: "bg-amber-100 text-amber-700" };
  if (c.isUser) return { label: "Signed up", cls: "bg-berry-100 text-berry-700" };
  return { label: "Lead", cls: "bg-cream text-ink-muted" };
}

export function AdminDashboard({
  email,
  stats,
  customers,
  focusList,
}: {
  email: string;
  stats: Stats;
  customers: CustomerRow[];
  focusList: { key: string; label: string; count: number }[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "members" && !c.membershipActive) return false;
      if (filter === "users" && !c.isUser) return false;
      if (filter === "leads" && c.isUser) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle) ||
        (c.focusLabel ?? "").toLowerCase().includes(needle)
      );
    });
  }, [customers, q, filter]);

  const maxFocus = Math.max(1, ...focusList.map((f) => f.count));

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  function exportCsv() {
    const head = ["Name", "Email", "Phone", "Focus area", "Focus score", "Avg score", "Nervous state", "Age", "Gender", "Status", "Journals", "Check-ins", "Plan", "Joined"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((c) =>
      [c.name, c.email, c.phone, c.focusLabel ?? "", c.focusScore ?? "", c.avgScore ?? "",
       c.nervousState ? NERVOUS_LABEL[c.nervousState] ?? c.nervousState : "", c.age ?? "", c.gender ?? "",
       statusOf(c).label, c.journalCount, c.checkInCount, c.plan ?? "", c.joinedLabel]
        .map(esc).join(",")
    );
    const blob = new Blob([[head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sachvins-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[100dvh] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="SachVins" className="h-11 w-11 rounded-full bg-white p-1 shadow-soft ring-1 ring-black/5" />
            <div>
              <h1 className="font-serif text-[26px] leading-none text-ink">Owner console</h1>
              <p className="text-[12.5px] text-ink-muted">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/companion" className="rounded-full bg-green-500 px-4 py-2 text-[13px] font-semibold text-white shadow-clay-teal transition active:scale-95">
              Use paid features →
            </Link>
            <button onClick={exportCsv} className="rounded-full border border-parchment bg-white px-4 py-2 text-[13px] font-semibold text-ink-light transition hover:bg-cream active:scale-95">
              Export CSV
            </button>
            <button onClick={signOut} className="rounded-full border border-parchment bg-white px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:bg-cream active:scale-95">
              Sign out
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Leads" value={stats.totalLeads} hint="assessments started" />
          <Stat label="Quizzes done" value={stats.quizCount} />
          <Stat label="App users" value={stats.appUsers} hint="onboarded" />
          <Stat label="Members" value={stats.activeMembers} accent hint="paid Companion" />
          <Stat label="Revenue / mo" value={formatInr(stats.revenue)} accent />
        </div>

        {/* Focus distribution */}
        {focusList.length > 0 && (
          <div className="glass mb-7 rounded-2xl p-5">
            <h2 className="mb-4 font-serif text-lg text-ink">Where people need healing most</h2>
            <div className="flex flex-col gap-2.5">
              {focusList.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-[13px] text-ink-light">{f.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-amber-300" style={{ width: `${(f.count / maxFocus) * 100}%` }} />
                  </div>
                  <span className="w-7 text-right text-[13px] font-semibold text-ink">{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="h-10 flex-1 min-w-[200px] rounded-full border border-parchment bg-white px-4 text-[14px] outline-none focus:border-green-400"
          />
          <div className="flex gap-1 rounded-full bg-cream p-1 text-[12.5px] font-medium">
            {([["all", "All"], ["members", "Members"], ["users", "Users"], ["leads", "Leads"]] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={clsx("rounded-full px-3 py-1.5 transition", filter === k ? "bg-white text-green-700 shadow-sm" : "text-ink-muted")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-parchment text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Person</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Focus area</th>
                  <th className="px-4 py-3 font-semibold">Who</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Journals</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const s = statusOf(c);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/admin/c/${c.detailId}`)}
                      className="cursor-pointer border-b border-parchment/60 last:border-0 hover:bg-white/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-ink">{c.name}</div>
                        {c.nervousState && (
                          <div className="text-[11px] text-ink-muted">{NERVOUS_LABEL[c.nervousState] ?? c.nervousState}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-light">{c.email}</div>
                        <div className="text-[11px] text-ink-muted">{c.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {c.focusLabel ? (
                          <div>
                            <span className="text-ink-light">{c.focusLabel}</span>
                            {c.focusScore != null && (
                              <span className="ml-1.5 rounded-full bg-cream px-1.5 py-0.5 text-[11px] font-semibold text-ink">{c.focusScore}/100</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {[c.age ? `${c.age}` : null, c.gender].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx("rounded-full px-2.5 py-1 text-[11px] font-semibold", s.cls)}>{s.label}</span>
                        {c.plan && <span className="ml-1.5 text-[11px] text-ink-muted">{c.plan}</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-ink">{c.journalCount}</td>
                      <td className="px-4 py-3 text-ink-muted">{c.joinedLabel}</td>
                      <td className="px-4 py-3 text-ink-muted">›</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <div className="px-4 py-10 text-center text-sm text-ink-muted">No matches.</div>}
        </div>
        <p className="mt-3 text-center text-[12px] text-ink-muted">
          Showing {rows.length} of {customers.length} · updated live
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <div className={clsx("rounded-2xl p-4", accent ? "glass-tint" : "glass")}>
      <div className="text-[11.5px] font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 font-serif text-[28px] leading-none text-ink">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-ink-muted">{hint}</div>}
    </div>
  );
}
