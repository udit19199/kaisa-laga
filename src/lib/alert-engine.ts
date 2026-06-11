import type { AlertEvaluation, AlertPayload } from "./types";
import type { Sentiment, Tag } from "./constants";

export function evaluateAlert(
  sentiment: Sentiment,
  transcript: string,
  keywords: readonly string[],
): AlertEvaluation {
  if (sentiment !== "Negative") {
    return { shouldAlert: false, matchedKeywords: [] };
  }

  const lowerTranscript = transcript.toLowerCase();
  const matchedKeywords = keywords.filter((keyword) =>
    lowerTranscript.includes(keyword.toLowerCase()),
  );

  return {
    shouldAlert: matchedKeywords.length > 0,
    matchedKeywords,
  };
}

export function buildAlertPayload(params: {
  locationName: string;
  transcript: string;
  tags: Tag[];
  timestamp: string;
  submissionId: string;
  appUrl: string;
}): AlertPayload {
  return {
    locationName: params.locationName,
    transcript: params.transcript,
    tags: params.tags,
    timestamp: params.timestamp,
    dashboardUrl: `${params.appUrl}/dashboard?submission=${params.submissionId}`,
  };
}
