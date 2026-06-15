export type DiscoverCity = "Jaipur" | "Bengaluru" | "Mumbai";

export type DiscoverAreaOption = {
  id: string;
  label: string;
  city: DiscoverCity;
  /** When set, only listings with this exact area name match. */
  area?: string;
};

export const DISCOVER_AREA_STORAGE_KEY = "kaisa-laga:discover-area";

export const discoverAreaOptions: DiscoverAreaOption[] = [
  { id: "c-scheme", label: "C-Scheme", city: "Jaipur", area: "C-Scheme" },
  { id: "malviya-nagar", label: "Malviya Nagar", city: "Jaipur", area: "Malviya Nagar" },
  { id: "raja-park", label: "Raja Park", city: "Jaipur", area: "Raja Park" },
  { id: "vaishali-nagar", label: "Vaishali Nagar", city: "Jaipur", area: "Vaishali Nagar" },
  { id: "mansarovar", label: "Mansarovar", city: "Jaipur", area: "Mansarovar" },
  { id: "jaipur-all", label: "Jaipur", city: "Jaipur" },
  { id: "indiranagar", label: "Indiranagar", city: "Bengaluru", area: "Indiranagar" },
  { id: "koramangala", label: "Koramangala", city: "Bengaluru", area: "Koramangala" },
  { id: "whitefield", label: "Whitefield", city: "Bengaluru", area: "Whitefield" },
  { id: "bengaluru-all", label: "Bengaluru", city: "Bengaluru" },
  { id: "bandra-west", label: "Bandra West", city: "Mumbai", area: "Bandra West" },
  { id: "andheri-west", label: "Andheri West", city: "Mumbai", area: "Andheri West" },
  { id: "mumbai-all", label: "Mumbai", city: "Mumbai" },
];

const cityAliases: Record<string, DiscoverCity> = {
  jaipur: "Jaipur",
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
  if (city === "Jaipur") {
    return discoverAreaOptions.find((option) => option.id === "jaipur-all")!;
  }
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


