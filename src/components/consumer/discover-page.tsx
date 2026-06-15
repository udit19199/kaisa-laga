"use client";

import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { DiscoverAreaPicker } from "@/components/consumer/discover-area-picker";
import { DiscoverTastePrompt } from "@/components/consumer/discover-taste-prompt";
import { ForYouMatchesSection } from "@/components/consumer/for-you-matches-section";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";
import { useDiscoverArea } from "@/hooks/use-discover-area";
import { useForYouMatches } from "@/hooks/use-for-you-matches";
import {
  reviewMatchesArea,
  type DiscoverCity,
} from "@/lib/discover/areas";
import { cn } from "@/lib/utils";

const featuredReviews = [
  {
    quote: "The filter coffee here actually tastes like the beans they claim.",
    place: "Bean & Brisk",
    area: "Indiranagar",
    city: "Bengaluru" as const,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Filter coffee being poured at a cafe counter",
  },
  {
    quote: "Murgh was genuinely excellent, and service noticed we needed water before we asked.",
    place: "Saffron Square",
    area: "Bandra West",
    city: "Mumbai" as const,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Indian curry served in a brass bowl",
  },
  {
    quote: "Quiet enough to work, pastries fresh, and nobody rushed us out.",
    place: "Third Wave Coffee",
    area: "Koramangala",
    city: "Bengaluru" as const,
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Sunlit cafe interior with pastries on the counter",
  },
  {
    quote: "Late-night thali portions are honest — not the usual stingy delivery box.",
    place: "Galli Kitchen",
    area: "Andheri West",
    city: "Mumbai" as const,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Thali with rice, dal, and vegetables on a steel plate",
  },
  {
    quote: "Crisp dosas, sambar with real punch — and they never stint on the chutney refills.",
    place: "MTR Express",
    area: "Whitefield",
    city: "Bengaluru" as const,
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Masala dosa on a banana leaf with chutneys",
  },
] as const satisfies ReadonlyArray<{
  quote: string;
  place: string;
  area: string;
  city: DiscoverCity;
  image: string;
  imageAlt: string;
}>;

function ReviewCard({ review }: { review: (typeof featuredReviews)[number] }) {
  return (
    <article
      aria-label={`${review.place}, ${review.area}: ${review.quote}`}
      className="relative aspect-[3/4] w-[min(78vw,260px)] shrink-0 snap-start overflow-hidden rounded-2xl lg:aspect-[4/5] lg:w-auto lg:min-h-[300px]"
    >
      <Image
        src={review.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 78vw, 240px"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-black/15"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 lg:gap-2 lg:p-5">
        <h3 className="m-0 font-marketing-display text-[15px] leading-[1.45] font-normal text-white lg:text-[17px]">
          {review.quote}
        </h3>
        <p className="m-0 text-[13px] text-white/75 lg:text-sm">
          <span className="font-medium text-white/95">{review.place}</span>
          <span>, {review.area}</span>
        </p>
      </div>
    </article>
  );
}

function matchesReviewQuery(
  review: (typeof featuredReviews)[number],
  query: string,
) {
  if (!query) return true;
  const haystack = [review.quote, review.place, review.area].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function DiscoverPage() {
  const { area, setArea, inferredFromGeo, options } = useDiscoverArea();
  const forYou = useForYouMatches();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const queryTerm = searchQuery.trim().toLowerCase();

  const visibleReviews = useMemo(
    () =>
      featuredReviews.filter(
        (review) =>
          reviewMatchesArea(review, area) && matchesReviewQuery(review, queryTerm),
      ),
    [area, queryTerm],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const reviewsSubtitle = area.area
    ? `What people said in ${area.label}.`
    : `What people said across ${area.label}.`;

  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader />

      <div className="discover-hero-zone">
        <ConsumerMain className="pb-8 lg:pb-10">
          <section
            aria-labelledby="discover-search-heading"
            className="mx-auto flex w-full max-w-xl flex-col items-center pt-7 text-center lg:pt-[clamp(2.5rem,10vh,5.5rem)]"
          >
            <h1
              id="discover-search-heading"
              className="m-0 max-w-[18ch] font-marketing-display text-[28px] leading-[1.12] font-normal tracking-[-0.02em] text-balance lg:max-w-none lg:text-[38px]"
            >
              Hear how it was{" "}
              <span className="text-marketing-accent">before you go.</span>
            </h1>

            <div
              className={cn(
                "mt-5 w-full overflow-hidden rounded-2xl border bg-white text-left lg:mt-6",
                "transition-[border-color,box-shadow] duration-200",
                searchFocused || locationOpen
                  ? "border-marketing-accent/45 shadow-[0_0_0_4px_rgb(229_107_60/0.14)]"
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
                  What are you looking for?
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
                  placeholder="Filter coffee, late-night thali, quiet cafe…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className={cn(
                    "h-11 w-full bg-transparent pr-4 pl-11",
                    "text-[15px] text-marketing-ink outline-none placeholder:text-marketing-muted",
                    "lg:h-12 lg:pl-12 lg:text-base",
                  )}
                />
              </form>
            </div>

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
        </ConsumerMain>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <hr className="marketing-content-rule" />
      </div>

      <ConsumerMain className="pt-8 lg:pt-10">
        <ForYouMatchesSection
          isSignedIn={forYou.isSignedIn}
          isLoaded={forYou.isLoaded}
          loading={forYou.loading}
          needsOnboarding={forYou.needsOnboarding}
          matches={forYou.matches}
        />

        <section id="reviews" aria-labelledby="reviews-heading">
          <div className="mb-5 flex items-end justify-between gap-4 lg:mb-7">
            <div>
              <h2
                id="reviews-heading"
                className="m-0 font-marketing-display text-[26px] leading-[1.15] font-normal tracking-[-0.02em] lg:text-[30px]"
              >
                Kaisa{" "}
                <span className="text-marketing-accent italic">laga?</span>
              </h2>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-marketing-muted lg:mt-2 lg:text-[15px]">
                {reviewsSubtitle}
              </p>
            </div>
            {queryTerm ? (
              <p className="m-0 shrink-0 text-sm text-marketing-muted">
                {visibleReviews.length} match{visibleReviews.length === 1 ? "" : "es"}
              </p>
            ) : null}
          </div>

          {visibleReviews.length > 0 ? (
            <div
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2",
                "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "lg:mx-0 lg:grid lg:snap-none lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0",
                "xl:grid-cols-5",
              )}
            >
              {visibleReviews.map((review) => (
                <ReviewCard key={review.place} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-marketing-muted lg:text-base">
              No reviews match yet in {area.label}
              {queryTerm ? ` for “${searchQuery.trim()}”` : ""}. Try another area or search.
            </p>
          )}
        </section>
      </ConsumerMain>
    </div>
  );
}
