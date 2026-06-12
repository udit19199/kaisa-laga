import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgContext } from "@/lib/clerk-org";
import { inngest } from "@/inngest/client";
import { extensionForAudioMimeType, normalizeStorageContentType } from "@/lib/audio";
import { MAX_AUDIO_SIZE_BYTES } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

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

  const { data: orgLocations } = await ctx.admin
    .from("locations")
    .select("id")
    .eq("org_id", ctx.organization.id);

  const locationIds = (orgLocations ?? []).map((l) => l.id);
  if (locationIds.length === 0) {
    return NextResponse.json({
      items: [],
      page,
      pageSize,
      total: 0,
      totalPages: 0,
    });
  }

  if (locationId && !locationIds.includes(locationId)) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  let query = ctx.admin
    .from("submissions")
    .select("*, locations(id, name)", { count: "exact" })
    .in("location_id", locationId ? [locationId] : locationIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const formData = await request.formData();
    const locationId = formData.get("locationId") as string | null;
    const audio = formData.get("audio") as File | null;

    if (!locationId || !audio) {
      return NextResponse.json(
        { error: "locationId and audio are required" },
        { status: 400 },
      );
    }

    const rateKey = `submit:${clientIp}:${locationId}`;
    const rate = checkRateLimit(rateKey, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { "Retry-After": String(rate.retryAfterSec) }
            : undefined,
        },
      );
    }

    if (audio.size > MAX_AUDIO_SIZE_BYTES) {
      return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
    }

    const supabase = createAdminClient();

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("id", locationId)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const submissionId = randomUUID();
    const contentType = normalizeStorageContentType(audio.type || "audio/webm");
    const extension = extensionForAudioMimeType(contentType);
    const storagePath = `${locationId}/${submissionId}.${extension}`;

    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("submissions-audio")
      .upload(storagePath, audioBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Audio upload failed:", uploadError.message);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      id: submissionId,
      location_id: locationId,
      status: "pending",
      audio_storage_path: storagePath,
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 },
      );
    }

    try {
      await inngest.send({
        name: "submission/process",
        data: { submissionId },
      });
    } catch (inngestError) {
      console.error("Inngest dispatch failed:", inngestError);
      return NextResponse.json(
        { error: "Submission saved but processing could not be started" },
        { status: 503 },
      );
    }

    return NextResponse.json({ id: submissionId, status: "pending" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
