import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-[var(--brand-paper)]">
      <div className="mx-auto max-w-4xl text-center rounded-3xl bg-[var(--brand-ink)] py-16 px-6 sm:px-16 shadow-2xl overflow-hidden relative">
        <div className="absolute -inset-24 rounded-full bg-gradient-to-tr from-[var(--brand-accent)]/20 to-blue-500/20 blur-3xl opacity-50" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop guessing how your customers feel.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join the pilot program and start listening today. Setup takes less than 5 minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full bg-white px-8 text-[var(--brand-ink)] hover:bg-gray-100 hover:text-[var(--brand-ink)] shadow-lg",
              )}
            >
              Get your first QR code
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
