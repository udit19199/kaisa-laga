"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { AccountMenu } from "@/components/auth/account-menu";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";
import {
  DINER_SIGN_IN_PATH,
  TASTE_ONBOARDING_PATH,
} from "@/lib/auth-routes";

export function ProfilePage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader title="Profile" showBrand={false} />

      <ConsumerMain className="pt-4 lg:pt-6">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12 xl:gap-16">
          <div>
            <h1 className="m-0 font-marketing-display text-[32px] font-normal lg:text-[40px]">
              Helpful settings
            </h1>

            <ul className="mt-8 divide-y divide-marketing-line border-y border-marketing-line lg:mt-10">
              <li>
                <Link
                  href={isSignedIn ? TASTE_ONBOARDING_PATH : DINER_SIGN_IN_PATH}
                  className="flex items-center justify-between py-4 text-base text-marketing-ink no-underline lg:py-5 lg:text-lg"
                >
                  Edit allergies &amp; dietary preferences
                  <span className="text-marketing-muted" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#for-you"
                  className="flex items-center justify-between py-4 text-base text-marketing-ink no-underline lg:py-5 lg:text-lg"
                >
                  Places for you
                  <span className="text-marketing-muted" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-10 rounded-3xl border border-marketing-line bg-marketing-card p-6 lg:mt-0 lg:p-8">
            <h2 className="m-0 font-marketing-display text-xl font-normal">Your account</h2>
            {!isLoaded ? (
              <p className="mt-4 text-sm text-marketing-muted">Loading…</p>
            ) : isSignedIn ? (
              <div className="mt-5 flex items-center gap-4">
                <AccountMenu />
                <p className="m-0 text-sm leading-relaxed text-marketing-muted lg:text-base">
                  Signed in to your taste profile
                </p>
              </div>
            ) : (
              <Link
                href={DINER_SIGN_IN_PATH}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-marketing-ink px-6 text-sm font-medium text-white no-underline lg:w-auto"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </ConsumerMain>
    </div>
  );
}
