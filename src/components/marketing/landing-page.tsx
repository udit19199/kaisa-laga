import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { StoryNarrative } from "@/components/marketing/story-narrative";
import { SocialProof } from "@/components/marketing/social-proof";
import { WhyVoice } from "@/components/marketing/why-voice";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase";
import { PrivateFeedback } from "@/components/marketing/private-feedback";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function LandingNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 sm:px-6">
      <nav className="glass-nav pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5">
        <Link href="/" className="shrink-0 text-sm font-bold tracking-[0.18em] text-[var(--brand-ink)]">
          PULSE DROP
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/login"
            className="text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
          >
            Log in
          </Link>
          <Link
            href="/dashboard/signup"
            className={cn(
              buttonVariants(),
              "h-9 rounded-full bg-[var(--brand-ink)] px-4 text-sm text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90",
            )}
          >
            Start free trial
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
        <SocialProof />
        <StoryNarrative />
        <WhyVoice />
        <HowItWorks />
        <DashboardShowcase />
        <PrivateFeedback />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
    </div>
  );
}
