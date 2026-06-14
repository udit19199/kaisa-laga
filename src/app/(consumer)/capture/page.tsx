import type { Metadata } from "next";
import { ForYouPage } from "@/components/consumer/for-you-page";

export const metadata: Metadata = {
  title: "For you — Kaisa Laga",
  description: "Places matched to your taste from verified visit reviews.",
};

export default function Page() {
  return <ForYouPage />;
}
