import {
  baseDietToLegacyPreference,
  legacyBaseDiet,
  resolveBaseDiet,
} from "./dietary";
export type PreferenceStorageShape = { dietPreferences: string[]; allergies: string[]; nutritionGoals: string[]; avoidedIngredients: { type: "canonical" | "custom"; ingredientId?: string; value?: string }[]; units: "Metric" | "Imperial"; notificationsEnabled: boolean; appearance: string; baseDiet?: "vegetarian" | "vegan" | "eggetarian" | "pescatarian" | null; glutenFree?: boolean; dairyFree?: boolean };

export function normalizePreferenceStorage(input: PreferenceStorageShape) {
  const baseDiet = resolveBaseDiet(input.baseDiet, input.dietPreferences);
  return {
    // Retain the legacy JSON mirror, but never let a display-only value such
    // as "No preference" become a persisted diet restriction.
    diet: [
      ...baseDietToLegacyPreference(baseDiet),
      // Preserve unmapped legacy values exactly; only V1 diet values are
      // represented by the normalized base_diet field.
      ...input.dietPreferences.filter((diet) => !legacyBaseDiet(diet)),
    ],
    allergies: input.allergies,
    nutrition_goals: input.nutritionGoals,
    base_diet: baseDiet,
    gluten_free: input.glutenFree ?? false,
    dairy_free: input.dairyFree ?? false,
    cooking_preferences: { avoidedIngredients: input.avoidedIngredients, units: input.units, notificationsEnabled: input.notificationsEnabled, appearance: input.appearance },
  };
}
export function baseDietSelection(
  current: string[],
  next: string | null,
): string[] {
  return next ? [next] : [];
}
