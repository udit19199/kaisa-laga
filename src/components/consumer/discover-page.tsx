"use client";

import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";
import { cn } from "@/lib/utils";

const featuredReviews = [
  {
    quote: "The filter coffee here actually tastes like the beans they claim.",
    place: "Bean & Brisk",
    area: "Indiranagar",
    image: "/marketing/strawberry-bread.png",
  },
  {
    quote: "Murgh was genuinely excellent, and service noticed we needed water before we asked.",
    place: "Saffron Square",
    area: "Bandra West",
    image: "/marketing/banana-bread.png",
  },
  {
    quote: "Quiet enough to work, pastries fresh, and nobody rushed us out.",
    place: "Third Wave Coffee",
    area: "Koramangala",
    image: "/marketing/crepes.png",
  },
  {
    quote: "Late-night thali portions are honest — not the usual stingy delivery box.",
    place: "Galli Kitchen",
    area: "Andheri West",
    image: "/marketing/orange-loaf.png",
  },
  {
    quote: "Check-in was smooth, room was clean, and breakfast had real South Indian options.",
    place: "Courtyard House",
    area: "Whitefield",
    image: "/marketing/orange-cake.png",
  },
] as const;

function ReviewCard({ review }: { review: (typeof featuredReviews)[number] }) {
  return (
    <article
      className={cn(
        "relative shrink-0 overflow-hidden rounded-3xl bg-marketing-card",
        "h-[400px] w-[min(82vw,300px)]",
        "lg:h-auto lg:min-h-[420px] lg:w-auto",
      )}
    >
      <div className="flex min-h-[88px] items-start px-5 pt-5 lg:min-h-[100px] lg:px-6 lg:pt-6">
        <h2 className="m-0 max-w-[260px] font-marketing-display text-[18px] leading-[1.55] font-normal lg:max-w-none lg:text-[19px]">
          {review.quote}
        </h2>
      </div>

      <Image
        src={review.image}
        alt=""
        width={240}
        height={240}
        className="mx-auto block h-[220px] w-[220px] object-contain lg:h-[240px] lg:w-[240px]"
        unoptimized
      />

      <p className="absolute inset-x-5 bottom-5 m-0 text-[14px] text-marketing-muted lg:static lg:px-6 lg:pb-6 lg:pt-2">
        <span className="text-marketing-ink">{review.place}</span>
        <span>, {review.area}</span>
      </p>
    </article>
  );
}

function matchesReview(
  review: (typeof featuredReviews)[number],
  query: string,
) {
  if (!query) return true;
  const haystack = [review.quote, review.place, review.area].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryTerm = searchQuery.trim().toLowerCase();

  const visibleReviews = useMemo(
    () => featuredReviews.filter((review) => matchesReview(review, queryTerm)),
    [queryTerm],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader />

      <ConsumerMain className="pt-8 lg:pt-12">
        <section className="pb-8 text-center lg:pb-10 lg:text-left">
          <h1 className="m-0 font-marketing-display text-[34px] leading-[1.12] font-normal tracking-[-0.02em] lg:text-[52px] lg:leading-[1.08]">
            <span className="block">Kaisa laga?</span>
            <span className="mt-2 block text-[22px] text-marketing-muted lg:mt-3 lg:text-[28px] lg:font-normal">
              Reviews from real visits.
            </span>
          </h1>

          <form
            className="relative mx-auto mt-7 w-full max-w-md lg:mx-0 lg:mt-10 lg:max-w-xl"
            onSubmit={handleSearchSubmit}
          >
            <label htmlFor="discover-search" className="sr-only">
              What are you in the mood for?
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-marketing-muted lg:left-5 lg:h-5 lg:w-5"
              strokeWidth={2}
            />
            <input
              id="discover-search"
              type="search"
              name="q"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="What are you in the mood for?"
              autoComplete="off"
              enterKeyHint="search"
              className={cn(
                "h-14 w-full rounded-2xl border border-[#dedede] bg-white pr-4 pl-11",
                "text-base text-marketing-ink outline-none placeholder:text-marketing-muted",
                "focus:border-[#c8c8c8] focus:shadow-[0_0_0_3px_rgb(229_107_60/0.08)]",
                "lg:h-16 lg:rounded-3xl lg:pl-14 lg:text-lg",
              )}
            />
          </form>
        </section>

        <section id="reviews" aria-label="Verified reviews">
          {visibleReviews.length > 0 ? (
            <div
              className={cn(
                "-mx-5 flex w-max gap-3 overflow-x-auto px-5 pb-1",
                "lg:mx-0 lg:grid lg:w-full lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0",
                "xl:grid-cols-5",
              )}
            >
              {visibleReviews.map((review) => (
                <ReviewCard key={review.place} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[15px] text-marketing-muted lg:text-left lg:text-base">
              No reviews match that search. Try another restaurant, cafe, or hotel.
            </p>
          )}
        </section>
      </ConsumerMain>
    </div>
  );
}
