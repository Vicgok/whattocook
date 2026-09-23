import type { UserPreferences } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseHttp,
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";
import {
  legacyAllergen,
} from "@/domain/preferences/dietary";
import { normalizePreferenceStorage } from "@/domain/preferences/preference-serialization";
import {
  hydratePreferences,
  type PreferenceStorageRow,
} from "@/domain/preferences/preference-hydration";

type AllergenRow = { allergen_code: string };
type AvoidedIngredientRow = { ingredient_id: string };

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
  const [preferencesResult, allergensResult, avoidedIngredientsResult] =
    await Promise.all([
      client
        .from("user_preferences")
        .select(
          "diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free",
        )
        .eq("user_id", userId)
        .maybeSingle(),
      client
        .from("user_preference_allergens")
        .select("allergen_code")
        .eq("user_id", userId),
      client
        .from("user_avoided_ingredients")
        .select("ingredient_id")
        .eq("user_id", userId),
    ]);
  if (signal?.aborted) {
    traceSupabaseHttp("preferences.get", "aborted", userId);
    throw new Error("Preferences request cancelled after dispatch.");
  }
  if (preferencesResult.error) {
    traceSupabaseError("preferences.get", preferencesResult.error);
    throw preferencesResult.error;
  }
  if (allergensResult.error) {
    traceSupabaseError("preferences.allergens.get", allergensResult.error);
    throw allergensResult.error;
  }
  if (avoidedIngredientsResult.error) {
    traceSupabaseError(
      "preferences.avoidedIngredients.get",
      avoidedIngredientsResult.error,
    );
    throw avoidedIngredientsResult.error;
  }
  traceSupabaseHttp(
    "preferences.get",
    "completed",
    userId,
    preferencesResult.status,
  );
  return preferencesResult.data
    ? hydratePreferences(
        preferencesResult.data as PreferenceStorageRow,
        allergensResult.data as AllergenRow[] | null,
        avoidedIngredientsResult.data as AvoidedIngredientRow[] | null,
      )
    : null;
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
    .select(
      "diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free",
    )
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
  await Promise.all([
    replaceAllergens(client, userId, normalizedAllergens),
    replaceAvoidedIngredients(client, userId, canonicalAvoidedIngredientIds),
  ]);
  return hydratePreferences(
    { ...(data as PreferenceStorageRow) },
    normalizedAllergens.map((allergen_code) => ({ allergen_code })),
    canonicalAvoidedIngredientIds.map((ingredient_id) => ({ ingredient_id })),
  );
}

async function replaceAllergens(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userId: string,
  allergenCodes: string[],
) {
  if (allergenCodes.length) {
    const { error } = await client
      .from("user_preference_allergens")
      .upsert(
        allergenCodes.map((allergen_code) => ({
          user_id: userId,
          allergen_code,
        })),
        { onConflict: "user_id,allergen_code" },
      );
    if (error) {
      traceSupabaseError("preferences.allergens.replace", error);
      throw error;
    }
  }
  let staleAllergens = client
    .from("user_preference_allergens")
    .delete()
    .eq("user_id", userId);
  if (allergenCodes.length)
    staleAllergens = staleAllergens.not(
      "allergen_code",
      "in",
      `(${allergenCodes.join(",")})`,
    );
  const { error } = await staleAllergens;
  if (error) {
    traceSupabaseError("preferences.allergens.replace", error);
    throw error;
  }
}

async function replaceAvoidedIngredients(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userId: string,
  ingredientIds: string[],
) {
  if (ingredientIds.length) {
    const { error } = await client
      .from("user_avoided_ingredients")
      .upsert(
        ingredientIds.map((ingredient_id) => ({
          user_id: userId,
          ingredient_id,
        })),
        { onConflict: "user_id,ingredient_id" },
      );
    if (error) {
      traceSupabaseError("preferences.avoidedIngredients.replace", error);
      throw error;
    }
  }
  let staleIngredients = client
    .from("user_avoided_ingredients")
    .delete()
    .eq("user_id", userId);
  if (ingredientIds.length)
    staleIngredients = staleIngredients.not(
      "ingredient_id",
      "in",
      `(${ingredientIds.join(",")})`,
    );
  const { error } = await staleIngredients;
  if (error) {
    traceSupabaseError("preferences.avoidedIngredients.replace", error);
    throw error;
  }
}
