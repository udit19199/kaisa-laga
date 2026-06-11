const RECORDING_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/mp4;codecs=mp4a",
  "audio/aac",
  "video/mp4",
  "audio/ogg",
] as const;

export function getSupportedRecordingMimeType(): string {
  if (typeof MediaRecorder !== "undefined") {
    for (const type of RECORDING_MIME_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  return "audio/webm";
}

/** Supabase Storage matches exact MIME strings; strip codec params (e.g. `;codecs=opus`). */
export function normalizeStorageContentType(contentType: string): string {
  return contentType.split(";")[0]?.trim().toLowerCase() || "audio/webm";
}

export function extensionForAudioMimeType(contentType: string): string {
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("mp4") || contentType.includes("aac") || contentType.includes("m4a")) {
    return "mp4";
  }

  return "webm";
}
