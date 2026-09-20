import { legacyBaseDiet } from "./dietary";
export type PreferenceStorageShape = { dietPreferences: string[]; allergies: string[]; nutritionGoals: string[]; avoidedIngredients: { type: "canonical" | "custom"; ingredientId?: string; value?: string }[]; units: "Metric" | "Imperial"; notificationsEnabled: boolean; appearance: string; baseDiet?: "vegetarian" | "vegan" | "eggetarian" | "pescatarian" | null; glutenFree?: boolean; dairyFree?: boolean };

export function normalizePreferenceStorage(input: PreferenceStorageShape) {
  return {
    diet: input.dietPreferences,
    allergies: input.allergies,
    nutrition_goals: input.nutritionGoals,
    base_diet: input.baseDiet ?? input.dietPreferences.map(legacyBaseDiet).find(Boolean) ?? null,
    gluten_free: input.glutenFree ?? false,
    dairy_free: input.dairyFree ?? false,
    cooking_preferences: { avoidedIngredients: input.avoidedIngredients, units: input.units, notificationsEnabled: input.notificationsEnabled, appearance: input.appearance },
  };
}
export function baseDietSelection(current: string[], next: string): string[] {
  return next === "No preference" ? ["No preference"] : [next];
}
