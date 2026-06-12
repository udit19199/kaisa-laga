import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectLocale } from "@/lib/i18n/capture";
import { CapturePage } from "@/components/capture/capture-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locationId: string }>;
}

export default async function FeedbackPage({ params }: PageProps) {
  const [{ locationId }, headersList] = await Promise.all([
    params,
    headers(),
  ]);
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage);

  let locationName = "";
  let captureToken = "";
  let data = null;
  try {
    const supabase = createAdminClient();
    const res = await supabase
      .from("locations")
      .select("name, public_capture_token, is_active")
      .eq("id", locationId)
      .eq("is_active", true)
      .single();
    data = res.data;
  } catch {
    // Database query failed (e.g. invalid UUID, database down)
  }

  if (!data) {
    notFound();
  }

  locationName = data.name;
  captureToken = data.public_capture_token;

  return (
    <CapturePage captureToken={captureToken} locationName={locationName} locale={locale} />
  );
}
