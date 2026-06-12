import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section className="bg-[var(--brand-paper)] px-4 py-24 sm:px-6 sm:py-32" id="pricing">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mx-auto max-w-[12ch] text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          Private pilot, shaped with early operators.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--brand-muted)]">
          We&apos;re onboarding a limited number of local businesses while we refine the
          product with real-world feedback.
        </p>

        <div className="mx-auto mt-[4.5rem] max-w-4xl border-t border-[var(--brand-ink)]/10 pt-10 text-left">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div>
              <div className="inline-flex items-center rounded-full bg-[var(--brand-accent)]/10 px-3 py-1 text-sm font-medium text-[var(--brand-accent)]">
                Early access
              </div>
              <h3 className="mt-5 max-w-[16ch] text-3xl font-semibold text-[var(--brand-ink)]">
                Join the pilot if you want to shape the product with us.
              </h3>
              <p className="mt-4 text-lg leading-8 text-[var(--brand-muted)]">
                We&apos;re currently working with a small group of local businesses that
                want a better way to collect honest customer feedback.
              </p>
            </div>

            <div>
              <ul className="space-y-4 text-sm leading-6 text-[var(--brand-muted)]">
                <li className="flex gap-x-3">
                  <span className="text-[var(--brand-accent)]">✓</span>
                  QR-based voice feedback flow
                </li>
                <li className="flex gap-x-3">
                  <span className="text-[var(--brand-accent)]">✓</span>
                  Structured summaries and recurring themes
                </li>
                <li className="flex gap-x-3">
                  <span className="text-[var(--brand-accent)]">✓</span>
                  Direct founder support while we learn with you
                </li>
                <li className="flex gap-x-3">
                  <span className="text-[var(--brand-accent)]">✓</span>
                  Pricing finalized with pilot partners
                </li>
              </ul>

              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 w-full rounded-full bg-[var(--brand-ink)] text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90 border-none",
                )}
              >
                Request early access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
