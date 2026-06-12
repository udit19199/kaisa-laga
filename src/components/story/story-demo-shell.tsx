"use client";

import { LiquidGlassProvider } from "@/components/liquid-glass";
import { LandingSky } from "@/components/marketing/landing-sky";
import { StoryJourney } from "@/components/story/story-journey";

export function StoryDemoShell() {
  return (
    <LiquidGlassProvider className="brand-surface relative min-h-dvh">
      <LandingSky />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col px-[var(--space-page-x)] py-8">
        <header className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            Asset preview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
            QR → Dashboard pipeline
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-muted)]">
            Internal preview of the landing journey animation.{" "}
            <a href="/demo/qr" className="font-medium text-[var(--brand-ink)] underline-offset-2 hover:underline">
              QR asset
            </a>
          </p>
        </header>

        <StoryJourney
          className="max-w-none scroll-mt-0 px-0 py-0"
          showIntro={false}
          showFooter={false}
          showChapters
        />

        <footer className="mt-auto pt-10 text-center text-xs text-[var(--brand-muted)]">
          Asset preview — not linked from production nav
        </footer>
      </div>
    </LiquidGlassProvider>
  );
}
