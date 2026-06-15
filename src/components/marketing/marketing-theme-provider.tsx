"use client";

import { useEffect } from "react";
import {
  MARKETING_THEME_STORAGE_KEY,
  resolveMarketingTheme,
  type MarketingThemeId,
} from "@/lib/marketing/tokens";

export function MarketingThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("theme");
    const fromStorage = window.localStorage.getItem(MARKETING_THEME_STORAGE_KEY);
    const theme: MarketingThemeId = resolveMarketingTheme(fromQuery ?? fromStorage);

    document.documentElement.dataset.marketingTheme = theme;

    if (fromQuery && resolveMarketingTheme(fromQuery) === fromQuery) {
      window.localStorage.setItem(MARKETING_THEME_STORAGE_KEY, fromQuery);
    }
  }, []);

  return children;
}
