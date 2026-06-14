import type { MetadataRoute } from "next";
import { landingConcepts } from "@/components/marketing/landing-variants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kaisa-laga.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://kaisa-laga.app/reviews",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://kaisa-laga.app/landings",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...landingConcepts.map((variant) => ({
      url: `https://kaisa-laga.app/landings/${variant.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}
