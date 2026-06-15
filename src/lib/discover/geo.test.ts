import { describe, expect, it } from "vitest";
import { findNearestDiscoverArea, filterDiscoverAreas } from "@/lib/discover/geo";
import { discoverAreaOptions } from "@/lib/discover/areas";

describe("findNearestDiscoverArea", () => {
  it("maps C-Scheme coordinates to C-Scheme", () => {
    const area = findNearestDiscoverArea(26.9124, 75.7873);
    expect(area.id).toBe("c-scheme");
  });

  it("maps Indiranagar coordinates to Indiranagar", () => {
    const area = findNearestDiscoverArea(12.9784, 77.6408);
    expect(area.id).toBe("indiranagar");
  });

  it("maps Bandra coordinates to Bandra West", () => {
    const area = findNearestDiscoverArea(19.0596, 72.8295);
    expect(area.id).toBe("bandra-west");
  });
});

describe("filterDiscoverAreas", () => {
  it("filters by neighbourhood name", () => {
    const results = filterDiscoverAreas(discoverAreaOptions, "malviya");
    expect(results.map((option) => option.id)).toEqual(["malviya-nagar"]);
  });
});
