import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  getDefaultAreaForCity,
  normalizeGeoCity,
  type DiscoverAreaOption,
} from "@/lib/discover/areas";

export async function GET() {
  const headerStore = await headers();
  const cityFromHeaders = headerStore.get("x-vercel-ip-city");
  const region = headerStore.get("x-vercel-ip-country-region");

  const city =
    cityFromHeaders ??
    (process.env.NODE_ENV === "development" ? process.env.DEV_GEO_CITY : null);

  const mappedCity = normalizeGeoCity(city);
  let suggestedArea: DiscoverAreaOption | null = null;

  if (mappedCity) {
    suggestedArea = getDefaultAreaForCity(mappedCity);
  }

  return NextResponse.json({
    city,
    region,
    mappedCity,
    suggestedAreaId: suggestedArea?.id ?? null,
    suggestedAreaLabel: suggestedArea?.label ?? null,
  });
}
