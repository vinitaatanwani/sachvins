"use client";

import { useEffect, useState } from "react";

// "Notes from Vinita" — Web Push opt-in. On iPhone, web push only works once
// the app is added to the Home Screen (iOS 16.4+), so browsers that can't
// subscribe get a gentle install hint instead of a broken button.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function base64ToUint8(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "loading" | "unsupported" | "ios_install" | "off" | "on" | "denied";

export function NotificationsCard() {
  const [state, setState] = useState<State>("loading");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    (async () => {
      if (!PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        // iPhone Safari before install: pushes exist only for Home Screen apps.
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        setState(ios && !standalone ? "ios_install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    if (!PUBLIC_KEY) return;
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8(PUBLIC_KEY) as BufferSource,
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
      });
      setState("on");
    } catch {
      setState("unsupported");
    } finally {
      setWorking(false);
    }
  }

  async function disable() {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setWorking(false);
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  return (
    <div className="mb-5 rounded-2xl border border-black/8 bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-ink">Notes from Vinita</h3>
        {state === "on" && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700">On</span>
        )}
      </div>

      {state === "ios_install" ? (
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          To receive Vinita&rsquo;s daily notes on iPhone, first add this app to your Home Screen:
          tap <b className="text-ink-light">Share</b> → <b className="text-ink-light">Add to Home Screen</b>, then open it
          from there and turn notes on.
        </p>
      ) : state === "denied" ? (
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Notifications are blocked for this app in your device settings. Allow them there, then return
          here to turn on Vinita&rsquo;s notes.
        </p>
      ) : state === "on" ? (
        <>
          <p className="mb-3 text-[12.5px] text-ink-muted">
            You&rsquo;ll receive Vinita&rsquo;s occasional notes of encouragement on this device.
          </p>
          <button
            onClick={disable}
            disabled={working}
            className="w-full rounded-full border border-parchment py-2.5 text-[12.5px] font-medium text-ink-muted transition active:scale-[0.98] disabled:opacity-60"
          >
            {working ? "…" : "Turn off on this device"}
          </button>
        </>
      ) : (
        <>
          <p className="mb-3 text-[12.5px] text-ink-muted">
            A short note of encouragement from Vinita, straight to your phone — never spam, easy to turn
            off.
          </p>
          <button
            onClick={enable}
            disabled={working}
            className="w-full rounded-full bg-indigo py-3 text-[13px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {working ? "Turning on…" : "Turn on notes from Vinita"}
          </button>
        </>
      )}
    </div>
  );
}
