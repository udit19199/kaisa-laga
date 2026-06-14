import type { Metadata } from "next";
import { LandingVariantGallery } from "@/components/marketing/variant-landing-page";

export const metadata: Metadata = {
  title: "Kaisa Laga Landing Gallery",
  description:
    "Ten distinct landing page directions for Kaisa Laga, each rebuilt from scratch with a different sales mood and visual logic.",
};

export default function LandingGalleryPage() {
  return <LandingVariantGallery />;
}
