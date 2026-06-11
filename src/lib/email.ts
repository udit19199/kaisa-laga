import { Resend } from "resend";
import type { AlertPayload } from "./types";

export function createResendClient(apiKey?: string) {
  return new Resend(apiKey ?? process.env.RESEND_API_KEY);
}

export async function sendAlertEmail(
  resend: Resend,
  to: string,
  payload: AlertPayload,
): Promise<{ id: string }> {
  const from = process.env.RESEND_FROM_EMAIL ?? "alerts@pulsedrop.app";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `⚠️ Negative feedback at ${payload.locationName}`,
    html: `
      <h2>Negative Feedback Alert</h2>
      <p><strong>Location:</strong> ${payload.locationName}</p>
      <p><strong>Time:</strong> ${new Date(payload.timestamp).toLocaleString()}</p>
      <p><strong>Tags:</strong> ${payload.tags.join(", ")}</p>
      <p><strong>Transcript:</strong></p>
      <blockquote>${payload.transcript}</blockquote>
      <p><a href="${payload.dashboardUrl}">View in dashboard</a></p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send alert email: ${error.message}`);
  }

  return { id: data?.id ?? "unknown" };
}
