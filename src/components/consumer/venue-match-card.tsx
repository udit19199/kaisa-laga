import Image from "next/image";
import type { VenueMatch } from "@/lib/taste/types";
import { cn } from "@/lib/utils";

export function VenueMatchCard({
  match,
  className,
}: {
  match: VenueMatch;
  className?: string;
}) {
  const imageSrc = match.coverImageUrl ?? "/marketing/banana-bread.png";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border border-marketing-line bg-white",
        className,
      )}
    >
      <div className="relative h-44 bg-marketing-card lg:h-52">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-5 lg:p-6">
        <p className="m-0 text-sm text-marketing-accent lg:text-[15px]">{match.matchCopy}</p>
        <h2 className="m-0 font-marketing-display text-[22px] font-normal leading-tight lg:text-2xl">
          {match.name}
        </h2>
        {match.tagline ? (
          <p className="m-0 text-sm text-marketing-muted">{match.tagline}</p>
        ) : null}
        {match.sampleQuote ? (
          <p className="m-0 text-[15px] leading-relaxed text-marketing-ink">
            &ldquo;{match.sampleQuote}&rdquo;
          </p>
        ) : null}
      </div>
    </article>
  );
}
