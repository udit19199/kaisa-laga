"use client";

import { useEffect } from "react";
import { VenueMatchCard } from "@/components/consumer/venue-match-card";
import type { useForYouMatches } from "@/hooks/use-for-you-matches";
import { cn } from "@/lib/utils";

type ForYouMatchesSectionProps = Pick<
  ReturnType<typeof useForYouMatches>,
  "isSignedIn" | "isLoaded" | "loading" | "needsOnboarding" | "matches"
>;

export function ForYouMatchesSection({
  isSignedIn,
  isLoaded,
  loading,
  needsOnboarding,
  matches,
}: ForYouMatchesSectionProps) {

  useEffect(() => {
    if (loading || !isSignedIn) {
      return;
    }

    if (window.location.hash !== "#for-you") {
      return;
    }

    if (!needsOnboarding && matches.length === 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document.getElementById("for-you")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [isSignedIn, loading, matches.length, needsOnboarding]);

  if (!isLoaded || !isSignedIn || loading || needsOnboarding) {
    return null;
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <section
      id="for-you-matches"
      aria-labelledby="for-you-heading"
      className="mb-8 lg:mb-10"
    >
      <div className="mb-5 lg:mb-6">
        <h2
          id="for-you-heading"
          className="m-0 font-marketing-display text-[26px] leading-[1.15] font-normal tracking-[-0.02em] lg:text-[30px]"
        >
          For you
        </h2>
        <p className="m-0 mt-1.5 text-sm leading-relaxed text-marketing-muted lg:mt-2 lg:text-[15px]">
          Places that fit your taste from visits and what you&apos;ve told us.
        </p>
      </div>

      <div
        className={cn(
          "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:mx-0 lg:grid lg:snap-none lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0",
          "xl:grid-cols-3",
        )}
      >
        {matches.map((match) => (
          <div
            key={match.locationId}
            className="w-[min(82vw,280px)] shrink-0 snap-start lg:w-auto"
          >
            <VenueMatchCard match={match} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
