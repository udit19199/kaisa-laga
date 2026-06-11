import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAIProvider } from "@/lib/ai";
import { createResendClient, sendAlertEmail } from "@/lib/email";
import { evaluateAlert, buildAlertPayload } from "@/lib/alert-engine";
import { FIXABLE_KEYWORDS } from "@/lib/constants";

export const processSubmission = inngest.createFunction(
  {
    id: "process-submission",
    retries: 3,
    triggers: [{ event: "submission/process" }],
  },
  async ({ event, step }) => {
    const { submissionId } = event.data;
    const supabase = createAdminClient();
    const ai = createAIProvider();

    const submission = await step.run("fetch-submission", async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*, locations(id, name, org_id, organizations(primary_language, alert_email, name))")
        .eq("id", submissionId)
        .single();

      if (error || !data) throw new Error(`Submission not found: ${submissionId}`);
      return data;
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
      return ai.transcribeAudio(buffer, `${submissionId}.webm`);
    });

    const location = submission.locations as {
      id: string;
      name: string;
      org_id: string;
      organizations: {
        primary_language: string;
        alert_email: string | null;
        name: string;
      };
    };

    const orgLanguage = location.organizations.primary_language ?? "en";
    let translatedTranscript = transcription.text;

    if (transcription.language !== orgLanguage) {
      translatedTranscript = await step.run("translate", async () => {
        return ai.translateText(transcription.text, orgLanguage);
      });
    }

    const categorization = await step.run("categorize", async () => {
      return ai.categorizeFeedback(translatedTranscript);
    });

    await step.run("update-submission", async () => {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "processed",
          transcript: transcription.text,
          translated_transcript: translatedTranscript,
          summary: categorization.summary,
          sentiment: categorization.sentiment,
          tags: categorization.tags,
          detected_language: transcription.language,
          processed_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw new Error(`Failed to update submission: ${error.message}`);
    });

    const alertEval = evaluateAlert(
      categorization.sentiment,
      translatedTranscript,
      FIXABLE_KEYWORDS,
    );

    if (alertEval.shouldAlert && location.organizations.alert_email) {
      await step.run("send-alert", async () => {
        const resend = createResendClient();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const payload = buildAlertPayload({
          locationName: location.name,
          transcript: translatedTranscript,
          tags: categorization.tags,
          timestamp: new Date().toISOString(),
          submissionId,
          appUrl,
        });

        await sendAlertEmail(resend, location.organizations.alert_email!, payload);
      });
    }

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
    await supabase
      .from("submissions")
      .update({
        status: "failed",
        error_message: "Processing failed after retries",
      })
      .eq("id", submissionId);
  },
);

export const functions = [processSubmission, markSubmissionFailed];
