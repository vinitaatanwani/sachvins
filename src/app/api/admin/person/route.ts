import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { activateMembership } from "@/lib/membership";
import { COACHING_PACKAGES } from "@/lib/pricing";

// Owner-only CRUD for a person in the console: edit contact details + focus,
// grant or revoke paid Companion access, and delete duplicate rows (a Lead or a
// Profile). Every path is gated by requireAdmin (Google email allowlist).

const FOCUS = [
  "focus_attention",
  "self_worth",
  "relationships",
  "career_purpose",
  "emotional_world",
  "spirituality",
] as const;

const patchSchema = z
  .object({
    profileId: z.string().optional(),
    leadId: z.string().optional(),
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(40).optional(),
    focusArea: z.enum(FOCUS).nullable().optional(),
    membershipActive: z.boolean().optional(),
    // Paid 1:1 coaching access (unlocks the 1-hour calendar booking).
    coachingActive: z.boolean().optional(),
    coachingPackageType: z.enum(["seven_session", "eleven_session"]).optional(),
  })
  .refine((d) => d.profileId || d.leadId, { message: "profileId or leadId required" });

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { profileId, leadId, name, email, phone, focusArea, membershipActive, coachingActive, coachingPackageType } =
    parsed.data;

  // Lead requires non-null name/email/phone, so only write the fields provided.
  if (leadId) {
    const leadData: { name?: string; email?: string; phone?: string } = {};
    if (name !== undefined) leadData.name = name;
    if (email !== undefined) leadData.email = email;
    if (phone !== undefined) leadData.phone = phone;
    if (Object.keys(leadData).length) {
      await prisma.lead.update({ where: { id: leadId }, data: leadData });
    }
  }

  if (profileId) {
    const profileData: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      focusArea?: (typeof FOCUS)[number] | null;
    } = {};
    if (name !== undefined) profileData.name = name || null;
    if (email !== undefined) profileData.email = email || null;
    if (phone !== undefined) profileData.phone = phone || null;
    if (focusArea !== undefined) profileData.focusArea = focusArea;
    if (Object.keys(profileData).length) {
      await prisma.profile.update({ where: { id: profileId }, data: profileData });
    }

    // Paid access. activateMembership is idempotent and seeds starter content on
    // first grant; revoking mirrors the companion/deactivate cleanup.
    if (membershipActive === true) {
      await activateMembership(profileId);
    } else if (membershipActive === false) {
      await prisma.$transaction([
        prisma.reflectiveLetter.deleteMany({ where: { profileId } }),
        prisma.clarityReport.deleteMany({ where: { profileId } }),
        prisma.affirmationSet.deleteMany({ where: { profileId } }),
        prisma.profile.update({
          where: { id: profileId },
          data: { membershipActive: false, membershipSince: null },
        }),
      ]);
    }

    // Paid 1:1 coaching access. Granting creates (or refreshes) an active
    // package so their 1-hour booking calendar opens for the next 180 days;
    // revoking cancels any active package. Mirrors a real Razorpay purchase.
    if (coachingActive === true) {
      const key = coachingPackageType ?? "seven_session";
      const pkg = COACHING_PACKAGES[key];
      const existing = await prisma.coachingPackage.findFirst({
        where: { profileId, status: "active" },
        orderBy: { purchasedAt: "desc" },
      });
      if (existing) {
        await prisma.coachingPackage.update({
          where: { id: existing.id },
          data: {
            packageType: key,
            sessionsTotal: pkg.sessions,
            priceInr: pkg.defaultPriceInr,
            purchasedAt: new Date(),
          },
        });
      } else {
        await prisma.coachingPackage.create({
          data: {
            profileId,
            packageType: key,
            priceInr: pkg.defaultPriceInr,
            sessionsTotal: pkg.sessions,
            status: "active",
            purchasedAt: new Date(),
          },
        });
      }
    } else if (coachingActive === false) {
      await prisma.coachingPackage.updateMany({
        where: { profileId, status: "active" },
        data: { status: "canceled" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

const deleteSchema = z
  .object({ profileId: z.string().optional(), leadId: z.string().optional() })
  .refine((d) => d.profileId || d.leadId, { message: "profileId or leadId required" });

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = deleteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { profileId, leadId } = parsed.data;

  // Deleting a Profile cascades to all their app data (journals, check-ins,
  // meditations, membership content, subscription) and unlinks any quiz result
  // (QuizResult.profileId is SetNull), so their assessment history is preserved.
  if (profileId) {
    await prisma.profile.delete({ where: { id: profileId } });
  }

  // Deleting a Lead: drop a quiz attempt that belongs only to this lead, but if
  // the lead converted (its quiz result is now shared with a surviving profile),
  // just unlink it so the profile keeps its assessment.
  if (leadId) {
    await prisma.$transaction([
      prisma.quizResult.deleteMany({ where: { leadId, profileId: null } }),
      prisma.quizResult.updateMany({ where: { leadId, NOT: { profileId: null } }, data: { leadId: null } }),
      prisma.lead.delete({ where: { id: leadId } }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
