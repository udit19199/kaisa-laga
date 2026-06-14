import type { Metadata } from "next";
import { DiscoverPage } from "@/components/consumer/discover-page";

export const metadata: Metadata = {
  title: "Kaisa Laga — Verified reviews from real visits",
  description:
    "Discover restaurants, cafes, and hotels through visit-based reviews. Kaisa laga? Honest feedback from people who were actually there.",
};

export default function Page() {
  return <DiscoverPage />;
}
