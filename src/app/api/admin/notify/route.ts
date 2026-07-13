import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Owner-only: send a note from Vinita to everyone (or members only) who has
// notifications enabled. `{name}` in the title/message is replaced with each
// person's first name, so one composed note still lands personally.

const bodySchema = z.object({
  title: z.string().trim().min(1).max(80).default("A note from Vinita"),
  message: z.string().trim().min(1).max(500),
  audience: z.enum(["everyone", "members"]).default("everyone"),
});

function personalise(text: string, name: string | null): string {
  const first = name?.trim().split(" ")[0];
  return text
    .replaceAll("{name}", first ?? "dear one")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const priv = process.env.VAPID_PRIVATE_KEY;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!priv || !pub) return NextResponse.json({ error: "Push keys not configured" }, { status: 500 });
  webpush.setVapidDetails("mailto:vinitaatanwani@gmail.com", pub, priv);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { title, message, audience } = parsed.data;

  const subs = await prisma.pushSubscription.findMany({
    where: audience === "members" ? { profile: { membershipActive: true } } : {},
    include: { profile: { select: { name: true } } },
  });
  if (subs.length === 0) return NextResponse.json({ sent: 0, devices: 0, note: "No one has notifications enabled yet" });

  let sent = 0;
  const gone: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      const payload = JSON.stringify({
        title: personalise(title, s.profile.name),
        body: personalise(message, s.profile.name),
        url: "/app/dashboard",
      });
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = the device unsubscribed or expired — prune it.
        if (status === 404 || status === 410) gone.push(s.id);
      }
    })
  );
  if (gone.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });

  return NextResponse.json({ sent, devices: subs.length, pruned: gone.length });
}
