import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { ProductDemo } from "@/components/marketing/product-demo";
import { SocialProof } from "@/components/marketing/social-proof";
import { PrivateFeedback } from "@/components/marketing/private-feedback";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function LandingNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 sm:px-6">
      <nav className="glass-nav pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
        >
          <BrandMark className="size-9" imageClassName="h-6 w-6" priority />
          <span className="text-sm font-bold tracking-[0.18em] text-[var(--brand-ink)] uppercase">
            Auris
          </span>
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          <a
            href="#product"
            className="text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Product
          </a>
          <a
            href="#faq"
            className="text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
          >
            FAQ
          </a>
          <a
            href="#pricing"
            className="text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants(),
              "h-9 rounded-full bg-[var(--brand-ink)] px-4 text-sm text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90",
            )}
          >
            Join private pilot
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function LandingPage() {
  return (
    <div className="brand-surface min-h-dvh">
      <LandingNav />

      <main className="relative">
        <LandingHero />
        <ProductDemo />
        <SocialProof />
        <PrivateFeedback />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
    </div>
  );
}
