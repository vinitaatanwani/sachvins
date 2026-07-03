import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  quizResultId: z.string().uuid().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { name, email, quizResultId } = parsed.data;

  // Prefer the quiz result the user just took; otherwise fall back to the
  // most recent lead-linked quiz result matching their email (PRD 3.2 step 5).
  const quizResult = quizResultId
    ? await prisma.quizResult.findUnique({ where: { id: quizResultId } })
    : await prisma.quizResult.findFirst({
        where: { lead: { email } },
        orderBy: { createdAt: "desc" },
      });

  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      name,
      email,
      focusArea: quizResult?.primaryFocusArea,
      nervousSystemState: quizResult?.nervousSystemState,
    },
    update: {
      focusArea: quizResult?.primaryFocusArea,
      nervousSystemState: quizResult?.nervousSystemState,
    },
  });

  if (quizResult) {
    await prisma.quizResult.update({
      where: { id: quizResult.id },
      data: { profileId: profile.id },
    });
  }

  return NextResponse.json({ profileId: profile.id, focusArea: profile.focusArea });
}
