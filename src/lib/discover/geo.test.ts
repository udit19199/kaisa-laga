import { describe, expect, it } from "vitest";
import { findNearestDiscoverArea, filterDiscoverAreas } from "@/lib/discover/geo";
import { discoverAreaOptions } from "@/lib/discover/areas";

describe("findNearestDiscoverArea", () => {
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
    const results = filterDiscoverAreas(discoverAreaOptions, "kora");
    expect(results.map((option) => option.id)).toEqual(["koramangala"]);
  });
});
