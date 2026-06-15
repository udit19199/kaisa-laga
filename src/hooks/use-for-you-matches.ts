"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { VenueMatch } from "@/lib/taste/types";

type ForYouMatchesState = {
  matches: VenueMatch[];
  needsOnboarding: boolean;
  loading: boolean;
};

const idleState: ForYouMatchesState = {
  matches: [],
  needsOnboarding: false,
  loading: false,
};

export function useForYouMatches() {
  const { isSignedIn, isLoaded } = useAuth();
  const [state, setState] = useState<ForYouMatchesState>(() => ({
    ...idleState,
    loading: isLoaded && isSignedIn,
  }));

  const [prevAuth, setPrevAuth] = useState({ isLoaded, isSignedIn });

  if (isLoaded !== prevAuth.isLoaded || isSignedIn !== prevAuth.isSignedIn) {
    setPrevAuth({ isLoaded, isSignedIn });
    setState({
      ...idleState,
      loading: isLoaded && isSignedIn,
    });
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/matches/for-you");
        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setState(idleState);
          return;
        }

        const data = (await response.json()) as {
          matches?: VenueMatch[];
          needsOnboarding?: boolean;
        };

        setState({
          matches: data.matches ?? [],
          needsOnboarding: Boolean(data.needsOnboarding),
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setState({ ...idleState, loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return {
    ...state,
    isSignedIn,
    isLoaded,
  };
}
