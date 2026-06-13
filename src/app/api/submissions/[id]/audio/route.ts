import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/lib/clerk-org";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { id } = await params;

  const { data: submission, error } = await ctx.admin
    .from("submissions")
    .select("audio_storage_path, organization_id")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: signed, error: signError } = await ctx.admin.storage
    .from("submissions-audio")
    .createSignedUrl(submission.audio_storage_path, 3600);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not load audio" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
