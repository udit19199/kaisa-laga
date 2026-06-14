import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { audioExists } from "@/lib/storage";
import { requireOrgContext } from "@/server/auth/context";
import { retrySubmissionDispatch } from "@/server/processing";
import { getSubmissionForOrganization } from "@/server/submissions";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.ctx.permissions.canManageOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submission = await getSubmissionForOrganization(auth.ctx.organization.id, id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const retryableStatuses = new Set(["failed", "terminal_failed", "processing", "accepted"]);
  if (!retryableStatuses.has(submission.status)) {
    return NextResponse.json(
      { error: "Submission cannot be retried in its current state" },
      { status: 409 },
    );
  }

  if (!submission.audio_retention_consent || submission.audio_deleted_at) {
    return NextResponse.json({ error: "Audio is not available for retry" }, { status: 409 });
  }

  const hasAudio = await audioExists(submission.audio_storage_path);
  if (!hasAudio) {
    return NextResponse.json({ error: "Audio is not available for retry" }, { status: 409 });
  }

  const result = await retrySubmissionDispatch(id);
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
