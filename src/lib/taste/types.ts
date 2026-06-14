export const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "low_carb",
  "dairy_free",
  "none",
] as const;

export const ALLERGY_OPTIONS = [
  "shellfish",
  "peanuts",
  "gluten",
  "eggs",
  "fish",
  "soy",
] as const;

export const SPICE_LEVELS = ["mild", "medium", "hot", "very_hot"] as const;

export const BUDGET_BANDS = ["budget", "mid", "premium"] as const;

export type DietaryOption = (typeof DIETARY_OPTIONS)[number];
export type AllergyOption = (typeof ALLERGY_OPTIONS)[number];
export type SpiceLevel = (typeof SPICE_LEVELS)[number];
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export type DinerOnboarding = {
  dietary: DietaryOption | null;
  allergies: AllergyOption[];
  spiceLevel: SpiceLevel | null;
  budgetBand: BudgetBand | null;
  otherAllergies?: string | null;
};

export const EMPTY_DINER_ONBOARDING: DinerOnboarding = {
  dietary: null,
  allergies: [],
  spiceLevel: null,
  budgetBand: null,
  otherAllergies: null,
};

export type VenueMatch = {
  locationId: string;
  name: string;
  tagline: string | null;
  coverImageUrl: string | null;
  tasteSummary: string | null;
  sampleQuote: string | null;
  matchCopy: string;
};
