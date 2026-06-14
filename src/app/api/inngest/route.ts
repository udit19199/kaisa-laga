import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions/process-submission";
import { tasteFunctions } from "@/inngest/functions/taste-pipeline";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...functions, ...tasteFunctions],
});
