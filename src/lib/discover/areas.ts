export type DiscoverCity = "Bengaluru" | "Mumbai";

export type DiscoverAreaOption = {
  id: string;
  label: string;
  city: DiscoverCity;
  /** When set, only reviews with this exact area name match. */
  area?: string;
};

export const DISCOVER_AREA_STORAGE_KEY = "kaisa-laga:discover-area";

export const discoverAreaOptions: DiscoverAreaOption[] = [
  { id: "indiranagar", label: "Indiranagar", city: "Bengaluru", area: "Indiranagar" },
  { id: "koramangala", label: "Koramangala", city: "Bengaluru", area: "Koramangala" },
  { id: "whitefield", label: "Whitefield", city: "Bengaluru", area: "Whitefield" },
  { id: "bengaluru-all", label: "All Bengaluru", city: "Bengaluru" },
  { id: "bandra-west", label: "Bandra West", city: "Mumbai", area: "Bandra West" },
  { id: "andheri-west", label: "Andheri West", city: "Mumbai", area: "Andheri West" },
  { id: "mumbai-all", label: "All Mumbai", city: "Mumbai" },
];

const cityAliases: Record<string, DiscoverCity> = {
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  mumbai: "Mumbai",
  bombay: "Mumbai",
};

export function normalizeGeoCity(city: string | null | undefined): DiscoverCity | null {
  if (!city?.trim()) {
    return null;
  }

  const key = city.trim().toLowerCase();
  return cityAliases[key] ?? null;
}

export function getDefaultAreaForCity(city: DiscoverCity): DiscoverAreaOption {
  if (city === "Mumbai") {
    return discoverAreaOptions.find((option) => option.id === "mumbai-all")!;
  }

  return discoverAreaOptions.find((option) => option.id === "bengaluru-all")!;
}

export function getAreaOptionById(id: string | null | undefined): DiscoverAreaOption | null {
  if (!id) {
    return null;
  }

  return discoverAreaOptions.find((option) => option.id === id) ?? null;
}

export function reviewMatchesArea(
  review: { area: string; city: DiscoverCity },
  selected: DiscoverAreaOption,
): boolean {
  if (selected.area) {
    return review.area === selected.area;
  }

  return review.city === selected.city;
}
