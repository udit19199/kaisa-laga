"use client";

import { useEffect, useState } from "react";
import {
  DISCOVER_AREA_STORAGE_KEY,
  discoverAreaOptions,
  getAreaOptionById,
  getDefaultAreaForCity,
  type DiscoverAreaOption,
} from "@/lib/discover/areas";

type GeoResponse = {
  suggestedAreaId: string | null;
  mappedCity: "Bengaluru" | "Mumbai" | null;
};

const fallbackArea = getDefaultAreaForCity("Bengaluru");

export function useDiscoverArea() {
  const [area, setAreaState] = useState<DiscoverAreaOption>(fallbackArea);
  const [ready, setReady] = useState(false);
  const [inferredFromGeo, setInferredFromGeo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const savedId = window.localStorage.getItem(DISCOVER_AREA_STORAGE_KEY);
      const saved = getAreaOptionById(savedId);

      if (saved) {
        if (!cancelled) {
          setAreaState(saved);
          setReady(true);
        }
        return;
      }

      const urlAreaId = new URLSearchParams(window.location.search).get("area");
      const urlArea = getAreaOptionById(urlAreaId);
      if (urlArea) {
        if (!cancelled) {
          setAreaState(urlArea);
          setReady(true);
        }
        return;
      }

      try {
        const response = await fetch("/api/geo");
        if (!response.ok) {
          throw new Error("geo lookup failed");
        }

        const data = (await response.json()) as GeoResponse;
        const suggested =
          getAreaOptionById(data.suggestedAreaId) ??
          (data.mappedCity ? getDefaultAreaForCity(data.mappedCity) : fallbackArea);

        if (!cancelled) {
          setAreaState(suggested);
          setInferredFromGeo(Boolean(data.suggestedAreaId || data.mappedCity));
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setAreaState(fallbackArea);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function setArea(next: DiscoverAreaOption) {
    setAreaState(next);
    setInferredFromGeo(false);
    window.localStorage.setItem(DISCOVER_AREA_STORAGE_KEY, next.id);
  }

  return {
    area,
    setArea,
    ready,
    inferredFromGeo,
    options: discoverAreaOptions,
  };
}
