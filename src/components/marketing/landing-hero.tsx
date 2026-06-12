import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHero() {
  return (
    <section
      className="relative flex flex-col items-center px-4 pt-28 text-center sm:px-6 sm:pt-32"
      aria-label="Auris introduction"
    >
      <h1
        className={cn(
          "landing-display mx-auto max-w-[20ch]",
          "text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--brand-ink)]",
          "[text-wrap:balance]",
        )}
      >
        Replace ignored surveys with 5-second voice reviews.
      </h1>
      
      <p className="mt-6 max-w-[42ch] text-[clamp(1rem,1.5vw,1.125rem)] leading-relaxed text-[var(--brand-muted)] [text-wrap:balance]">
        Customers scan a QR code to leave a quick voice note. Our AI instantly turns it into operational insights for your dashboard. No typing. No apps. Just the truth.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/dashboard/signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-full bg-[var(--brand-ink)] px-8 text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90",
          )}
        >
          Start your free trial
        </Link>
      </div>
    </section>
  );
}
