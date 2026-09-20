import type { UserPreferences } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseHttp,
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";
import {
  ALLERGEN_LABELS,
  legacyAllergen,
  resolveBaseDiet,
} from "@/domain/preferences/dietary";
import { normalizePreferenceStorage } from "@/domain/preferences/preference-serialization";

type PreferencesRow = {
  diet: string[];
  allergies: string[];
  nutrition_goals: string[];
  cooking_preferences: Partial<
    Pick<
      UserPreferences,
      "avoidedIngredients" | "units" | "notificationsEnabled" | "appearance"
    >
  > | null;
  base_diet?: UserPreferences["baseDiet"];
  gluten_free?: boolean;
  dairy_free?: boolean;
  user_preference_allergens?: { allergen_code: string }[] | null;
  user_avoided_ingredients?: { ingredient_id: string }[] | null;
};

const toPreferences = (row: PreferencesRow): UserPreferences => ({
  dietPreferences: row.diet,
  baseDiet: resolveBaseDiet(row.base_diet, row.diet),
  glutenFree: row.gluten_free ?? false,
  dairyFree: row.dairy_free ?? false,
  allergies:
    row.user_preference_allergens?.map(
      ({ allergen_code }) => ALLERGEN_LABELS[allergen_code as keyof typeof ALLERGEN_LABELS] ?? allergen_code,
    ) ?? row.allergies,
  nutritionGoals: row.nutrition_goals,
  avoidedIngredients: row.user_avoided_ingredients?.map(({ ingredient_id }) => ({
    type: "canonical" as const,
    ingredientId: ingredient_id,
  })) ?? row.cooking_preferences?.avoidedIngredients ?? [],
  units: row.cooking_preferences?.units ?? "Metric",
  notificationsEnabled: row.cooking_preferences?.notificationsEnabled ?? true,
  appearance: row.cooking_preferences?.appearance ?? "System default",
});

export async function fetchPreferences(
  userId: string,
  signal?: AbortSignal,
): Promise<UserPreferences | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  if (signal?.aborted) {
    traceSupabaseHttp("preferences.get", "aborted", userId);
    throw new Error("Preferences request cancelled before dispatch.");
  }
  traceSupabaseRequest("preferences.get", "useUserPreferences");
  // The installed PostgREST client does not expose a typed abortSignal API.
  // TanStack cancellation plus this post-response check prevents a late result
  // from being committed after an identity replacement.
  traceSupabaseHttp("preferences.get", "started", userId);
  const { data, error, status } = await client
    .from("user_preferences")
    .select("diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free, user_preference_allergens(allergen_code), user_avoided_ingredients(ingredient_id)")
    .eq("user_id", userId)
    .maybeSingle();
  if (signal?.aborted) {
    traceSupabaseHttp("preferences.get", "aborted", userId);
    throw new Error("Preferences request cancelled after dispatch.");
  }
  if (error) {
    traceSupabaseError("preferences.get", error);
    throw error;
  }
  traceSupabaseHttp("preferences.get", "completed", userId, status);
  return data ? toPreferences(data as PreferencesRow) : null;
}

export async function upsertPreferences(
  userId: string,
  preferences: UserPreferences,
): Promise<UserPreferences> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  traceSupabaseRequest("preferences.upsert", "useUserPreferences.update");
  const { data, error } = await client
    .from("user_preferences")
    .upsert(
      { user_id: userId, ...normalizePreferenceStorage(preferences) },
      { onConflict: "user_id" },
    )
    .select("diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free, user_preference_allergens(allergen_code), user_avoided_ingredients(ingredient_id)")
    .single();
  if (error) {
    traceSupabaseError("preferences.upsert", error);
    throw error;
  }
  const canonicalAvoidedIngredientIds = preferences.avoidedIngredients
    .filter((ingredient): ingredient is { type: "canonical"; ingredientId: string } => ingredient.type === "canonical")
    .map((ingredient) => ingredient.ingredientId);
  const normalizedAllergens = preferences.allergies
    .map(legacyAllergen)
    .filter((allergen): allergen is NonNullable<typeof allergen> => Boolean(allergen));
  const { error: allergensError } = await client
    .from("user_preference_allergens")
    .delete()
    .eq("user_id", userId);
  if (allergensError) {
    traceSupabaseError("preferences.allergens.replace", allergensError);
    throw allergensError;
  }
  if (normalizedAllergens.length) {
    const { error: insertAllergensError } = await client
      .from("user_preference_allergens")
      .insert(normalizedAllergens.map((allergen_code) => ({ user_id: userId, allergen_code })));
    if (insertAllergensError) {
      traceSupabaseError("preferences.allergens.replace", insertAllergensError);
      throw insertAllergensError;
    }
  }
  const { error: avoidedError } = await client
    .from("user_avoided_ingredients")
    .delete()
    .eq("user_id", userId);
  if (avoidedError) {
    traceSupabaseError("preferences.avoidedIngredients.replace", avoidedError);
    throw avoidedError;
  }
  if (canonicalAvoidedIngredientIds.length) {
    const { error: insertAvoidedError } = await client
      .from("user_avoided_ingredients")
      .insert(canonicalAvoidedIngredientIds.map((ingredient_id) => ({ user_id: userId, ingredient_id })));
    if (insertAvoidedError) {
      traceSupabaseError("preferences.avoidedIngredients.replace", insertAvoidedError);
      throw insertAvoidedError;
    }
  }
  return toPreferences({
    ...(data as PreferencesRow),
    user_preference_allergens: normalizedAllergens.map((allergen_code) => ({ allergen_code })),
    user_avoided_ingredients: canonicalAvoidedIngredientIds.map((ingredient_id) => ({ ingredient_id })),
  });
}
