import { inngest } from "@/inngest/client";
import { publishSubmission } from "@/server/taste";

export const scheduleSubmissionPublish = inngest.createFunction(
  {
    id: "schedule-submission-publish",
    triggers: [{ event: "submission/publish.schedule" }],
  },
  async ({ event, step }) => {
    const { submissionId, previewDays } = event.data as {
      submissionId: string;
      previewDays: number;
    };

    if (previewDays > 0) {
      await step.sleep(`preview-window-${submissionId}`, `${previewDays}d`);
    }

    await step.run("publish-submission", async () => {
      await publishSubmission(submissionId);
    });

    return { submissionId, published: true };
  },
);

export const refreshDinerTasteOnLink = inngest.createFunction(
  {
    id: "refresh-diner-taste",
    triggers: [{ event: "diner/taste.refresh" }],
  },
  async ({ event, step }) => {
    const { dinerId } = event.data as { dinerId: string };

    await step.run("refresh-diner-taste", async () => {
      const { refreshDinerTasteEmbedding } = await import("@/server/taste");
      await refreshDinerTasteEmbedding(dinerId);
    });

    return { dinerId };
  },
);

export const tasteFunctions = [scheduleSubmissionPublish, refreshDinerTasteOnLink];
