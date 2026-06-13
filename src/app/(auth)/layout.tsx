import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="brand-surface min-h-dvh px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden flex-col justify-between rounded-[2rem] border border-white/45 bg-white/30 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3">
            <BrandMark className="size-11" imageClassName="h-7 w-7" priority />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-muted)]">
                Kaisa Laga
              </p>
              <p className="text-sm text-[var(--brand-ink)]/70">
                Feedback capture for local service teams
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--brand-muted)]">
              Start here
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--brand-ink)]">
              Sign in, sign up, and land in the right workspace without a detour.
            </h1>
            <p className="text-base leading-7 text-[var(--brand-ink)]/72">
              The route structure keeps login, signup, and onboarding separate so the
              first-run path stays fast, predictable, and easy to maintain.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/50 bg-white/40 px-5 py-4 text-sm text-[var(--brand-ink)]/80">
            <span>Need to switch paths?</span>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="font-medium hover:text-[var(--brand-ink)]">
                Log in
              </Link>
              <span className="text-[var(--brand-muted)]">·</span>
              <Link href="/sign-up" className="font-medium hover:text-[var(--brand-ink)]">
                Create account
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
