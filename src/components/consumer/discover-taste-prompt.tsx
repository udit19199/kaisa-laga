"use client";

import Link from "next/link";
import type { useForYouMatches } from "@/hooks/use-for-you-matches";
import {
  DINER_SIGN_IN_PATH,
  TASTE_ONBOARDING_PATH,
} from "@/lib/auth-routes";

type DiscoverTastePromptProps = Pick<
  ReturnType<typeof useForYouMatches>,
  "isSignedIn" | "isLoaded" | "loading" | "needsOnboarding"
>;

export function DiscoverTastePrompt({
  isSignedIn,
  isLoaded,
  loading,
  needsOnboarding,
}: DiscoverTastePromptProps) {
  if (!isLoaded || loading) {
    return null;
  }

  if (isSignedIn && !needsOnboarding) {
    return null;
  }

  const href = isSignedIn ? TASTE_ONBOARDING_PATH : DINER_SIGN_IN_PATH;

  return (
    <p id="for-you" className="m-0 mt-3 text-center lg:mt-3.5">
      <Link
        href={href}
        className="text-sm font-medium text-marketing-ink underline decoration-marketing-line underline-offset-[5px] transition-colors hover:text-marketing-accent hover:decoration-marketing-accent/40"
      >
        Set up taste profile
      </Link>
    </p>
  );
}
