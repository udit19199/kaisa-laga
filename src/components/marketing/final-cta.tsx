import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="bg-[var(--brand-paper)] px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl border-t border-[var(--brand-ink)]/10 pt-14 text-center">
        <div className="relative z-10">
          <h2 className="mx-auto max-w-[12ch] text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
            Want to hear what customers won&apos;t type?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[var(--brand-muted)]">
            Join the private pilot and help shape a simpler way for local businesses
            to collect real feedback.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full bg-[var(--brand-ink)] px-8 text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90 hover:text-[var(--brand-paper)]",
              )}
            >
              Request early access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
