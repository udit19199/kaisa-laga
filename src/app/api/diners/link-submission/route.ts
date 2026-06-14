import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireDinerContext } from "@/server/auth/diner-context";
import { linkSubmissionToDiner } from "@/server/taste";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const auth = await requireDinerContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission id" }, { status: 400 });
  }

  const result = await linkSubmissionToDiner(auth.diner.id, parsed.data.submissionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
