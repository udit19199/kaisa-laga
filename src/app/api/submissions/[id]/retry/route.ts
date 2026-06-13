import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
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

  if (!ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: submission, error } = await ctx.admin
    .from("submissions")
    .select("id, organization_id, status, audio_storage_path, audio_retention_consent, audio_deleted_at")
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

  if (!submission.audio_retention_consent || submission.audio_deleted_at) {
    return NextResponse.json(
      {
        error: "Audio is not available for retry",
      },
      { status: 409 },
    );
  }

  const { error: storageError } = await ctx.admin.storage
    .from("submissions-audio")
    .download(submission.audio_storage_path);

  if (storageError) {
    return NextResponse.json(
      {
        error: "Audio is not available for retry",
      },
      { status: 409 },
    );
  }

  const { data: retryResult, error: retryError } = await ctx.admin.rpc("retry_submission_dispatch", {
    p_submission_id: id,
  });

  if (retryError) {
    return NextResponse.json({ error: retryError.message }, { status: 500 });
  }

  const result = Array.isArray(retryResult) ? retryResult[0] : retryResult;
  if (!result) {
    return NextResponse.json({ error: "Failed to queue retry" }, { status: 500 });
  }

  try {
    await inngest.send({
      name: "submission/outbox.reconcile",
      data: { submissionId: id },
    });
  } catch {
    // The outbox row is durable; this wake-up can be retried later.
  }

  return NextResponse.json({
    success: true,
    status: result.status ?? "accepted",
    dispatch_status: result.dispatch_status ?? "pending",
  });
}
