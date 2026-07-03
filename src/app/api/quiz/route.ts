import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  QUESTIONS,
  buildEmotionalPortrait,
  primaryAndSecondaryFocus,
  scoreAllDomains,
  scoreNervousSystemState,
} from "@/lib/quiz-data";

const bodySchema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(4)),
  demographics: z
    .object({
      age: z.number().int().min(13).max(120).optional(),
      gender: z.string().min(1).max(60).optional(),
      maritalStatus: z.string().min(1).max(60).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const { answers, demographics } = parsed.data;
  const missing = QUESTIONS.filter((q) => answers[q.id] === undefined);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing answers for: ${missing.map((q) => q.id).join(", ")}` },
      { status: 400 }
    );
  }

  const domainScores = scoreAllDomains(answers);
  const { primary, secondary } = primaryAndSecondaryFocus(domainScores);
  const nervousSystemState = scoreNervousSystemState(answers);
  const emotionalPortrait = buildEmotionalPortrait(domainScores);

  const quizResult = await prisma.quizResult.create({
    data: {
      domainScores: domainScores as unknown as object,
      primaryFocusArea: primary,
      secondaryFocusArea: secondary,
      nervousSystemState,
      emotionalPortrait,
      age: demographics?.age,
      gender: demographics?.gender,
      maritalStatus: demographics?.maritalStatus,
    },
  });

  return NextResponse.json({ quizResultId: quizResult.id });
}
