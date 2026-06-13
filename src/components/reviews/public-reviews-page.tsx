"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button-variants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type VenueType = "Restaurant" | "Cafe" | "Hotel";
type Sentiment = "positive" | "mixed" | "needs_attention";

type Review = {
  id: string;
  author: string;
  anonymous: boolean;
  dateLabel: string;
  excerpt: string;
  tags: string[];
  verified: boolean;
};

type Place = {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  dish: string;
  venueType: VenueType;
  rating: number;
  reviewCount: number;
  sentiment: Sentiment;
  summary: string;
  response: string;
  publishedLabel: string;
  highlights: string[];
  reviews: Review[];
};

const PLACES: Place[] = [
  {
    id: "saffron-square",
    name: "Saffron Square",
    area: "Bandra West",
    cuisine: "North Indian",
    dish: "Butter chicken",
    venueType: "Restaurant",
    rating: 4.8,
    reviewCount: 42,
    sentiment: "positive",
    summary: "People keep praising the warmth of the staff, the consistency of the grill, and the pacing between courses.",
    response: "The team says they already tightened dessert service timing after a run of late-night comments.",
    publishedLabel: "Published 2 days ago",
    highlights: ["date night", "late dinner", "family tables"],
    reviews: [
      {
        id: "s1",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Visited Friday",
        excerpt: "The murgh was genuinely excellent, and the server noticed our table needed water before we asked.",
        tags: ["Service", "Food"],
        verified: true,
      },
      {
        id: "s2",
        author: "Aparna",
        anonymous: false,
        dateLabel: "Published yesterday",
        excerpt: "We came for a birthday dinner and the staff handled the whole table with real patience.",
        tags: ["Family", "Experience"],
        verified: true,
      },
      {
        id: "s3",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published 4 days ago",
        excerpt: "Only issue was dessert arriving a little late, but the main meal made up for it.",
        tags: ["Timing", "Mixed"],
        verified: true,
      },
    ],
  },
  {
    id: "bean-and-brisk",
    name: "Bean & Brisk",
    area: "Indiranagar",
    cuisine: "Cafe Bakery",
    dish: "Single-origin cold brew",
    venueType: "Cafe",
    rating: 4.6,
    reviewCount: 27,
    sentiment: "positive",
    summary: "The reviews cluster around coffee quality, easy seating, and a calm place to work without feeling rushed.",
    response: "The owner responded to a seating complaint and added more high-top tables near the window.",
    publishedLabel: "Published 6 days ago",
    highlights: ["work friendly", "pastries", "morning crowd"],
    reviews: [
      {
        id: "b1",
        author: "Rahul",
        anonymous: false,
        dateLabel: "Published today",
        excerpt: "Cold brew had a clean finish, and the pastry case was actually fresher than most cafes in the area.",
        tags: ["Coffee", "Value"],
        verified: true,
      },
      {
        id: "b2",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published 3 days ago",
        excerpt: "Good place for one laptop and a long conversation, but power sockets were limited at the back.",
        tags: ["Work", "Facilities"],
        verified: true,
      },
      {
        id: "b3",
        author: "Meera",
        anonymous: false,
        dateLabel: "Published 5 days ago",
        excerpt: "The barista explained the beans without turning it into a lecture, which I really appreciated.",
        tags: ["Service", "Coffee"],
        verified: true,
      },
    ],
  },
  {
    id: "harbor-key",
    name: "Harbor Key",
    area: "Koregaon Park",
    cuisine: "Hotel Dining",
    dish: "Breakfast spread",
    venueType: "Hotel",
    rating: 4.5,
    reviewCount: 19,
    sentiment: "mixed",
    summary: "Guests love the room service and breakfast spread, but some reviews call out slower check-in on weekends.",
    response: "The front office team posted that they added one more check-in station for Friday and Saturday evenings.",
    publishedLabel: "Published 1 day ago",
    highlights: ["staycation", "breakfast", "front desk"],
    reviews: [
      {
        id: "h1",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published yesterday",
        excerpt: "The breakfast buffet had enough variety to make the morning feel easy instead of rushed.",
        tags: ["Breakfast", "Stay"],
        verified: true,
      },
      {
        id: "h2",
        author: "Sana",
        anonymous: false,
        dateLabel: "Published 2 days ago",
        excerpt: "Front desk was polite, but our check-in window stretched longer than expected after a late train.",
        tags: ["Check-in", "Service"],
        verified: true,
      },
      {
        id: "h3",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published 3 days ago",
        excerpt: "The room was spotless, and housekeeping handled an extra towel request quickly.",
        tags: ["Cleanliness", "Housekeeping"],
        verified: true,
      },
    ],
  },
  {
    id: "nori-lane",
    name: "Nori Lane",
    area: "Powai",
    cuisine: "Japanese",
    dish: "Spicy ramen",
    venueType: "Restaurant",
    rating: 4.7,
    reviewCount: 31,
    sentiment: "positive",
    summary: "The food stories here keep pointing to fresh noodles, balanced spice, and strong repeat visits for dinner.",
    response: "The kitchen shared that they rotated the broth prep schedule after feedback about consistency.",
    publishedLabel: "Published 5 days ago",
    highlights: ["ramen", "after work", "repeat visitors"],
    reviews: [
      {
        id: "n1",
        author: "Vikram",
        anonymous: false,
        dateLabel: "Published 2 days ago",
        excerpt: "The ramen held together from first sip to last, which is rare when a bowl is pushed out busy.",
        tags: ["Food", "Consistency"],
        verified: true,
      },
      {
        id: "n2",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published 4 days ago",
        excerpt: "Loved the spice level, but the host stand got a little crowded around peak dinner time.",
        tags: ["Queue", "Mixed"],
        verified: true,
      },
      {
        id: "n3",
        author: "Anonymous guest",
        anonymous: true,
        dateLabel: "Published today",
        excerpt: "Very calm dinner spot, and the gyoza disappeared way too fast.",
        tags: ["Atmosphere", "Food"],
        verified: true,
      },
    ],
  },
];

const venueOptions: Array<"all" | VenueType> = ["all", "Restaurant", "Cafe", "Hotel"];

const sentimentLabels: Record<Sentiment, string> = {
  positive: "Mostly positive",
  mixed: "Mixed feedback",
  needs_attention: "Needs attention",
};

function matchesQuery(place: Place, query: string) {
  if (!query) return true;
  const haystack = [
    place.name,
    place.area,
    place.cuisine,
    place.dish,
    place.summary,
    place.response,
    place.venueType,
    ...place.highlights,
    ...place.reviews.flatMap((review) => [review.author, review.excerpt, ...review.tags]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function FilterChip({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-4 text-sm transition-colors",
        active
          ? "border-[var(--discovery-accent)]/30 bg-[var(--discovery-accent)] text-[var(--discovery-ink)]"
          : "border-[var(--discovery-border)] bg-[var(--discovery-panel)] text-[var(--discovery-paper)] hover:border-[var(--discovery-border)]/70 hover:bg-[var(--discovery-panel-strong)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[1.8rem] border border-[var(--discovery-border)]", className)}>
      {children}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-[1.35rem] border border-[var(--discovery-border)] bg-[var(--discovery-paper)] p-4 text-[var(--discovery-ink)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--discovery-ink)]">
            {review.anonymous ? "Anonymous guest" : review.author}
          </p>
          <p className="mt-0.5 text-xs text-[var(--discovery-muted)]">{review.dateLabel}</p>
        </div>
        {review.verified ? (
          <Badge variant="outline" className="border-[var(--discovery-success)]/25 bg-[var(--discovery-success)]/12 text-[var(--discovery-success)]">
            Verified
          </Badge>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--discovery-ink)]">{review.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {review.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-[var(--discovery-panel)] text-[var(--discovery-paper)]">
            {tag}
          </Badge>
        ))}
      </div>
    </article>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <SurfaceCard className="overflow-hidden bg-[var(--discovery-paper)] text-[var(--discovery-ink)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-[var(--discovery-accent)]/30 bg-[var(--discovery-accent)]/14 text-[var(--discovery-ink)]">
              {place.venueType}
            </Badge>
            <Badge variant="outline" className="border-[var(--discovery-border)] bg-white/70 text-[var(--discovery-muted)]">
              {place.publishedLabel}
            </Badge>
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[32rem]">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--discovery-ink)] sm:text-3xl">
                {place.name}
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--discovery-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {place.area}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UtensilsCrossed className="h-4 w-4" />
                  {place.cuisine}
                </span>
                <span>{place.dish}</span>
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--discovery-border)] bg-[var(--discovery-panel)] px-4 py-3 text-[var(--discovery-paper)]">
              <div className="flex items-center gap-2 text-[var(--discovery-paper)]">
                <Star className="h-4 w-4 fill-[var(--discovery-accent)] text-[var(--discovery-accent)]" />
                <span className="text-lg font-semibold">{place.rating.toFixed(1)}</span>
              </div>
              <p className="mt-1 text-xs text-white/68">{place.reviewCount} verified reviews</p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--discovery-ink)]">{place.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {place.highlights.map((highlight) => (
              <Badge key={highlight} variant="secondary" className="bg-[var(--discovery-panel)] text-[var(--discovery-paper)]">
                {highlight}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--discovery-border)] bg-[var(--discovery-panel-strong)] p-6 sm:p-8 lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className={cn(
                "border-0",
                place.sentiment === "positive"
                  ? "bg-[var(--discovery-success)]/14 text-[var(--discovery-success)]"
                  : place.sentiment === "mixed"
                    ? "bg-[var(--discovery-accent)]/14 text-[var(--discovery-paper)]"
                    : "bg-destructive/12 text-destructive",
              )}
            >
              {sentimentLabels[place.sentiment]}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-white/68">
              <Clock3 className="h-3.5 w-3.5" />
              7-day publish window
            </span>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-[var(--discovery-border)] bg-[var(--discovery-paper)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--discovery-ink)]">
              <Sparkles className="h-4 w-4 text-[var(--discovery-accent)]" />
              Most repeated note
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--discovery-ink)]">{place.response}</p>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold text-[var(--discovery-paper)]">Recent verified reviews</p>
            {place.reviews.slice(0, 2).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function PublicReviewsPage() {
  const [query, setQuery] = useState("");
  const [venueType, setVenueType] = useState<"all" | VenueType>("all");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<"Recently published" | "Most reviewed" | "Highest rated">("Recently published");

  const queryTerm = query.trim().toLowerCase();

  const filteredPlaces = useMemo(() => {
    const next = PLACES.filter((place) => {
      const venueMatches = venueType === "all" || place.venueType === venueType;
      const areaMatches = area === "all" || place.area === area;
      return venueMatches && areaMatches && matchesQuery(place, queryTerm);
    });

    return next.sort((a, b) => {
      if (sort === "Most reviewed") return b.reviewCount - a.reviewCount;
      if (sort === "Highest rated") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [area, queryTerm, sort, venueType]);

  const featuredPlace = filteredPlaces[0];
  const remainingPlaces = filteredPlaces.slice(1);
  const totalReviews = filteredPlaces.reduce((sum, place) => sum + place.reviewCount, 0);
  const averageRating =
    filteredPlaces.length === 0
      ? 0
      : filteredPlaces.reduce((sum, place) => sum + place.rating, 0) / filteredPlaces.length;

  const areaOptions = ["all", ...new Set(PLACES.map((place) => place.area))];

  return (
    <div className="discovery-surface min-h-dvh">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
        <nav className="pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[var(--discovery-panel)]/90 px-4 py-3 text-[var(--discovery-paper)] shadow-[0_14px_36px_oklch(0_0_0/.22)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--discovery-accent)] text-xs font-semibold text-[var(--discovery-ink)]">
              KL
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--discovery-paper)]">Kaisa Laga</p>
              <p className="text-xs text-white/64">Verified reviews from real visits</p>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <a href="#explore" className="text-sm text-white/62 transition-colors hover:text-[var(--discovery-paper)]">
              Explore
            </a>
            <a href="#trust" className="text-sm text-white/62 transition-colors hover:text-[var(--discovery-paper)]">
              Trust rules
            </a>
            <a href="#how-it-works" className="text-sm text-white/62 transition-colors hover:text-[var(--discovery-paper)]">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants(),
                "h-9 rounded-full bg-[var(--discovery-accent)] px-4 text-[var(--discovery-ink)] hover:bg-[var(--discovery-accent)]/90",
              )}
            >
              Claim your place
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 lg:px-8 lg:pt-32">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-start">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--discovery-paper)] px-3 py-1 text-xs font-medium text-[var(--discovery-ink)] shadow-[0_8px_20px_oklch(0_0_0/.18)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--discovery-success)]" />
              Demo feed for the public review platform
            </div>

            <h1 className="mt-6 max-w-[12ch] text-[clamp(3rem,7vw,5.9rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-[var(--discovery-paper)] [text-wrap:balance]">
              Kaisa Laga?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Search places, read verified reviews from real visits, and see what businesses
              fixed before a comment became public. It is a review layer designed to feel
              local, human, and hard to game.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--discovery-muted)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by restaurant, cafe, hotel, dish, or area"
                  className="h-12 rounded-full border border-white/10 bg-[var(--discovery-paper)] pl-11 text-[var(--discovery-ink)] placeholder:text-[var(--discovery-muted)] shadow-[0_8px_20px_oklch(0_0_0/.15)]"
                />
              </label>

              <div className="flex items-center gap-2">
                <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                  <SelectTrigger className="h-12 w-[11.5rem] rounded-full border border-white/10 bg-[var(--discovery-paper)] text-[var(--discovery-ink)] shadow-[0_8px_20px_oklch(0_0_0/.15)]">
                    <Filter className="mr-2 h-4 w-4 text-[var(--discovery-muted)]" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recently published">Recently published</SelectItem>
                    <SelectItem value="Most reviewed">Most reviewed</SelectItem>
                    <SelectItem value="Highest rated">Highest rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {venueOptions.map((option) => (
              <FilterChip key={option} active={venueType === option} onClick={() => setVenueType(option)}>
                {option === "all" ? "All venues" : option}
              </FilterChip>
              ))}
            </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {areaOptions.map((option) => (
              <FilterChip key={option} active={area === option} onClick={() => setArea(option)}>
                {option === "all" ? "All areas" : option}
              </FilterChip>
            ))}
          </div>
        </div>

          <SurfaceCard className="bg-[var(--discovery-panel)] p-6 text-[var(--discovery-paper)] shadow-[0_18px_45px_oklch(0_0_0/.2)] sm:p-7">
            <div id="how-it-works" className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--discovery-paper)]">
                <Building2 className="h-4 w-4 text-[var(--discovery-success)]" />
                How the review window works
              </div>
              <ol className="space-y-4">
                <li className="rounded-[1.2rem] border border-white/10 bg-[var(--discovery-paper)] p-4 text-[var(--discovery-ink)]">
                  <p className="text-sm font-semibold">1. Verified visit</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--discovery-muted)]">
                    A review only enters the system after a real customer leaves feedback from the venue.
                  </p>
                </li>
                <li className="rounded-[1.2rem] border border-white/10 bg-[var(--discovery-paper)] p-4 text-[var(--discovery-ink)]">
                  <p className="text-sm font-semibold">2. Seven-day preview</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--discovery-muted)]">
                    The business gets a short private window to read, respond, and fix the issue before it publishes.
                  </p>
                </li>
                <li className="rounded-[1.2rem] border border-white/10 bg-[var(--discovery-paper)] p-4 text-[var(--discovery-ink)]">
                  <p className="text-sm font-semibold">3. Public by default</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--discovery-muted)]">
                    After the window closes, the review goes live so nobody can quietly hide only the bad stuff.
                  </p>
                </li>
              </ol>
              <div className="rounded-[1.2rem] bg-[var(--discovery-accent)] px-4 py-4 text-[var(--discovery-ink)]">
                <p className="text-sm font-semibold">Demo note</p>
                <p className="mt-1 text-sm leading-6 text-[var(--discovery-ink)]/80">
                  The results below use sample data until the first real reviews land.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </section>

        <section id="trust" className="mt-8 grid gap-4 sm:grid-cols-3">
          <SurfaceCard className="bg-[var(--discovery-paper)] p-5 text-[var(--discovery-ink)] shadow-[0_16px_36px_oklch(0_0_0/.18)]">
            <p className="text-sm font-semibold">Verified only</p>
            <p className="mt-2 text-sm leading-6 text-[var(--discovery-muted)]">
              Reviews are tied to a visit, not a random browser session.
            </p>
          </SurfaceCard>
          <SurfaceCard className="bg-[var(--discovery-panel)] p-5 text-[var(--discovery-paper)] shadow-[0_16px_36px_oklch(0_0_0/.18)]">
            <p className="text-sm font-semibold">Anonymous by choice</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              People can keep their name hidden while still leaving a real review.
            </p>
          </SurfaceCard>
          <SurfaceCard className="bg-[var(--discovery-paper)] p-5 text-[var(--discovery-ink)] shadow-[0_16px_36px_oklch(0_0_0/.18)]">
            <p className="text-sm font-semibold">Built for recovery</p>
            <p className="mt-2 text-sm leading-6 text-[var(--discovery-muted)]">
              Businesses can fix issues during the preview window instead of learning after the fact.
            </p>
          </SurfaceCard>
        </section>

        <section id="explore" className="mt-10 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/62">Live demo feed</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--discovery-paper)] sm:text-3xl">
                {filteredPlaces.length} places matched
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/68">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--discovery-panel)] px-3 py-1 text-[var(--discovery-paper)]">
                <Star className="h-4 w-4 fill-[var(--discovery-accent)] text-[var(--discovery-accent)]" />
                {averageRating ? averageRating.toFixed(1) : "0.0"} average rating
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--discovery-panel)] px-3 py-1 text-[var(--discovery-paper)]">
                <ShieldCheck className="h-4 w-4 text-[var(--discovery-success)]" />
                {totalReviews} verified reviews
              </span>
            </div>
          </div>

          {featuredPlace ? (
            <PlaceCard place={featuredPlace} />
          ) : (
            <SurfaceCard className="bg-[var(--discovery-paper)] p-8 text-center text-[var(--discovery-ink)] shadow-[0_18px_45px_oklch(0_0_0/.18)]">
              <p className="text-lg font-semibold">No places match those filters.</p>
              <p className="mt-2 text-sm text-[var(--discovery-muted)]">
                Try clearing the search or switching to another area.
              </p>
            </SurfaceCard>
          )}

          {remainingPlaces.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {remainingPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <SurfaceCard className="bg-[var(--discovery-panel)] p-6 text-[var(--discovery-paper)] shadow-[0_18px_45px_oklch(0_0_0/.2)] sm:p-7">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[var(--discovery-accent)]" />
              Why this feels different
            </div>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
              The point is not to be louder than Google Reviews, it is to be more trustworthy by
              design. A review here comes from a real visit, gets time for a private business
              response, and then becomes public so the platform keeps its teeth.
            </p>
          </SurfaceCard>

          <SurfaceCard className="bg-[var(--discovery-paper)] p-6 text-[var(--discovery-ink)] shadow-[0_18px_45px_oklch(0_0_0/.18)] sm:p-7">
            <p className="text-sm font-semibold">Want the business view too?</p>
            <p className="mt-3 text-sm leading-6 text-[var(--discovery-muted)]">
              The operator dashboard can show what is being said, what is recurring, and what was fixed before a review went live.
            </p>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-5 h-11 rounded-full bg-[var(--discovery-accent)] px-5 text-[var(--discovery-ink)] hover:bg-[var(--discovery-accent)]/90",
              )}
            >
              Start with your venue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </SurfaceCard>
        </section>
      </main>
    </div>
  );
}
