export type MarketingThemeId = "paper" | "cobalt" | "forest";

export const defaultMarketingTheme: MarketingThemeId = "paper";

export const MARKETING_THEME_STORAGE_KEY = "kaisa-laga:marketing-theme";



export function resolveMarketingTheme(value: string | null | undefined): MarketingThemeId {
  if (value === "paper" || value === "cobalt" || value === "forest") {
    return value;
  }
  return defaultMarketingTheme;
}

export type MarketingIllustrationId =
  | "voice-wave"
  | "chai-steam"
  | "jaipur-arch"
  | "cuisine-orbit";


