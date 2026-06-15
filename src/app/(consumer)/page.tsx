import type { Metadata } from "next";
import { DiscoverPage } from "@/components/consumer/discover-page";

export const metadata: Metadata = {
  title: "Kaisa Laga — Verified reviews from real visits",
  description:
    "Search restaurants and cafes in Jaipur through visit-based reviews. New cuisines, honest notes from people who were actually there.",
};

export default function Page() {
  return <DiscoverPage />;
}
