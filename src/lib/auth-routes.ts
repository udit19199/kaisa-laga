/** Operator auth paths — keep in sync with Clerk env vars and Vercel settings. */
export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";
export const DINER_SIGN_IN_PATH = "/sign-in/diner";
const ONBOARDING_PATH = "/dashboard/onboarding";
export const DASHBOARD_PATH = "/dashboard";
export const CONSUMER_PROFILE_PATH = "/profile";

export const TASTE_ONBOARDING_PATH = "/taste/onboarding";

export function clerkSignInRedirectUrl(): string {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? DASHBOARD_PATH;
}

export function clerkSignUpRedirectUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? ONBOARDING_PATH
  );
}


