import {
  discoverAreaOptions,
  getDefaultAreaForCity,
  type DiscoverAreaOption,
  type DiscoverCity,
} from "@/lib/discover/areas";

const areaCentroids: Record<string, { lat: number; lng: number }> = {
  "c-scheme": { lat: 26.9124, lng: 75.7873 },
  "malviya-nagar": { lat: 26.8546, lng: 75.8142 },
  "raja-park": { lat: 26.8922, lng: 75.828 },
  "vaishali-nagar": { lat: 26.903, lng: 75.742 },
  mansarovar: { lat: 26.852, lng: 75.769 },
  "jaipur-all": { lat: 26.9124, lng: 75.7873 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  whitefield: { lat: 12.9698, lng: 77.75 },
  "bengaluru-all": { lat: 12.9716, lng: 77.5946 },
  "bandra-west": { lat: 19.0596, lng: 72.8295 },
  "andheri-west": { lat: 19.1364, lng: 72.8296 },
  "mumbai-all": { lat: 19.076, lng: 72.8777 },
};

const cityCentroids: Record<DiscoverCity, { lat: number; lng: number }> = {
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
};

const supportedCities: DiscoverCity[] = ["Jaipur", "Bengaluru", "Mumbai"];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lng: number): DiscoverCity {
  let nearest: DiscoverCity = "Jaipur";
  let nearestKm = Infinity;

  for (const city of supportedCities) {
    const centroid = cityCentroids[city];
    const distance = haversineKm(lat, lng, centroid.lat, centroid.lng);
    if (distance < nearestKm) {
      nearestKm = distance;
      nearest = city;
    }
  }

  return nearest;
}

/** Map device coordinates to the closest supported neighbourhood. */
export function findNearestDiscoverArea(
  lat: number,
  lng: number,
): DiscoverAreaOption {
  const city = nearestCity(lat, lng);
  const cityKm = haversineKm(
    lat,
    lng,
    cityCentroids[city].lat,
    cityCentroids[city].lng,
  );

  if (cityKm > 120) {
    return getDefaultAreaForCity(city);
  }

  const neighbourhoods = discoverAreaOptions.filter(
    (option) => option.city === city && option.area,
  );

  let nearest = neighbourhoods[0] ?? getDefaultAreaForCity(city);
  let nearestKm = Infinity;

  for (const option of neighbourhoods) {
    const centroid = areaCentroids[option.id];
    if (!centroid) {
      continue;
    }

    const distance = haversineKm(lat, lng, centroid.lat, centroid.lng);
    if (distance < nearestKm) {
      nearestKm = distance;
      nearest = option;
    }
  }

  return nearest;
}

export function filterDiscoverAreas(
  options: DiscoverAreaOption[],
  query: string,
): DiscoverAreaOption[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return options;
  }

  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(term) ||
      option.city.toLowerCase().includes(term),
  );
}
