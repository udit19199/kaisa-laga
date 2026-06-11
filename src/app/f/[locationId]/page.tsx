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
  const { locationId } = await params;
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage);

  let locationName = "";
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("locations")
      .select("name")
      .eq("id", locationId)
      .single();

    if (!data) notFound();
    locationName = data.name;
  } catch {
    notFound();
  }

  return (
    <CapturePage
      locationId={locationId}
      locationName={locationName}
      locale={locale}
    />
  );
}
