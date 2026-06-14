/** Canonical production origin when env and request hints are unavailable. */
export const CANONICAL_APP_URL = "https://kaisa-laga.vercel.app";

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * Resolves the public app origin for QR codes, emails, and sitemap entries.
 *
 * Priority: NEXT_PUBLIC_APP_URL → VERCEL_URL → request host → production default → localhost.
 */
export function getAppUrl(headersList?: Headers): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return normalizeOrigin(configured);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return vercelUrl.startsWith("http")
      ? normalizeOrigin(vercelUrl)
      : `https://${normalizeOrigin(vercelUrl)}`;
  }

  if (headersList) {
    const host =
      headersList.get("x-forwarded-host") ?? headersList.get("host");
    if (host) {
      const hostname = host.split(",")[0]?.trim();
      if (hostname) {
        const protocol =
          headersList.get("x-forwarded-proto") ??
          (hostname.includes("localhost") ? "http" : "https");
        return `${protocol}://${hostname}`;
      }
    }
  }

  if (process.env.NODE_ENV === "production") {
    return CANONICAL_APP_URL;
  }

  return "http://localhost:3000";
}

export function buildCaptureUrl(locationId: string, appUrl = getAppUrl()): string {
  return `${normalizeOrigin(appUrl)}/f/${locationId}`;
}
