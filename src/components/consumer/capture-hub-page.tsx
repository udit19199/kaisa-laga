import Image from "next/image";
import Link from "next/link";
import { ConsumerHeader } from "@/components/consumer/consumer-chrome";
import { ConsumerMain } from "@/components/consumer/consumer-main";

export function CaptureHubPage() {
  return (
    <div className="font-marketing-ui text-marketing-ink">
      <ConsumerHeader title="Capture" showBrand={false} />

      <ConsumerMain className="space-y-8 pt-6 lg:space-y-0 lg:pt-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div className="space-y-4 lg:pt-4">
            <p className="m-0 max-w-lg text-base leading-relaxed text-marketing-muted lg:text-lg">
              After a visit, scan the QR at the table or counter. Hold to record — no account
              needed.
            </p>

            <div className="space-y-3 pt-2">
              <h2 className="m-0 font-marketing-display text-xl font-normal lg:text-2xl">
                After you review
              </h2>
              <p className="m-0 max-w-lg text-sm leading-relaxed text-marketing-muted lg:text-base">
                Optionally save your feedback to a taste profile. That&apos;s how we learn what
                you like and suggest places on the For you tab.
              </p>
              <Link
                href="/profile"
                className="inline-flex text-sm font-medium text-marketing-accent no-underline hover:underline lg:text-base"
              >
                Manage your profile →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-marketing-line bg-marketing-card p-6 text-center lg:p-10">
            <Image
              src="/marketing/app-qr.png"
              alt="Example QR code for in-venue capture"
              width={220}
              height={220}
              className="mx-auto lg:h-[240px] lg:w-[240px]"
              unoptimized
            />
            <p className="mx-auto mt-4 max-w-sm text-sm text-marketing-muted lg:text-base">
              Each venue has its own QR. It opens the capture screen for that location only.
            </p>
          </div>
        </div>
      </ConsumerMain>
    </div>
  );
}
