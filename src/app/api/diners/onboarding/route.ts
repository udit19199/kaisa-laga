import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ALLERGY_OPTIONS,
  BUDGET_BANDS,
  DIETARY_OPTIONS,
  SPICE_LEVELS,
} from "@/lib/taste/types";
import { requireDinerContext } from "@/server/auth/diner-context";
import { updateDinerOnboarding } from "@/server/taste";

const onboardingSchema = z.object({
  dietary: z.enum(DIETARY_OPTIONS).nullable(),
  allergies: z.array(z.enum(ALLERGY_OPTIONS)),
  spiceLevel: z.enum(SPICE_LEVELS).nullable(),
  budgetBand: z.enum(BUDGET_BANDS).nullable(),
  otherAllergies: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireDinerContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid taste profile" }, { status: 400 });
  }

  const diner = await updateDinerOnboarding(auth.diner.id, parsed.data);
  if (!diner) {
    return NextResponse.json({ error: "Failed to save taste profile" }, { status: 500 });
  }

  return NextResponse.json({ diner });
}
