import { NextResponse } from "next/server";
import { requireDinerContext } from "@/server/auth/diner-context";
import { getMatchesForDiner } from "@/server/taste";

export async function GET() {
  const auth = await requireDinerContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const needsOnboarding = !auth.diner.onboardingCompletedAt;
  const matches = needsOnboarding ? [] : await getMatchesForDiner(auth.diner);

  return NextResponse.json({
    matches,
    needsOnboarding,
    linkedReviewCount: auth.diner.linkedReviewCount,
  });
}
