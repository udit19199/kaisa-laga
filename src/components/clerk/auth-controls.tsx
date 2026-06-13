"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type AuthControlsProps = {
  trialClassName?: string;
};

export function AuthControls({ trialClassName }: AuthControlsProps) {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <button
            type="button"
            className="hidden text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)] sm:inline"
          >
            Log in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/dashboard/onboarding">
          <button
            type="button"
            className={cn(
              buttonVariants(),
              "h-9 rounded-full bg-[var(--brand-ink)] px-4 text-sm text-[var(--brand-paper)] hover:bg-[var(--brand-ink)]/90",
              trialClassName,
            )}
        >
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="hidden text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)] sm:inline"
        >
          Dashboard
        </Link>
        <UserButton />
      </Show>
    </>
  );
}
