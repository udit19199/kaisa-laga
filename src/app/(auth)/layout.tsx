import type { ReactNode } from "react";
import Link from "next/link";
import { KaisaLagaMark } from "@/components/consumer/consumer-chrome";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-white px-4 py-8 font-marketing-ui text-marketing-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <KaisaLagaMark className="scale-90 text-marketing-ink" />
          <div>
            <p className="m-0 font-marketing-display text-[28px] font-normal">Kaisa Laga</p>
            <p className="mt-1 text-sm text-marketing-muted">
              Sign in or create an account for your business.
            </p>
          </div>
        </div>

        <main className="w-full max-w-md">{children}</main>

        <div className="flex items-center gap-3 text-sm text-marketing-muted">
          <Link
            href="/sign-in"
            className="font-medium text-marketing-ink no-underline hover:underline"
          >
            Log in
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="/sign-up"
            className="font-medium text-marketing-ink no-underline hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
