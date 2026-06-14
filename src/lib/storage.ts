import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUDIO_BUCKET = "submissions-audio";

function createStorageClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadAudio(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await createStorageClient()
    .storage.from(AUDIO_BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(error.message);
  }
}

export async function downloadAudio(path: string): Promise<Buffer> {
  const { data, error } = await createStorageClient()
    .storage.from(AUDIO_BUCKET)
    .download(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Audio download failed");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function deleteAudio(paths: string[]): Promise<void> {
  const { error } = await createStorageClient()
    .storage.from(AUDIO_BUCKET)
    .remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createSignedAudioUrl(
  path: string,
  expiresInSeconds: number,
): Promise<string> {
  const { data, error } = await createStorageClient()
    .storage.from(AUDIO_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not create signed URL");
  }

  return data.signedUrl;
}

export async function audioExists(path: string): Promise<boolean> {
  const { error } = await createStorageClient()
    .storage.from(AUDIO_BUCKET)
    .download(path);

  return !error;
}
