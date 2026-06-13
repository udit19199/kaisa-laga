import type { Metadata } from "next";
import { PublicReviewsPage } from "@/components/reviews/public-reviews-page";

export const metadata: Metadata = {
  title: "Kaisa Laga Reviews",
  description:
    "Browse verified customer reviews from real visits, with a seven-day business preview window before reviews go public.",
};

export default function ReviewsPage() {
  return <PublicReviewsPage />;
}
