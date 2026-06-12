import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-gray-50" id="pricing">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          Simple pricing for serious operators.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--brand-muted)]">
          Start free. No credit card required.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold text-[var(--brand-ink)]">Starter</h3>
            <p className="mt-4 text-[var(--brand-muted)]">Perfect for a single location looking to capture more feedback.</p>
            <div className="mt-6 flex items-baseline gap-x-2">
              <span className="text-5xl font-bold tracking-tight text-[var(--brand-ink)]">$49</span>
              <span className="text-sm font-semibold leading-6 text-[var(--brand-muted)]">/month</span>
            </div>
            <ul className="mt-8 space-y-4 text-sm leading-6 text-[var(--brand-muted)] flex-1">
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> 1 Location</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Up to 500 voice reviews/month</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Standard AI Sentiment Analysis</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Daily Email Summary</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> 1 Free Acrylic QR Display</li>
            </ul>
            <Link
              href="/dashboard/signup"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-8 w-full rounded-full border-[var(--brand-ink)]/20 text-[var(--brand-ink)] hover:bg-gray-50",
              )}
            >
              Start 14-day free trial
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="rounded-3xl border border-[var(--brand-accent)] bg-[var(--brand-ink)] p-8 text-left shadow-xl ring-1 ring-[var(--brand-accent)] flex flex-col">
            <h3 className="text-2xl font-semibold text-white">Growth</h3>
            <p className="mt-4 text-gray-300">For multi-location operators who need real-time alerts.</p>
            <div className="mt-6 flex items-baseline gap-x-2">
              <span className="text-5xl font-bold tracking-tight text-white">$129</span>
              <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>
            </div>
            <ul className="mt-8 space-y-4 text-sm leading-6 text-gray-300 flex-1">
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Up to 3 Locations</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Unlimited voice reviews</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Real-time SMS/Email Operational Alerts</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Advanced Theme Extraction</li>
              <li className="flex gap-x-3"><span className="text-[var(--brand-accent)]">✓</span> Priority Support</li>
            </ul>
            <Link
              href="/dashboard/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 w-full rounded-full bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent)]/90 border-none",
              )}
            >
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
