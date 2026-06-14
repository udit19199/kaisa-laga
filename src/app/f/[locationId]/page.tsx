import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { detectLocale } from "@/lib/i18n/capture";
import { CapturePage } from "@/components/capture/capture-page";
import { getActiveLocationById } from "@/server/locations";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locationId: string }>;
}

export default async function FeedbackPage({ params }: PageProps) {
  const [{ locationId }, headersList] = await Promise.all([params, headers()]);
  const locale = detectLocale(headersList.get("accept-language"));

  const location = await getActiveLocationById(locationId).catch(() => null);
  if (!location) {
    notFound();
  }

  return (
    <CapturePage
      captureToken={location.publicCaptureToken}
      locationName={location.name}
      locale={locale}
    />
  );
}
