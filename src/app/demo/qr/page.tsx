import { LandingSky } from "@/components/marketing/landing-sky";
import { StoryQrAsset } from "@/components/story/assets/story-qr-asset";

export default function DemoQrPage() {
  return (
    <div className="brand-surface relative min-h-dvh">
      <LandingSky />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-[var(--space-page-x)] py-12">
        <p className="mb-12 text-center text-xs font-medium text-[var(--brand-muted)]">
          Story asset · QR
        </p>

        <StoryQrAsset />

        <p className="mt-12 text-center text-xs text-[var(--brand-muted)]">
          Finalized — ready for animation
        </p>
      </div>
    </div>
  );
}
