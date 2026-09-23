export const BASE_DIETS = ["vegetarian", "vegan", "eggetarian", "pescatarian"] as const;
export type BaseDiet = (typeof BASE_DIETS)[number];
export const ALLERGENS = ["peanuts", "tree-nuts", "milk", "eggs", "wheat", "soy", "fish", "crustacean-shellfish", "sesame"] as const;
export type AllergenCode = (typeof ALLERGENS)[number];
export const NUTRITION_GOALS = ["high-protein", "lower-calorie", "balanced"] as const;
export type NutritionGoal = (typeof NUTRITION_GOALS)[number];
export const NUTRITION_GOAL_LABELS: Record<NutritionGoal, string> = {
  "high-protein": "High protein",
  "lower-calorie": "Lower calorie",
  balanced: "Balanced",
};

/** Explicit WhatToCook V1 product definitions, not universal cultural definitions. */
export const BASE_DIET_LABELS: Record<BaseDiet, string> = {
  vegetarian: "Vegetarian", vegan: "Vegan", eggetarian: "Eggetarian", pescatarian: "Pescatarian",
};

export function baseDietToLegacyPreference(baseDiet: BaseDiet | null): string[] {
  return baseDiet ? [BASE_DIET_LABELS[baseDiet]] : [];
}

/**
 * The legacy JSON list remains for backwards compatibility, but V1 accepts
 * exactly one base diet. Prefer the normalized field whenever it exists.
 */
export function resolveBaseDiet(
  baseDiet: BaseDiet | null | undefined,
  legacyDiets: string[],
): BaseDiet | null {
  return baseDiet ?? legacyDiets.map(legacyBaseDiet).find(Boolean) ?? null;
}
export const ALLERGEN_LABELS: Record<AllergenCode, string> = {
  peanuts: "Peanuts", "tree-nuts": "Tree nuts", milk: "Milk", eggs: "Eggs", wheat: "Wheat", soy: "Soy", fish: "Fish", "crustacean-shellfish": "Crustacean shellfish", sesame: "Sesame",
};

/** Maps only unambiguous legacy display values; unmapped values remain preserved in legacy JSON. */
export function legacyBaseDiet(value: string): BaseDiet | null {
  const normalized = value.trim().toLowerCase();
  return (BASE_DIETS as readonly string[]).includes(normalized) ? normalized as BaseDiet : null;
}
export function legacyAllergen(value: string): AllergenCode | null {
  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, AllergenCode> = { "milk / dairy": "milk", "milk-dairy": "milk", shellfish: "crustacean-shellfish" };
  return (ALLERGENS as readonly string[]).includes(normalized) ? normalized as AllergenCode : aliases[normalized] ?? null;
}
