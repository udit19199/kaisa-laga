import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { canManageOrganization, getMembershipForUser } from "@/lib/org-access";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembershipForUser(supabase, user);
  if (!membership || !canManageOrganization(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: submission, error } = await admin
    .from("submissions")
    .select("id, organization_id, status")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .maybeSingle();

  if (error || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const retryableStatuses = new Set(["failed", "terminal_failed", "processing", "accepted"]);
  if (!retryableStatuses.has(submission.status)) {
    return NextResponse.json({ error: "Submission cannot be retried in its current state" }, { status: 409 });
  }

  const { error: updateError } = await admin
    .from("submissions")
    .update({
      status: "processing",
      latest_error: null,
      error_message: null,
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", membership.organization_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await inngest.send({
      name: "submission/process",
      data: { submissionId: id },
    });
  } catch (dispatchError) {
    await admin
      .from("submissions")
      .update({
        status: "failed",
        latest_error: "Failed to queue retry",
        error_message: "Failed to queue retry",
      })
      .eq("id", id)
      .eq("organization_id", membership.organization_id);

    return NextResponse.json(
      { error: dispatchError instanceof Error ? dispatchError.message : "Failed to queue retry" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
