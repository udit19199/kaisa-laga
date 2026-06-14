import { NextRequest, NextResponse } from "next/server";
import { createSignedAudioUrl } from "@/lib/storage";
import { requireOrgContext } from "@/server/auth/context";
import { getSubmissionForOrganization } from "@/server/submissions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const submission = await getSubmissionForOrganization(auth.ctx.organization.id, id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  try {
    const url = await createSignedAudioUrl(submission.audio_storage_path, 3600);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Could not load audio" }, { status: 500 });
  }
}
