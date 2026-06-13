import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "kaisa-laga",
  isDev: process.env.NODE_ENV === "development",
});

export type SubmissionProcessEvent = {
  name: "submission/process";
  data: {
    submissionId: string;
  };
};

export type SubmissionOutboxReconcileEvent = {
  name: "submission/outbox.reconcile";
  data: {
    submissionId?: string;
  };
};

export type AlertSendEvent = {
  name: "alert/send";
  data: {
    submissionId: string;
    alertEmail: string;
    locationName: string;
    transcript: string;
    tags: string[];
    timestamp: string;
  };
};
