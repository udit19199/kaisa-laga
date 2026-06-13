import { inngest } from "@/inngest/client";
import { createGeminiProvider } from "@/lib/ai/providers/gemini";
import { createSarvamProvider } from "@/lib/ai/providers/sarvam";
import { evaluateAlert, buildAlertPayload } from "@/lib/alert-engine";
import { FIXABLE_KEYWORDS } from "@/lib/constants";
import { createResendClient, sendAlertEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

export const processSubmission = inngest.createFunction(
  {
    id: "process-submission",
    retries: 3,
    triggers: [{ event: "submission/process" }],
  },
  async ({ event, step }) => {
    const { submissionId } = event.data;
    const supabase = createAdminClient();
    const sttProvider = createSarvamProvider();
    const extractionProvider = createGeminiProvider();

    const [submission, attemptNumber] = await Promise.all([
      step.run("fetch-submission", async () => {
        const { data, error } = await supabase
          .from("submissions")
          .select(
            "*, locations(id, name, organization_id, organizations(default_alert_email, alert_email, name))",
          )
          .eq("id", submissionId)
          .single();

        if (error || !data) throw new Error(`Submission not found: ${submissionId}`);
        return data;
      }),
      step.run("create-processing-attempt", async () => {
        const { data: latestAttempt } = await supabase
          .from("submission_processing_attempts")
          .select("attempt_number")
          .eq("submission_id", submissionId)
          .order("attempt_number", { ascending: false })
          .limit(1);

        const nextAttemptNumber = ((latestAttempt?.[0]?.attempt_number as number | undefined) ?? 0) + 1;

        const { data, error } = await supabase
          .from("submission_processing_attempts")
          .insert({
            submission_id: submissionId,
            attempt_number: nextAttemptNumber,
            stage: "download",
            provider: "sarvam+gemini",
            model: null,
            status: "processing",
            started_at: new Date().toISOString(),
          })
          .select("attempt_number")
          .single();

        if (error || !data) {
          throw new Error(`Failed to create processing attempt: ${error?.message ?? "unknown"}`);
        }

        return data.attempt_number as number;
      }),
    ]);

    await step.run("mark-processing", async () => {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "processing",
          processing_started_at: new Date().toISOString(),
          latest_error: null,
          error_message: null,
        })
        .eq("id", submissionId);

      if (error) {
        throw new Error(`Failed to mark submission processing: ${error.message}`);
      }
    });

    const audioBase64 = await step.run("download-audio", async () => {
      const { data, error } = await supabase.storage
        .from("submissions-audio")
        .download(submission.audio_storage_path);

      if (error || !data) throw new Error(`Audio download failed: ${error?.message}`);
      const buffer = Buffer.from(await data.arrayBuffer());
      return buffer.toString("base64");
    });

    const transcription = await step.run("transcribe-audio", async () => {
      const buffer = Buffer.from(audioBase64, "base64");
      return sttProvider.transcribeAudio(buffer, `${submissionId}.webm`);
    });

    const location = submission.locations as {
      id: string;
      name: string;
      organization_id: string;
      organizations: {
        default_alert_email: string | null;
        alert_email: string | null;
        name: string;
      };
    };

    const alertEmail =
      location.organizations.default_alert_email ?? location.organizations.alert_email;
    const englishTranscript = transcription.englishText?.trim() ?? transcription.text.trim();
    const translatedTranscript = englishTranscript;

    const categorization = await step.run("categorize", async () => {
      return extractionProvider.categorizeFeedback(translatedTranscript);
    });

    await step.run("update-submission", async () => {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "processed",
          original_transcript: transcription.text,
          transcript: transcription.text,
          translated_transcript: translatedTranscript,
          english_transcript: englishTranscript,
          summary: categorization.summary,
          sentiment: categorization.sentiment,
          detected_language: transcription.language,
          processed_at: new Date().toISOString(),
          latest_error: null,
          error_message: null,
        })
        .eq("id", submissionId);

      if (error) throw new Error(`Failed to update submission: ${error.message}`);
    });

    await step.run("sync-tags", async () => {
      const { error: deleteError } = await supabase
        .from("submission_tags")
        .delete()
        .eq("submission_id", submissionId);

      if (deleteError) {
        throw new Error(`Failed to clear submission tags: ${deleteError.message}`);
      }

      if (categorization.tags.length > 0) {
        const { error: insertError } = await supabase.from("submission_tags").insert(
          categorization.tags.map((tag) => ({
            submission_id: submissionId,
            tag,
          })),
        );

        if (insertError) {
          throw new Error(`Failed to sync submission tags: ${insertError.message}`);
        }
      }
    });

    const alertEval = evaluateAlert(
      categorization.sentiment,
      englishTranscript,
      FIXABLE_KEYWORDS,
    );

    if (alertEval.shouldAlert && alertEmail) {
      await step.run("send-alert", async () => {
        const resend = createResendClient();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const payload = buildAlertPayload({
          locationName: location.name,
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
      if (submission.audio_retention_consent) {
        return;
      }

      const { error } = await supabase.storage
        .from("submissions-audio")
        .remove([submission.audio_storage_path]);

      if (error) {
        console.warn(`Failed to delete audio for ${submissionId}: ${error.message}`);
        return;
      }

      await supabase
        .from("submissions")
        .update({
          audio_deleted_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
    });

    await step.run("complete-processing-attempt", async () => {
      const { error } = await supabase
        .from("submission_processing_attempts")
        .update({
          stage: "complete",
          status: "processed",
          finished_at: new Date().toISOString(),
        })
        .eq("submission_id", submissionId)
        .eq("attempt_number", attemptNumber);

      if (error) {
        throw new Error(`Failed to complete processing attempt: ${error.message}`);
      }
    });

    return { submissionId, sentiment: categorization.sentiment, alertSent: alertEval.shouldAlert };
  },
);

export const markSubmissionFailed = inngest.createFunction(
  {
    id: "mark-submission-failed",
    triggers: [{ event: "inngest/function.failed" }],
  },
  async ({ event }) => {
    const originalEvent = event.data.event as { name?: string; data?: { submissionId?: string } };
    if (originalEvent?.name !== "submission/process") return;

    const submissionId = originalEvent.data?.submissionId;
    if (!submissionId) return;

    const supabase = createAdminClient();

    const { data: submission } = await supabase
      .from("submissions")
      .select("audio_storage_path, audio_retention_consent, audio_deleted_at")
      .eq("id", submissionId)
      .maybeSingle();

    const { data: latestAttempts } = await supabase
      .from("submission_processing_attempts")
      .select("id, attempt_number")
      .eq("submission_id", submissionId)
      .order("attempt_number", { ascending: false })
      .limit(1);

    const latestAttempt = latestAttempts?.[0];
    const latestAttemptNumber = ((latestAttempt?.attempt_number as number | undefined) ?? 0);

    if (latestAttempt?.id) {
      await supabase
        .from("submission_processing_attempts")
        .update({
          stage: "failed",
          status: "failed",
          error_message: "Processing failed after retries",
          finished_at: new Date().toISOString(),
        })
        .eq("id", latestAttempt.id);
    }

    const canAutoRetry =
      latestAttemptNumber < 2 &&
      Boolean(submission?.audio_storage_path) &&
      Boolean(submission?.audio_retention_consent) &&
      !submission?.audio_deleted_at;

    if (canAutoRetry) {
      const { error: retryError } = await supabase.rpc("retry_submission_dispatch", {
        p_submission_id: submissionId,
      });

      if (!retryError) {
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

    if (submission?.audio_storage_path && !submission?.audio_retention_consent) {
      await supabase.storage.from("submissions-audio").remove([submission.audio_storage_path]);
      await supabase
        .from("submissions")
        .update({
          audio_deleted_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
    }

    await supabase
      .from("submissions")
      .update({
        status: "failed",
        latest_error: "Processing failed after retries",
        error_message: "Processing failed after retries",
      })
      .eq("id", submissionId);

  },
);

type SubmissionDispatchOutboxRow = {
  id: string;
  submission_id: string;
  event_type: string;
};

export const processSubmissionOutbox = inngest.createFunction(
  {
    id: "process-submission-outbox",
    triggers: [{ event: "submission/outbox.reconcile" }],
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    const claimedRows = await step.run("claim-submission-outbox", async () => {
      const { data, error } = await supabase.rpc("claim_submission_dispatch_outbox", {
        p_limit: 20,
      });

      if (error) {
        throw new Error(`Failed to claim submission outbox items: ${error.message}`);
      }

      return (data ?? []) as SubmissionDispatchOutboxRow[];
    });

    for (const row of claimedRows) {
      await step.run(`dispatch-submission-outbox-${row.id}`, async () => {
        if (row.event_type !== "submission/process") {
          const { error: unsupportedError } = await supabase
            .from("submission_dispatch_outbox")
            .update({
              status: "failed",
              last_error: `Unsupported outbox event type: ${row.event_type}`,
            })
            .eq("id", row.id);

          if (unsupportedError) {
            throw new Error(`Failed to update outbox row: ${unsupportedError.message}`);
          }

          return;
        }

        try {
          await inngest.send({
            name: "submission/process",
            data: { submissionId: row.submission_id },
          });

          const { error: dispatchedError } = await supabase
            .from("submission_dispatch_outbox")
            .update({
              status: "dispatched",
              dispatched_at: new Date().toISOString(),
              last_error: null,
            })
            .eq("id", row.id);

          if (dispatchedError) {
            console.warn(`Failed to mark outbox row dispatched: ${dispatchedError.message}`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to dispatch submission";
          const { error: failedError } = await supabase
            .from("submission_dispatch_outbox")
            .update({
              status: "failed",
              last_error: message,
            })
            .eq("id", row.id);

          if (failedError) {
            throw new Error(`Failed to mark outbox row failed: ${failedError.message}`);
          }
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

export const functions = [processSubmission, markSubmissionFailed, processSubmissionOutbox];
