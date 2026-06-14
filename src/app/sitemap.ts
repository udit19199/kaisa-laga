import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-url";

/** Customer-facing routes only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl();

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${appUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
