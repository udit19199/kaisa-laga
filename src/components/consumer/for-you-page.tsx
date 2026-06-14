"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";
import { VenueMatchCard } from "@/components/consumer/venue-match-card";
import { TASTE_ONBOARDING_PATH, DINER_SIGN_IN_PATH } from "@/lib/auth-routes";
import type { VenueMatch } from "@/lib/taste/types";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

function EmptyStateCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-marketing-line bg-marketing-card p-6 lg:max-w-xl lg:p-8">
      <h2 className="m-0 font-marketing-display text-2xl font-normal lg:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-marketing-muted lg:text-base">{description}</p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-marketing-ink px-6 text-sm font-medium text-white no-underline lg:h-14 lg:px-8 lg:text-base"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export function ForYouPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [matches, setMatches] = useState<VenueMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/matches/for-you");
        if (response.status === 401) {
          setLoading(false);
          return;
        }

        const data = (await response.json()) as {
          matches?: VenueMatch[];
          needsOnboarding?: boolean;
        };

        setMatches(data.matches ?? []);
        setNeedsOnboarding(Boolean(data.needsOnboarding));
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn]);

  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader title="For you" showBrand={false} />

      <ConsumerMain className="space-y-6 pt-6 lg:space-y-8 lg:pt-8">
        <p className="m-0 max-w-2xl text-base text-marketing-muted lg:text-lg">
          Places that fit your taste — matched from reviews you&apos;ve left and what you told us.
        </p>

        {!isLoaded || loading ? (
          <p className="text-sm text-marketing-muted lg:text-base">Finding places for you…</p>
        ) : !isSignedIn ? (
          <EmptyStateCard
            title="Sign in to see your matches"
            description="Build a taste profile from your visits and we'll suggest places you'll love."
            actionHref={DINER_SIGN_IN_PATH}
            actionLabel="Sign in"
          />
        ) : needsOnboarding ? (
          <EmptyStateCard
            title="Tell us your taste first"
            description="A quick setup helps until you've linked a few reviews from real visits."
            actionHref={TASTE_ONBOARDING_PATH}
            actionLabel="Set up taste profile"
          />
        ) : matches.length > 0 ? (
          <div
            className={cn(
              "grid gap-4",
              "md:grid-cols-2",
              "xl:grid-cols-3",
            )}
          >
            {matches.map((match) => (
              <VenueMatchCard key={match.locationId} match={match} />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            title="No matches yet"
            description="Visit a place on Kaisa Laga, leave a review, and link it to your profile. Matches appear as more venues publish guest feedback."
            actionHref="/capture"
            actionLabel="Go to capture"
          />
        )}
      </ConsumerMain>
    </div>
  );
}
