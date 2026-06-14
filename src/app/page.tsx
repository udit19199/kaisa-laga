import type { Metadata } from "next";
import { JulienneLandingPage } from "@/components/marketing/julienne-landing-page";

export const metadata: Metadata = {
  title: "Kaisa Laga · Julienne",
  description:
    "A Julienne-inspired landing page with a food-forward editorial layout, calm onboarding rhythm, and premium reservation cues.",
};

export default function HomePage() {
  return <JulienneLandingPage />;
}
