import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-12" imageClassName="h-7 w-7" priority />
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-900 uppercase">
              Kaisa Laga
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Sign in or create an account to continue.
            </p>
          </div>
        </div>

        <main className="w-full max-w-md">{children}</main>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/sign-in" className="font-medium text-slate-700 hover:text-slate-900">
            Log in
          </Link>
          <span>·</span>
          <Link href="/sign-up" className="font-medium text-slate-700 hover:text-slate-900">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
