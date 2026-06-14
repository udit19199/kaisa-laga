import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { acceptPublicSubmission } from "@/db/rpc";
import { extensionForAudioMimeType, normalizeStorageContentType } from "@/lib/audio";
import { MAX_AUDIO_SIZE_BYTES } from "@/lib/constants";
import { deleteAudio, uploadAudio } from "@/lib/storage";
import { requireOrgContext } from "@/server/auth/context";
import {
  getActiveLocationByCaptureToken,
  getActiveLocationById,
} from "@/server/locations";
import { listSubmissionsForOrganization } from "@/server/submissions";
import { buildSubmissionInsights } from "@/lib/submission-insights";

export async function GET(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const result = await listSubmissionsForOrganization({
    organizationId: auth.ctx.organization.id,
    locationId,
    page,
    pageSize,
  });

  return NextResponse.json({
    ...result,
    items: result.items.map((submission) => ({
      ...submission,
      insights: buildSubmissionInsights(submission),
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const captureTokenField = formData.get("captureToken") as string | null;
    const locationIdField = formData.get("locationId") as string | null;
    const retentionConsentField = formData.get("retentionConsent");
    const audio = formData.get("audio") as File | null;
    const idempotencyKey =
      request.headers.get("Idempotency-Key") ??
      request.headers.get("x-idempotency-key") ??
      (formData.get("idempotencyKey") as string | null);

    if (!audio) {
      return NextResponse.json(
        { error: "captureToken or locationId and audio are required" },
        { status: 400 },
      );
    }

    if (!idempotencyKey) {
      return NextResponse.json({ error: "Idempotency-Key is required" }, { status: 400 });
    }

    if (retentionConsentField === null) {
      return NextResponse.json({ error: "retentionConsent is required" }, { status: 400 });
    }

    if (audio.size > MAX_AUDIO_SIZE_BYTES) {
      return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
    }

    let captureToken = captureTokenField;
    const retentionConsent =
      retentionConsentField === "true" || retentionConsentField === "1";

    if (!captureToken) {
      if (!locationIdField) {
        return NextResponse.json(
          { error: "captureToken or locationId is required" },
          { status: 400 },
        );
      }

      const locationLookup = await getActiveLocationById(locationIdField);
      if (!locationLookup) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }

      captureToken = locationLookup.publicCaptureToken;
    }

    const location = await getActiveLocationByCaptureToken(captureToken);
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const submissionId = randomUUID();
    const contentType = normalizeStorageContentType(audio.type || "audio/webm");
    const extension = extensionForAudioMimeType(contentType);
    const storagePath = `${location.id}/${submissionId}.${extension}`;
    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    try {
      await uploadAudio(storagePath, audioBuffer, contentType);
    } catch (error) {
      console.error("Audio upload failed:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Upload failed" },
        { status: 500 },
      );
    }

    let result;
    try {
      result = await acceptPublicSubmission({
        captureToken,
        submissionId,
        idempotencyKey,
        audioStoragePath: storagePath,
        audioMimeType: contentType,
        retentionConsent,
      });
    } catch (error) {
      await deleteAudio([storagePath]).catch(() => undefined);
      const message = error instanceof Error ? error.message : "Failed to create submission";
      const status = message.toLowerCase().includes("cap reached") ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }

    if (!result) {
      await deleteAudio([storagePath]).catch(() => undefined);
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    try {
      await inngest.send({
        name: "submission/outbox.reconcile",
        data: { submissionId: result.submission_id ?? submissionId },
      });
    } catch (inngestError) {
      console.error("Inngest dispatch failed:", inngestError);
    }

    return NextResponse.json(
      {
        id: result.submission_id ?? submissionId,
        status: result.status ?? "accepted",
        dispatch_status: result.dispatch_status ?? "pending",
        created_new: result.created_new ?? true,
      },
      { status: result.created_new === false ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
