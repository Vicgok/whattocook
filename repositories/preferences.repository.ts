import type { UserPreferences } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase";
import {
  traceSupabaseHttp,
  traceSupabaseError,
  traceSupabaseRequest,
} from "@/lib/supabase-request-tracer";
import { legacyBaseDiet } from "@/domain/preferences/dietary";
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
};

const toPreferences = (row: PreferencesRow): UserPreferences => ({
  dietPreferences: row.diet,
  baseDiet: row.base_diet ?? row.diet.map(legacyBaseDiet).find(Boolean) ?? null,
  glutenFree: row.gluten_free ?? false,
  dairyFree: row.dairy_free ?? false,
  allergies: row.allergies,
  nutritionGoals: row.nutrition_goals,
  avoidedIngredients: row.cooking_preferences?.avoidedIngredients ?? [],
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
    .select("diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free")
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
    .select("diet, allergies, nutrition_goals, cooking_preferences, base_diet, gluten_free, dairy_free")
    .single();
  if (error) {
    traceSupabaseError("preferences.upsert", error);
    throw error;
  }
  return toPreferences(data as PreferencesRow);
}
