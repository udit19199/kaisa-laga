import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function LandingHero() {
  return (
    <section
      className="relative flex flex-col items-center px-4 pt-32 pb-16 text-center sm:px-6 sm:pt-40 sm:pb-20"
      aria-label="Kaisa Laga introduction"
    >
      <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-muted)] uppercase">
        Built for local service businesses
      </p>
      <h1
        className={cn(
          "landing-display mx-auto mt-6 max-w-[16ch]",
          "text-[clamp(3rem,7vw,5.5rem)] leading-[0.97] tracking-[-0.03em] text-[var(--brand-ink)]",
          "[text-wrap:balance]",
        )}
      >
        Some things customers only say out loud.
      </h1>

      <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 rounded-full bg-[var(--brand-ink)] px-8 text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90",
          )}
        >
          Join the private pilot
        </Link>
      </div>
    </section>
  );
}
