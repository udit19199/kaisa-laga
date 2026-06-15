export type MarketingThemeId = "paper" | "cobalt" | "forest";

export type MarketingTheme = {
  id: MarketingThemeId;
  label: string;
  description: string;
};

export const marketingThemes: MarketingTheme[] = [
  {
    id: "paper",
    label: "Paper",
    description: "White canvas, zinc type, single warm accent on actions only.",
  },
  {
    id: "cobalt",
    label: "Cobalt",
    description: "Same neutral base with a cool blue accent.",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Same neutral base with an emerald accent.",
  },
];

export const defaultMarketingTheme: MarketingThemeId = "paper";

export const MARKETING_THEME_STORAGE_KEY = "kaisa-laga:marketing-theme";

const legacyThemeIds = ["warm-stone", "terracotta-indigo", "blush-craft"] as const;

export function isMarketingThemeId(value: string | null | undefined): value is MarketingThemeId {
  if (!value) {
    return false;
  }
  if (marketingThemes.some((theme) => theme.id === value)) {
    return true;
  }
  return (legacyThemeIds as readonly string[]).includes(value);
}

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

export const marketingIllustrations: Record<
  MarketingIllustrationId,
  { webm: string; poster: string; label: string }
> = {
  "voice-wave": {
    webm: "/marketing/animations/voice-wave.webm",
    poster: "/marketing/animations/voice-wave-poster.png",
    label: "Voice review waveform",
  },
  "chai-steam": {
    webm: "/marketing/animations/chai-steam.webm",
    poster: "/marketing/animations/chai-steam-poster.png",
    label: "Chai steam rising from a kulhad",
  },
  "jaipur-arch": {
    webm: "/marketing/animations/jaipur-arch.webm",
    poster: "/marketing/animations/jaipur-arch-poster.png",
    label: "Jaipur arch silhouette",
  },
  "cuisine-orbit": {
    webm: "/marketing/animations/cuisine-orbit.webm",
    poster: "/marketing/animations/cuisine-orbit-poster.png",
    label: "Plates from many cuisines",
  },
};
