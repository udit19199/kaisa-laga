import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const SSO_CALLBACK_PATH = "/sso-callback";

export function clerkErrorMessage(
  error: { message?: string; longMessage?: string } | null | undefined,
  fallback = "Something went wrong. Try again.",
): string {
  if (!error) return fallback;
  return error.longMessage ?? error.message ?? fallback;
}

export function navigateAfterAuth(
  router: AppRouterInstance,
  redirectUrl: string,
  decorateUrl: (url: string) => string,
) {
  const destination = decorateUrl(redirectUrl);
  if (destination.startsWith("http")) {
    window.location.href = destination;
    return;
  }
  router.push(destination);
  router.refresh();
}
