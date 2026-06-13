import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inngest } from "@/inngest/client";
import { extensionForAudioMimeType, normalizeStorageContentType } from "@/lib/audio";
import { MAX_AUDIO_SIZE_BYTES } from "@/lib/constants";
import { requireOrgContext } from "@/lib/clerk-org";
import { buildSubmissionInsights } from "@/lib/submission-insights";

export async function GET(request: NextRequest) {
  const ctx = await requireOrgContext();
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = ctx.admin
    .from("submissions")
    .select("*, locations(id, name)", { count: "exact" })
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((submission) => ({
    ...submission,
    insights: buildSubmissionInsights(submission),
  }));

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
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

    const supabase = createAdminClient();
    let captureToken = captureTokenField;
    let locationId = locationIdField;
    const retentionConsent =
      retentionConsentField === "true" || retentionConsentField === "1";

    if (!captureToken) {
      if (!locationId) {
        return NextResponse.json(
          { error: "captureToken or locationId is required" },
          { status: 400 },
        );
      }

      const { data: locationLookup, error: lookupError } = await supabase
        .from("locations")
        .select("id, public_capture_token, is_active")
        .eq("id", locationId)
        .eq("is_active", true)
        .single();

      if (lookupError || !locationLookup) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }

      captureToken = locationLookup.public_capture_token;
      locationId = locationLookup.id;
    }

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id, organization_id, is_active")
      .eq("public_capture_token", captureToken)
      .eq("is_active", true)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const submissionId = randomUUID();
    const contentType = normalizeStorageContentType(audio.type || "audio/webm");
    const extension = extensionForAudioMimeType(contentType);
    const storagePath = `${location.id}/${submissionId}.${extension}`;
    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("submissions-audio")
      .upload(storagePath, audioBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Audio upload failed:", uploadError.message);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    const { data, error: rpcError } = await supabase.rpc("accept_public_submission", {
      p_capture_token: captureToken,
      p_submission_id: submissionId,
      p_idempotency_key: idempotencyKey,
      p_audio_storage_path: storagePath,
      p_audio_mime_type: contentType,
      p_retention_consent: retentionConsent,
    });

    if (rpcError) {
      await supabase.storage.from("submissions-audio").remove([storagePath]);
      const message = rpcError.message ?? "Failed to create submission";
      const status = message.toLowerCase().includes("cap reached") ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }

    const result = Array.isArray(data) ? data[0] : null;
    if (!result) {
      await supabase.storage.from("submissions-audio").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 },
      );
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
