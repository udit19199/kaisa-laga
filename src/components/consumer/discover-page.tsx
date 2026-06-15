"use client";

import { type FormEvent, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { DiscoverAreaPicker } from "@/components/consumer/discover-area-picker";
import { DiscoverTastePrompt } from "@/components/consumer/discover-taste-prompt";
import { ForYouMatchesSection } from "@/components/consumer/for-you-matches-section";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";
import {
  DiscoverSearchContinuation,
  DiscoverShareUtilities,
} from "@/components/marketing/discover-grow-section";
import { useDiscoverArea } from "@/hooks/use-discover-area";
import { useForYouMatches } from "@/hooks/use-for-you-matches";
import { cn } from "@/lib/utils";

export function DiscoverPage() {
  const { area, setArea, inferredFromGeo, options } = useDiscoverArea();
  const forYou = useForYouMatches();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const areaLabel = area.area ?? area.label;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader />

      <div className="discover-hero-zone">
        <ConsumerMain>
          <section
            aria-labelledby="discover-search-heading"
            className="mx-auto flex w-full max-w-xl flex-col items-center pt-5 text-center lg:pt-[clamp(2.5rem,10vh,5.5rem)]"
          >
            <h1
              id="discover-search-heading"
              className="m-0 max-w-[18ch] text-[28px] leading-[1.1] font-semibold tracking-tight text-balance lg:max-w-none lg:text-[36px]"
            >
              Hear how it was{" "}
              <span className="text-marketing-accent">before you go.</span>
            </h1>

            <div
              className={cn(
                "mt-5 w-full overflow-hidden rounded-2xl border bg-white text-left lg:mt-6",
                "transition-[border-color,box-shadow] duration-200",
                searchFocused || locationOpen
                  ? "border-marketing-accent/45 shadow-[0_0_0_4px_color-mix(in_oklch,var(--marketing-accent)_14%,transparent)]"
                  : "border-marketing-line shadow-[0_2px_16px_rgb(8_8_8/0.06)]",
              )}
            >
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex w-full items-center gap-2.5 border-b border-marketing-line/70 px-4 py-2.5 transition-colors hover:bg-marketing-card/40 lg:px-5 lg:py-3"
              >
                <MapPin
                  className="size-4 shrink-0 text-marketing-accent lg:size-[18px]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px] text-marketing-muted lg:text-xs">
                    Location
                  </span>
                  <span className="block truncate text-[15px] font-medium text-marketing-ink lg:text-base">
                    {area.label}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-marketing-muted lg:text-sm">Change</span>
              </button>

              <form className="relative" onSubmit={handleSearchSubmit}>
                <label htmlFor="discover-search" className="sr-only">
                  Search for a restaurant or cafe
                </label>
                <Search
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors duration-200 lg:left-5 lg:h-[18px] lg:w-[18px]",
                    searchFocused ? "text-marketing-accent" : "text-marketing-muted",
                  )}
                  strokeWidth={2}
                />
                <input
                  id="discover-search"
                  type="search"
                  name="q"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search a restaurant you love…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className={cn(
                    "h-11 w-full bg-transparent pr-4 pl-11",
                    "text-[15px] text-marketing-ink outline-none placeholder:text-marketing-muted",
                    "lg:h-12 lg:pl-12 lg:text-base",
                  )}
                />
              </form>

              <DiscoverSearchContinuation
                key={searchQuery}
                areaLabel={areaLabel}
                query={searchQuery}
              />
            </div>

            <DiscoverShareUtilities className="mt-5 lg:mt-6" />

            <DiscoverAreaPicker
              area={area}
              options={options}
              inferredFromGeo={inferredFromGeo}
              onSelect={setArea}
              open={locationOpen}
              onOpenChange={setLocationOpen}
              showTrigger={false}
            />

            <DiscoverTastePrompt
              isSignedIn={forYou.isSignedIn}
              isLoaded={forYou.isLoaded}
              loading={forYou.loading}
              needsOnboarding={forYou.needsOnboarding}
            />

          </section>

          <ForYouMatchesSection
            isSignedIn={forYou.isSignedIn}
            isLoaded={forYou.isLoaded}
            loading={forYou.loading}
            needsOnboarding={forYou.needsOnboarding}
            matches={forYou.matches}
            className="mt-12 lg:mt-16"
          />
        </ConsumerMain>
      </div>
    </div>
  );
}
