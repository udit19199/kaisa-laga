import { inngest } from "@/inngest/client";
import { createGeminiProvider } from "@/lib/ai/providers/gemini";
import { createSarvamProvider } from "@/lib/ai/providers/sarvam";
import { evaluateAlert, buildAlertPayload } from "@/lib/alert-engine";
import { getAppUrl } from "@/lib/app-url";
import { FIXABLE_KEYWORDS } from "@/lib/constants";
import { createResendClient, sendAlertEmail } from "@/lib/email";
import { deleteAudio, downloadAudio } from "@/lib/storage";
import {
  claimSubmissionDispatchOutbox,
  completeProcessingAttempt,
  createProcessingAttempt,
  failProcessingAttempt,
  getLatestProcessingAttempt,
  getLatestProcessingAttemptNumber,
  markOutboxDispatched,
  markOutboxFailed,
  markOutboxUnsupported,
  replaceSubmissionTags,
  retrySubmissionDispatch,
} from "@/server/processing";
import {
  getSubmissionAudioState,
  getSubmissionForProcessing,
  markSubmissionAudioDeleted,
  markSubmissionFailed,
  markSubmissionProcessing,
  updateSubmissionAfterProcessing,
} from "@/server/submissions";
import { scheduleSubmissionPublish } from "@/server/taste";

const processSubmission = inngest.createFunction(
  {
    id: "process-submission",
    retries: 3,
    triggers: [{ event: "submission/process" }],
  },
  async ({ event, step }) => {
    const { submissionId } = event.data;
    const sttProvider = createSarvamProvider();
    const extractionProvider = createGeminiProvider();

    const [context, attemptNumber] = await Promise.all([
      step.run("fetch-submission", async () => {
        const result = await getSubmissionForProcessing(submissionId);
        if (!result) {
          throw new Error(`Submission not found: ${submissionId}`);
        }
        return result;
      }),
      step.run("create-processing-attempt", async () => {
        const latest = await getLatestProcessingAttemptNumber(submissionId);
        return createProcessingAttempt(submissionId, latest + 1);
      }),
    ]);

    await step.run("mark-processing", async () => {
      await markSubmissionProcessing(submissionId);
    });

    const audioBase64 = await step.run("download-audio", async () => {
      const buffer = await downloadAudio(context.submission.audioStoragePath);
      return buffer.toString("base64");
    });

    const transcription = await step.run("transcribe-audio", async () => {
      const buffer = Buffer.from(audioBase64, "base64");
      return sttProvider.transcribeAudio(buffer, `${submissionId}.webm`);
    });

    const alertEmail =
      context.location.organizations.default_alert_email ??
      context.location.organizations.alert_email;
    const englishTranscript = transcription.englishText?.trim() ?? transcription.text.trim();
    const translatedTranscript = englishTranscript;

    const categorization = await step.run("categorize", async () => {
      return extractionProvider.categorizeFeedback(translatedTranscript);
    });

    await step.run("update-submission", async () => {
      await updateSubmissionAfterProcessing(submissionId, {
        originalTranscript: transcription.text,
        transcript: transcription.text,
        translatedTranscript,
        englishTranscript,
        summary: categorization.summary,
        sentiment: categorization.sentiment,
        detectedLanguage: transcription.language,
      });
    });

    await step.run("sync-tags", async () => {
      await replaceSubmissionTags(submissionId, categorization.tags);
    });

    const alertEval = evaluateAlert(
      categorization.sentiment,
      englishTranscript,
      FIXABLE_KEYWORDS,
    );

    if (alertEval.shouldAlert && alertEmail) {
      await step.run("send-alert", async () => {
        const resend = createResendClient();
        const appUrl = getAppUrl();
        const payload = buildAlertPayload({
          locationName: context.location.name,
          transcript: englishTranscript,
          tags: categorization.tags,
          timestamp: new Date().toISOString(),
          submissionId,
          appUrl,
        });

        await sendAlertEmail(resend, alertEmail, payload);
      });
    }

    await step.run("delete-audio-after-success", async () => {
      if (context.submission.audioRetentionConsent) {
        return;
      }

      try {
        await deleteAudio([context.submission.audioStoragePath]);
        await markSubmissionAudioDeleted(submissionId);
      } catch (error) {
        console.warn(
          `Failed to delete audio for ${submissionId}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    });

    await step.run("complete-processing-attempt", async () => {
      await completeProcessingAttempt(submissionId, attemptNumber);
    });

    await step.run("schedule-publish-window", async () => {
      const raw = process.env.PUBLISH_PREVIEW_DAYS;
      const previewDays =
        raw === undefined || raw === ""
          ? 7
          : Math.max(0, Number.parseInt(raw, 10) || 7);

      await scheduleSubmissionPublish(submissionId, context.location.id);

      if (previewDays > 0) {
        await inngest.send({
          name: "submission/publish.schedule",
          data: { submissionId, previewDays },
        });
      }
    });

    return { submissionId, sentiment: categorization.sentiment, alertSent: alertEval.shouldAlert };
  },
);

const markSubmissionFailedOnRetry = inngest.createFunction(
  {
    id: "mark-submission-failed",
    triggers: [{ event: "inngest/function.failed" }],
  },
  async ({ event, step }) => {
    const originalEvent = event.data.event as { name?: string; data?: { submissionId?: string } };
    if (originalEvent?.name !== "submission/process") return;

    const submissionId = originalEvent.data?.submissionId;
    if (!submissionId) return;

    await step.run("handle-failure", async () => {
      const [submission, latestAttempt] = await Promise.all([
        getSubmissionAudioState(submissionId),
        getLatestProcessingAttempt(submissionId),
      ]);

      if (latestAttempt) {
        await failProcessingAttempt(
          submissionId,
          latestAttempt.attemptNumber,
          "Processing failed after retries",
        );
      }

      const canAutoRetry =
        (latestAttempt?.attemptNumber ?? 0) < 2 &&
        Boolean(submission?.audioStoragePath) &&
        Boolean(submission?.audioRetentionConsent) &&
        !submission?.audioDeletedAt;

      if (canAutoRetry) {
        const retryResult = await retrySubmissionDispatch(submissionId);
        if (retryResult) {
          try {
            await inngest.send({
              name: "submission/outbox.reconcile",
              data: { submissionId },
            });
          } catch {
            // The durable outbox will be picked up on the next pass.
          }
          return;
        }
      }

      if (submission?.audioStoragePath && !submission.audioRetentionConsent) {
        await deleteAudio([submission.audioStoragePath]).catch(() => undefined);
        await markSubmissionAudioDeleted(submissionId);
      }

      await markSubmissionFailed(submissionId, "Processing failed after retries");
    });
  },
);

const processSubmissionOutbox = inngest.createFunction(
  {
    id: "process-submission-outbox",
    triggers: [{ event: "submission/outbox.reconcile" }],
  },
  async ({ step }) => {
    const claimedRows = await step.run("claim-submission-outbox", async () => {
      return claimSubmissionDispatchOutbox(20);
    });

    for (const row of claimedRows) {
      await step.run(`dispatch-submission-outbox-${row.id}`, async () => {
        if (row.event_type !== "submission/process") {
          await markOutboxUnsupported(row.id, row.event_type);
          return;
        }

        try {
          await inngest.send({
            name: "submission/process",
            data: { submissionId: row.submission_id },
          });
          await markOutboxDispatched(row.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to dispatch submission";
          await markOutboxFailed(row.id, message);
        }
      });
    }

    if (claimedRows.length === 20) {
      await step.run("schedule-next-outbox-drain", async () => {
        await inngest.send({
          name: "submission/outbox.reconcile",
          data: {},
        });
      });
    }

    return { claimed: claimedRows.length };
  },
);

export const functions = [
  processSubmission,
  markSubmissionFailedOnRetry,
  processSubmissionOutbox,
];
