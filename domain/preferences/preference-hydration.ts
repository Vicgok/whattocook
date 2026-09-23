import {
  ALLERGEN_LABELS,
  legacyAllergen,
  resolveBaseDiet,
} from "./dietary";

export type PreferenceStorageRow = {
  diet: string[];
  allergies: string[];
  nutrition_goals: string[];
  cooking_preferences: {
    avoidedIngredients?: HydratedPreferences["avoidedIngredients"];
    units?: "Metric" | "Imperial";
    notificationsEnabled?: boolean;
    appearance?: string;
  } | null;
  base_diet?: HydratedPreferences["baseDiet"];
  gluten_free?: boolean;
  dairy_free?: boolean;
};

export type HydratedPreferences = {
  dietPreferences: string[];
  baseDiet: "vegetarian" | "vegan" | "eggetarian" | "pescatarian" | null;
  glutenFree: boolean;
  dairyFree: boolean;
  nutritionGoals: string[];
  allergies: string[];
  avoidedIngredients: (
    | { type: "canonical"; ingredientId: string }
    | { type: "custom"; value: string }
  )[];
  units: "Metric" | "Imperial";
  notificationsEnabled: boolean;
  appearance: string;
};

/** Combines independently fetched, user-owned preference relations. */
export function hydratePreferences(
  row: PreferenceStorageRow,
  normalizedAllergens: { allergen_code: string }[] | null = null,
  normalizedAvoidedIngredients: { ingredient_id: string }[] | null = null,
): HydratedPreferences {
  return {
    dietPreferences: row.diet,
    baseDiet: resolveBaseDiet(row.base_diet, row.diet),
    glutenFree: row.gluten_free ?? false,
    dairyFree: row.dairy_free ?? false,
    allergies:
      normalizedAllergens && normalizedAllergens.length
        ? [
            ...normalizedAllergens.map(
              ({ allergen_code }) =>
                ALLERGEN_LABELS[
                  allergen_code as keyof typeof ALLERGEN_LABELS
                ] ?? allergen_code,
            ),
            ...row.allergies.filter((allergen) => !legacyAllergen(allergen)),
          ]
        : row.allergies,
    nutritionGoals: row.nutrition_goals,
    avoidedIngredients:
      normalizedAvoidedIngredients && normalizedAvoidedIngredients.length
        ? [
            ...normalizedAvoidedIngredients.map(({ ingredient_id }) => ({
              type: "canonical" as const,
              ingredientId: ingredient_id,
            })),
            ...(row.cooking_preferences?.avoidedIngredients ?? []).filter(
              (ingredient) => ingredient.type === "custom",
            ),
          ]
        : row.cooking_preferences?.avoidedIngredients ?? [],
    units: row.cooking_preferences?.units ?? "Metric",
    notificationsEnabled: row.cooking_preferences?.notificationsEnabled ?? true,
    appearance: row.cooking_preferences?.appearance ?? "System default",
  };
}
