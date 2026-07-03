import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  quizResultId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
  }
  const { name, email, phone, quizResultId } = parsed.data;

  const quizResult = await prisma.quizResult.findUnique({ where: { id: quizResultId } });
  if (!quizResult) {
    return NextResponse.json({ error: "Quiz result not found." }, { status: 404 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      quizResult: { connect: { id: quizResultId } },
    },
  });

  // PRD 4.2 — immediately after form submission, email an assessment summary
  // and app links. No transactional email provider is wired up yet (needs an
  // API key), so this is logged for now — swap in Resend/Postmark before launch.
  console.log(`[lead-capture] would email assessment summary to ${email} (lead ${lead.id})`);

  return NextResponse.json({ leadId: lead.id });
}
