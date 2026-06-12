import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { canManageOrganization } from "@/lib/org-access";
import { requireOrgContext } from "@/lib/clerk-org";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  // Fetch membership role
  const { data: membership, error: memError } = await ctx.admin
    .from("organization_memberships")
    .select("role")
    .eq("clerk_user_id", ctx.clerkUserId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();

  if (memError || !membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: submission, error } = await ctx.admin
    .from("submissions")
    .select("id, organization_id, status")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();

  if (error || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const retryableStatuses = new Set(["failed", "terminal_failed", "processing", "accepted"]);
  if (!retryableStatuses.has(submission.status)) {
    return NextResponse.json({ error: "Submission cannot be retried in its current state" }, { status: 409 });
  }

  const { error: updateError } = await ctx.admin
    .from("submissions")
    .update({
      status: "processing",
      latest_error: null,
      error_message: null,
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await inngest.send({
      name: "submission/process",
      data: { submissionId: id },
    });
  } catch (dispatchError) {
    await ctx.admin
      .from("submissions")
      .update({
        status: "failed",
        latest_error: "Failed to queue retry",
        error_message: "Failed to queue retry",
      })
      .eq("id", id)
      .eq("organization_id", ctx.organization.id);

    return NextResponse.json(
      { error: dispatchError instanceof Error ? dispatchError.message : "Failed to queue retry" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
