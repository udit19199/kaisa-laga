"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ALLERGY_OPTIONS,
  BUDGET_BANDS,
  DIETARY_OPTIONS,
  SPICE_LEVELS,
  type AllergyOption,
  type BudgetBand,
  type DietaryOption,
  type DinerOnboarding,
  type SpiceLevel,
} from "@/lib/taste/types";
import { cn } from "@/lib/utils";

const STEPS = ["allergies", "dietary", "spice"] as const;
type Step = (typeof STEPS)[number];

const allergyLabels: Record<AllergyOption, string> = {
  shellfish: "Shellfish",
  peanuts: "Peanuts",
  gluten: "Gluten",
  eggs: "Eggs",
  fish: "Fish",
  soy: "Soy",
};

const dietaryLabels: Record<DietaryOption, { title: string; description: string }> = {
  vegetarian: {
    title: "Vegetarian",
    description: "No meat, poultry, and fish, but includes eggs and dairy.",
  },
  vegan: {
    title: "Vegan",
    description: "No animal products, including meat, dairy, eggs, etc.",
  },
  pescatarian: {
    title: "Pescatarian",
    description: "No meat and poultry but includes fish and seafood.",
  },
  low_carb: {
    title: "Low-carb",
    description: "Low-carb, focusing on protein and fats instead.",
  },
  dairy_free: {
    title: "Dairy-free",
    description: "No dairy products due to lactose intolerance.",
  },
  none: {
    title: "None, I eat everything",
    description: "Don't worry, you can update this later.",
  },
};

const spiceLabels: Record<SpiceLevel, string> = {
  mild: "Mild — comfort first",
  medium: "Medium — some heat is fine",
  hot: "Hot — bring the chilli",
  very_hot: "Very hot — the spicier the better",
};

const budgetLabels: Record<BudgetBand, string> = {
  budget: "Budget-friendly",
  mid: "Mid-range",
  premium: "Special occasion",
};

export function TasteOnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [onboarding, setOnboarding] = useState<DinerOnboarding>({
    dietary: null,
    allergies: [],
    spiceLevel: null,
    budgetBand: null,
    otherAllergies: null,
  });

  const step = STEPS[stepIndex] as Step;

  const toggleAllergy = (allergy: AllergyOption) => {
    setOnboarding((current) => ({
      ...current,
      allergies: current.allergies.includes(allergy)
        ? current.allergies.filter((item) => item !== allergy)
        : [...current.allergies, allergy],
    }));
  };

  const saveAndFinish = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/diners/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboarding),
      });

      if (!response.ok) {
        throw new Error("Failed to save taste profile");
      }

      router.push("/#for-you");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] font-marketing-ui text-marketing-ink lg:px-8 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col gap-6 lg:min-h-0 lg:max-w-xl lg:gap-8">
        <div className="flex gap-2 pt-2">
          {STEPS.map((_, index) => (
            <span
              key={STEPS[index]}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                index <= stepIndex ? "bg-marketing-accent" : "bg-marketing-line",
              )}
            />
          ))}
        </div>

        {step === "allergies" ? (
          <>
            <div>
              <h1 className="m-0 font-marketing-display text-[30px] leading-tight font-normal lg:text-[36px]">
                Do you have any allergies we should know about?
              </h1>
              <p className="mt-3 text-sm text-marketing-muted">
                We&apos;ll take these into account when suggesting places for you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
              {ALLERGY_OPTIONS.map((allergy) => {
                const selected = onboarding.allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={cn(
                      "rounded-2xl border bg-marketing-card p-4 text-left transition-colors",
                      selected
                        ? "border-marketing-ink border-2"
                        : "border-marketing-line",
                    )}
                  >
                    <span className="block text-sm font-medium">{allergyLabels[allergy]}</span>
                  </button>
                );
              })}
            </div>

            <label className="block rounded-2xl border border-marketing-line p-4">
              <span className="text-sm font-medium">Other</span>
              <textarea
                value={onboarding.otherAllergies ?? ""}
                onChange={(event) =>
                  setOnboarding((current) => ({
                    ...current,
                    otherAllergies: event.target.value,
                  }))
                }
                placeholder="Any other allergies we should know about?"
                className="mt-2 min-h-[72px] w-full resize-none border-0 bg-transparent text-sm text-marketing-ink outline-none placeholder:text-marketing-muted"
              />
            </label>
          </>
        ) : null}

        {step === "dietary" ? (
          <>
            <div>
              <h1 className="m-0 font-marketing-display text-[30px] leading-tight font-normal lg:text-[36px]">
                Any dietary preferences we should consider?
              </h1>
            </div>

            <div className="space-y-3">
              {DIETARY_OPTIONS.map((dietary) => {
                const selected = onboarding.dietary === dietary;
                return (
                  <button
                    key={dietary}
                    type="button"
                    onClick={() => setOnboarding((current) => ({ ...current, dietary }))}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left",
                      selected
                        ? "border-marketing-ink border-2"
                        : "border-marketing-line",
                    )}
                  >
                    <span className="block font-medium">{dietaryLabels[dietary].title}</span>
                    <span className="mt-1 block text-sm text-marketing-muted">
                      {dietaryLabels[dietary].description}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === "spice" ? (
          <>
            <div>
              <h1 className="m-0 font-marketing-display text-[30px] leading-tight font-normal lg:text-[36px]">
                How do you like your heat and spend?
              </h1>
              <p className="mt-3 text-sm text-marketing-muted">
                Helps us match you to the right kind of place before you&apos;ve left many reviews.
              </p>
            </div>

            <div className="space-y-3">
              <p className="m-0 text-sm font-medium">Spice comfort</p>
              {SPICE_LEVELS.map((spice) => {
                const selected = onboarding.spiceLevel === spice;
                return (
                  <button
                    key={spice}
                    type="button"
                    onClick={() =>
                      setOnboarding((current) => ({ ...current, spiceLevel: spice }))
                    }
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left text-sm",
                      selected
                        ? "border-marketing-ink border-2"
                        : "border-marketing-line",
                    )}
                  >
                    {spiceLabels[spice]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <p className="m-0 text-sm font-medium">Budget</p>
              {BUDGET_BANDS.map((budget) => {
                const selected = onboarding.budgetBand === budget;
                return (
                  <button
                    key={budget}
                    type="button"
                    onClick={() =>
                      setOnboarding((current) => ({ ...current, budgetBand: budget }))
                    }
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left text-sm",
                      selected
                        ? "border-marketing-ink border-2"
                        : "border-marketing-line",
                    )}
                  >
                    {budgetLabels[budget]}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="mt-auto flex gap-3 pt-4">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStepIndex((index) => index - 1)}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-marketing-line bg-white"
              aria-label="Back"
            >
              ‹
            </button>
          ) : (
            <Link
              href="/profile"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-marketing-line bg-white no-underline text-xl text-marketing-ink"
              aria-label="Back to profile"
            >
              ‹
            </Link>
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((index) => index + 1)}
              className="h-12 flex-1 rounded-full bg-marketing-ink text-sm font-medium text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveAndFinish()}
              className="h-12 flex-1 rounded-full bg-marketing-ink text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
