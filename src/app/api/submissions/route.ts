import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import { extensionForAudioMimeType, normalizeStorageContentType } from "@/lib/audio";
import { MAX_AUDIO_SIZE_BYTES } from "@/lib/constants";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("submissions")
    .select("*, locations(id, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

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
    const formData = await request.formData();
    const locationId = formData.get("locationId") as string | null;
    const audio = formData.get("audio") as File | null;

    if (!locationId || !audio) {
      return NextResponse.json(
        { error: "locationId and audio are required" },
        { status: 400 },
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
    }

    return NextResponse.json({ id: submissionId, status: "pending" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
